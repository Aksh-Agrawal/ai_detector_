from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
from transformers import AutoModelForImageClassification, AutoImageProcessor
import cv2
import numpy as np
from PIL import Image
import torch.nn.functional as F
import torch
import tempfile
import os
from document_processor import DocumentProcessor

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Initialize document processor
document_processor = DocumentProcessor()

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

###############################
# TEXT MODEL
###############################
MODEL_PATH = os.path.join(BASE_DIR, "text_model.pkl")
with open(MODEL_PATH, "rb") as f:
    text_model = pickle.load(f)

def detect_text_model(text):
    prob = text_model.predict_proba([text])[0]
    return {"ai": float(prob[1]), "human": float(prob[0])}

@app.post("/detect/text")
def detect_text():
    text = request.json["text"]
    return detect_text_model(text)

###############################
# IMAGE MODEL (HF ViT)
###############################
MODEL_NAME = "Ateeqq/ai-vs-human-image-detector"

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
image_model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
image_model.eval()

def predict_image_model(img):
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        logits = image_model(**inputs).logits
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()
    return {"ai": float(probs[0]), "human": float(probs[1])}

@app.post("/detect/image")
def detect_image():
    img = Image.open(request.files["image"].stream).convert("RGB")
    return predict_image_model(img)

###############################
# VIDEO PROCESSING
###############################
def extract_frames(path, fps=1):
    cap = cv2.VideoCapture(path)
    frames = []
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    interval = max(int(video_fps // fps), 1)

    idx = 0
    ok, frame = cap.read()
    while ok:
        if idx % interval == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(frame_rgb))
        idx += 1
        ok, frame = cap.read()

    cap.release()
    return frames

@app.post("/detect/video")
def detect_video():
    file = request.files["video"]
    
    # Create temporary file with proper extension
    temp_dir = tempfile.gettempdir()
    path = os.path.join(temp_dir, "video_upload.mp4")
    
    try:
        file.save(path)
        
        # Extract frames from video
        frames = extract_frames(path, fps=1)
        
        if not frames:
            return {"error": "No frames could be extracted from video"}, 400
        
        results = []
        
        # Process each frame through the image model
        for frame in frames:
            out = predict_image_model(frame)
            results.append([out["ai"], out["human"]])
        
        # Calculate average across all frames
        avg = np.mean(results, axis=0)
        
        return {
            "ai": float(avg[0]),
            "human": float(avg[1]),
            "frame_count": len(frames)
        }
    
    finally:
        # Clean up temporary file
        if os.path.exists(path):
            os.remove(path)

###############################
# DOCUMENT PROCESSING
###############################
@app.post("/detect/document")
def detect_document():
    """
    Process and analyze documents (PDF, DOCX, TXT)
    Returns text extraction + AI detection results
    """
    try:
        # Check if file was uploaded
        if 'document' not in request.files:
            return jsonify({"error": "No document file provided"}), 400
        
        file = request.files['document']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read file data
        file_data = file.read()
        filename = file.filename
        
        # Process document (extract text and metadata)
        try:
            doc_info = document_processor.process_document(file_data, filename)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except RuntimeError as e:
            return jsonify({"error": str(e)}), 500
        
        # Get extracted text
        full_text = doc_info.get('full_text', '')
        
        if not full_text or len(full_text.strip()) < 10:
            return jsonify({
                "error": "Could not extract sufficient text from document",
                "details": doc_info
            }), 400
        
        # Run AI detection on the extracted text
        detection_result = detect_text_model(full_text)
        
        # Page-by-page analysis for PDFs
        page_results = []
        if doc_info.get('file_type') == 'pdf' and 'pages' in doc_info:
            for page_data in doc_info['pages']:
                page_text = page_data.get('text', '').strip()
                if page_text and len(page_text) > 10:
                    page_detection = detect_text_model(page_text)
                    page_results.append({
                        "page": page_data['page'],
                        "ai_score": round(page_detection['ai'] * 100, 2),
                        "human_score": round(page_detection['human'] * 100, 2),
                        "char_count": page_data['char_count']
                    })
        
        # Compile full response
        response = {
            "success": True,
            "document_info": {
                "filename": doc_info['filename'],
                "file_type": doc_info['file_type'],
                "page_count": doc_info.get('page_count', 1),
                "total_characters": doc_info['total_characters'],
                "total_words": doc_info['total_words'],
                "metadata": doc_info.get('metadata', {})
            },
            "detection_results": {
                "ai_score": round(detection_result['ai'] * 100, 2),
                "human_score": round(detection_result['human'] * 100, 2),
                "confidence": "high" if abs(detection_result['ai'] - detection_result['human']) > 0.3 else "medium"
            },
            "page_analysis": page_results if page_results else None,
            "text_preview": full_text[:500] + "..." if len(full_text) > 500 else full_text
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

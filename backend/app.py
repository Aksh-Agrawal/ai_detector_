from flask import Flask, request
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

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

###############################
# TEXT MODEL
###############################
with open(r"D:\data\id\ai_detector\ai_detector_full\backend\text_model.pkl", "rb") as f:
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

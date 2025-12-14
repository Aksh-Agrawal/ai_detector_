# AI Detector Frontend

A modern web interface for the AI Content Detector application.

## Features

- **Text Detection**: Analyze text content to detect AI-generated text
- **Image Detection**: Upload and analyze images
- **Video Detection**: Upload and analyze videos (frame-by-frame analysis)
- Responsive design with modern UI
- Real-time progress indicators
- Visual result display with percentage bars

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend server running on `http://localhost:8000`

## File Structure

```
frontend/
├── index.html      # Main HTML structure
├── style.css       # Styling and animations
├── script.js       # JavaScript logic and API calls
└── README.md       # This file
```

## Setup

1. **Enable CORS in Backend**: The Flask backend needs to allow cross-origin requests. Add Flask-CORS:

```bash
pip install flask-cors
```

2. **Start the Backend Server**:

```bash
cd backend
python app.py
```

3. **Open the Frontend**:
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Using Python
   cd frontend
   python -m http.server 3000
   # Then visit http://localhost:3000
   ```

## API Endpoints Used

- `POST /detect/text` - Text detection
- `POST /detect/image` - Image detection
- `POST /detect/video` - Video detection

## Configuration

To change the backend URL, edit the `API_URL` constant in `script.js`:

```javascript
const API_URL = "http://localhost:8000";
```

## Usage

1. **Text Detection**:

   - Click on the "Text" tab
   - Enter or paste text in the textarea
   - Click "Detect Text"
   - View the AI vs Human probability results

2. **Image Detection**:

   - Click on the "Image" tab
   - Click "Choose Image" and select an image file
   - Preview will appear
   - Click "Detect Image"
   - View the results

3. **Video Detection**:
   - Click on the "Video" tab
   - Click "Choose Video" and select a video file
   - Preview will appear
   - Click "Detect Video" (this may take time as it analyzes multiple frames)
   - View the results with frame count information

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported

## Notes

- The backend must be running before using the frontend
- Large videos may take time to process
- Make sure CORS is enabled on the backend

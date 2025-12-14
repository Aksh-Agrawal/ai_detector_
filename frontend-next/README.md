# AI Content Detector - Next.js Frontend

A modern, beautiful frontend for detecting AI-generated content in text, images, and videos.

## Features

- 🎨 **Modern UI** - Clean design with orange/green gradients (no purple!)
- ✨ **Smooth Animations** - Framer Motion for fluid interactions
- 📱 **Responsive** - Works on all devices
- 🎯 **Three Detection Modes**:
  - Text analysis
  - Image analysis
  - Video analysis (frame-by-frame)

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Dropzone** - File uploads
- **Axios** - API calls

## Installation

1. Navigate to the frontend directory:

```bash
cd frontend-next
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Backend Setup

Make sure your Flask backend is running on `http://127.0.0.1:8000`:

```bash
cd ../backend
python app.py
```

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend-next/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page with tabs
├── components/
│   ├── TextDetector.tsx  # Text detection component
│   ├── ImageDetector.tsx # Image detection component
│   ├── VideoDetector.tsx # Video detection component
│   └── ResultCard.tsx    # Results display component
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Design Features

- **Color Scheme**: Orange and green gradients instead of typical AI purple
- **Glass Effect**: Frosted glass morphism for modern look
- **Animations**: Smooth transitions and micro-interactions
- **Icons**: Custom icons for each content type
- **Progress Bars**: Animated result visualization

## API Endpoints

The frontend connects to these backend endpoints:

- `POST /detect/text` - Analyze text
- `POST /detect/image` - Analyze images
- `POST /detect/video` - Analyze videos

## Customization

To change colors, edit `tailwind.config.js`:

```js
colors: {
  primary: { ... },    // Orange tones
  secondary: { ... },  // Green tones
}
```

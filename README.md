# Context Fill POC

A complete proof of concept demonstrating AI-powered document extraction to auto-fill forms. Built with Angular 21, Node.js, Firebase, and Google Gemini AI.

![Angular](https://img.shields.io/badge/Angular-21-red)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blue)

## Project Structure

```
Srt-ContextFill-POC/
├── context-fill-frontend/    # Angular 21 Frontend Application
├── context-fill-backend/     # Node.js + Express Backend API
└── context-fill-firebase/    # Firebase Configuration & Emulator
```

## Features

- 🎨 **Modern Angular 21** with Signals for reactive state management
- 📄 **Drag & Drop** document upload (Images & PDFs)
- 🤖 **AI-Powered Extraction** using Google Gemini API
- 📝 **Auto-fill Forms** from extracted document data
- 🔥 **Firebase Firestore** for data persistence
- 💅 **Elegant UI** with Angular Material Design

## Prerequisites

- Node.js 20+ (recommended 22.x)
- npm 10+
- Angular CLI 21+
- Firebase CLI (for emulator)
- Google Gemini API Key

## Quick Start

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for later use

### 2. Start Firebase Emulator

```bash
cd context-fill-firebase
npm run emulator
```

This starts:
- Firestore Emulator on `localhost:8080`
- Emulator UI on `localhost:4000`

### 3. Start Backend Server

```bash
cd context-fill-backend

# Configure your Gemini API key
# Edit .env and replace 'your_gemini_api_key_here' with your actual key
nano .env

# Install dependencies and start server
npm install
npm run dev
```

Backend runs on `http://localhost:3000`

### 4. Start Frontend Application

```bash
cd context-fill-frontend
npm install
ng serve
```

Frontend runs on `http://localhost:4200`

## Usage

1. Open `http://localhost:4200` in your browser
2. Drag & drop a document (image or PDF) containing contact information
3. Click "Extract Data with AI" to let Gemini analyze the document
4. Review and edit the auto-filled form fields
5. Submit the form to save to Firebase

## API Endpoints

### Documents
- `POST /api/documents/extract` - Extract data from uploaded file
- `POST /api/documents/extract-base64` - Extract data from base64 encoded file

### Forms
- `GET /api/forms` - Get all form submissions
- `POST /api/forms` - Create new submission
- `GET /api/forms/:id` - Get specific submission
- `PUT /api/forms/:id` - Update submission
- `DELETE /api/forms/:id` - Delete submission

### Health
- `GET /api/health` - API health check

## Configuration

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=context-fill-poc
FIREBASE_EMULATOR_HOST=localhost:8080
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:4200
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Technologies Used

### Frontend
- Angular 21 with Standalone Components
- Angular Signals for State Management
- Reactive Forms with Validation
- Angular Material 21 (Material Design 3)
- RxJS for HTTP Operations

### Backend
- Node.js with TypeScript
- Express.js REST API
- Multer for File Uploads
- Firebase Admin SDK
- Google Generative AI SDK

### Database
- Firebase Firestore (Emulator for local development)

## Supported Document Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF

## License

MIT License

## Contributing

This is a proof of concept project. Feel free to fork and extend!

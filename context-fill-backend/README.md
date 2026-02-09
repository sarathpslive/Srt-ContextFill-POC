# Context Fill Backend

Node.js backend API for the Context Fill POC. Features Express.js, Firebase Admin SDK, and Google Gemini AI integration.

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Gemini API key

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server

## API Documentation

### Extract Document Data
```http
POST /api/documents/extract
Content-Type: multipart/form-data

{
  "document": <file>
}
```

### Submit Form
```http
POST /api/forms
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  ...
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| FIREBASE_PROJECT_ID | Firebase project ID | context-fill-poc |
| FIREBASE_EMULATOR_HOST | Firestore emulator host | localhost:8080 |
| GEMINI_API_KEY | Google Gemini API Key | - |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:4200 |

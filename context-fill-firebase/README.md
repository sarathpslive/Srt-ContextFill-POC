# Context Fill Firebase

Firebase configuration and emulator setup for local development.

## Setup

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Start emulator
npm run emulator
```

## Emulator Ports

| Service | Port |
|---------|------|
| Firestore | 8080 |
| Emulator UI | 4000 |

## Access Emulator UI

Open `http://localhost:4000` in your browser to:
- View Firestore data
- Monitor requests
- Clear data
- Import/Export data

## Firestore Rules

The `firestore.rules` file contains security rules for the `form_submissions` collection.

## Data Persistence

To persist emulator data between sessions:

```bash
# Export current data
npm run emulator:export

# Start with imported data
npm run emulator:import
```

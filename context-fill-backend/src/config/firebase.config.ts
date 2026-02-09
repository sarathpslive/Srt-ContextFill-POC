import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

export const initializeFirebase = (): void => {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'context-fill-poc';
  
  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: projectId,
    });
  }

  db = admin.firestore();

  // Connect to Firestore emulator in development
  if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_EMULATOR_HOST) {
    const [host, port] = process.env.FIREBASE_EMULATOR_HOST.split(':');
    db.settings({
      host: process.env.FIREBASE_EMULATOR_HOST,
      ssl: false,
    });
    console.log(`🔥 Connected to Firebase Emulator at ${process.env.FIREBASE_EMULATOR_HOST}`);
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

export { admin };

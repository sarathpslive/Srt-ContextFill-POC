import { getFirestore, admin } from '../config/firebase.config';
import { v4 as uuidv4 } from 'uuid';

export interface FormSubmission {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  notes?: string;
  sourceDocument?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

const COLLECTION_NAME = 'form_submissions';

class FormService {
  async createFormSubmission(data: Omit<FormSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormSubmission> {
    const db = getFirestore();
    const id = uuidv4();
    const now = admin.firestore.Timestamp.now();
    
    const submission: FormSubmission = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };

    await db.collection(COLLECTION_NAME).doc(id).set(submission);
    console.log(`✅ Form submission created with ID: ${id}`);
    
    return submission;
  }

  async getFormSubmission(id: string): Promise<FormSubmission | null> {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data() as FormSubmission;
  }

  async getAllFormSubmissions(): Promise<FormSubmission[]> {
    const db = getFirestore();
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as FormSubmission);
  }

  async updateFormSubmission(id: string, data: Partial<Omit<FormSubmission, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FormSubmission | null> {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const updateData = {
      ...data,
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    await docRef.update(updateData);
    
    const updated = await docRef.get();
    return updated.data() as FormSubmission;
  }

  async deleteFormSubmission(id: string): Promise<boolean> {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    console.log(`🗑️ Form submission deleted: ${id}`);
    return true;
  }
}

export const formService = new FormService();

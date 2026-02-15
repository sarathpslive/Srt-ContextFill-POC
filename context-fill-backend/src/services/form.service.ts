import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

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
  createdAt: string;
  updatedAt: string;
}

const SUBMISSIONS: FormSubmission[] = [];
const LOG_FILE = path.join(process.cwd(), 'form_submissions.log');

class FormService {
  private logSubmission(submission: FormSubmission): void {
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(submission)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
  }

  async createFormSubmission(data: Omit<FormSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormSubmission> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const submission: FormSubmission = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };

    SUBMISSIONS.push(submission);
    this.logSubmission(submission);
    console.log(`✅ Form submission created with ID: ${id}`);
    
    return submission;
  }

  async getFormSubmission(id: string): Promise<FormSubmission | null> {
    return SUBMISSIONS.find(submission => submission.id === id) || null;
  }

  async getAllFormSubmissions(): Promise<FormSubmission[]> {
    return SUBMISSIONS.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateFormSubmission(id: string, data: Partial<Omit<FormSubmission, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FormSubmission | null> {
    const index = SUBMISSIONS.findIndex(submission => submission.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updated: FormSubmission = {
      ...SUBMISSIONS[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    SUBMISSIONS[index] = updated;
    this.logSubmission(updated);
    
    return updated;
  }

  async deleteFormSubmission(id: string): Promise<boolean> {
    const index = SUBMISSIONS.findIndex(submission => submission.id === id);
    
    if (index === -1) {
      return false;
    }
    
    SUBMISSIONS.splice(index, 1);
    console.log(`🗑️ Form submission deleted: ${id}`);
    return true;
  }
}

export const formService = new FormService();

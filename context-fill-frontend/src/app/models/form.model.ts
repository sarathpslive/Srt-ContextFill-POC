export interface FormSubmission {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExtractedData {
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DocumentExtractionResponse {
  success: boolean;
  data: ExtractedData;
  filename: string;
  mimeType: string;
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  FormSubmission, 
  ApiResponse, 
  DocumentExtractionResponse, 
  ExtractedData 
} from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Document extraction endpoints
  extractDocumentData(file: File): Observable<DocumentExtractionResponse> {
    const formData = new FormData();
    formData.append('document', file);
    
    return this.http.post<DocumentExtractionResponse>(
      `${this.apiUrl}/documents/extract`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  extractDocumentDataBase64(
    data: string, 
    mimeType: string, 
    filename: string
  ): Observable<DocumentExtractionResponse> {
    return this.http.post<DocumentExtractionResponse>(
      `${this.apiUrl}/documents/extract-base64`,
      { data, mimeType, filename }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Form submission endpoints
  submitForm(formData: FormSubmission): Observable<ApiResponse<FormSubmission>> {
    return this.http.post<ApiResponse<FormSubmission>>(
      `${this.apiUrl}/forms`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAllSubmissions(): Observable<ApiResponse<FormSubmission[]>> {
    return this.http.get<ApiResponse<FormSubmission[]>>(
      `${this.apiUrl}/forms`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSubmission(id: string): Observable<ApiResponse<FormSubmission>> {
    return this.http.get<ApiResponse<FormSubmission>>(
      `${this.apiUrl}/forms/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateSubmission(id: string, formData: Partial<FormSubmission>): Observable<ApiResponse<FormSubmission>> {
    return this.http.put<ApiResponse<FormSubmission>>(
      `${this.apiUrl}/forms/${id}`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteSubmission(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/forms/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Health check
  checkHealth(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(
      `${this.apiUrl}/health`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.error || error.message || `Error Code: ${error.status}`;
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

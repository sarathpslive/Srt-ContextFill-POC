import { 
  Component, 
  inject, 
  signal, 
  output,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ExtractedData } from '../../models/form.model';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state management
  isDragOver = signal(false);
  isProcessing = signal(false);
  uploadedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  processingProgress = signal(0);
  errorMessage = signal<string | null>(null);

  // Output to emit extracted data to parent
  dataExtracted = output<ExtractedData>();

  // Computed signals
  hasFile = computed(() => this.uploadedFile() !== null);
  canUpload = computed(() => this.hasFile() && !this.isProcessing());

  // Accepted file types
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage.set(null);
    
    // Validate file type
    if (!this.acceptedTypes.includes(file.type)) {
      this.errorMessage.set(`Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF.`);
      this.snackBar.open(this.errorMessage()!, 'Close', { duration: 5000 });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage.set('File size exceeds 10MB limit.');
      this.snackBar.open(this.errorMessage()!, 'Close', { duration: 5000 });
      return;
    }

    this.uploadedFile.set(file);
    this.createPreview(file);
  }

  private createPreview(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, show a generic icon
      this.previewUrl.set(null);
    }
  }

  extractData(): void {
    const file = this.uploadedFile();
    if (!file) return;

    this.isProcessing.set(true);
    this.processingProgress.set(20);
    this.errorMessage.set(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      const current = this.processingProgress();
      if (current < 90) {
        this.processingProgress.set(current + 10);
      }
    }, 500);

    this.apiService.extractDocumentData(file).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.processingProgress.set(100);
        
        if (response.success && response.data) {
          this.dataExtracted.emit(response.data);
          this.snackBar.open('Data extracted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
        
        setTimeout(() => {
          this.isProcessing.set(false);
          this.processingProgress.set(0);
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isProcessing.set(false);
        this.processingProgress.set(0);
        this.errorMessage.set(error.message || 'Failed to extract data');
        this.snackBar.open(this.errorMessage()!, 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeFile(): void {
    this.uploadedFile.set(null);
    this.previewUrl.set(null);
    this.errorMessage.set(null);
    this.processingProgress.set(0);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

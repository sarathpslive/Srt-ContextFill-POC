import { 
  Component, 
  inject, 
  signal, 
  computed,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { ExtractedData } from '../../models/form.model';

interface DetectedForm {
  id: string;
  name: string;
  element: HTMLFormElement;
  fields: string[];
}

@Component({
  selector: 'app-context-fill-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './context-fill-widget.component.html',
  styleUrl: './context-fill-widget.component.scss'
})
export class ContextFillWidgetComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  // Widget state signals
  isOpen = signal(false);
  isMinimized = signal(false);
  isDragOver = signal(false);
  isProcessing = signal(false);
  processingProgress = signal(0);
  
  // Document state
  uploadedFile = signal<File | null>(null);
  extractedData = signal<ExtractedData | null>(null);
  
  // Form detection
  detectedForms = signal<DetectedForm[]>([]);
  selectedFormId = signal<string | null>(null);
  filledFieldsCount = signal(0);
  
  // Computed
  hasFile = computed(() => this.uploadedFile() !== null);
  hasExtractedData = computed(() => this.extractedData() !== null);
  selectedForm = computed(() => 
    this.detectedForms().find(f => f.id === this.selectedFormId())
  );

  // Accepted file types
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  ngOnInit(): void {
    this.detectForms();
    // Re-detect forms periodically for SPAs
    this.formDetectionInterval = setInterval(() => this.detectForms(), 3000);
  }

  private formDetectionInterval: any;

  ngOnDestroy(): void {
    if (this.formDetectionInterval) {
      clearInterval(this.formDetectionInterval);
    }
  }

  toggleWidget(): void {
    if (this.isMinimized()) {
      this.isMinimized.set(false);
    } else {
      this.isOpen.update(v => !v);
    }
  }

  minimizeWidget(): void {
    this.isMinimized.set(true);
  }

  closeWidget(): void {
    this.isOpen.set(false);
    this.isMinimized.set(false);
  }

  // Form Detection
  detectForms(): void {
    const forms = document.querySelectorAll('form');
    const detected: DetectedForm[] = [];

    forms.forEach((form, index) => {
      const formElement = form as HTMLFormElement;
      const fields = this.getFormFields(formElement);
      
      if (fields.length > 0) {
        detected.push({
          id: formElement.id || `form-${index}`,
          name: formElement.name || formElement.id || `Form ${index + 1}`,
          element: formElement,
          fields: fields
        });
      }
    });

    this.detectedForms.set(detected);
    
    // Auto-select first form if none selected
    if (detected.length > 0 && !this.selectedFormId()) {
      this.selectedFormId.set(detected[0].id);
    }
  }

  private getFormFields(form: HTMLFormElement): string[] {
    const fields: string[] = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
      const el = input as HTMLInputElement;
      const name = el.name || el.id || el.getAttribute('formcontrolname');
      if (name && !['submit', 'button', 'hidden'].includes(el.type)) {
        fields.push(name);
      }
    });
    
    return fields;
  }

  // File Handling
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

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  private handleFile(file: File): void {
    if (!this.acceptedTypes.includes(file.type)) {
      this.snackBar.open('Invalid file type. Use images or PDF.', 'Close', { duration: 3000 });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('File too large. Max 10MB.', 'Close', { duration: 3000 });
      return;
    }

    this.uploadedFile.set(file);
    this.extractedData.set(null);
    this.filledFieldsCount.set(0);
  }

  removeFile(): void {
    this.uploadedFile.set(null);
    this.extractedData.set(null);
    this.filledFieldsCount.set(0);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Extract & Fill
  extractAndFill(): void {
    const file = this.uploadedFile();
    const form = this.selectedForm();
    
    if (!file || !form) {
      this.snackBar.open('Please select a file and form', 'Close', { duration: 3000 });
      return;
    }

    this.isProcessing.set(true);
    this.processingProgress.set(20);

    const progressInterval = setInterval(() => {
      const current = this.processingProgress();
      if (current < 90) {
        this.processingProgress.set(current + 10);
      }
    }, 400);

    this.apiService.extractDocumentData(file).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.processingProgress.set(100);
        
        if (response.success && response.data) {
          this.extractedData.set(response.data);
          const filled = this.fillForm(form, response.data);
          this.filledFieldsCount.set(filled);
          
          this.snackBar.open(`Filled ${filled} field(s) successfully!`, 'Close', {
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
        this.snackBar.open(error.message || 'Extraction failed', 'Close', { duration: 5000 });
      }
    });
  }

  private fillForm(form: DetectedForm, data: ExtractedData): number {
    let filledCount = 0;
    const formElement = form.element;
    
    // Field mapping - maps common form field names to extracted data keys
    const fieldMappings: { [key: string]: keyof ExtractedData } = {
      // First Name variations
      'firstname': 'firstName',
      'first_name': 'firstName',
      'fname': 'firstName',
      'givenname': 'firstName',
      'given_name': 'firstName',
      // Last Name variations
      'lastname': 'lastName',
      'last_name': 'lastName',
      'lname': 'lastName',
      'surname': 'lastName',
      'familyname': 'lastName',
      'family_name': 'lastName',
      // Email variations
      'email': 'email',
      'emailaddress': 'email',
      'email_address': 'email',
      'mail': 'email',
      // Phone variations
      'phone': 'phone',
      'phonenumber': 'phone',
      'phone_number': 'phone',
      'telephone': 'phone',
      'tel': 'phone',
      'mobile': 'phone',
      'cell': 'phone',
      // Address variations
      'address': 'address',
      'streetaddress': 'address',
      'street_address': 'address',
      'street': 'address',
      'address1': 'address',
      'addressline1': 'address',
      // City variations
      'city': 'city',
      'town': 'city',
      'locality': 'city',
      // State variations
      'state': 'state',
      'province': 'state',
      'region': 'state',
      // Zip variations
      'zip': 'zipCode',
      'zipcode': 'zipCode',
      'zip_code': 'zipCode',
      'postalcode': 'zipCode',
      'postal_code': 'zipCode',
      'postcode': 'zipCode',
      // Country variations
      'country': 'country',
      'nation': 'country',
      // Company variations
      'company': 'company',
      'companyname': 'company',
      'company_name': 'company',
      'organization': 'company',
      'organisation': 'company',
      'employer': 'company',
      // Job Title variations
      'jobtitle': 'jobTitle',
      'job_title': 'jobTitle',
      'title': 'jobTitle',
      'position': 'jobTitle',
      'role': 'jobTitle',
      // Department variations
      'department': 'department',
      'dept': 'department',
      'division': 'department',
      // Notes variations
      'notes': 'notes',
      'comments': 'notes',
      'message': 'notes',
      'description': 'notes'
    };

    // Get all form inputs
    const inputs = formElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
      const el = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const fieldName = (el.name || el.id || el.getAttribute('formcontrolname') || '').toLowerCase().replace(/[-\s]/g, '');
      
      // Find matching data key
      const dataKey = fieldMappings[fieldName];
      if (dataKey && data[dataKey]) {
        const value = data[dataKey] as string;
        
        // Set value based on input type
        if (el.tagName === 'SELECT') {
          this.setSelectValue(el as HTMLSelectElement, value);
        } else {
          el.value = value;
        }
        
        // Trigger events for Angular/React forms
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        
        // Add visual indicator
        el.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        el.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
          el.style.backgroundColor = '';
        }, 2000);
        
        filledCount++;
      }
    });

    return filledCount;
  }

  private setSelectValue(select: HTMLSelectElement, value: string): void {
    const options = Array.from(select.options);
    const lowerValue = value.toLowerCase();
    
    // Try exact match first
    let matchedOption = options.find(opt => 
      opt.value.toLowerCase() === lowerValue || 
      opt.text.toLowerCase() === lowerValue
    );
    
    // Try partial match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        opt.value.toLowerCase().includes(lowerValue) || 
        opt.text.toLowerCase().includes(lowerValue) ||
        lowerValue.includes(opt.value.toLowerCase()) ||
        lowerValue.includes(opt.text.toLowerCase())
      );
    }
    
    if (matchedOption) {
      select.value = matchedOption.value;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

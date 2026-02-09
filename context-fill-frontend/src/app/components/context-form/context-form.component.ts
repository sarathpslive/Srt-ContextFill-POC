import { 
  Component, 
  inject, 
  signal, 
  computed,
  effect,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { ApiService } from '../../services/api.service';
import { ExtractedData, FormSubmission } from '../../models/form.model';

@Component({
  selector: 'app-context-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    DocumentUploadComponent
  ],
  templateUrl: './context-form.component.html',
  styleUrl: './context-form.component.scss'
})
export class ContextFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  // Form group
  contextForm!: FormGroup;

  // Signals for reactive state
  isSubmitting = signal(false);
  isAutoFilled = signal(false);
  autoFilledFields = signal<string[]>([]);
  submissionSuccess = signal(false);
  lastSubmissionId = signal<string | null>(null);

  // Computed signals
  isFormValid = computed(() => this.contextForm?.valid ?? false);
  filledFieldsCount = computed(() => this.autoFilledFields().length);

  // Countries list for dropdown
  countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'India', 'China', 'Brazil', 'Mexico', 'Spain',
    'Italy', 'Netherlands', 'Switzerland', 'Singapore', 'Other'
  ];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.contextForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      address: [''],
      city: [''],
      state: [''],
      zipCode: ['', [Validators.pattern(/^[\d\-\s]+$/)]],
      country: [''],
      company: [''],
      jobTitle: [''],
      department: [''],
      notes: ['']
    });
  }

  onDataExtracted(data: ExtractedData): void {
    const filledFields: string[] = [];

    // Update form with extracted data
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof ExtractedData];
      if (value && this.contextForm.get(key)) {
        this.contextForm.get(key)?.setValue(value);
        filledFields.push(key);
      }
    });

    this.autoFilledFields.set(filledFields);
    this.isAutoFilled.set(filledFields.length > 0);

    if (filledFields.length > 0) {
      this.snackBar.open(
        `Successfully extracted ${filledFields.length} field(s) from document!`,
        'Close',
        {
          duration: 4000,
          panelClass: ['success-snackbar']
        }
      );
    }
  }

  isFieldAutoFilled(fieldName: string): boolean {
    return this.autoFilledFields().includes(fieldName);
  }

  clearForm(): void {
    this.contextForm.reset();
    this.isAutoFilled.set(false);
    this.autoFilledFields.set([]);
    this.submissionSuccess.set(false);
    this.lastSubmissionId.set(null);
  }

  submitForm(): void {
    if (this.contextForm.invalid) {
      this.contextForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting.set(true);

    const formData: FormSubmission = {
      ...this.contextForm.value,
      sourceDocument: this.isAutoFilled() ? 'AI Extracted' : 'Manual Entry'
    };

    this.apiService.submitForm(formData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.submissionSuccess.set(true);
          this.lastSubmissionId.set(response.data?.id || null);
          this.snackBar.open('Form submitted successfully!', 'Close', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.snackBar.open(error.message || 'Submission failed', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Helper for form field error messages
  getErrorMessage(fieldName: string): string {
    const control = this.contextForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (control.hasError('pattern')) {
      if (fieldName === 'phone') return 'Please enter a valid phone number';
      if (fieldName === 'zipCode') return 'Please enter a valid ZIP code';
    }
    return '';
  }

  formatFieldLabel(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

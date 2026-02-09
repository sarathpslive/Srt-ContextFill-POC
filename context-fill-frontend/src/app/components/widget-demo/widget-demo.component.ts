import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ContextFillWidgetComponent } from '../context-fill-widget/context-fill-widget.component';

@Component({
  selector: 'app-widget-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ContextFillWidgetComponent
  ],
  templateUrl: './widget-demo.component.html',
  styleUrl: './widget-demo.component.scss'
})
export class WidgetDemoComponent {
  // Sample form data
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    company: '',
    jobTitle: '',
    department: '',
    notes: ''
  };

  countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'India', 'China', 'Brazil'
  ];

  onSubmit(): void {
    console.log('Form submitted:', this.formData);
    alert('Form submitted! Check console for data.');
  }

  clearForm(): void {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      company: '',
      jobTitle: '',
      department: '',
      notes: ''
    };
  }
}

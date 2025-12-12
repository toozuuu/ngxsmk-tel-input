/**
 * User registration example with phone input
 */

import { Component, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent, CarrierInfo, FormatSuggestion } from 'ngxsmk-tel-input';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxsmkTelInputComponent],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  theme = input<'light' | 'dark'>('dark');
  
  registrationForm: FormGroup;
  processing = false;
  suggestion: FormatSuggestion | null = null;
  carrierInfo: CarrierInfo | null = null;

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: passwordMatchValidator });
  }

  onIntelligenceChange(info: CarrierInfo | null) {
    this.carrierInfo = info;
  }

  onFormatSuggestion(suggestion: FormatSuggestion | null) {
    this.suggestion = suggestion;
  }

  applySuggestion() {
    if (this.suggestion) {
      this.registrationForm.patchValue({ phone: this.suggestion.suggested });
      this.suggestion = null;
    }
  }

  getTypeDescription(type: string | undefined): string {
    if (!type) {
      return 'Unknown';
    }
    const descriptions: Record<string, string> = {
      'MOBILE': 'Mobile phone',
      'FIXED_LINE': 'Landline',
      'FIXED_LINE_OR_MOBILE': 'Mobile or landline',
      'TOLL_FREE': 'Toll-free',
      'PREMIUM_RATE': 'Premium rate',
      'VOIP': 'VoIP',
      'UNKNOWN': 'Unknown'
    };
    return descriptions[type] || 'Unknown';
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.processing = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Account created:', this.registrationForm.value);
        this.processing = false;
        alert('Account created successfully!');
      }, 2000);
    }
  }

  goBack() {
    console.log('Cancelled registration');
  }
}


/**
 * Profile management example with phone input
 */

import { Component, OnInit, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent, CarrierInfo } from 'ngxsmk-tel-input';
import type { CountryCode } from 'libphonenumber-js';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxsmkTelInputComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  theme = input<'light' | 'dark'>('dark');
  
  profileForm: FormGroup;
  saving = false;
  saved = false;
  initialCountry: CountryCode = 'US';
  carrierInfo: CarrierInfo | null = null;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: [''],
      email: ['', Validators.email],
      phone: [''],
      language: ['en'],
      timezone: ['America/New_York'],
      emailNotifications: [true],
      smsNotifications: [false]
    });
  }

  ngOnInit() {
    // Load user data (simulated)
    this.loadUserData();
  }

  loadUserData() {
    // Simulate loading user data from API
    const userData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+12025551234',
      language: 'en',
      timezone: 'America/New_York',
      emailNotifications: true,
      smsNotifications: false
    };
    
    this.profileForm.patchValue(userData);
    this.initialCountry = 'US';
  }

  onPhoneChange(event: { raw: string; e164: string | null; iso2: CountryCode }) {
    if (event.e164) {
      this.profileForm.patchValue({ phone: event.e164 });
    }
  }

  onCountryChange(event: { iso2: CountryCode }) {
    this.initialCountry = event.iso2;
  }

  onIntelligenceChange(info: CarrierInfo | null) {
    this.carrierInfo = info;
  }

  getTypeDescription(type: string): string {
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
    if (this.profileForm.valid && this.profileForm.dirty) {
      this.saving = true;
      this.saved = false;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Profile updated:', this.profileForm.value);
        this.saving = false;
        this.saved = true;
        this.profileForm.markAsPristine();
        
        setTimeout(() => {
          this.saved = false;
        }, 3000);
      }, 1500);
    }
  }

  resetForm() {
    this.profileForm.reset();
    this.loadUserData();
  }
}


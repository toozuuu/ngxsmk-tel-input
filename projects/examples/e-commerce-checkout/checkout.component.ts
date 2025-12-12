/**
 * E-commerce checkout example with phone input
 */

import { Component, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';
import type { CountryCode } from 'libphonenumber-js';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxsmkTelInputComponent],
  styleUrls: ['./checkout.component.css'],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  theme = input<'light' | 'dark'>('dark');
  
  checkoutForm: FormGroup;
  processing = false;
  subtotal = 99.99;
  shipping = 9.99;
  
  get total(): number {
    return this.subtotal + this.shipping;
  }

  getFormattedPrice(price: number): string {
    return price.toFixed(2);
  }

  constructor(private fb: FormBuilder) {
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    });
  }

  onPhoneChange(event: { raw: string; e164: string | null; iso2: CountryCode }) {
    if (event.e164) {
      this.checkoutForm.patchValue({ phone: event.e164 });
    }
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.processing = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Order placed:', this.checkoutForm.value);
        this.processing = false;
        alert('Order placed successfully!');
      }, 2000);
    }
  }

  goBack() {
    // Navigate back to cart
    console.log('Going back to cart');
  }
}


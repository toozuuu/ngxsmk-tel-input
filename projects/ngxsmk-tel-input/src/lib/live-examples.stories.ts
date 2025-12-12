/**
 * Live code examples for ngxsmk-tel-input
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent } from './ngxsmk-tel-input.component';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';

const meta: Meta<NgxsmkTelInputComponent> = {
  title: 'Examples',
  component: NgxsmkTelInputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, CommonModule, NgxsmkTelInputComponent],
      providers: [NgxsmkTelInputService]
    })
  ],
  parameters: {
    docs: {
      description: {
        component: 'Live, editable code examples demonstrating real-world usage patterns.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<NgxsmkTelInputComponent>;

/**
 * Basic Reactive Forms Example
 */
export const ReactiveFormsExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-phone-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsmkTelInputComponent],
  template: \`
    <form [formGroup]="form">
      <ngxsmk-tel-input
        formControlName="phone"
        label="Phone Number"
        [initialCountry]="'US'"
        [preferredCountries]="['US', 'GB']"
      />
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  \`
})
export class PhoneFormComponent {
  form = this.fb.group({
    phone: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}
}
        `
      }
    }
  },
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      phone: ['', Validators.required]
    });

    return {
      props: { form },
      template: `
        <form [formGroup]="form">
          <ngxsmk-tel-input
            formControlName="phone"
            label="Phone Number"
            [initialCountry]="'US'"
            [preferredCountries]="['US', 'GB']"
            [separateDialCode]="true"
          />
          <div style="margin-top: 1rem;">
            <button 
              type="submit" 
              [disabled]="form.invalid"
              style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Submit
            </button>
            <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <p><strong>Form Value:</strong> {{ form.value | json }}</p>
              <p><strong>Form Valid:</strong> {{ form.valid }}</p>
            </div>
          </div>
        </form>
      `
    };
  }
};

/**
 * Signal-Based API Example
 */
export const SignalAPIExample: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Example using the modern signal-based API'
      },
      source: {
        code: `
import { Component, signal } from '@angular/core';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-signal-phone',
  standalone: true,
  imports: [NgxsmkTelInputComponent],
  template: \`
    <ngxsmk-tel-input
      #phoneInput
      [initialCountrySignal]="country()"
      [sizeSignal]="size()"
      (inputChangeSignal)="onInputChange($event)"
    />
    
    <div>
      <p>Is Valid: {{ phoneInput.isValid() }}</p>
      <p>E.164: {{ phoneInput.e164Value() }}</p>
      <p>Country: {{ phoneInput.currentCountry() }}</p>
    </div>
  \`
})
export class SignalPhoneComponent {
  country = signal('US');
  size = signal('md');

  onInputChange(event: any) {
    console.log('Input changed:', event);
  }
}
        `
      }
    }
  },
  render: () => ({
    template: `
      <div>
        <ngxsmk-tel-input
          #phoneInput
          [initialCountry]="'US'"
          [size]="'md'"
        />
        <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <p><strong>Note:</strong> Signal-based API is available. Check component reference for signal properties.</p>
        </div>
      </div>
    `
  })
};

/**
 * With Intelligence Features Example
 */
export const IntelligenceExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { Component } from '@angular/core';
import { NgxsmkTelInputComponent, CarrierInfo, FormatSuggestion } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-intelligent-phone',
  standalone: true,
  imports: [NgxsmkTelInputComponent],
  template: \`
    <ngxsmk-tel-input
      [enableIntelligence]="true"
      [enableFormatSuggestions]="true"
      (intelligenceChange)="onIntelligenceChange($event)"
      (formatSuggestion)="onFormatSuggestion($event)"
    />
    
    <div *ngIf="carrierInfo">
      <p>Type: {{ carrierInfo.type }}</p>
      <p>Mobile: {{ carrierInfo.isMobile }}</p>
    </div>
    
    <div *ngIf="suggestion">
      <p>Suggested: {{ suggestion.suggested }}</p>
      <button (click)="applySuggestion()">Apply</button>
    </div>
  \`
})
export class IntelligentPhoneComponent {
  carrierInfo: CarrierInfo | null = null;
  suggestion: FormatSuggestion | null = null;

  onIntelligenceChange(info: CarrierInfo | null) {
    this.carrierInfo = info;
  }

  onFormatSuggestion(suggestion: FormatSuggestion | null) {
    this.suggestion = suggestion;
  }

  applySuggestion() {
    // Apply suggestion logic
  }
}
        `
      }
    }
  },
  render: () => ({
    props: {
      carrierInfo: null,
      suggestion: null
    },
    template: `
      <div>
        <ngxsmk-tel-input
          [enableIntelligence]="true"
          [enableFormatSuggestions]="true"
          label="Phone Number"
          hint="Intelligence features enabled"
        />
        <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <p><strong>Note:</strong> Open browser console to see intelligence data</p>
        </div>
      </div>
    `
  })
};

/**
 * Theme Integration Example
 */
export const ThemeIntegrationExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `
// Angular Material Theme
@import 'ngxsmk-tel-input/themes/material';

<ngxsmk-tel-input class="ngxsmk-tel-input-material" />

// PrimeNG Theme
@import 'ngxsmk-tel-input/themes/primeng';

<ngxsmk-tel-input class="ngxsmk-tel-input-primeng" />
        `
      }
    }
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <h4>Default Theme</h4>
          <ngxsmk-tel-input placeholder="Default theme" />
        </div>
        <div>
          <h4>Material Theme (if imported)</h4>
          <ngxsmk-tel-input class="ngxsmk-tel-input-material" placeholder="Material theme" />
        </div>
        <div>
          <h4>PrimeNG Theme (if imported)</h4>
          <ngxsmk-tel-input class="ngxsmk-tel-input-primeng" placeholder="PrimeNG theme" />
        </div>
      </div>
    `
  })
};

/**
 * Validation Example
 */
export const ValidationExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [NgxsmkTelInputComponent],
  template: \`
    <form [formGroup]="form">
      <ngxsmk-tel-input
        formControlName="phone"
        label="Phone Number"
        errorText="Please enter a valid phone number"
      />
      
      <div *ngIf="form.get('phone')?.hasError('required')">
        Phone is required
      </div>
      <div *ngIf="form.get('phone')?.hasError('phoneInvalid')">
        Invalid phone number
      </div>
      <div *ngIf="form.get('phone')?.hasError('phoneInvalidCountryCode')">
        Invalid country code
      </div>
    </form>
  \`
})
export class ValidationComponent {
  form = this.fb.group({
    phone: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}
}
        `
      }
    }
  },
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      phone: ['123', Validators.required] // Invalid number
    });

    return {
      props: { form },
      template: `
        <form [formGroup]="form">
          <ngxsmk-tel-input
            formControlName="phone"
            label="Phone Number"
            errorText="Please enter a valid phone number"
            [initialCountry]="'US'"
          />
          <div style="margin-top: 1rem;">
            <div *ngIf="form.get('phone')?.hasError('required')" style="color: #dc3545;">
              Phone is required
            </div>
            <div *ngIf="form.get('phone')?.hasError('phoneInvalid')" style="color: #dc3545;">
              Invalid phone number
            </div>
            <div *ngIf="form.get('phone')?.hasError('phoneInvalidCountryCode')" style="color: #dc3545;">
              Invalid country code
            </div>
          </div>
        </form>
      `
    };
  }
};


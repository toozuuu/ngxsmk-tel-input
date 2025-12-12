/**
 * Storybook stories for ngxsmk-tel-input
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent } from './ngxsmk-tel-input.component';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';

const meta: Meta<NgxsmkTelInputComponent> = {
  title: 'Components/Phone Input',
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
        component: 'A comprehensive Angular telephone input component with country dropdown, flags, and robust validation/formatting.'
      }
    }
  },
  argTypes: {
    initialCountry: {
      control: 'text',
      description: 'Initial country to select. Use "auto" for geo-location detection.'
    },
    preferredCountries: {
      control: 'object',
      description: 'Countries to show at the top of the dropdown list.'
    },
    separateDialCode: {
      control: 'boolean',
      description: 'Show dial code outside the input field.'
    },
    allowDropdown: {
      control: 'boolean',
      description: 'Enable or disable the country dropdown.'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the input.'
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underline'],
      description: 'Style variant of the input.'
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'auto'],
      description: 'Theme preference for the component.'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the control.'
    },
    showClear: {
      control: 'boolean',
      description: 'Show a clear button when not empty.'
    },
    enableIntelligence: {
      control: 'boolean',
      description: 'Enable carrier and number type detection.'
    },
    enableFormatSuggestions: {
      control: 'boolean',
      description: 'Enable format suggestions for invalid numbers.'
    }
  }
};

export default meta;
type Story = StoryObj<NgxsmkTelInputComponent>;

/**
 * Basic usage example
 */
export const Basic: Story = {
  args: {
    initialCountry: 'US',
    preferredCountries: ['US', 'GB'],
    separateDialCode: true,
    showClear: true,
    size: 'md',
    variant: 'outline',
    theme: 'auto'
  },
  render: (args) => ({
    props: args,
    template: `
      <ngxsmk-tel-input
        [initialCountry]="initialCountry"
        [preferredCountries]="preferredCountries"
        [separateDialCode]="separateDialCode"
        [showClear]="showClear"
        [size]="size"
        [variant]="variant"
        [theme]="theme"
        label="Phone Number"
        hint="Enter your phone number"
        (inputChange)="onInputChange($event)"
        (countryChange)="onCountryChange($event)"
      />
    `
  })
};

/**
 * With reactive forms
 */
export const WithReactiveForms: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      phone: ['', Validators.required]
    });

    return {
      props: {
        form,
        onPhoneChange: (event: any) => {
          console.log('Phone changed:', event);
        }
      },
      template: `
        <form [formGroup]="form">
          <ngxsmk-tel-input
            formControlName="phone"
            label="Phone Number"
            hint="Required field"
            [initialCountry]="'US'"
            [preferredCountries]="['US', 'GB', 'CA']"
            [separateDialCode]="true"
          />
          <div style="margin-top: 1rem;">
            <p><strong>Form Value:</strong> {{ form.value | json }}</p>
            <p><strong>Form Valid:</strong> {{ form.valid }}</p>
            <p><strong>Form Errors:</strong> {{ form.get('phone')?.errors | json }}</p>
          </div>
        </form>
      `
    };
  }
};

/**
 * Size variants
 */
export const SizeVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Small</label>
          <ngxsmk-tel-input [size]="'sm'" [variant]="'outline'" placeholder="Small input" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Medium (default)</label>
          <ngxsmk-tel-input [size]="'md'" [variant]="'outline'" placeholder="Medium input" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Large</label>
          <ngxsmk-tel-input [size]="'lg'" [variant]="'outline'" placeholder="Large input" />
        </div>
      </div>
    `
  })
};

/**
 * Style variants
 */
export const StyleVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Outline</label>
          <ngxsmk-tel-input [variant]="'outline'" placeholder="Outline style" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Filled</label>
          <ngxsmk-tel-input [variant]="'filled'" placeholder="Filled style" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Underline</label>
          <ngxsmk-tel-input [variant]="'underline'" placeholder="Underline style" />
        </div>
      </div>
    `
  })
};

/**
 * Theme variants
 */
export const ThemeVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Light Theme</label>
          <ngxsmk-tel-input [theme]="'light'" placeholder="Light theme" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Dark Theme</label>
          <ngxsmk-tel-input [theme]="'dark'" placeholder="Dark theme" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Auto Theme</label>
          <ngxsmk-tel-input [theme]="'auto'" placeholder="Auto theme" />
        </div>
      </div>
    `
  })
};

/**
 * With intelligence features
 */
export const WithIntelligence: Story = {
  render: () => ({
    props: {
      carrierInfo: null,
      suggestion: null,
      onIntelligenceChange: (info: any) => {
        console.log('Intelligence:', info);
      },
      onFormatSuggestion: (suggestion: any) => {
        console.log('Suggestion:', suggestion);
      }
    },
    template: `
      <div>
        <ngxsmk-tel-input
          label="Phone Number"
          hint="Intelligence features enabled"
          [initialCountry]="'US'"
          [enableIntelligence]="true"
          [enableFormatSuggestions]="true"
          (intelligenceChange)="onIntelligenceChange($event)"
          (formatSuggestion)="onFormatSuggestion($event)"
        />
        <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <p><strong>Note:</strong> Open browser console to see intelligence data</p>
        </div>
      </div>
    `
  })
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => ({
    template: `
      <ngxsmk-tel-input
        [disabled]="true"
        label="Phone Number"
        hint="This input is disabled"
        [initialCountry]="'US'"
      />
    `
  })
};

/**
 * With error state
 */
export const WithError: Story = {
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
        </form>
      `
    };
  }
};

/**
 * Preferred countries
 */
export const PreferredCountries: Story = {
  render: () => ({
    template: `
      <ngxsmk-tel-input
        label="Phone Number"
        hint="Preferred countries: US, GB, AU, CA, DE, FR"
        [initialCountry]="'US'"
        [preferredCountries]="['US', 'GB', 'AU', 'CA', 'DE', 'FR']"
        [separateDialCode]="true"
      />
    `
  })
};

/**
 * Only specific countries
 */
export const OnlyCountries: Story = {
  render: () => ({
    template: `
      <ngxsmk-tel-input
        label="Phone Number"
        hint="Only US, GB, and CA are available"
        [initialCountry]="'US'"
        [onlyCountries]="['US', 'GB', 'CA']"
        [separateDialCode]="true"
      />
    `
  })
};

/**
 * RTL support
 */
export const RTLSupport: Story = {
  render: () => ({
    template: `
      <div dir="rtl" style="direction: rtl;">
        <ngxsmk-tel-input
          label="رقم الهاتف"
          hint="أدخل رقم هاتفك"
          [initialCountry]="'AE'"
          [preferredCountries]="['AE', 'SA', 'EG']"
          dir="rtl"
        />
      </div>
    `
  })
};


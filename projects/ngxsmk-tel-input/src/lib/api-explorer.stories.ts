/**
 * Interactive API Explorer for ngxsmk-tel-input
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent } from './ngxsmk-tel-input.component';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';

const meta: Meta<NgxsmkTelInputComponent> = {
  title: 'API Explorer',
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
        component: 'Interactive API explorer to test all component properties and events in real-time.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<NgxsmkTelInputComponent>;

/**
 * Interactive API Explorer
 */
export const InteractiveExplorer: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      phone: ['', Validators.required]
    });

    return {
      props: {
        form,
        config: {
          initialCountry: 'US',
          preferredCountries: ['US', 'GB'],
          onlyCountries: null,
          separateDialCode: true,
          allowDropdown: true,
          size: 'md',
          variant: 'outline',
          theme: 'auto',
          disabled: false,
          showClear: true,
          enableIntelligence: false,
          enableFormatSuggestions: false,
          label: 'Phone Number',
          hint: 'Enter your phone number',
          placeholder: '',
          errorText: ''
        },
        events: {
          inputChange: null,
          countryChange: null,
          validityChange: null,
          intelligenceChange: null,
          formatSuggestion: null
        },
        updateConfig: (key: string, value: any) => {
          console.log('Config updated:', key, value);
        },
        onInputChange: (event: any) => {
          console.log('Input change:', event);
        },
        onCountryChange: (event: any) => {
          console.log('Country change:', event);
        },
        onValidityChange: (valid: boolean) => {
          console.log('Validity change:', valid);
        }
      },
      template: `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <!-- Component Preview -->
          <div>
            <h3 style="margin-bottom: 1rem;">Component Preview</h3>
            <form [formGroup]="form">
              <ngxsmk-tel-input
                formControlName="phone"
                [initialCountry]="config.initialCountry"
                [preferredCountries]="config.preferredCountries"
                [onlyCountries]="config.onlyCountries"
                [separateDialCode]="config.separateDialCode"
                [allowDropdown]="config.allowDropdown"
                [size]="config.size"
                [variant]="config.variant"
                [theme]="config.theme"
                [disabled]="config.disabled"
                [showClear]="config.showClear"
                [enableIntelligence]="config.enableIntelligence"
                [enableFormatSuggestions]="config.enableFormatSuggestions"
                [label]="config.label"
                [hint]="config.hint"
                [placeholder]="config.placeholder"
                [errorText]="config.errorText"
                (inputChange)="onInputChange($event); events.inputChange = $event"
                (countryChange)="onCountryChange($event); events.countryChange = $event"
                (validityChange)="onValidityChange($event); events.validityChange = $event"
              />
            </form>
            
            <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <h4>Form State</h4>
              <p><strong>Value:</strong> {{ form.value | json }}</p>
              <p><strong>Valid:</strong> {{ form.valid }}</p>
              <p><strong>Errors:</strong> {{ form.get('phone')?.errors | json }}</p>
            </div>
          </div>
          
          <!-- Configuration Panel -->
          <div>
            <h3 style="margin-bottom: 1rem;">Configuration</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 600px; overflow-y: auto;">
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Initial Country</label>
                <input 
                  type="text" 
                  [value]="config.initialCountry"
                  (input)="config.initialCountry = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Preferred Countries</label>
                <input 
                  type="text" 
                  [value]="config.preferredCountries.join(',')"
                  (input)="config.preferredCountries = $event.target.value.split(',').map(c => c.trim())"
                  placeholder="US, GB, CA"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                />
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input 
                    type="checkbox" 
                    [checked]="config.separateDialCode"
                    (change)="config.separateDialCode = $event.target.checked"
                  />
                  Separate Dial Code
                </label>
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input 
                    type="checkbox" 
                    [checked]="config.allowDropdown"
                    (change)="config.allowDropdown = $event.target.checked"
                  />
                  Allow Dropdown
                </label>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Size</label>
                <select 
                  [value]="config.size"
                  (change)="config.size = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Variant</label>
                <select 
                  [value]="config.variant"
                  (change)="config.variant = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                >
                  <option value="outline">Outline</option>
                  <option value="filled">Filled</option>
                  <option value="underline">Underline</option>
                </select>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Theme</label>
                <select 
                  [value]="config.theme"
                  (change)="config.theme = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input 
                    type="checkbox" 
                    [checked]="config.disabled"
                    (change)="config.disabled = $event.target.checked"
                  />
                  Disabled
                </label>
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input 
                    type="checkbox" 
                    [checked]="config.showClear"
                    (change)="config.showClear = $event.target.checked"
                  />
                  Show Clear Button
                </label>
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input 
                    type="checkbox" 
                    [checked]="config.enableIntelligence"
                    (change)="config.enableIntelligence = $event.target.checked"
                  />
                  Enable Intelligence
                </label>
              </div>
              
              <div>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input 
                    type="checkbox" 
                    [checked]="config.enableFormatSuggestions"
                    (change)="config.enableFormatSuggestions = $event.target.checked"
                  />
                  Enable Format Suggestions
                </label>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Label</label>
                <input 
                  type="text" 
                  [value]="config.label"
                  (input)="config.label = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Hint</label>
                <input 
                  type="text" 
                  [value]="config.hint"
                  (input)="config.hint = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Placeholder</label>
                <input 
                  type="text" 
                  [value]="config.placeholder"
                  (input)="config.placeholder = $event.target.value"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                />
              </div>
            </div>
            
            <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <h4>Events</h4>
              <div style="font-size: 0.875rem;">
                <p><strong>Input Change:</strong> {{ events.inputChange | json }}</p>
                <p><strong>Country Change:</strong> {{ events.countryChange | json }}</p>
                <p><strong>Validity Change:</strong> {{ events.validityChange }}</p>
              </div>
            </div>
          </div>
        </div>
      `
    };
  }
};


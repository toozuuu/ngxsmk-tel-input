# Phone Intelligence Features

The `ngxsmk-tel-input` component includes advanced phone intelligence features for carrier detection, number type detection, and smart formatting suggestions.

## Features

### Carrier and Number Type Detection

Detect the type of phone number (mobile, landline, toll-free, etc.) and carrier information.

```typescript
import { Component } from '@angular/core';
import { NgxsmkTelInputComponent, PhoneIntelligenceService, CarrierInfo } from 'ngxsmk-tel-input';

@Component({
  template: `
    <ngxsmk-tel-input
      [enableIntelligence]="true"
      (intelligenceChange)="onIntelligenceChange($event)"
      formControlName="phone"
    />
    
    <div *ngIf="carrierInfo">
      <p>Type: {{ carrierInfo.type }}</p>
      <p>Mobile: {{ carrierInfo.isMobile }}</p>
      <p>Landline: {{ carrierInfo.isLandline }}</p>
      <p>Toll-free: {{ carrierInfo.isTollFree }}</p>
    </div>
  `
})
export class MyComponent {
  carrierInfo: CarrierInfo | null = null;

  onIntelligenceChange(info: CarrierInfo | null) {
    this.carrierInfo = info;
  }
}
```

### Format Suggestions

Get smart suggestions for correcting phone number format.

```typescript
import { Component } from '@angular/core';
import { NgxsmkTelInputComponent, FormatSuggestion } from 'ngxsmk-tel-input';

@Component({
  template: `
    <ngxsmk-tel-input
      [enableFormatSuggestions]="true"
      (formatSuggestion)="onFormatSuggestion($event)"
      formControlName="phone"
    />
    
    <div *ngIf="suggestion" class="suggestion">
      <p>Did you mean: {{ suggestion.suggested }}?</p>
      <p>Reason: {{ suggestion.reason }}</p>
      <button (click)="applySuggestion()">Apply</button>
    </div>
  `
})
export class MyComponent {
  suggestion: FormatSuggestion | null = null;

  onFormatSuggestion(suggestion: FormatSuggestion | null) {
    this.suggestion = suggestion;
  }

  applySuggestion() {
    if (this.suggestion) {
      // Apply the suggested format
      this.phoneInput.writeValue(this.suggestion.suggested);
    }
  }
}
```

## Service API

### PhoneIntelligenceService

#### detectCarrierAndType(phoneNumber: string, country: CountryCode): CarrierInfo | null

Detects carrier and number type information.

**Returns:**
- `CarrierInfo` with type, mobile/landline flags, etc.
- `null` if detection fails

#### suggestFormatCorrection(input: string, country: CountryCode): FormatSuggestion | null

Suggests format corrections for invalid phone numbers.

**Returns:**
- `FormatSuggestion` with suggested format and confidence
- `null` if no suggestion available

#### getNumberTypeDescription(type: NumberType): string

Gets human-readable description of number type.

#### getTimezone(phoneNumber: string, country: CountryCode): string | null

Gets timezone for phone number's country.

#### isLikelySpam(phoneNumber: string, country: CountryCode): boolean

Checks if number matches spam patterns (basic heuristic).

## Number Types

- `MOBILE`: Mobile phone number
- `FIXED_LINE`: Landline number
- `FIXED_LINE_OR_MOBILE`: Could be either
- `TOLL_FREE`: Toll-free number
- `PREMIUM_RATE`: Premium rate number
- `VOIP`: VoIP number
- `UNKNOWN`: Unknown type

## Example: Complete Intelligence Integration

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxsmkTelInputComponent, CarrierInfo, FormatSuggestion } from 'ngxsmk-tel-input';

@Component({
  template: `
    <form [formGroup]="form">
      <ngxsmk-tel-input
        formControlName="phone"
        [enableIntelligence]="true"
        [enableFormatSuggestions]="true"
        (intelligenceChange)="onIntelligenceChange($event)"
        (formatSuggestion)="onFormatSuggestion($event)"
      />
      
      <!-- Intelligence Info -->
      <div *ngIf="carrierInfo" class="intelligence-info">
        <h3>Number Information</h3>
        <p><strong>Type:</strong> {{ getTypeDescription(carrierInfo.type) }}</p>
        <p><strong>Mobile:</strong> {{ carrierInfo.isMobile ? 'Yes' : 'No' }}</p>
        <p><strong>Landline:</strong> {{ carrierInfo.isLandline ? 'Yes' : 'No' }}</p>
        <p *ngIf="carrierInfo.isTollFree"><strong>Toll-free:</strong> Yes</p>
      </div>
      
      <!-- Format Suggestion -->
      <div *ngIf="suggestion" class="format-suggestion">
        <p><strong>Suggested format:</strong> {{ suggestion.suggested }}</p>
        <p><strong>Reason:</strong> {{ suggestion.reason }}</p>
        <p><strong>Confidence:</strong> {{ suggestion.confidence * 100 }}%</p>
        <button (click)="applySuggestion()">Apply Suggestion</button>
      </div>
    </form>
  `
})
export class MyComponent {
  form: FormGroup;
  carrierInfo: CarrierInfo | null = null;
  suggestion: FormatSuggestion | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      phone: ['', Validators.required]
    });
  }

  onIntelligenceChange(info: CarrierInfo | null) {
    this.carrierInfo = info;
  }

  onFormatSuggestion(suggestion: FormatSuggestion | null) {
    this.suggestion = suggestion;
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

  applySuggestion() {
    if (this.suggestion) {
      this.form.patchValue({ phone: this.suggestion.suggested });
    }
  }
}
```

## Performance Considerations

- Intelligence features are optional and disabled by default
- Detection runs only when `enableIntelligence` is true
- Format suggestions only appear for invalid numbers
- All intelligence operations are cached for performance


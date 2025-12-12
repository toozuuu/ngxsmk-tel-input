# Signal-Based API Documentation

The `ngxsmk-tel-input` component now supports a modern signal-based API alongside the traditional `@Input`/`@Output` decorators for full backward compatibility.

## Signal-Based Inputs

All major inputs are available as signals:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input
      [initialCountrySignal]="'US'"
      [preferredCountriesSignal]="['US', 'GB']"
      [sizeSignal]="'md'"
      [variantSignal]="'outline'"
      [themeSignal]="'auto'"
      [disabledSignal]="false"
    />
  `
})
export class MyComponent {
  // Signals are reactive and update automatically
  country = signal<CountryCode>('US');
  size = signal<'sm' | 'md' | 'lg'>('md');
}
```

## Signal-Based Outputs

Events are available as signal outputs:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input
      (countryChangeSignal)="onCountryChange($event)"
      (validityChangeSignal)="onValidityChange($event)"
      (inputChangeSignal)="onInputChange($event)"
    />
  `
})
export class MyComponent {
  onCountryChange(event: { iso2: CountryCode }) {
    console.log('Country changed:', event.iso2);
  }
  
  onValidityChange(isValid: boolean) {
    console.log('Validity changed:', isValid);
  }
  
  onInputChange(event: { raw: string; e164: string | null; iso2: CountryCode }) {
    console.log('Input changed:', event);
  }
}
```

## Computed Signals

The component exposes several computed signals for reactive state:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input #telInput />
    
    <div>
      <p>Is Valid: {{ telInput.isValid() }}</p>
      <p>Has Errors: {{ telInput.hasErrors() }}</p>
      <p>E.164 Value: {{ telInput.e164Value() }}</p>
      <p>Raw Value: {{ telInput.rawValue() }}</p>
      <p>Current Country: {{ telInput.currentCountry() }}</p>
    </div>
  `
})
export class MyComponent {
  @ViewChild('telInput') telInput!: NgxsmkTelInputComponent;
}
```

## State Signal

Access the full state signal:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input #telInput />
    
    <div>
      <pre>{{ telInput.state() | json }}</pre>
    </div>
  `
})
export class MyComponent {
  @ViewChild('telInput') telInput!: NgxsmkTelInputComponent;
  
  ngAfterViewInit() {
    // Subscribe to state changes
    effect(() => {
      const state = this.telInput.state();
      console.log('State changed:', state);
    });
  }
}
```

## Validation Status Signal

Get detailed validation information:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input #telInput />
    
    <div>
      <p>Is Valid: {{ telInput.validationStatus().isValid }}</p>
      <p>Is Invalid: {{ telInput.validationStatus().isInvalid }}</p>
      <p>Has Errors: {{ telInput.validationStatus().hasErrors }}</p>
      <p>Error Keys: {{ telInput.validationStatus().errorKeys }}</p>
    </div>
  `
})
export class MyComponent {
  @ViewChild('telInput') telInput!: NgxsmkTelInputComponent;
}
```

## Phone Metadata Signal

Get phone number metadata:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input #telInput />
    
    <div>
      <p>Country Code: {{ telInput.phoneMetadata().countryCode }}</p>
      <p>Dial Code: {{ telInput.phoneMetadata().dialCode }}</p>
      <p>National Number: {{ telInput.phoneMetadata().nationalNumber }}</p>
      <p>International Format: {{ telInput.phoneMetadata().internationalFormat }}</p>
    </div>
  `
})
export class MyComponent {
  @ViewChild('telInput') telInput!: NgxsmkTelInputComponent;
}
```

## Backward Compatibility

All traditional `@Input` and `@Output` decorators continue to work:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input
      [initialCountry]="'US'"
      [preferredCountries]="['US', 'GB']"
      (countryChange)="onCountryChange($event)"
      (inputChange)="onInputChange($event)"
    />
  `
})
export class MyComponent {
  // Traditional API still works
}
```

## Mixing Signals and Traditional API

You can mix signals and traditional inputs:

```typescript
@Component({
  template: `
    <ngxsmk-tel-input
      [initialCountrySignal]="country()"
      [preferredCountries]="['US', 'GB']"
      (countryChangeSignal)="onCountryChange($event)"
      (inputChange)="onInputChange($event)"
    />
  `
})
export class MyComponent {
  country = signal<CountryCode>('US');
}
```

The component will use signal values when available, falling back to traditional inputs.


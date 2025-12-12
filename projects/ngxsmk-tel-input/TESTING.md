# Testing Utilities Documentation

The `ngxsmk-tel-input` library provides comprehensive testing utilities for unit tests, integration tests, and E2E tests.

## Mock Service

### Usage in Unit Tests

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockNgxsmkTelInputService } from 'ngxsmk-tel-input/testing';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockPhoneService: MockNgxsmkTelInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsmkTelInputComponent],
      providers: [
        {
          provide: NgxsmkTelInputService,
          useClass: MockNgxsmkTelInputService
        }
      ]
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    mockPhoneService = TestBed.inject(NgxsmkTelInputService) as MockNgxsmkTelInputService;
  });

  it('should validate phone number', () => {
    // Configure mock
    mockPhoneService.addValidNumber('2025551234', 'US');
    
    // Test your component
    component.phoneInput.writeValue('2025551234');
    expect(component.phoneInput.isValid()).toBe(true);
  });
});
```

### Mock Service Methods

- `addValidNumber(number: string, country?: CountryCode)`: Add a valid phone number
- `addInvalidNumber(number: string, country?: CountryCode)`: Add an invalid phone number
- `setParseResult(input: string, country: CountryCode, result: ParseResult)`: Set custom parse result
- `setShouldThrowError(shouldThrow: boolean, message?: string)`: Configure error throwing
- `clearMocks()`: Clear all mock data

## Test Fixtures

### Usage

```typescript
import { 
  TEST_PHONE_NUMBERS, 
  TEST_COUNTRIES,
  TEST_SCENARIOS,
  getPhoneInputComponent,
  setPhoneInputValue,
  triggerInputEvent
} from 'ngxsmk-tel-input/testing';

describe('PhoneInputComponent', () => {
  it('should handle valid US number', () => {
    const scenario = TEST_SCENARIOS.validUSNumber;
    const component = getPhoneInputComponent(fixture);
    
    setPhoneInputValue(component, scenario.input);
    selectCountry(component, scenario.country);
    
    expect(component.e164Value()).toBe(scenario.expectedE164);
    expect(component.isValid()).toBe(scenario.expectedValid);
  });
});
```

### Available Fixtures

- `TEST_PHONE_NUMBERS`: Pre-defined valid and invalid phone numbers
- `TEST_COUNTRIES`: List of test country codes
- `TEST_SCENARIOS`: Common test scenarios

### Helper Functions

- `getPhoneInputComponent(fixture)`: Get phone input component from fixture
- `setPhoneInputValue(component, value)`: Set phone input value
- `selectCountry(component, country)`: Select country
- `triggerInputEvent(fixture, value)`: Trigger input event
- `triggerBlurEvent(fixture)`: Trigger blur event
- `triggerFocusEvent(fixture)`: Trigger focus event
- `getInputValue(fixture)`: Get current input value
- `isInputValid(component)`: Check if input is valid
- `hasInputErrors(component)`: Check if input has errors
- `getValidationErrors(component)`: Get validation errors

## E2E Helpers

### Usage with Protractor

```typescript
import { 
  typePhoneNumber, 
  getPhoneInputValue,
  isErrorDisplayed,
  E2E_SCENARIOS
} from 'ngxsmk-tel-input/testing';

describe('Phone Input E2E', () => {
  it('should validate phone number', async () => {
    await E2E_SCENARIOS.testValidPhoneInput('2025551234', 'US');
  });

  it('should show error for invalid number', async () => {
    await E2E_SCENARIOS.testInvalidPhoneInput('123', 'US');
  });
});
```

### E2E Helper Functions

- `getPhoneInput()`: Get phone input element
- `typePhoneNumber(value)`: Type phone number
- `clearPhoneInput()`: Clear phone input
- `getPhoneInputValue()`: Get input value
- `clickCountryDropdown()`: Click country dropdown
- `selectCountryFromDropdown(countryCode)`: Select country
- `clickClearButton()`: Click clear button
- `getErrorMessage()`: Get error message
- `isErrorDisplayed()`: Check if error is displayed
- `focusPhoneInput()`: Focus phone input
- `blurPhoneInput()`: Blur phone input

### E2E Test Scenarios

- `E2E_SCENARIOS.testValidPhoneInput(phoneNumber, countryCode)`: Test valid input
- `E2E_SCENARIOS.testInvalidPhoneInput(phoneNumber, countryCode)`: Test invalid input
- `E2E_SCENARIOS.testCountrySelection(countryCode)`: Test country selection
- `E2E_SCENARIOS.testClearButton()`: Test clear button

## Testing Module

Use the testing module for easy setup:

```typescript
import { NgxsmkTelInputTestingModule } from 'ngxsmk-tel-input/testing';

TestBed.configureTestingModule({
  imports: [NgxsmkTelInputTestingModule]
});
```

## Example Test Suite

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { 
  NgxsmkTelInputComponent,
  MockNgxsmkTelInputService,
  TEST_SCENARIOS,
  getPhoneInputComponent
} from 'ngxsmk-tel-input';

describe('PhoneInputComponent', () => {
  let component: NgxsmkTelInputComponent;
  let fixture: ComponentFixture<NgxsmkTelInputComponent>;
  let mockService: MockNgxsmkTelInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgxsmkTelInputComponent],
      providers: [
        {
          provide: NgxsmkTelInputService,
          useClass: MockNgxsmkTelInputService
        }
      ]
    });

    fixture = TestBed.createComponent(NgxsmkTelInputComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(NgxsmkTelInputService) as MockNgxsmkTelInputService;
  });

  it('should validate valid US number', () => {
    const scenario = TEST_SCENARIOS.validUSNumber;
    mockService.addValidNumber(scenario.input, scenario.country);
    
    component.writeValue(scenario.input);
    component.selectCountry(scenario.country);
    fixture.detectChanges();
    
    expect(component.isValid()).toBe(true);
    expect(component.e164Value()).toBe(scenario.expectedE164);
  });

  it('should show error for invalid number', () => {
    const scenario = TEST_SCENARIOS.invalidNumber;
    mockService.addInvalidNumber(scenario.input, scenario.country);
    
    component.writeValue(scenario.input);
    fixture.detectChanges();
    
    expect(component.isValid()).toBe(false);
    expect(component.hasErrors()).toBe(true);
  });
});
```


/**
 * E2E testing helpers for ngxsmk-tel-input
 */

// Protractor types are optional - only needed for E2E tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ElementFinder = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const by = { css: (selector: string) => ({ selector }) } as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const element = (selector: any) => selector as any;

/**
 * E2E selectors
 */
export const E2E_SELECTORS = {
  phoneInput: 'ngxsmk-tel-input input[type="tel"]',
  phoneInputWrapper: 'ngxsmk-tel-input',
  countryDropdown: '.iti__selected-flag',
  countryList: '.iti__country-list',
  clearButton: '.ngxsmk-tel__clear',
  errorMessage: '.ngxsmk-tel__error',
  hint: '.ngxsmk-tel__hint',
  label: '.ngxsmk-tel__label'
};

/**
 * Get phone input element
 */
export function getPhoneInput(): ElementFinder {
  return element(by.css(E2E_SELECTORS.phoneInput));
}

/**
 * Get phone input wrapper
 */
export function getPhoneInputWrapper(): ElementFinder {
  return element(by.css(E2E_SELECTORS.phoneInputWrapper));
}

/**
 * Type phone number
 */
export async function typePhoneNumber(value: string): Promise<void> {
  const input = getPhoneInput();
  await input.clear();
  await input.sendKeys(value);
}

/**
 * Clear phone input
 */
export async function clearPhoneInput(): Promise<void> {
  const input = getPhoneInput();
  await input.clear();
}

/**
 * Get phone input value
 */
export async function getPhoneInputValue(): Promise<string> {
  const input = getPhoneInput();
  return await input.getAttribute('value');
}

/**
 * Click country dropdown
 */
export async function clickCountryDropdown(): Promise<void> {
  const dropdown = element(by.css(E2E_SELECTORS.countryDropdown));
  await dropdown.click();
}

/**
 * Select country from dropdown
 */
export async function selectCountryFromDropdown(countryCode: string): Promise<void> {
  await clickCountryDropdown();
  const countryItem = element(by.css(`.iti__country[data-country-code="${countryCode.toLowerCase()}"]`));
  await countryItem.click();
}

/**
 * Click clear button
 */
export async function clickClearButton(): Promise<void> {
  const clearBtn = element(by.css(E2E_SELECTORS.clearButton));
  if (await clearBtn.isPresent()) {
    await clearBtn.click();
  }
}

/**
 * Get error message
 */
export async function getErrorMessage(): Promise<string> {
  const errorEl = element(by.css(E2E_SELECTORS.errorMessage));
  if (await errorEl.isPresent()) {
    return await errorEl.getText();
  }
  return '';
}

/**
 * Check if error is displayed
 */
export async function isErrorDisplayed(): Promise<boolean> {
  const errorEl = element(by.css(E2E_SELECTORS.errorMessage));
  return await errorEl.isPresent();
}

/**
 * Get hint text
 */
export async function getHintText(): Promise<string> {
  const hintEl = element(by.css(E2E_SELECTORS.hint));
  if (await hintEl.isPresent()) {
    return await hintEl.getText();
  }
  return '';
}

/**
 * Get label text
 */
export async function getLabelText(): Promise<string> {
  const labelEl = element(by.css(E2E_SELECTORS.label));
  if (await labelEl.isPresent()) {
    return await labelEl.getText();
  }
  return '';
}

/**
 * Check if input is disabled
 */
export async function isInputDisabled(): Promise<boolean> {
  const input = getPhoneInput();
  return await input.getAttribute('disabled').then(
    (value: string | null) => value !== null,
    () => false
  );
}

/**
 * Focus phone input
 */
export async function focusPhoneInput(): Promise<void> {
  const input = getPhoneInput();
  await input.click();
}

/**
 * Blur phone input
 */
export async function blurPhoneInput(): Promise<void> {
  // Click outside the input
  const body = element(by.tagName('body'));
  await body.click();
}

/**
 * Wait for validation
 */
export async function waitForValidation(timeout: number = 1000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Check if country dropdown is open
 */
export async function isCountryDropdownOpen(): Promise<boolean> {
  const countryList = element(by.css(E2E_SELECTORS.countryList));
  return await countryList.isPresent() && await countryList.isDisplayed();
}

/**
 * Search for country in dropdown
 */
export async function searchCountryInDropdown(searchTerm: string): Promise<void> {
  await clickCountryDropdown();
  const searchInput = element(by.css('.iti__search-input'));
  if (await searchInput.isPresent()) {
    await searchInput.clear();
    await searchInput.sendKeys(searchTerm);
  }
}

/**
 * Get selected country code
 */
export async function getSelectedCountryCode(): Promise<string> {
  const flag = element(by.css(E2E_SELECTORS.countryDropdown));
  if (await flag.isPresent()) {
    const countryCode = await flag.getAttribute('data-country-code');
    return countryCode ? countryCode.toUpperCase() : '';
  }
  return '';
}

/**
 * E2E test scenarios
 */
export const E2E_SCENARIOS = {
  /**
   * Test valid phone number input
   */
  async testValidPhoneInput(phoneNumber: string, countryCode: string = 'US'): Promise<void> {
    await selectCountryFromDropdown(countryCode);
    await typePhoneNumber(phoneNumber);
    await waitForValidation();
    const errorDisplayed = await isErrorDisplayed();
    if (errorDisplayed) {
      throw new Error(`Expected valid input but error was displayed: ${await getErrorMessage()}`);
    }
  },

  /**
   * Test invalid phone number input
   */
  async testInvalidPhoneInput(phoneNumber: string, countryCode: string = 'US'): Promise<void> {
    await selectCountryFromDropdown(countryCode);
    await typePhoneNumber(phoneNumber);
    await waitForValidation();
    const errorDisplayed = await isErrorDisplayed();
    if (!errorDisplayed) {
      throw new Error('Expected error to be displayed for invalid input');
    }
  },

  /**
   * Test country selection
   */
  async testCountrySelection(countryCode: string): Promise<void> {
    await selectCountryFromDropdown(countryCode);
    await waitForValidation();
    const selectedCode = await getSelectedCountryCode();
    if (selectedCode !== countryCode.toUpperCase()) {
      throw new Error(`Expected country ${countryCode} but got ${selectedCode}`);
    }
  },

  /**
   * Test clear button
   */
  async testClearButton(): Promise<void> {
    await typePhoneNumber('1234567890');
    await clickClearButton();
    await waitForValidation();
    const value = await getPhoneInputValue();
    if (value !== '') {
      throw new Error(`Expected empty value after clear but got: ${value}`);
    }
  }
};


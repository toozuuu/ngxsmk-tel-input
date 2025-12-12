import { CountryCode } from 'libphonenumber-js';

/**
 * Utility functions for phone number input optimization and performance.
 * Provides helper methods for common operations like debouncing, throttling, and DOM manipulation.
 */
export class PhoneInputUtils {
  /**
   * Converts any string to digits only (NSN - National Significant Number basis).
   * Removes all non-digit characters.
   * 
   * @param v - Input string that may contain formatting characters
   * @returns String containing only digits
   * 
   * @example
   * ```typescript
   * PhoneInputUtils.toNSN('(202) 555-1234'); // Returns '2025551234'
   * PhoneInputUtils.toNSN('+1 202-555-1234'); // Returns '12025551234'
   * ```
   */
  static toNSN(v: string | null | undefined): string {
    return (v ?? '').replace(/\D/g, '');
  }

  /**
   * Strips exactly one leading trunk '0' from national input.
   * Used for countries like Sri Lanka where national format includes a leading 0.
   * 
   * @param nsn - National Significant Number string
   * @returns NSN with leading zero removed (if present)
   * 
   * @example
   * ```typescript
   * PhoneInputUtils.stripLeadingZero('0712345678'); // Returns '712345678'
   * PhoneInputUtils.stripLeadingZero('712345678'); // Returns '712345678'
   * ```
   */
  static stripLeadingZero(nsn: string): string {
    return nsn.replace(/^0/, '');
  }

  /**
   * Creates a cache key for phone number operations.
   * Combines input and country code into a unique key string.
   * 
   * @param input - Phone number input string
   * @param iso2 - ISO 3166-1 alpha-2 country code
   * @returns Cache key string in format "input|iso2"
   * 
   * @example
   * ```typescript
   * PhoneInputUtils.createCacheKey('2025551234', 'US'); // Returns '2025551234|US'
   * ```
   */
  static createCacheKey(input: string, iso2: CountryCode): string {
    return `${input || ''}|${iso2}`;
  }

  /**
   * Creates a debounced version of a function.
   * The debounced function delays execution until after wait milliseconds have elapsed
   * since the last time it was invoked.
   * 
   * @param func - Function to debounce
   * @param wait - Number of milliseconds to wait
   * @returns Debounced function
   * 
   * @example
   * ```typescript
   * const debouncedHandler = PhoneInputUtils.debounce((value: string) => {
   *   console.log(value);
   * }, 300);
   * 
   * debouncedHandler('a'); // Waits 300ms
   * debouncedHandler('ab'); // Cancels previous, waits 300ms
   * debouncedHandler('abc'); // Cancels previous, waits 300ms, then logs 'abc'
   * ```
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Creates a throttled version of a function.
   * The throttled function will only execute once per limit milliseconds.
   * 
   * @param func - Function to throttle
   * @param limit - Number of milliseconds between executions
   * @returns Throttled function
   * 
   * @example
   * ```typescript
   * const throttledHandler = PhoneInputUtils.throttle((value: string) => {
   *   console.log(value);
   * }, 100);
   * 
   * throttledHandler('a'); // Executes immediately
   * throttledHandler('b'); // Ignored (within 100ms)
   * throttledHandler('c'); // Ignored (within 100ms)
   * // After 100ms, next call will execute
   * ```
   */
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Checks if a string contains only digits.
   * 
   * @param str - String to check
   * @returns true if string contains only digits, false otherwise
   * 
   * @example
   * ```typescript
   * PhoneInputUtils.isDigitsOnly('12345'); // Returns true
   * PhoneInputUtils.isDigitsOnly('123-45'); // Returns false
   * ```
   */
  static isDigitsOnly(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Safely gets an element's value with fallback to empty string.
   * 
   * @param element - HTML input element (may be null)
   * @returns Element value or empty string if element is null/undefined
   * 
   * @example
   * ```typescript
   * const value = PhoneInputUtils.getElementValue(inputElement); // Returns value or ''
   * ```
   */
  static getElementValue(element: HTMLInputElement | null): string {
    return element?.value?.trim() || '';
  }

  /**
   * Checks if an element is currently visible in the viewport.
   * Useful for performance optimization (e.g., lazy loading).
   * 
   * @param element - HTML element to check
   * @returns true if element is in viewport, false otherwise
   */
  static isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Creates an optimized event listener with cleanup function.
   * Returns a function that removes the event listener when called.
   * 
   * @param element - HTML element to attach listener to
   * @param event - Event name (e.g., 'click', 'input')
   * @param handler - Event handler function
   * @param options - Optional AddEventListenerOptions
   * @returns Cleanup function that removes the event listener
   * 
   * @example
   * ```typescript
   * const cleanup = PhoneInputUtils.addEventListener(element, 'click', handler);
   * // Later...
   * cleanup(); // Removes the event listener
   * ```
   */
  static createEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }

  /**
   * Batches DOM operations for better performance.
   * Executes all operations in a single requestAnimationFrame callback.
   * 
   * @param operations - Array of functions that perform DOM operations
   * 
   * @example
   * ```typescript
   * PhoneInputUtils.batchDOMOperations([
   *   () => element1.style.display = 'none',
   *   () => element2.classList.add('active'),
   *   () => element3.textContent = 'Updated'
   * ]);
   * ```
   */
  static batchDOMOperations(operations: (() => void)[]): void {
    requestAnimationFrame(() => {
      operations.forEach(op => op());
    });
  }
}

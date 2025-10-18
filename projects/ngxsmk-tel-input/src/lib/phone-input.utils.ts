import { CountryCode } from 'libphonenumber-js';

/**
 * Utility functions for phone number input optimization
 */
export class PhoneInputUtils {
  /**
   * Convert any string to digits only (NSN basis)
   */
  static toNSN(v: string | null | undefined): string {
    return (v ?? '').replace(/\D/g, '');
  }

  /**
   * Strip exactly one leading trunk '0' from national input
   */
  static stripLeadingZero(nsn: string): string {
    return nsn.replace(/^0/, '');
  }

  /**
   * Create cache key for phone number operations
   */
  static createCacheKey(input: string, iso2: CountryCode): string {
    return `${input || ''}|${iso2}`;
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
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
   * Throttle function for performance optimization
   */
  static throttle<T extends (...args: any[]) => any>(
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
   * Check if a string contains only digits
   */
  static isDigitsOnly(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Safely get element value with fallback
   */
  static getElementValue(element: HTMLInputElement | null): string {
    return element?.value?.trim() || '';
  }

  /**
   * Check if element is in viewport for performance optimization
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
   * Create optimized event listener with cleanup
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
   * Batch DOM operations for better performance
   */
  static batchDOMOperations(operations: (() => void)[]): void {
    requestAnimationFrame(() => {
      operations.forEach(op => op());
    });
  }
}

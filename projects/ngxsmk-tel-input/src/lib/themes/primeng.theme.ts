/**
 * PrimeNG theme configuration helper
 */

import { InjectionToken } from '@angular/core';

export interface PrimeNGThemeConfig {
  theme?: 'lara-light' | 'lara-dark' | 'aura-light' | 'aura-dark' | 'saga-blue' | 'vela-blue' | 'arya-blue';
  ripple?: boolean;
  inputStyle?: 'outlined' | 'filled';
}

export const PRIMENG_THEME_CONFIG = new InjectionToken<PrimeNGThemeConfig>(
  'PRIMENG_THEME_CONFIG'
);

/**
 * Provides PrimeNG theme configuration
 */
export function providePrimeNGTheme(config: PrimeNGThemeConfig = {}) {
  return {
    provide: PRIMENG_THEME_CONFIG,
    useValue: {
      theme: 'lara-light',
      ripple: true,
      inputStyle: 'outlined',
      ...config
    }
  };
}


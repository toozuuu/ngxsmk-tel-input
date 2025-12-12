/**
 * Angular Material theme configuration helper
 */

import { InjectionToken } from '@angular/core';

export interface MaterialThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  warnColor?: string;
  density?: 'comfortable' | 'compact' | 'cosy';
}

export const MATERIAL_THEME_CONFIG = new InjectionToken<MaterialThemeConfig>(
  'MATERIAL_THEME_CONFIG'
);

/**
 * Provides Material theme configuration
 */
export function provideMaterialTheme(config: MaterialThemeConfig = {}) {
  return {
    provide: MATERIAL_THEME_CONFIG,
    useValue: {
      primaryColor: '#3f51b5',
      accentColor: '#ff4081',
      warnColor: '#f44336',
      density: 'comfortable',
      ...config
    }
  };
}


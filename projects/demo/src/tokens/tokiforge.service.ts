/**
 * TokiForge-inspired Theme Engine Service
 * Manages design tokens and theme application
 */

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { designTokens, tokensToCSS, type DesignTokens } from './tokens.config';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class TokiForgeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeSubject = new BehaviorSubject<Theme>('auto');
  private readonly currentThemeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  
  public readonly theme$ = this.themeSubject.asObservable();
  public readonly currentTheme$ = this.currentThemeSubject.asObservable();
  public readonly tokens = designTokens;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.setupSystemThemeListener();
    }
  }

  /** Get current theme preference */
  getTheme(): Theme {
    return this.themeSubject.value;
  }

  /** Get current resolved theme (light or dark) */
  getCurrentTheme(): 'light' | 'dark' {
    return this.currentThemeSubject.value;
  }

  /** Get design tokens */
  getTokens(): DesignTokens {
    return this.tokens;
  }

  /** Set theme preference */
  setTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.themeSubject.next(theme);
    this.applyTheme(theme);
    this.saveThemePreference(theme);
  }

  /** Toggle between light and dark themes */
  toggleTheme(): void {
    const current = this.getCurrentTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  /** Initialize theme from saved preference or system */
  private initializeTheme(): void {
    const savedTheme = this.getSavedThemePreference();
    const theme = savedTheme || 'auto';
    this.setTheme(theme);
  }

  /** Apply theme to document and components */
  private applyTheme(theme: Theme): void {
    const resolvedTheme = this.resolveTheme(theme);
    this.currentThemeSubject.next(resolvedTheme);

    // Apply to document
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply design tokens as CSS custom properties
    this.applyTokens(resolvedTheme);
  }

  /** Apply design tokens to document root */
  private applyTokens(theme: 'light' | 'dark'): void {
    const root = document.documentElement;
    const cssVars = tokensToCSS(this.tokens, theme);
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  /** Resolve theme to light or dark */
  private resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.detectSystemTheme();
    }
    return theme;
  }

  /** Detect system theme preference */
  private detectSystemTheme(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /** Setup listener for system theme changes */
  private setupSystemThemeListener(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.getTheme() === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  /** Save theme preference to localStorage */
  private saveThemePreference(theme: Theme): void {
    try {
      localStorage.setItem('tokiforge-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /** Get saved theme preference from localStorage */
  private getSavedThemePreference(): Theme | null {
    try {
      const saved = localStorage.getItem('tokiforge-theme');
      return saved as Theme | null;
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return null;
    }
  }

  /** Check if dark theme is active */
  isDarkTheme(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  /** Check if light theme is active */
  isLightTheme(): boolean {
    return this.getCurrentTheme() === 'light';
  }

  /** Check if auto theme is set */
  isAutoTheme(): boolean {
    return this.getTheme() === 'auto';
  }

  /** Get token value by path (e.g., 'colors.light.background.primary') */
  getToken(path: string): string | number | undefined {
    const keys = path.split('.');
    let value: any = this.tokens;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
}


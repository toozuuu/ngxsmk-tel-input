import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeSubject = new BehaviorSubject<Theme>('auto');
  private readonly currentThemeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  
  public readonly theme$ = this.themeSubject.asObservable();
  public readonly currentTheme$ = this.currentThemeSubject.asObservable();

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

    // Update CSS custom properties
    this.updateCSSVariables(resolvedTheme);

    // Force update of all tel-input components
    this.updateTelInputComponents(resolvedTheme);
  }

  /** Update all tel-input components with the new theme */
  private updateTelInputComponents(theme: 'light' | 'dark'): void {
    const telInputComponents = document.querySelectorAll('ngxsmk-tel-input');
    telInputComponents.forEach(component => {
      const element = component as HTMLElement;
      element.setAttribute('data-theme', theme);
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

  /** Update CSS custom properties for theme */
  private updateCSSVariables(theme: 'light' | 'dark'): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--tel-bg', '#212121');
      root.style.setProperty('--tel-fg', '#ffffff');
      root.style.setProperty('--tel-border', '#334155');
      root.style.setProperty('--tel-border-hover', '#475569');
      root.style.setProperty('--tel-ring', '#60a5fa');
      root.style.setProperty('--tel-placeholder', '#ffffff');
      root.style.setProperty('--tel-error', '#f87171');
      root.style.setProperty('--tel-success', '#34d399');
      root.style.setProperty('--tel-warning', '#fbbf24');
      root.style.setProperty('--tel-dd-bg', '#212121');
      root.style.setProperty('--tel-dd-border', '#324056');
      root.style.setProperty('--tel-dd-shadow', '0 24px 60px rgba(0, 0, 0, .4)');
      root.style.setProperty('--tel-dd-search-bg', 'rgba(148, 163, 184, .12)');
    } else {
      root.style.setProperty('--tel-bg', '#fff');
      root.style.setProperty('--tel-fg', '#0f172a');
      root.style.setProperty('--tel-border', '#c0c0c0');
      root.style.setProperty('--tel-border-hover', '#9aa0a6');
      root.style.setProperty('--tel-ring', '#2563eb');
      root.style.setProperty('--tel-placeholder', '#9ca3af');
      root.style.setProperty('--tel-error', '#ef4444');
      root.style.setProperty('--tel-success', '#10b981');
      root.style.setProperty('--tel-warning', '#f59e0b');
      root.style.setProperty('--tel-dd-bg', '#fff');
      root.style.setProperty('--tel-dd-border', '#c0c0c0');
      root.style.setProperty('--tel-dd-shadow', '0 24px 60px rgba(0, 0, 0, .18)');
      root.style.setProperty('--tel-dd-search-bg', 'rgba(148, 163, 184, .08)');
    }
  }

  /** Save theme preference to localStorage */
  private saveThemePreference(theme: Theme): void {
    try {
      localStorage.setItem('ngxsmk-tel-input-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /** Get saved theme preference from localStorage */
  private getSavedThemePreference(): Theme | null {
    try {
      const saved = localStorage.getItem('ngxsmk-tel-input-theme');
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
}

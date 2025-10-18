# 🌙 Dark & Light Theme Support for Ngxsmk Tel Input

## Overview

The ngxsmk-tel-input plugin now includes comprehensive dark and light theme support with automatic system preference detection, manual theme switching, and persistent theme storage.

## 🎨 Theme Features

### **1. Multiple Theme Options**
- **Light Theme**: Clean, bright interface optimized for daytime use
- **Dark Theme**: Easy-on-eyes dark interface for low-light environments  
- **Auto Theme**: Automatically detects and follows system preference

### **2. Smart Theme Detection**
- **System Preference**: Detects `prefers-color-scheme` media query
- **Document Classes**: Respects `.dark` class on document element
- **Data Attributes**: Supports `data-theme="dark"` attribute
- **Manual Override**: Allows explicit theme setting

### **3. Persistent Storage**
- **localStorage**: Saves user theme preference
- **Automatic Restoration**: Restores theme on page reload
- **Fallback Handling**: Graceful degradation if storage unavailable

## 🚀 Usage Examples

### **Basic Theme Usage**

```typescript
import { NgxsmkTelInputComponent, ThemeService } from 'ngxsmk-tel-input';

@Component({
  template: `
    <!-- Light theme -->
    <ngxsmk-tel-input [theme]="'light'" placeholder="Light theme input">
    </ngxsmk-tel-input>

    <!-- Dark theme -->
    <ngxsmk-tel-input [theme]="'dark'" placeholder="Dark theme input">
    </ngxsmk-tel-input>

    <!-- Auto theme (follows system) -->
    <ngxsmk-tel-input [theme]="'auto'" placeholder="Auto theme input">
    </ngxsmk-tel-input>
  `
})
export class MyComponent {}
```

### **Global Theme Management**

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from 'ngxsmk-tel-input';

@Component({
  template: `
    <div class="theme-controls">
      <button (click)="setLightTheme()">☀️ Light</button>
      <button (click)="setDarkTheme()">🌙 Dark</button>
      <button (click)="setAutoTheme()">🔄 Auto</button>
      <button (click)="toggleTheme()">Toggle</button>
    </div>
  `
})
export class ThemeComponent {
  private themeService = inject(ThemeService);

  setLightTheme() {
    this.themeService.setTheme('light');
  }

  setDarkTheme() {
    this.themeService.setTheme('dark');
  }

  setAutoTheme() {
    this.themeService.setTheme('auto');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

### **Reactive Theme Subscription**

```typescript
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from 'ngxsmk-tel-input';
import { Subscription } from 'rxjs';

@Component({
  template: `
    <div [class.dark-mode]="isDarkTheme">
      <p>Current theme: {{ currentTheme }}</p>
      <ngxsmk-tel-input [theme]="currentTheme">
      </ngxsmk-tel-input>
    </div>
  `
})
export class ReactiveThemeComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private subscription?: Subscription;
  
  currentTheme: 'light' | 'dark' | 'auto' = 'auto';
  isDarkTheme = false;

  ngOnInit() {
    // Subscribe to theme changes
    this.subscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Subscribe to resolved theme changes
    this.themeService.currentTheme$.subscribe(resolvedTheme => {
      this.isDarkTheme = resolvedTheme === 'dark';
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

## 🎯 API Reference

### **Component Inputs**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme preference for the component |

### **ThemeService Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setTheme(theme)` | `Theme` | `void` | Set theme preference |
| `getTheme()` | - | `Theme` | Get current theme preference |
| `getCurrentTheme()` | - | `'light' \| 'dark'` | Get resolved theme |
| `toggleTheme()` | - | `void` | Toggle between light and dark |
| `isDarkTheme()` | - | `boolean` | Check if dark theme is active |
| `isLightTheme()` | - | `boolean` | Check if light theme is active |
| `isAutoTheme()` | - | `boolean` | Check if auto theme is set |

### **Observables**

| Observable | Type | Description |
|------------|------|-------------|
| `theme$` | `Observable<Theme>` | Emits theme preference changes |
| `currentTheme$` | `Observable<'light' \| 'dark'>` | Emits resolved theme changes |

## 🎨 CSS Custom Properties

The plugin uses CSS custom properties for theming, allowing easy customization:

### **Light Theme Variables**
```css
:host {
  --tel-bg: #fff;
  --tel-fg: #0f172a;
  --tel-border: #c0c0c0;
  --tel-border-hover: #9aa0a6;
  --tel-ring: #2563eb;
  --tel-placeholder: #9ca3af;
  --tel-error: #ef4444;
  --tel-success: #10b981;
  --tel-warning: #f59e0b;
}
```

### **Dark Theme Variables**
```css
:host([data-theme="dark"]) {
  --tel-bg: #0b0f17;
  --tel-fg: #e5e7eb;
  --tel-border: #334155;
  --tel-border-hover: #475569;
  --tel-ring: #60a5fa;
  --tel-placeholder: #94a3b8;
  --tel-error: #f87171;
  --tel-success: #34d399;
  --tel-warning: #fbbf24;
}
```

## 🔧 Advanced Configuration

### **Custom Theme Detection**

```typescript
// Custom theme detection logic
private detectCustomTheme(): 'light' | 'dark' {
  // Check for custom theme indicators
  if (document.body.classList.contains('dark-mode')) {
    return 'dark';
  }
  
  // Check for time-based theme
  const hour = new Date().getHours();
  if (hour >= 18 || hour <= 6) {
    return 'dark';
  }
  
  return 'light';
}
```

### **Theme Persistence with Custom Storage**

```typescript
// Custom storage implementation
class CustomThemeStorage {
  saveTheme(theme: Theme): void {
    // Save to custom storage
    sessionStorage.setItem('app-theme', theme);
  }
  
  loadTheme(): Theme | null {
    return sessionStorage.getItem('app-theme') as Theme | null;
  }
}
```

## 🌟 Best Practices

### **1. Theme Consistency**
- Use the same theme across all components
- Apply theme to the document root for global consistency
- Consider user preferences and accessibility needs

### **2. Performance Optimization**
- Theme changes are optimized with CSS custom properties
- Minimal re-rendering with efficient change detection
- Smooth transitions between themes

### **3. Accessibility Considerations**
- Respect system preferences for accessibility
- Provide manual override options
- Ensure sufficient contrast in both themes
- Support for reduced motion preferences

### **4. Progressive Enhancement**
- Graceful fallback to light theme if detection fails
- Works without JavaScript for basic functionality
- Enhanced experience with full theme support

## 🎯 Integration Examples

### **Angular Material Integration**

```typescript
// Integrate with Angular Material theme
import { MatDialog } from '@angular/material/dialog';

@Component({})
export class MaterialThemeComponent {
  constructor(private dialog: MatDialog, private themeService: ThemeService) {
    // Sync with Material theme
    this.themeService.currentTheme$.subscribe(theme => {
      document.body.classList.toggle('dark-theme', theme === 'dark');
    });
  }
}
```

### **Tailwind CSS Integration**

```typescript
// Integrate with Tailwind dark mode
@Component({
  template: `
    <div class="dark:bg-gray-900 bg-white">
      <ngxsmk-tel-input [theme]="currentTheme">
      </ngxsmk-tel-input>
    </div>
  `
})
export class TailwindThemeComponent {
  currentTheme = this.themeService.getCurrentTheme();
}
```

## 🚀 Migration Guide

### **From Previous Versions**

1. **Add Theme Input**: Add `[theme]` input to existing components
2. **Import ThemeService**: Add ThemeService for global theme management
3. **Update CSS**: Ensure custom CSS works with both themes
4. **Test Accessibility**: Verify contrast and usability in both themes

### **Breaking Changes**
- None! Theme support is fully backward compatible
- Default behavior remains unchanged
- Existing components work without modification

## 🎉 Benefits

- ✅ **Automatic System Detection**: Respects user's system preferences
- ✅ **Manual Override**: Users can choose their preferred theme
- ✅ **Persistent Storage**: Remembers user preferences
- ✅ **Smooth Transitions**: Animated theme changes
- ✅ **Accessibility**: Supports accessibility requirements
- ✅ **Performance**: Optimized with CSS custom properties
- ✅ **Flexibility**: Easy to customize and extend
- ✅ **Compatibility**: Works with existing Angular applications

The theme system provides a comprehensive solution for modern web applications that need to support both light and dark themes while respecting user preferences and system settings.

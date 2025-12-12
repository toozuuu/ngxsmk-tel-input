# TokiForge Design Token System

This directory contains the TokiForge-inspired design token system for the ngxsmk-tel-input demo project.

## Files

- `tokens.config.ts` - Design token definitions (colors, spacing, typography, shadows, borders)
- `tokiforge.service.ts` - Theme engine service that manages token application and theme switching

## Usage

The TokiForge service automatically applies design tokens as CSS custom properties to the document root. You can use these tokens in your styles:

```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

## Theme Switching

The service supports three theme modes:
- `light` - Always use light theme
- `dark` - Always use dark theme  
- `auto` - Follow system preference

```typescript
import { TokiForgeService } from './tokens/tokiforge.service';

// Inject the service
private tokiForge = inject(TokiForgeService);

// Set theme
tokiForge.setTheme('dark');

// Get current theme
const theme = tokiForge.getCurrentTheme(); // 'light' | 'dark'

// Subscribe to theme changes
tokiForge.currentTheme$.subscribe(theme => {
  console.log('Theme changed to:', theme);
});
```

## Design Tokens

All design tokens are available through the service:

```typescript
const tokens = tokiForge.getTokens();
const primaryColor = tokens.colors.light.background.primary;
```

## CSS Custom Properties

The following CSS custom properties are automatically applied:

### Colors
- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-border-primary`, `--color-border-secondary`, `--color-border-focus`
- `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- `--color-sidebar-*` (sidebar-specific colors)

### Spacing
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`, `--spacing-2xl`, `--spacing-3xl`

### Typography
- `--font-family-sans`, `--font-family-mono`
- `--font-size-xs` through `--font-size-3xl`
- `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`
- `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

### Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

### Borders
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- `--border-width-thin`, `--border-width-medium`, `--border-width-thick`


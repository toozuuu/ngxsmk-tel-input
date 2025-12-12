/**
 * TokiForge-inspired Design Token Configuration
 * Design tokens for the ngxsmk-tel-input demo project
 */

export interface DesignTokens {
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
}

export interface ColorTokens {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    code: string;
    form: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    code: string;
    link: string;
    linkHover: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  semantic: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  sidebar: {
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
    active: string;
  };
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BorderTokens {
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  width: {
    thin: string;
    medium: string;
    thick: string;
  };
}

export const designTokens: DesignTokens = {
  colors: {
    light: {
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        code: '#f8fafc',
        form: '#f8fafc',
      },
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        tertiary: '#64748b',
        inverse: '#ffffff',
        code: '#1e293b',
        link: '#3b82f6',
        linkHover: '#2563eb',
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        focus: '#3b82f6',
      },
      semantic: {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      sidebar: {
        background: '#ffffff',
        text: '#475569',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        hover: '#f1f5f9',
        active: '#eff6ff',
      },
    },
    dark: {
      background: {
        primary: '#212121',
        secondary: '#212121',
        tertiary: '#1a1a1a',
        code: '#212121',
        form: '#212121',
      },
      text: {
        primary: '#ffffff',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#1e293b',
        code: '#e2e8f0',
        link: '#60a5fa',
        linkHover: '#93c5fd',
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
        focus: '#60a5fa',
      },
      semantic: {
        success: '#34d399',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa',
      },
      sidebar: {
        background: '#212121',
        text: '#cbd5e1',
        textSecondary: '#94a3b8',
        border: '#334155',
        hover: '#334155',
        active: '#1e3a5f',
      },
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  typography: {
    fontFamily: {
      sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      mono: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 24px 60px rgba(0, 0, 0, 0.18)',
  },
  borders: {
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
    },
  },
};

/**
 * Convert design tokens to CSS custom properties
 */
export function tokensToCSS(tokens: DesignTokens, theme: 'light' | 'dark'): Record<string, string> {
  const themeColors = tokens.colors[theme];
  
  return {
    '--color-bg-primary': themeColors.background.primary,
    '--color-bg-secondary': themeColors.background.secondary,
    '--color-bg-tertiary': themeColors.background.tertiary,
    '--color-bg-code': themeColors.background.code,
    '--color-bg-form': themeColors.background.form,
    
    '--color-text-primary': themeColors.text.primary,
    '--color-text-secondary': themeColors.text.secondary,
    '--color-text-tertiary': themeColors.text.tertiary,
    '--color-text-inverse': themeColors.text.inverse,
    '--color-text-code': themeColors.text.code,
    '--color-text-link': themeColors.text.link,
    '--color-text-link-hover': themeColors.text.linkHover,
    
    '--color-border-primary': themeColors.border.primary,
    '--color-border-secondary': themeColors.border.secondary,
    '--color-border-focus': themeColors.border.focus,
    
    '--color-success': themeColors.semantic.success,
    '--color-error': themeColors.semantic.error,
    '--color-warning': themeColors.semantic.warning,
    '--color-info': themeColors.semantic.info,
    
    '--color-sidebar-bg': themeColors.sidebar.background,
    '--color-sidebar-text': themeColors.sidebar.text,
    '--color-sidebar-text-secondary': themeColors.sidebar.textSecondary,
    '--color-sidebar-border': themeColors.sidebar.border,
    '--color-sidebar-hover': themeColors.sidebar.hover,
    '--color-sidebar-active': themeColors.sidebar.active,
    
    '--spacing-xs': tokens.spacing.xs,
    '--spacing-sm': tokens.spacing.sm,
    '--spacing-md': tokens.spacing.md,
    '--spacing-lg': tokens.spacing.lg,
    '--spacing-xl': tokens.spacing.xl,
    '--spacing-2xl': tokens.spacing['2xl'],
    '--spacing-3xl': tokens.spacing['3xl'],
    
    '--font-family-sans': tokens.typography.fontFamily.sans,
    '--font-family-mono': tokens.typography.fontFamily.mono,
    '--font-size-xs': tokens.typography.fontSize.xs,
    '--font-size-sm': tokens.typography.fontSize.sm,
    '--font-size-base': tokens.typography.fontSize.base,
    '--font-size-lg': tokens.typography.fontSize.lg,
    '--font-size-xl': tokens.typography.fontSize.xl,
    '--font-size-2xl': tokens.typography.fontSize['2xl'],
    '--font-size-3xl': tokens.typography.fontSize['3xl'],
    '--font-weight-normal': tokens.typography.fontWeight.normal.toString(),
    '--font-weight-medium': tokens.typography.fontWeight.medium.toString(),
    '--font-weight-semibold': tokens.typography.fontWeight.semibold.toString(),
    '--font-weight-bold': tokens.typography.fontWeight.bold.toString(),
    '--line-height-tight': tokens.typography.lineHeight.tight.toString(),
    '--line-height-normal': tokens.typography.lineHeight.normal.toString(),
    '--line-height-relaxed': tokens.typography.lineHeight.relaxed.toString(),
    
    '--shadow-sm': tokens.shadows.sm,
    '--shadow-md': tokens.shadows.md,
    '--shadow-lg': tokens.shadows.lg,
    '--shadow-xl': tokens.shadows.xl,
    
    '--radius-sm': tokens.borders.radius.sm,
    '--radius-md': tokens.borders.radius.md,
    '--radius-lg': tokens.borders.radius.lg,
    '--radius-xl': tokens.borders.radius.xl,
    '--border-width-thin': tokens.borders.width.thin,
    '--border-width-medium': tokens.borders.width.medium,
    '--border-width-thick': tokens.borders.width.thick,
  };
}


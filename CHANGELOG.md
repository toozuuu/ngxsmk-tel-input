# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.6] - 2025-10-18

### Added
- **Dark & Light Theme Support**: Comprehensive theme system with automatic detection
- **ThemeService**: Global theme management service with reactive observables
- **Theme Input**: Component-level theme control with `[theme]="'light'|'dark'|'auto'"`
- **System Preference Detection**: Automatic theme detection based on user system settings
- **Persistent Theme Storage**: Saves user theme preference to localStorage
- **CSS Custom Properties**: Enhanced theming with CSS variables for both light and dark modes
- **Theme Documentation**: Comprehensive documentation for theme implementation

### Enhanced
- **Dropdown Styling**: Improved dark mode dropdown appearance and functionality
- **Search Input**: Enhanced search input visibility and functionality in dark mode
- **Text Visibility**: Fixed text visibility issues in both light and dark themes
- **Title Styling**: Improved section title visibility and typography
- **Performance**: Removed hover animations for better performance
- **Accessibility**: Enhanced contrast ratios and focus indicators

### Fixed
- **Dark Mode Dropdown**: Fixed dropdown panel not working properly in dark mode
- **Search Input**: Fixed search input not being visible when typing in dark mode
- **Title Visibility**: Fixed section titles not showing properly
- **Text Contrast**: Improved text contrast for better readability
- **Theme Consistency**: Ensured consistent theming across all components

### Technical Improvements
- **CSS Optimization**: Enhanced CSS with better selectors and performance
- **TypeScript**: Fixed type issues with timeout handling
- **Component Integration**: Improved theme detection and application
- **Global Styling**: Added comprehensive global CSS rules for theme support
- **Observer Pattern**: Implemented MutationObserver for dynamic theme application

### Breaking Changes
- None

### Migration Guide
- No migration required - all changes are backward compatible
- New theme features are optional and work with existing implementations
- Default behavior remains unchanged

## [1.6.5] - Previous Version
- Previous features and improvements

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.7] - 2025-10-21

### Added
- **Enhanced Validation**: New invalid country code detection for numbers starting with invalid codes like "11", "99"
- **phoneInvalidCountryCode Error**: New validation error type for invalid country codes
- **parseWithInvalidDetection Method**: Enhanced service method that detects invalid international numbers
- **Invalid Country Code Detection**: Automatic detection when users enter numbers with non-existent country codes
- **Enhanced Error Handling**: Better error states and user feedback for invalid phone number scenarios

### Enhanced
- **Validation Logic**: Improved validation to distinguish between invalid country codes and invalid number formats
- **User Experience**: Better visual feedback for different types of validation errors
- **Error Messages**: More specific error messages for different validation scenarios
- **Demo Application**: Added test section for invalid country code detection

### Fixed
- **Country Code "11" Issue**: Fixed issue where country codes starting with "11" didn't show invalid/valid status
- **Invalid Country Code Handling**: Proper handling of non-existent country codes
- **Validation States**: Improved validation state management for edge cases

### Technical Improvements
- **Service Enhancement**: Added `isInvalidInternationalNumber()` method for better detection
- **Component Updates**: Enhanced component validation logic with new error types
- **Type Safety**: Improved TypeScript types for enhanced validation features
- **Performance**: Optimized validation caching for better performance

### Breaking Changes
- None

### Migration Guide
- No migration required - all changes are backward compatible
- New validation features work automatically with existing implementations
- Enhanced error handling provides better user experience without breaking changes

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

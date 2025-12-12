# Ngxsmk Tel Input DevTools Extension

Chrome DevTools extension for debugging `ngxsmk-tel-input` components.

## Features

- **Component Detection**: Automatically detects all `ngxsmk-tel-input` components on the page
- **Real-time Monitoring**: Monitors component state changes in real-time
- **Visual Validation Feedback**: Visual indicators for validation status
- **Format Preview**: Shows how numbers will be formatted in different formats
- **Country Detection**: Displays detected country and detection method
- **Component Details**: Detailed information about each component's state

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `projects/devtools-extension` directory
5. The extension will be installed and available in DevTools

## Usage

1. Open Chrome DevTools (F12)
2. Navigate to the "Ngxsmk Tel Input" tab
3. The extension will automatically detect all phone input components on the page
4. Click on a component to view detailed information
5. Information updates in real-time as you interact with the inputs

## Development

To modify the extension:

1. Make changes to the files in `projects/devtools-extension`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the page you're debugging

## Building

The extension can be packaged for distribution:

1. Go to `chrome://extensions/`
2. Click "Pack extension"
3. Select the `projects/devtools-extension` directory
4. A `.crx` file will be created for distribution

## Notes

- The extension requires access to the page content to detect components
- Some features require the component to expose its internal state (via signals or public methods)
- The extension works best with Angular applications using `ngxsmk-tel-input`


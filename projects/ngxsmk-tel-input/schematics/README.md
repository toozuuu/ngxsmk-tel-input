# Angular CLI Schematics

This package includes Angular CLI schematics for quickly setting up `ngxsmk-tel-input` in your project.

## Installation

The schematics are automatically available when you install the package:

```bash
ng add ngxsmk-tel-input
```

## Available Schematics

### ng-add

Adds `ngxsmk-tel-input` to your project with automatic configuration.

**Options:**
- `--project`: The name of the project (default: default project)
- `--skipPackageJson`: Skip adding dependencies to package.json
- `--theme`: Theme to use (default | material | primeng)
- `--addStyles`: Add required styles to angular.json (default: true)
- `--addAssets`: Add required assets to angular.json (default: true)

**Example:**
```bash
ng add ngxsmk-tel-input --theme=material --project=my-app
```

### component

Generates a phone input component.

**Options:**
- `name`: The name of the component (required)
- `--path`: The path to create the component (default: app)
- `--project`: The name of the project
- `--theme`: Theme to use (default | material | primeng)
- `--useReactiveForms`: Use reactive forms (default: true)

**Example:**
```bash
ng generate ngxsmk-tel-input:component phone-input --theme=material
```

## What the schematics do

### ng-add

1. Adds required dependencies to `package.json`:
   - `ngxsmk-tel-input`
   - `intl-tel-input`
   - `libphonenumber-js`

2. Updates `angular.json`:
   - Adds `intl-tel-input` CSS to styles
   - Adds flag assets to assets array

3. Creates example component (for app projects)

4. Installs dependencies

### component

1. Creates a new component with phone input
2. Sets up reactive forms (if selected)
3. Applies selected theme
4. Includes example usage

## Manual Setup

If you prefer to set up manually:

1. Install dependencies:
```bash
npm install ngxsmk-tel-input intl-tel-input libphonenumber-js
```

2. Update `angular.json`:
```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/intl-tel-input/build/css/intlTelInput.css"
            ],
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/intl-tel-input/build/img",
                "output": "assets/intl-tel-input/img"
              }
            ]
          }
        }
      }
    }
  }
}
```

3. Import the component:
```typescript
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';
```


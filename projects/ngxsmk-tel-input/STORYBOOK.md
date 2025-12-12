# Storybook Integration

Complete Storybook setup with live code examples and interactive API explorer for `ngxsmk-tel-input`.

## Installation

Storybook dependencies are included in `package.json`. Install them:

```bash
npm install
```

## Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

## Building Storybook

Build a static version of Storybook:

```bash
npm run build-storybook
```

The static build will be in the `storybook-static` directory.

## Stories Available

### 1. Component Stories (`ngxsmk-tel-input.stories.ts`)

- **Basic**: Basic usage example
- **WithReactiveForms**: Integration with Angular reactive forms
- **SizeVariants**: Small, medium, and large size variants
- **StyleVariants**: Outline, filled, and underline variants
- **ThemeVariants**: Light, dark, and auto theme variants
- **WithIntelligence**: Phone intelligence features
- **Disabled**: Disabled state example
- **WithError**: Error state example
- **PreferredCountries**: Preferred countries configuration
- **OnlyCountries**: Restricted countries list
- **RTLSupport**: Right-to-left language support

### 2. API Explorer (`api-explorer.stories.ts`)

- **InteractiveExplorer**: Interactive API explorer with:
  - Live component preview
  - Real-time configuration panel
  - Event monitoring
  - Form state display

### 3. Live Examples (`live-examples.stories.ts`)

- **ReactiveFormsExample**: Complete reactive forms example with code
- **SignalAPIExample**: Signal-based API usage
- **IntelligenceExample**: Intelligence features example
- **ThemeIntegrationExample**: Theme integration examples
- **ValidationExample**: Validation examples

## Features

### Interactive API Explorer

The API Explorer allows you to:

- Test all component properties in real-time
- See live updates as you change configuration
- Monitor all component events
- View form state and validation
- Copy configuration code

### Live Code Examples

Each example includes:

- Editable source code
- Live preview
- Documentation
- Best practices
- Real-world usage patterns

### Documentation

All stories include:

- Auto-generated documentation
- Property descriptions
- Usage examples
- Type information
- Accessibility information

## Customization

### Adding New Stories

Create a new story file:

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { NgxsmkTelInputComponent } from './ngxsmk-tel-input.component';

const meta: Meta<NgxsmkTelInputComponent> = {
  title: 'My Stories',
  component: NgxsmkTelInputComponent
};

export default meta;
type Story = StoryObj<NgxsmkTelInputComponent>;

export const MyStory: Story = {
  render: () => ({
    template: `<ngxsmk-tel-input />`
  })
};
```

### Customizing Storybook Theme

Edit `.storybook/preview.ts` to customize:

- Background colors
- Theme switcher
- Global parameters
- Documentation settings

## Addons

Storybook includes these addons:

- **Controls**: Interactive property controls
- **Actions**: Event logging
- **Docs**: Auto-generated documentation
- **Viewport**: Responsive testing
- **A11y**: Accessibility testing
- **Interactions**: User interaction testing

## Deployment

### GitHub Pages

1. Build Storybook:
```bash
npm run build-storybook
```

2. Deploy to GitHub Pages:
```bash
npx gh-pages -d storybook-static
```

### Netlify

Add `netlify.toml`:

```toml
[build]
  command = "npm run build-storybook"
  publish = "storybook-static"
```

### Vercel

Add `vercel.json`:

```json
{
  "buildCommand": "npm run build-storybook",
  "outputDirectory": "storybook-static"
}
```

## Best Practices

1. **Keep stories focused**: Each story should demonstrate one feature
2. **Include code examples**: Show how to use the component
3. **Document props**: Use JSDoc comments for better documentation
4. **Test interactions**: Use interaction testing for complex stories
5. **Accessibility**: Use the a11y addon to check accessibility

## Troubleshooting

### Storybook won't start

- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall
- Check for port conflicts (default: 6006)

### Stories not showing

- Check file naming (`*.stories.ts`)
- Verify story exports
- Check Storybook configuration

### Build errors

- Check TypeScript configuration
- Verify all dependencies are installed
- Check for circular dependencies

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Angular Storybook Guide](https://storybook.js.org/docs/get-started/angular)
- [Component Story Format](https://storybook.js.org/docs/api/csf)


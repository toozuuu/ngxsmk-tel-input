import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import './styles.css';

// Try to load compodoc JSON if available
try {
  const docJson = require('../documentation.json');
  if (docJson) {
    setCompodocJson(docJson);
  }
} catch (e) {
  // Compodoc JSON not available, continue without it
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    docs: {
      toc: true,
      source: {
        type: 'code',
        state: 'open'
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'dark',
          value: '#1a1a1a'
        }
      ]
    }
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark', 'auto'],
        dynamicTitle: true
      }
    }
  }
};

export default preview;


import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: {
    ...themes.light,
    brandTitle: 'Ngxsmk Tel Input',
    brandUrl: 'https://github.com/toozuuu/ngxsmk-tel-input',
    brandImage: undefined,
    brandTarget: '_self'
  }
});


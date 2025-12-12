/**
 * DevTools entry point for ngxsmk-tel-input debugging
 */

chrome.devtools.panels.create(
  'Ngxsmk Tel Input',
  'icons/icon48.png',
  'panel.html',
  (panel) => {
    console.log('Ngxsmk Tel Input DevTools panel created');
  }
);


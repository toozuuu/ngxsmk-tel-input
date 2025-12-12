/**
 * DevTools panel script for ngxsmk-tel-input debugging
 */

let selectedComponent = null;
let components = [];

// Connect to content script
const port = chrome.runtime.connect({ name: 'devtools' });

port.onMessage.addListener((message) => {
  if (message.type === 'components-update') {
    components = message.components;
    updateComponentsList();
  } else if (message.type === 'component-update') {
    updateComponentDetails(message.data);
  }
});

// Request initial components
port.postMessage({ type: 'get-components' });

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', () => {
  port.postMessage({ type: 'refresh' });
});

function updateComponentsList() {
  const list = document.getElementById('components-list');
  
  if (components.length === 0) {
    list.innerHTML = '<div class="empty-state">No ngxsmk-tel-input components found</div>';
    return;
  }

  list.innerHTML = components.map((comp, index) => `
    <div class="component-item" data-index="${index}">
      <div class="component-header">
        <span class="component-label">Component #${index + 1}</span>
        <span class="component-id">ID: ${comp.id}</span>
      </div>
      <div class="component-preview">
        <span class="preview-label">Value:</span>
        <span class="preview-value">${comp.rawValue || '(empty)'}</span>
        <span class="preview-status ${comp.isValid ? 'valid' : 'invalid'}">
          ${comp.isValid ? '✓ Valid' : '✗ Invalid'}
        </span>
      </div>
    </div>
  `).join('');

  // Add click handlers
  list.querySelectorAll('.component-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      selectComponent(index);
    });
  });
}

function selectComponent(index) {
  selectedComponent = components[index];
  document.getElementById('component-details').style.display = 'block';
  port.postMessage({ type: 'select-component', componentId: selectedComponent.id });
  updateComponentDetails(selectedComponent);
}

function updateComponentDetails(data) {
  if (!data) return;

  document.getElementById('component-id').textContent = data.id || '-';
  document.getElementById('raw-value').textContent = data.rawValue || '-';
  document.getElementById('e164-value').textContent = data.e164Value || '-';
  document.getElementById('country-iso2').textContent = data.country || '-';
  
  const isValidEl = document.getElementById('is-valid');
  isValidEl.textContent = data.isValid ? 'Valid' : 'Invalid';
  isValidEl.className = `status-badge ${data.isValid ? 'valid' : 'invalid'}`;

  const errorsEl = document.getElementById('validation-errors');
  if (data.errors && data.errors.length > 0) {
    errorsEl.innerHTML = data.errors.map(err => `<div class="error-item">${err}</div>`).join('');
  } else {
    errorsEl.textContent = 'No errors';
  }

  document.getElementById('formatted-value').textContent = data.formattedValue || '-';
  document.getElementById('metadata').textContent = JSON.stringify(data.metadata || {}, null, 2);

  // Update validation indicator
  updateValidationIndicator(data);

  // Update format preview
  updateFormatPreview(data);

  // Update country detection
  updateCountryDetection(data);
}

function updateValidationIndicator(data) {
  const indicator = document.getElementById('validation-indicator');
  const icon = indicator.querySelector('.indicator-icon');
  const text = indicator.querySelector('.indicator-text');

  if (!data.rawValue) {
    icon.textContent = '⏳';
    text.textContent = 'Waiting for input...';
    indicator.className = 'validation-indicator waiting';
  } else if (data.isValid) {
    icon.textContent = '✓';
    text.textContent = 'Valid phone number';
    indicator.className = 'validation-indicator valid';
  } else {
    icon.textContent = '✗';
    text.textContent = 'Invalid phone number';
    indicator.className = 'validation-indicator invalid';
  }
}

function updateFormatPreview(data) {
  document.getElementById('preview-e164').textContent = data.e164Value || '-';
  document.getElementById('preview-national').textContent = data.formattedValue || '-';
  document.getElementById('preview-international').textContent = data.e164Value || '-';
}

function updateCountryDetection(data) {
  document.getElementById('detected-country').textContent = data.country || '-';
  document.getElementById('detection-method').textContent = data.detectionMethod || 'Manual';
  document.getElementById('detection-confidence').textContent = data.confidence || '-';
}

// Auto-refresh every 2 seconds
setInterval(() => {
  port.postMessage({ type: 'refresh' });
}, 2000);


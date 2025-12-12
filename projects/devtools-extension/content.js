/**
 * Content script for detecting and monitoring ngxsmk-tel-input components
 */

let components = [];
let selectedComponentId = null;

// Find all ngxsmk-tel-input components on the page
function findComponents() {
  const elements = document.querySelectorAll('ngxsmk-tel-input');
  components = Array.from(elements).map((el, index) => {
    const input = el.querySelector('input[type="tel"]');
    const component = {
      id: input?.id || `tel-input-${index}`,
      element: el,
      input: input,
      index: index
    };
    
    // Try to get component instance data
    try {
      const ngComponent = (window as any).ng?.getComponent?.(el);
      if (ngComponent) {
        component.data = {
          rawValue: ngComponent.currentRaw?.() || input?.value || '',
          e164Value: ngComponent.e164Value?.() || null,
          country: ngComponent.currentCountry?.() || 'US',
          isValid: ngComponent.isValid?.() || false,
          errors: ngComponent.validationStatus?.()?.errorKeys || []
        };
      }
    } catch (e) {
      // Fallback to DOM inspection
      component.data = {
        rawValue: input?.value || '',
        e164Value: null,
        country: 'US',
        isValid: false,
        errors: []
      };
    }
    
    return component;
  });
  
  return components;
}

// Monitor component changes
function monitorComponent(component) {
  if (!component.input) return;

  const observer = new MutationObserver(() => {
    updateComponentData(component);
    sendUpdate();
  });

  observer.observe(component.element, {
    attributes: true,
    childList: true,
    subtree: true
  });

  // Also listen to input events
  component.input.addEventListener('input', () => {
    updateComponentData(component);
    sendUpdate();
  });

  component.input.addEventListener('blur', () => {
    updateComponentData(component);
    sendUpdate();
  });
}

function updateComponentData(component) {
  if (!component.input) return;

  const input = component.input;
  const value = input.value || '';
  
  // Try to get component instance
  try {
    const ngComponent = (window as any).ng?.getComponent?.(component.element);
    if (ngComponent) {
      component.data = {
        rawValue: ngComponent.currentRaw?.() || value,
        e164Value: ngComponent.e164Value?.() || null,
        country: ngComponent.currentCountry?.() || 'US',
        isValid: ngComponent.isValid?.() || false,
        errors: ngComponent.validationStatus?.()?.errorKeys || [],
        formattedValue: ngComponent.formattedValue?.() || value,
        metadata: ngComponent.phoneMetadata?.() || {}
      };
    } else {
      // Fallback
      component.data = {
        rawValue: value,
        e164Value: null,
        country: 'US',
        isValid: false,
        errors: [],
        formattedValue: value,
        metadata: {}
      };
    }
  } catch (e) {
    // Fallback
    component.data = {
      rawValue: value,
      e164Value: null,
      country: 'US',
      isValid: false,
      errors: [],
      formattedValue: value,
      metadata: {}
    };
  }
}

function sendUpdate() {
  const message = {
    type: 'components-update',
    components: components.map(comp => ({
      id: comp.id,
      rawValue: comp.data?.rawValue || '',
      e164Value: comp.data?.e164Value || null,
      country: comp.data?.country || 'US',
      isValid: comp.data?.isValid || false,
      errors: comp.data?.errors || [],
      formattedValue: comp.data?.formattedValue || '',
      metadata: comp.data?.metadata || {},
      detectionMethod: 'DOM Inspection',
      confidence: 'Medium'
    }))
  };

  // Send to background script
  chrome.runtime.sendMessage(message).catch(() => {
    // DevTools might not be open
  });
}

// Listen for messages from DevTools
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-components') {
    findComponents();
    components.forEach(comp => monitorComponent(comp));
    sendUpdate();
    sendResponse({ success: true });
  } else if (message.type === 'refresh') {
    findComponents();
    components.forEach(comp => monitorComponent(comp));
    sendUpdate();
    sendResponse({ success: true });
  } else if (message.type === 'select-component') {
    selectedComponentId = message.componentId;
    const component = components.find(c => c.id === selectedComponentId);
    if (component) {
      updateComponentData(component);
      sendResponse({ 
        type: 'component-update',
        data: {
          id: component.id,
          ...component.data
        }
      });
    }
  }
  return true;
});

// Initial scan
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    findComponents();
    components.forEach(comp => monitorComponent(comp));
  });
} else {
  findComponents();
  components.forEach(comp => monitorComponent(comp));
}

// Also scan when new content is added
const pageObserver = new MutationObserver(() => {
  const newComponents = findComponents();
  newComponents.forEach(comp => {
    if (!components.find(c => c.id === comp.id)) {
      monitorComponent(comp);
    }
  });
  components = newComponents;
  sendUpdate();
});

pageObserver.observe(document.body, {
  childList: true,
  subtree: true
});


// content.js
// Injected into job board pages to extract data and auto-fill forms.

console.log('AutoApplyAI Content Script Loaded');

// 1. Extract Job Information based on the current domain
function extractJobData() {
  const url = window.location.href;
  let title = '';
  let company = '';
  let description = '';

  try {
    if (url.includes('greenhouse.io')) {
      title = document.querySelector('.app-title')?.innerText.trim() || '';
      company = document.querySelector('.company-name')?.innerText.trim() || '';
      description = document.querySelector('#content')?.innerText.trim() || '';
    } else if (url.includes('lever.co')) {
      title = document.querySelector('.posting-headline h2')?.innerText.trim() || '';
      company = document.title.split('-')[0].trim() || '';
      description = document.querySelector('.posting-body')?.innerText.trim() || '';
    } else if (url.includes('linkedin.com')) {
      title = document.querySelector('.jobs-unified-top-card__job-title')?.innerText.trim() || '';
      company = document.querySelector('.jobs-unified-top-card__company-name')?.innerText.trim() || '';
      description = document.querySelector('.jobs-description__content')?.innerText.trim() || '';
    }
  } catch (err) {
    console.error('AutoApplyAI Extraction Error:', err);
  }

  return { title, company, description, url };
}

// 2. Auto-fill the application form with AI-generated data
function autoFillForm(formData) {
  console.log('AutoApplyAI: Filling form with data', formData);
  
  // Helper to safely set value and trigger React/Angular change events
  const setNativeValue = (element, value) => {
    if (!element) return;
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // Common selectors for standard ATS forms (Greenhouse, Lever, etc.)
  const fieldMapping = {
    firstName: ['input[name="first_name"]', 'input[name="name"]', 'input[id*="first"]'],
    lastName: ['input[name="last_name"]', 'input[id*="last"]'],
    email: ['input[name="email"]', 'input[type="email"]'],
    phone: ['input[name="phone"]', 'input[type="tel"]'],
    linkedIn: ['input[name="urls[LinkedIn]"]', 'input[name*="linkedin"]'],
    portfolio: ['input[name="urls[Portfolio]"]', 'input[name*="portfolio"]'],
  };

  // Fill standard fields
  Object.keys(fieldMapping).forEach(key => {
    if (formData[key]) {
      for (const selector of fieldMapping[key]) {
        const el = document.querySelector(selector);
        if (el) {
          setNativeValue(el, formData[key]);
          el.style.backgroundColor = '#e8f0fe'; // Highlight filled fields
          break;
        }
      }
    }
  });

  // Fill Cover Letter
  if (formData.coverLetter) {
    const coverLetterEl = document.querySelector('textarea[name="cover_letter"], textarea[id*="cover"]');
    if (coverLetterEl) {
      setNativeValue(coverLetterEl, formData.coverLetter);
      coverLetterEl.style.backgroundColor = '#e8f0fe';
    }
  }

  return true;
}

// 3. Listen for messages from the Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_JOB') {
    const data = extractJobData();
    sendResponse({ success: true, data });
  }
  
  if (request.action === 'FILL_FORM') {
    const success = autoFillForm(request.formData);
    sendResponse({ success });
  }
});

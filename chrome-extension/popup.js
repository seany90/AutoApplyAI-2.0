// popup.js
// Handles the UI logic for the extension popup.

document.addEventListener('DOMContentLoaded', async () => {
  const applyBtn = document.getElementById('applyBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const jobTitleEl = document.getElementById('jobTitle');
  const jobCompanyEl = document.getElementById('jobCompany');
  const authWarning = document.getElementById('authWarning');

  let currentJobData = null;

  // 1. Check Authentication Status
  chrome.runtime.sendMessage({ action: 'GET_AUTH_STATUS' }, (response) => {
    if (!response || !response.isAuthenticated) {
      authWarning.style.display = 'block';
      applyBtn.disabled = true;
      jobTitleEl.innerText = 'Authentication Required';
      return;
    }
    
    // 2. If authenticated, extract job data from the active tab
    extractJobFromTab();
  });

  function extractJobFromTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Send message to content script to extract data
      chrome.tabs.sendMessage(activeTab.id, { action: 'EXTRACT_JOB' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          jobTitleEl.innerText = 'No job application detected.';
          jobCompanyEl.innerText = 'Please navigate to a supported job board.';
          applyBtn.disabled = true;
          return;
        }

        currentJobData = response.data;
        
        if (currentJobData.title) {
          jobTitleEl.innerText = currentJobData.title;
          jobCompanyEl.innerText = currentJobData.company;
          applyBtn.disabled = false;
        } else {
          jobTitleEl.innerText = 'No job application detected.';
          applyBtn.disabled = true;
        }
      });
    });
  }

  // 3. Handle the "Auto-Fill" button click
  applyBtn.addEventListener('click', () => {
    if (!currentJobData) return;

    // Update UI to loading state
    applyBtn.disabled = true;
    btnText.innerText = 'Generating Answers...';
    btnLoader.style.display = 'block';

    // Send job data to background script to process via AutoApplyAI backend
    chrome.runtime.sendMessage({ action: 'PROCESS_APPLICATION', jobData: currentJobData }, (response) => {
      if (response && response.success) {
        btnText.innerText = 'Filling Form...';
        
        // Send the generated data back to the content script to fill the DOM
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'FILL_FORM', formData: response.formData }, (fillResponse) => {
            btnLoader.style.display = 'none';
            if (fillResponse && fillResponse.success) {
              btnText.innerText = 'Application Filled!';
              applyBtn.style.backgroundColor = '#16a34a'; // green-600
            } else {
              btnText.innerText = 'Error Filling Form';
              applyBtn.style.backgroundColor = '#dc2626'; // red-600
            }
          });
        });
      } else {
        btnLoader.style.display = 'none';
        btnText.innerText = 'Error Generating Data';
        applyBtn.style.backgroundColor = '#dc2626';
        console.error(response?.error);
      }
    });
  });
});

// background.js
// Service worker handling communication between the extension, the active tab, and the AutoApplyAI web app.

let authToken = null;

// 1. Listen for authentication tokens sent from the AutoApplyAI web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'SET_AUTH_TOKEN') {
    authToken = request.token;
    // Store token securely in local storage for future use
    chrome.storage.local.set({ authToken, userEmail: request.email }, () => {
      console.log('AutoApplyAI: Auth token securely stored.');
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
});

// Load token into memory on startup
chrome.storage.local.get(['authToken'], (result) => {
  if (result.authToken) {
    authToken = result.authToken;
  }
});

// 2. Handle messages from the Popup UI or Content Scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_AUTH_STATUS') {
    chrome.storage.local.get(['authToken', 'userEmail'], (result) => {
      sendResponse({ isAuthenticated: !!result.authToken, email: result.userEmail });
    });
    return true;
  }

  if (request.action === 'PROCESS_APPLICATION') {
    handleApplicationProcessing(request.jobData, sendResponse);
    return true; // Async response
  }
});

// 3. Core Logic: Send job data to AutoApplyAI backend and get AI-generated form answers
async function handleApplicationProcessing(jobData, sendResponse) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    
    if (!authToken) {
      throw new Error('User is not authenticated with AutoApplyAI. Please log in via the web app.');
    }

    // In a real production environment, this would point to your actual backend API endpoint
    // e.g., https://api.autoapplyai.com/v1/generate-application
    // For this example, we simulate the API call that triggers the AI logic
    
    console.log('Sending job data to AutoApplyAI backend...', jobData);
    
    // Simulated API Call to AutoApplyAI Backend
    // const response = await fetch('https://your-backend-api.com/generate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`
    //   },
    //   body: JSON.stringify({ jobData })
    // });
    // const aiGeneratedFormData = await response.json();

    // Simulated AI Response (Mocking the backend AI logic)
    const aiGeneratedFormData = await mockAIGeneration(jobData);

    // Send the generated data back to the popup/content script to auto-fill the form
    sendResponse({ success: true, formData: aiGeneratedFormData });

  } catch (error) {
    console.error('AutoApplyAI Error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Mock function to simulate AI generating form answers based on user profile + job description
async function mockAIGeneration(jobData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        phone: "+1234567890",
        linkedIn: "https://linkedin.com/in/janedoe",
        portfolio: "https://janedoe.dev",
        coverLetter: `Dear Hiring Manager at ${jobData.company || 'the company'},\n\nI am thrilled to apply for the ${jobData.title || 'open'} position. Based on the requirements, my background in full-stack development aligns perfectly with your needs.\n\nBest,\nJane Doe`,
        customQuestions: {
          "years of experience": "5",
          "sponsorship": "No"
        }
      });
    }, 1500); // Simulate network/AI latency
  });
}

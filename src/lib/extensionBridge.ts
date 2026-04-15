import { auth } from '../firebase';

declare global {
  interface Window {
    chrome: any;
  }
  const chrome: any;
}

// Replace this with your actual Chrome Extension ID once published
const EXTENSION_ID = 'your_chrome_extension_id_here'; 

/**
 * Syncs the current Firebase authentication token with the Chrome Extension.
 * This allows the extension to make authenticated requests to the AutoApplyAI backend
 * on behalf of the user.
 */
export const syncAuthWithExtension = async () => {
  // Check if we are in a browser environment that supports Chrome extensions
  if (typeof window === 'undefined' || !window.chrome || !chrome.runtime) {
    return;
  }

  try {
    const user = auth.currentUser;
    
    if (user) {
      // Get a fresh ID token
      const token = await user.getIdToken(true);
      
      // Send the token to the extension via external messaging
      chrome.runtime.sendMessage(
        EXTENSION_ID, 
        { 
          type: 'SET_AUTH_TOKEN', 
          token,
          email: user.email 
        }, 
        (response: any) => {
          if (chrome.runtime.lastError) {
            // Extension might not be installed or ID is incorrect
            console.log('AutoApplyAI Extension not detected or not ready.');
          } else if (response && response.success) {
            console.log('Successfully synced auth token with AutoApplyAI Extension.');
          }
        }
      );
    } else {
      // If user logs out, we should clear the token in the extension
      chrome.runtime.sendMessage(
        EXTENSION_ID, 
        { type: 'SET_AUTH_TOKEN', token: null, email: null }
      );
    }
  } catch (error) {
    console.error('Error syncing auth with extension:', error);
  }
};

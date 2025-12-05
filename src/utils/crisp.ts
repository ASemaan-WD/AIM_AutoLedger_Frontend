/**
 * Utility functions for Crisp chatbox integration
 */

/**
 * Opens the Crisp chatbox
 * This function checks if Crisp is loaded and opens the chat window
 */
export function openCrispChat(): void {
  // Check if Crisp is loaded
  if (typeof window !== 'undefined' && window.$crisp) {
    // Crisp API: open the chat window
    window.$crisp.push(['do', 'chat:open']);
  } else {
    // If Crisp isn't loaded yet, wait a bit and try again
    setTimeout(() => {
      if (window.$crisp) {
        window.$crisp.push(['do', 'chat:open']);
      } else {
        console.warn('Crisp chatbox is not available');
      }
    }, 500);
  }
}

// Extend Window interface to include Crisp types
declare global {
  interface Window {
    $crisp?: {
      push: (command: [string, string] | [string, string, any]) => void;
    };
    CRISP_WEBSITE_ID?: string;
  }
}


/**
 * Utility functions for Crisp chatbox integration
 */

/**
 * Opens the Crisp chatbox with optional prepopulated message
 * @param message - Optional message to prepopulate in the chat input
 */
export function openCrispChat(message?: string): void {
  const openChat = () => {
    if (window.$crisp) {
      // If a message is provided, set it in the chat input first
      if (message) {
        window.$crisp.push(['set', 'message:text', message]);
      }
      // Open the chat window
      window.$crisp.push(['do', 'chat:open']);
    } else {
      console.warn('Crisp chatbox is not available');
    }
  };

  // Check if Crisp is loaded
  if (typeof window !== 'undefined' && window.$crisp) {
    openChat();
  } else {
    // If Crisp isn't loaded yet, wait a bit and try again
    setTimeout(openChat, 500);
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


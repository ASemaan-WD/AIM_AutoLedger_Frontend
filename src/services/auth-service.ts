/**
 * Auth Service
 * Frontend service for Authentication operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'auth_token';

interface TokenResponse {
  token: string;
}

/**
 * Login user
 * Endpoint: POST /api/security/token
 * 
 * Authenticates the user and stores the returned token.
 * 
 * @param username - The username to login with
 * @param password - The password to login with
 * @returns Promise that resolves when login is successful
 */
export async function login(username: string, password: string): Promise<void> {
  console.log(`🚀 Logging in user: ${username}`);

  try {
    const response = await fetch(`${API_BASE_URL}/security/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(errorText);
    }

    const result = await response.json() as TokenResponse;
    
    if (result.token) {
        localStorage.setItem(TOKEN_KEY, result.token);
        console.log(`✅ Login successful for user: ${username}`);
    } else {
        throw new Error('No token received in response');
    }

  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

/**
 * Logout user
 * 
 * Clears the stored token and redirects to login page.
 */
export function logout() {
  console.log('👋 Logging out user');
  localStorage.removeItem(TOKEN_KEY);
  // Optional: Redirect to login page if not handled by component state
  window.location.href = '/login';
}

/**
 * Get stored token
 * 
 * @returns The stored auth token or null if not found
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Validate current token
 * Endpoint: POST /api/security/validate
 * 
 * Checks if the stored token is still valid on the server.
 * 
 * @returns Promise resolving to true if token is valid, false otherwise
 */
export async function validateToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  console.log(`🚀 Validating token...`);

  try {
    const response = await fetch(`${API_BASE_URL}/security/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        // If validation fails (e.g. 401), we consider it invalid
        console.warn(`⚠️ Token validation failed with status: ${response.status}`);
        return false;
    }

    const result = await response.json();
    // Assuming API returns true/false directly as per previous code assumption
    const isValid = result &&result.auth && result.auth === true;
    
    if (isValid) {
        console.log(`✅ Token is valid`);
    } else {
        console.warn(`⚠️ Token is invalid`);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return false;
  }
}

/**
 * Check if user is authenticated (client-side only)
 * 
 * @returns true if token exists
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

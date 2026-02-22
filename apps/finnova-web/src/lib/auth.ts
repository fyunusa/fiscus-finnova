/**
 * Authentication utilities
 * Handles retrieving auth tokens and user info from localStorage
 */

/**
 * Get the access token from localStorage
 * The token is stored during login
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem('refreshToken');
    return token;
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
}

/**
 * Get the user ID from localStorage
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userId = localStorage.getItem('userId');
    return userId;
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    return null;
  }
}

/**
 * Get the user email from localStorage
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const email = localStorage.getItem('userEmail');
    return email;
  } catch (error) {
    console.error('Error retrieving user email:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * Get all user information
 */
export function getUserInfo() {
  return {
    userId: getUserId(),
    email: getUserEmail(),
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}

/**
 * Clear all authentication data (logout)
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

/**
 * Handle token expiry by clearing auth data and redirecting to login
 * Called when API returns 401 (Unauthorized) response
 */
export function handleTokenExpiry(): void {
  if (typeof window === 'undefined') {
    return;
  }

  console.warn('🔐 Token expired or invalid. Redirecting to login...');
  
  // Clear all auth data
  clearAuthData();
  
  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Wrapper for fetch that automatically handles authorization and token expiry
 * Use this instead of direct fetch calls when you need authentication
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options (headers will be merged with auth headers)
 * @returns Promise<Response>
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  
  // Prepare headers with auth token
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check for 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      console.error('Unauthorized access - token may be expired');
      handleTokenExpiry();
      // Throw error after redirect is initiated
      throw new Error('User authentication expired');
    }

    return response;
  } catch (error) {
    // If it's a parse error from handleTokenExpiry, let it propagate
    if (error instanceof Error && error.message === 'User authentication expired') {
      throw error;
    }
    // Re-throw other errors
    throw error;
  }
}

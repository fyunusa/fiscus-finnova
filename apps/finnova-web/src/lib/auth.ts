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

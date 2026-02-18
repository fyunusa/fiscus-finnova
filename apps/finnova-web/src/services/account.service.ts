/**
 * Account Creation Service
 * Handles creating user account from collected signup data
 */

export interface CreateAccountRequest {
  // Registration data
  username: string;
  email: string;
  password: string;

  // Personal data
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  phone: string;

  // Address
  address: string;
  buildingName: string;
  postcode?: string;

  // Account verification
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;

  // Agreement
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToMarketing: boolean;

  // Tokens/IDs from verification
  niceCI?: string;
  niceDI?: string;
}

export interface CreateAccountResponse {
  success: boolean;
  userId?: string;
  message?: string;
  error?: string;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Create account with all collected signup data
 */
export async function createAccountFromSignup(
  data: CreateAccountRequest
): Promise<CreateAccountResponse> {
  try {
    console.log('📤 Creating account with signup data...');

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Account creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create account',
      };
    }

    const result = await response.json();

    console.log('✅ Account created successfully:', result.data.userId);

    // Extract tokens from response data
    const { userId, accessToken, refreshToken } = result.data;

    return {
      success: true,
      userId,
      accessToken,
      refreshToken,
      message: 'Account created successfully',
    };
  } catch (error) {
    console.error('❌ Account creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify if account was already created
 */
export async function checkAccountExists(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/v1/auth/user/${userId}`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking account existence:', error);
    return false;
  }
}

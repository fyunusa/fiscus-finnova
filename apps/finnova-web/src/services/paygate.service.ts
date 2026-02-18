/**
 * Paygate (Toss Payments) Service
 * Handles 1 won micro-deposit verification for account ownership confirmation
 * Uses Portone (formerly iamport) API for payment gateway integration
 */

// Get environment variables
const getPaygateConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', merchantId: '', apiKey: '', demoMode: true };
  }
  return {
    url: process.env.NEXT_PUBLIC_PAYGATE_API_URL || '',
    merchantId: process.env.NEXT_PUBLIC_PAYGATE_MERCHANT_ID || '',
    apiKey: process.env.NEXT_PUBLIC_PAYGATE_API_KEY || '',
    // Use demo mode if credentials are not properly configured
    demoMode: !process.env.NEXT_PUBLIC_PAYGATE_MERCHANT_ID || 
              process.env.NEXT_PUBLIC_PAYGATE_MERCHANT_ID.includes('placeholder') ||
              process.env.NEXT_PUBLIC_PAYGATE_MERCHANT_ID.includes('generated'),
  };
};

export interface PaygateTransferRequest {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

export interface PaygateTransferResponse {
  success: boolean;
  token?: string;
  code?: string;
  message?: string;
  error?: string;
}

export interface PaygateVerifyRequest {
  token: string;
  code: string;
}

export interface PaygateVerifyResponse {
  success: boolean;
  verified: boolean;
  message?: string;
  error?: string;
}

/**
 * Initiate 1-won micro transfer for account verification
 * Calls backend API which handles Paygate/Toss integration
 */
export async function initiate1WonTransfer(
  data: PaygateTransferRequest
): Promise<PaygateTransferResponse> {
  try {
    console.log('📤 Requesting 1 won transfer from backend');

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetch(`${apiUrl}/account-verification/initiate-1won`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend 1 won transfer failed:', error);
      return {
        success: false,
        error: error.message || error.data?.error || '1 won transfer failed',
      };
    }

    const result = await response.json();
    
    console.log('✅ Backend initiated 1 won transfer');
    
    return {
      success: result.data?.success || true,
      token: result.data?.token,
      message: result.data?.message || result.message || '1 won transferred to your account',
    };
  } catch (error) {
    console.error('❌ Transfer initiation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify the 3-digit code from 1 won transfer memo
 * Calls backend endpoint to verify code
 */
export async function verify1WonCode(
  data: PaygateVerifyRequest
): Promise<PaygateVerifyResponse> {
  try {
    console.log('📤 Verifying 1 won code via backend');

    if (!data.code || !/^\d{3}$/.test(data.code)) {
      return {
        success: false,
        verified: false,
        error: 'Code must be 3 digits',
      };
    }

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    // Call backend endpoint
    const response = await fetch(`${apiUrl}/account-verification/verify-1won`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.token,
        code: data.code,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend code verification failed:', error);
      return {
        success: false,
        verified: false,
        error: error.message || error.data?.error || 'Code verification failed',
      };
    }

    const result = await response.json();
    
    console.log('✅ Backend verified 1 won code successfully');
    
    return {
      success: result.data?.success || true,
      verified: result.data?.verified || true,
      message: result.data?.message || result.message || 'Account verified',
    };
  } catch (error) {
    console.error('❌ Verification error:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get Paygate status and configuration
 */
export function getPaygateStatus() {
  const config = getPaygateConfig();
  return {
    configured: !!config.merchantId && !config.demoMode,
    demoMode: config.demoMode,
    apiUrl: config.url,
    merchantId: config.merchantId?.substring(0, 10) + '...' || 'Not configured',
  };
}

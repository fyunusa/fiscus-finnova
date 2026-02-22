/**
 * NICE API Service
 * Handles identity verification through NICE/KCB API
 * Includes fallback demo mode when credentials are not available
 */

import { fetchWithAuth } from '@/lib/auth';

// Get environment variables - these are safe to access in browser with NEXT_PUBLIC prefix
const getNiceConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', id: '', secret: '', demoMode: true };
  }
  return {
    url: process.env.NEXT_PUBLIC_NICE_API_URL || '',
    id: process.env.NEXT_PUBLIC_NICE_CLIENT_ID || '',
    secret: process.env.NEXT_PUBLIC_NICE_CLIENT_SECRET || '',
    // Use demo mode if credentials are not properly configured
    demoMode: !process.env.NEXT_PUBLIC_NICE_CLIENT_ID || 
              process.env.NEXT_PUBLIC_NICE_CLIENT_ID.includes('placeholder') ||
              process.env.NEXT_PUBLIC_NICE_CLIENT_ID.includes('generated'),
  };
};

interface NiceVerificationRequest {
  name: string;
  phone: string;
  birthDate?: string;
  gender?: 'M' | 'F';
}

interface NiceVerificationResponse {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
}

interface NiceCodeVerificationRequest {
  token: string;
  code: string;
}

interface NiceCodeVerificationResponse {
  success: boolean;
  ci?: string; // Unique identifier
  di?: string; // Device identifier
  name?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  message?: string;
  error?: string;
}

/**
 * Request identity verification from NICE
 * Calls backend API which handles NICE verification in demo or real mode
 */
export async function requestNiceVerification(
  data: NiceVerificationRequest
): Promise<NiceVerificationResponse> {
  try {
    console.log('📤 Requesting NICE verification from backend');

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    // Call backend endpoint
    const response = await fetchWithAuth(`${apiUrl}/account-verification/initiate-nice`, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        birthDate: data.birthDate,
        gender: data.gender,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend verification request failed:', error);
      return {
        success: false,
        error: error.message || error.data?.error || 'Verification request failed',
      };
    }

    const result = await response.json();
    
    console.log('✅ Backend returned verification token');
    
    return {
      success: result.data?.success || true,
      token: result.data?.token,
      message: result.data?.message || result.message || 'Verification initiated',
    };
  } catch (error) {
    console.error('❌ Verification request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify the code received from NICE API
 * Calls backend endpoint to verify code
 */
export async function verifyNiceCode(
  data: NiceCodeVerificationRequest
): Promise<NiceCodeVerificationResponse> {
  try {
    console.log('📤 Verifying NICE code via backend');

    if (!data.code || data.code.length !== 6) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit code',
      };
    }

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    // Call backend endpoint
    const response = await fetch(`${apiUrl}/account-verification/verify-nice-code`, {
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
        error: error.message || error.data?.error || 'Code verification failed',
      };
    }

    const result = await response.json();
    
    console.log('✅ Backend verified code successfully');
    
    return {
      success: result.data?.success || true,
      ci: result.data?.ci,
      di: result.data?.di,
      name: result.data?.name,
      birthDate: result.data?.birthDate,
      gender: result.data?.gender,
      phone: result.data?.phone,
      message: result.data?.message || result.message || 'Code verified',
    };
  } catch (error) {
    console.error('NICE code verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify code',
    };
  }
}

/**
 * Check if NICE API is properly configured (or in demo mode)
 */
export function isNiceConfigured(): boolean {
  const config = getNiceConfig();
  // Return true if we have real credentials OR if demo mode is available
  return true; // Always available - either real API or demo mode
}

/**
 * Get NICE API status
 */
export function getNiceStatus() {
  const config = getNiceConfig();
  return {
    configured: true,
    demoMode: config.demoMode,
    apiUrl: config.url || 'Demo Mode',
    clientId: config.demoMode ? 'Demo Mode' : (config.id ? `${config.id.substring(0, 10)}...` : 'Not set'),
  };
}

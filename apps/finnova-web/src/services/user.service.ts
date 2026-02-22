/**
 * User Financial Services API Client
 * Handles Bank Accounts, KYC Documents, and Transaction PIN operations
 */

import { fetchWithAuth } from '@/lib/auth';

// ==================== Types ====================

export interface BankAccount {
  id: string;
  userId: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  status: 'pending' | 'verified';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'id_copy' | 'selfie_with_id';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'supplement';
  rejectionReason?: string | null;
  adminReviewedBy?: string | null;
  adminReviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionPIN {
  id: string;
  userId: string;
  isSet: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockoutTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

// ==================== Bank Account Methods ====================

/**
 * Create a new bank account for the logged-in user
 */
export async function createBankAccount(
  bankAccount: CreateBankAccountRequest
): Promise<ApiResponse<BankAccount>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/bank-accounts`, {
      method: 'POST',
      body: JSON.stringify(bankAccount),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to create bank account:', data);
      throw new Error(data.message || 'Failed to create bank account');
    }

    console.log('✅ Bank account created:', data.data);
    return data;
  } catch (error) {
    console.error('❌ Bank account creation error:', error);
    throw error;
  }
}

/**
 * Get all bank accounts for the logged-in user
 */
export async function getBankAccounts(): Promise<ApiResponse<BankAccount[]>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/bank-accounts`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch bank accounts:', data);
      throw new Error(data.message || 'Failed to fetch bank accounts');
    }

    console.log('✅ Bank accounts fetched:', data.data.length);
    return data;
  } catch (error) {
    console.error('❌ Bank accounts fetch error:', error);
    throw error;
  }
}

/**
 * Get default bank account for the logged-in user
 */
export async function getDefaultBankAccount(): Promise<ApiResponse<BankAccount>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/bank-accounts/default`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch default bank account:', data);
      throw new Error(data.message || 'Failed to fetch default bank account');
    }

    console.log('✅ Default bank account fetched');
    return data;
  } catch (error) {
    console.error('❌ Default bank account fetch error:', error);
    throw error;
  }
}

/**
 * Set a bank account as default
 */
export async function setDefaultBankAccount(
  bankAccountId: string
): Promise<ApiResponse<BankAccount>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/bank-accounts/${bankAccountId}/default`, {
      method: 'PUT',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to set default bank account:', data);
      throw new Error(data.message || 'Failed to set default bank account');
    }

    console.log('✅ Default bank account updated');
    return data;
  } catch (error) {
    console.error('❌ Default bank account update error:', error);
    throw error;
  }
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(bankAccountId: string): Promise<ApiResponse<void>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/bank-accounts/${bankAccountId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to delete bank account:', data);
      throw new Error(data.message || 'Failed to delete bank account');
    }

    console.log('✅ Bank account deleted');
    return data;
  } catch (error) {
    console.error('❌ Bank account deletion error:', error);
    throw error;
  }
}

// ==================== KYC Document Methods ====================

/**
 * Upload KYC documents (ID copy and selfie with ID)
 */
export async function uploadKYCDocuments(
  files: { idDocument?: File; selfieDocument?: File }
): Promise<ApiResponse<KYCDocument[]>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const formData = new FormData();
    if (files.idDocument) {
      formData.append('idDocument', files.idDocument);
    }
    if (files.selfieDocument) {
      formData.append('selfieDocument', files.selfieDocument);
    }

    const response = await fetchWithAuth(`${apiUrl}/users/kyc-documents`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to upload KYC documents:', data);
      throw new Error(data.message || 'Failed to upload KYC documents');
    }

    console.log('✅ KYC documents uploaded:', data.data.length);
    return data;
  } catch (error) {
    console.error('❌ KYC documents upload error:', error);
    throw error;
  }
}

/**
 * Get all KYC documents for the logged-in user
 */
export async function getKYCDocuments(): Promise<ApiResponse<KYCDocument[]>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/kyc-documents`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch KYC documents:', data);
      throw new Error(data.message || 'Failed to fetch KYC documents');
    }

    console.log('✅ KYC documents fetched:', data.data.length);
    return data;
  } catch (error) {
    console.error('❌ KYC documents fetch error:', error);
    throw error;
  }
}

/**
 * Get a specific KYC document
 */
export async function getKYCDocument(
  documentId: string
): Promise<ApiResponse<KYCDocument>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/kyc-documents/${documentId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch KYC document:', data);
      throw new Error(data.message || 'Failed to fetch KYC document');
    }

    console.log('✅ KYC document fetched');
    return data;
  } catch (error) {
    console.error('❌ KYC document fetch error:', error);
    throw error;
  }
}

/**
 * Delete a KYC document
 */
export async function deleteKYCDocument(
  documentId: string
): Promise<ApiResponse<void>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/kyc-documents/${documentId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to delete KYC document:', data);
      throw new Error(data.message || 'Failed to delete KYC document');
    }

    console.log('✅ KYC document deleted');
    return data;
  } catch (error) {
    console.error('❌ KYC document delete error:', error);
    throw error;
  }
}

// ==================== Transaction PIN Methods ====================

/**
 * Set transaction PIN
 */
export async function setTransactionPIN(pin: string): Promise<ApiResponse<TransactionPIN>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/transaction-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to set transaction PIN:', data);
      throw new Error(data.message || 'Failed to set transaction PIN');
    }

    console.log('✅ Transaction PIN set');
    return data;
  } catch (error) {
    console.error('❌ Transaction PIN set error:', error);
    throw error;
  }
}

/**
 * Get transaction PIN status
 */
export async function getTransactionPINStatus(): Promise<ApiResponse<TransactionPIN>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    const response = await fetchWithAuth(`${apiUrl}/users/transaction-pin`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch transaction PIN status:', data);
      throw new Error(data.message || 'Failed to fetch transaction PIN status');
    }

    console.log('✅ Transaction PIN status fetched');
    return data;
  } catch (error) {
    console.error('❌ Transaction PIN status fetch error:', error);
    throw error;
  }
}

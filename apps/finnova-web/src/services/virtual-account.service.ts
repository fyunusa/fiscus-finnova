import { getAccessToken } from '@/lib/auth';

const API_BASE_URL = 'http://localhost:4000/api/v1';

export interface VirtualAccountInfo {
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  frozenBalance: number;
  bankName?: string;
  lastTransactionAt?: string;
}

export interface VirtualAccountInitiation {
  requestId: string;
  paymentKey: string;
  orderId: string;
  checkoutUrl: string;
  amount: number;
  status: 'READY' | 'DONE';
  requiresUserAction: boolean;
  createdAt: string;
}

export interface DepositHistoryItem {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface DepositHistory {
  items: DepositHistoryItem[];
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

export interface VirtualAccountTransaction {
  id: string;
  virtualAccountId: string;
  type: string;
  amount: number;
  status: string;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceNumber?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Get user's virtual account info
 */
export async function getVirtualAccountInfo(): Promise<{ success: boolean; data?: VirtualAccountInfo; error?: string }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Account not found or other error - return success: false with error message
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || 'Virtual account not found',
    };
  }

  const data = await response.json();
  return data;
}

/**
 * Create or get user's virtual account
 * Returns either a checkout URL (if new account needs payment) or completed account info
 */
export async function createVirtualAccount(): Promise<{ success: boolean; data: VirtualAccountInfo | VirtualAccountInitiation }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create virtual account');
  }

  return response.json();
}

/**
 * Complete virtual account creation after user finishes checkout
 * Called with the request ID to confirm account creation
 */
export async function completeVirtualAccount(requestId: string): Promise<{ success: boolean; data: VirtualAccountInfo | { status: string; message: string } }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/complete/${requestId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to complete virtual account');
  }

  return response.json();
}

/**
 * Get any pending virtual account request for current user
 * Returns pending request details if one exists
 */
export async function getPendingVirtualAccountRequest(): Promise<{ success: boolean; data: { id: string; requestId: string; status: string; message: string; pendingSince: string } | null }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/pending-request`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { success: false, data: null };
  }

  return response.json();
}

/**
 * Check status of virtual account request
 * Can be called repeatedly to check if account has been issued
 */
export async function checkVirtualAccountStatus(
  requestId: string,
): Promise<{ success: boolean; data: VirtualAccountInfo | { status: string; message: string; pendingSince?: string; requiresUserAction: boolean } }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/status/${requestId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check virtual account status');
  }

  return response.json();
}

/**
 * Confirm virtual account payment after user completes Toss checkout
 * Attempts to confirm payment and issue the virtual account
 */
export async function confirmVirtualAccountPayment(
  requestId: string,
): Promise<{
  success: boolean;
  data:
    | VirtualAccountInfo
    | {
        status: string;
        message: string;
        requiresUserAction: boolean;
        nextSteps?: string;
      };
}> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/confirm/${requestId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to confirm virtual account payment');
  }

  return response.json();
}

/**
 * Get transaction history (deposits and withdrawals)
 */
export async function getTransactionHistory(): Promise<{ success: boolean; data: DepositHistory }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/transactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transaction history');
  }

  return response.json();
}

/**
 * Record a deposit
 */
export async function recordDeposit(amount: number, description?: string): Promise<{ success: boolean; data: VirtualAccountTransaction }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to record deposit');
  }

  return response.json();
}

/**
 * Record a withdrawal
 */
export async function recordWithdrawal(amount: number, pin: string, description?: string): Promise<{ success: boolean; data: VirtualAccountTransaction }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/virtual-accounts/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
      pin,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to record withdrawal');
  }

  return response.json();
}

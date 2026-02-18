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
export async function getVirtualAccountInfo(): Promise<{ success: boolean; data: VirtualAccountInfo }> {
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
    throw new Error('Failed to fetch virtual account info');
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

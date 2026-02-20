import { getAccessToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface InvestmentSummary {
  totalInvestments: number;
  numberOfInvestments: number;
  totalEarnings: number;
  investmentsInProgress: number;
  estimatedMonthlyProfit: number;
}

export interface ScheduledPayment {
  id: string;
  investmentTitle: string;
  dueDate: string;
  expectedAmount: number;
  investmentAmount: number;
  rate: number;
  status: 'pending' | 'completed' | 'overdue';
}

export interface RepaymentHistory {
  id: string;
  investmentTitle: string;
  repaymentDate: string;
  amount: number;
  investmentAmount: number;
  rate: number;
  status: 'completed' | 'failed';
}

export interface RepaymentStatus {
  scheduledPayments: ScheduledPayment[];
  repaymentHistory: RepaymentHistory[];
  upcomingPaymentAmount: number;
}

export interface InvestmentHistoryItem {
  id: string;
  investmentId: string;
  investmentTitle: string;
  type: string;
  amount: number;
  rate: number;
  expectedRate?: number;
  period: number;
  investedDate: string;
  maturityDate?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';
  expectedEarnings: number;
  actualEarnings?: number;
}

export interface InvestmentHistory {
  total: number;
  page: number;
  limit: number;
  items: InvestmentHistoryItem[];
}

export interface FavoriteInvestment {
  id: string;
  title: string;
  type: string;
  rate: number;
  period: number;
  riskLevel: 'low' | 'medium' | 'high';
  fundingGoal: number;
  fundingCurrent: number;
  fundingPercent: number;
  minInvestment: number;
  status: string;
}

/**
 * Get investment summary
 */
export async function getInvestmentSummary(): Promise<{ success: boolean; data: InvestmentSummary }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/investments/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch investment summary');
  }

  return response.json();
}

/**
 * Get repayment status
 */
export async function getRepaymentStatus(): Promise<{ success: boolean; data: RepaymentStatus }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/investments/repayment-status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch repayment status');
  }

  return response.json();
}

/**
 * Get investment history with filters
 */
export async function getInvestmentHistory(params?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: InvestmentHistory }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.type) query.append('type', params.type);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/dashboard/investments/history?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch investment history');
  }

  return response.json();
}

/**
 * Get user's favorite investments
 */
export async function getFavoriteInvestments(): Promise<{ success: boolean; data: FavoriteInvestment[] }> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/investments/favorites`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch favorite investments');
  }

  return response.json();
}

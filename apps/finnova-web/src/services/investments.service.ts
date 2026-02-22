import { fetchWithAuth } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface Investment {
  id: string;
  title: string;
  type: 'apartment' | 'credit-card' | 'business-loan';
  rate: number;
  period: number;
  fundingGoal: number;
  fundingCurrent: number;
  fundingPercent: number;
  minInvestment: number;
  borrowerType: string;
  status: 'recruiting' | 'funding' | 'ending-soon' | 'closed';
  badge?: string;
  description?: string;
  investorCount: number;
  propertyAddress?: string;
  propertySize?: string;
  buildYear?: number;
  kbValuation?: number;
  currentLien?: number;
  ltv?: number;
  merchantName?: string;
  merchantCategory?: string;
  outstandingAmount?: number;
  businessName?: string;
  businessCategory?: string;
  annualRevenue?: number;
  fundingStartDate?: string;
  fundingEndDate?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface UserInvestment {
  id: string;
  userId: string;
  investmentId: string;
  investmentAmount: number;
  investmentCount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';
  expectedRate: number;
  investmentPeriodMonths: number;
  expectedMaturityDate?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  investment?: Investment;
}

export interface InvestmentsResponse {
  success: boolean;
  message: string;
  data: {
    data: Investment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface UserInvestmentsResponse {
  success: boolean;
  message: string;
  data: UserInvestment[];
}

export interface InvestmentDetailResponse {
  success: boolean;
  message: string;
  data: Investment;
}

export interface CreateInvestmentResponse {
  success: boolean;
  message: string;
  data: UserInvestment;
}

/**
 * Get all investments with filters
 */
export async function getInvestments(params?: {
  type?: string;
  status?: string;
  sort?: 'popular' | 'new' | 'ending' | 'high';
  page?: number;
  limit?: number;
}): Promise<InvestmentsResponse> {
  const query = new URLSearchParams();
  
  if (params?.type) query.append('type', params.type);
  if (params?.status) query.append('status', params.status);
  if (params?.sort) query.append('sort', params.sort);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/investments?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch investments');
  }

  return response.json();
}

/**
 * Get investment detail
 */
export async function getInvestmentDetail(id: string): Promise<InvestmentDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/investments/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Investment not found');
  }

  return response.json();
}

/**
 * Get investment with investors
 */
export async function getInvestmentWithInvestors(id: string): Promise<{
  success: boolean;
  message: string;
  data: {
    investment: Investment;
    investors: UserInvestment[];
  };
}> {
  const response = await fetch(`${API_BASE_URL}/investments/${id}/investors`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch investment details');
  }

  return response.json();
}

/**
 * Get user's investments
 */
export async function getUserInvestments(): Promise<UserInvestmentsResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/user/my-investments`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user investments');
  }

  return response.json();
}

/**
 * Create user investment
 */
export async function createUserInvestment(
  investmentId: string,
  amount: number,
): Promise<CreateInvestmentResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/invest`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create investment');
  }

  return response.json();
}

/**
 * Add investment to favorites
 */
export async function addToFavorites(investmentId: string): Promise<{
  success: boolean;
  message: string;
  data: any;
}> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/favorite`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add to favorites');
  }

  return response.json();
}

/**
 * Remove investment from favorites
 */
export async function removeFromFavorites(investmentId: string): Promise<{
  success: boolean;
  message: string;
  data: any;
}> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/favorite`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove from favorites');
  }

  return response.json();
}

/**
 * Check if investment is favorited by user
 */
export async function isFavorited(investmentId: string): Promise<{
  success: boolean;
  message: string;
  data: { isFavorited: boolean };
}> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/is-favorited`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check favorite status');
  }

  return response.json();
}

/**
 * Get user's favorite investments
 */
export async function getUserFavorites(): Promise<{
  success: boolean;
  message: string;
  data: Investment[];
}> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/user/favorites`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get favorites');
  }

  return response.json();
}

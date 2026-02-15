// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  userType: 'individual' | 'corporate';
  role: 'investor' | 'borrower' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Investment Types
export interface FundingProduct {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'card-sales' | 'sales-loan';
  status: 'recruiting' | 'funded' | 'active' | 'completed' | 'defaulted';
  targetAmount: number;
  raisedAmount: number;
  progressPercentage: number;
  annualRate: number;
  period: number; // in months
  startDate: string;
  endDate: string;
  borrowerInfo: {
    name: string;
    type: 'individual' | 'corporate';
  };
  collateral: {
    type: string;
    value: number;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  expectedReturn: number;
  investedAt: string;
  completedAt?: string;
}

// Loan Types
export interface LoanApplication {
  id: string;
  userId: string;
  type: 'apartment' | 'sales-loan' | 'card-sales';
  amount: number;
  status: 'inquiry' | 'applied' | 'approved' | 'rejected' | 'funded' | 'active' | 'completed';
  appliedAt: string;
  approvedAt?: string;
  createdAt: string;
}

// Deposit Types
export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'confirmed';
  virtualAccount?: string;
  bankCode?: string;
  depositedAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

import { apiClient } from '@/lib/api-client';

const LOANS_API = '/loans';

// ============ Types ============

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  productType: 'apartment' | 'building' | 'credit' | 'business-loan' | 'unsecured';
  maxLTV: number;
  minInterestRate: number;
  maxInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minLoanPeriod: number;
  maxLoanPeriod: number;
  repaymentMethod: 'equal-principal-interest' | 'equal-principal' | 'bullet';
  isActive: boolean;
  requiredDocuments: string[];
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  applicationNo: string;
  userId: string;
  loanProductId: string;
  requestedLoanAmount: number;
  approvedLoanAmount: number | null;
  approvedInterestRate: number | null;
  approvedLoanPeriod: number | null;
  collateralType: string;
  collateralValue: number;
  collateralAddress: string;
  collateralDetails: string | null;
  status: 'pending' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  statusHistory: Array<{
    status: string;
    date: string;
    note?: string;
  }>;
  rejectionReason: string | null;
  documents: any[];
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanApplicationDto {
  loanProductId: string;
  requestedLoanAmount: number;
  loanPeriod: number;
  collateralType: string;
  collateralValue: number;
  collateralAddress: string;
  collateralDetails?: string;
  applicantNotes?: string;
}

export interface LoanConsultation {
  id: string;
  name: string;
  phone: string;
  email: string;
  loanType: string | null;
  requestedAmount: number | null;
  propertyType: string | null;
  purpose: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
}

export interface CreateLoanConsultationDto {
  name: string;
  phone: string;
  email: string;
  loanType?: string;
  requestedAmount?: number;
  propertyType?: string;
  purpose?: string;
  message?: string;
}

// ============ API Calls ============

export const loanService = {
  // ===== Products =====
  
  /**
   * Get all active loan products
   */
  async getProducts(active = true): Promise<LoanProduct[]> {
    const response = await apiClient.get<{ success: boolean; data: LoanProduct[] }>(
      `${LOANS_API}/products?active=${active}`,
      true // public endpoint
    );
    return response.data;
  },

  /**
   * Get specific loan product by ID
   */
  async getProduct(id: string): Promise<LoanProduct> {
    const response = await apiClient.get<{ success: boolean; data: LoanProduct }>(
      `${LOANS_API}/products/${id}`,
      true // public endpoint
    );
    return response.data;
  },

  // ===== Applications =====

  /**
   * Create new loan application
   */
  async createApplication(dto: CreateLoanApplicationDto): Promise<LoanApplication> {
    const response = await apiClient.post<{ success: boolean; data: LoanApplication }>(
      `${LOANS_API}/applications`,
      dto
    );
    return response.data;
  },

  /**
   * Get current user's loan applications with optional filtering
   */
  async getApplications(
    status?: string,
    page = 1,
    limit = 10
  ): Promise<{ data: LoanApplication[]; pagination: any }> {
    let url = `${LOANS_API}/applications?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get<{
      success: boolean;
      data: LoanApplication[];
      pagination: any;
    }>(url);
    return {
      data: response.data,
      pagination: response.pagination,
    };
  },

  /**
   * Get specific loan application by ID
   */
  async getApplication(id: string): Promise<LoanApplication> {
    const response = await apiClient.get<{ success: boolean; data: LoanApplication }>(
      `${LOANS_API}/applications/${id}`
    );
    return response.data;
  },

  /**
   * Update loan application (only for pending applications)
   */
  async updateApplication(id: string, dto: Partial<CreateLoanApplicationDto>): Promise<LoanApplication> {
    const response = await apiClient.put<{ success: boolean; data: LoanApplication }>(
      `${LOANS_API}/applications/${id}`,
      dto
    );
    return response.data;
  },

  /**
   * Submit application for review
   */
  async submitApplication(id: string): Promise<LoanApplication> {
    const response = await apiClient.post<{ success: boolean; data: LoanApplication }>(
      `${LOANS_API}/applications/${id}/submit`,
      {}
    );
    return response.data;
  },

  /**
   * Delete loan application (only for pending applications)
   */
  async deleteApplication(id: string): Promise<void> {
    await apiClient.delete(`${LOANS_API}/applications/${id}`);
  },

  // ===== Consultations =====

  /**
   * Create consultation request (public endpoint - no auth required)
   */
  async createConsultation(dto: CreateLoanConsultationDto): Promise<LoanConsultation> {
    const response = await apiClient.post<{ success: boolean; data: LoanConsultation }>(
      `${LOANS_API}/consultations`,
      dto,
      true // public endpoint
    );
    return response.data;
  },
};

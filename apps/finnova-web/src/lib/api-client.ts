import { getAccessToken, handleTokenExpiry } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private extractErrorMessage(errorText: string): string {
    try {
      const errorObj = JSON.parse(errorText);
      if (errorObj.message) {
        return errorObj.message;
      }
      if (errorObj.error) {
        return errorObj.error;
      }
    } catch {
      // If not JSON, return the text as is
    }
    return errorText || 'An error occurred';
  }

  private handleResponse(response: Response): void {
    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      handleTokenExpiry();
    }
  }

  async get<T = any>(endpoint: string, isPublic = false): Promise<T> {
    const headers = isPublic ? { 'Content-Type': 'application/json' } : this.getHeaders();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      this.handleResponse(response);
      const error = await response.text();
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async post<T = any>(endpoint: string, body?: any, isPublic = false): Promise<T> {
    const headers = isPublic ? { 'Content-Type': 'application/json' } : this.getHeaders();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      this.handleResponse(response);
      const error = await response.text();
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const headers = this.getHeaders();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      this.handleResponse(response);
      const error = await response.text();
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const headers = this.getHeaders();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      this.handleResponse(response);
      const error = await response.text();
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }
}

export const apiClient = new ApiClient();

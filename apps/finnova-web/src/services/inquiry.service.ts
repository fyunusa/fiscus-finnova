const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface InquiryUser {
  id: string;
  name: string;
}

export interface InquiryComment {
  id: string;
  content: string;
  isAdminReply: boolean;
  userId: string;
  user?: InquiryUser;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  subject: string;
  message: string;
  category: 'account' | 'investment' | 'loan' | 'technical' | 'other';
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  repliesCount: number;
  lastReplyAt?: string;
  lastReplyBy?: string;
  userId: string;
  user?: InquiryUser;
  comments?: InquiryComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryPayload {
  subject: string;
  message: string;
  category: string;
  priority?: string;
}

export interface UpdateInquiryPayload {
  subject?: string;
  message?: string;
  category?: string;
  priority?: string;
  status?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function getInquiries(category?: string, status?: string): Promise<Inquiry[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (status) params.set('status', status);

  const url = `${API_URL}/inquiries${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inquiries');
  }
  return data.data;
}

export async function getMyInquiries(category?: string, status?: string): Promise<Inquiry[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (status) params.set('status', status);

  const url = `${API_URL}/inquiries/my${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inquiries');
  }
  return data.data;
}

export async function getInquiry(id: string): Promise<Inquiry> {
  const res = await fetch(`${API_URL}/inquiries/${id}`);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inquiry');
  }
  return data.data;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<Inquiry> {
  const res = await fetch(`${API_URL}/inquiries`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to create inquiry');
  }
  return data.data;
}

export async function updateInquiry(id: string, payload: UpdateInquiryPayload): Promise<Inquiry> {
  const res = await fetch(`${API_URL}/inquiries/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to update inquiry');
  }
  return data.data;
}

export async function closeInquiry(id: string): Promise<Inquiry> {
  const res = await fetch(`${API_URL}/inquiries/${id}/close`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to close inquiry');
  }
  return data.data;
}

export async function addComment(inquiryId: string, content: string): Promise<InquiryComment> {
  const res = await fetch(`${API_URL}/inquiries/${inquiryId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to add comment');
  }
  return data.data;
}

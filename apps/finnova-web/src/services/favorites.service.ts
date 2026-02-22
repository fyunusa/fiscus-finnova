import { fetchWithAuth } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Add investment to favorites
 */
export async function addToFavorites(investmentId: string): Promise<{ success: boolean }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/favorite`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to add to favorites');
  }

  return response.json();
}

/**
 * Remove investment from favorites
 */
export async function removeFromFavorites(investmentId: string): Promise<{ success: boolean }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/favorite`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to remove from favorites');
  }

  return response.json();
}

/**
 * Get user's favorite investments
 */
export async function getFavoriteInvestments(): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/user/favorites`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch favorite investments');
  }

  return response.json();
}

/**
 * Check if investment is favorited
 */
export async function checkIsFavorited(investmentId: string): Promise<{ isFavorited: boolean }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/investments/${investmentId}/is-favorited`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to check favorite status');
  }

  return response.json();
}

/**
 * Kakao Auth Service
 * Handles Kakao OAuth 2.0 login redirect and code exchange via backend
 */

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '';
const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/kakao/callback`;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface KakaoUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  role: string;
  isNewUser: boolean;
}

export interface KakaoAuthResult {
  accessToken: string;
  refreshToken: string;
  user: KakaoUser;
}

class KakaoAuthService {
  private readonly authUrl = 'https://kauth.kakao.com/oauth/authorize';

  /**
   * Redirect the user to Kakao login page
   */
  login(): void {
    if (!KAKAO_JS_KEY) {
      console.error('❌ Kakao JS key not configured (NEXT_PUBLIC_KAKAO_JS_KEY)');
      throw new Error('Kakao login is not configured');
    }

    const params = new URLSearchParams({
      client_id: KAKAO_JS_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email',
    });

    const kakaoLoginUrl = `${this.authUrl}?${params.toString()}`;
    console.log('🟡 Redirecting to Kakao login...');
    window.location.href = kakaoLoginUrl;
  }

  /**
   * Exchange Kakao authorization code for our app JWT via backend
   */
  async handleCallback(code: string): Promise<KakaoAuthResult> {
    if (!code) {
      throw new Error('Authorization code is missing');
    }

    console.log('🔄 Exchanging Kakao code with backend...');

    const response = await fetch(`${API_URL}/auth/kakao/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirectUri: KAKAO_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = (errorData as any)?.message || 'Kakao authentication failed';
      throw new Error(message);
    }

    const data = await response.json();

    // data.data contains the auth result (follows your ResponseDto pattern)
    const result: KakaoAuthResult = data.data;

    if (!result?.accessToken) {
      throw new Error('Invalid response from authentication server');
    }

    console.log('✅ Kakao login successful');
    return result;
  }

  /**
   * Store JWT tokens in localStorage (mirrors your existing auth pattern)
   */
  storeTokens(result: KakaoAuthResult): void {
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  /**
   * Clear stored tokens (logout)
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export const kakaoAuthService = new KakaoAuthService();

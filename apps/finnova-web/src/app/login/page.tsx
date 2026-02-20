'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Check lockout status on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedLockoutTime = localStorage.getItem('loginLockoutTime');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockoutTime) {
      const timeLeft = parseInt(storedLockoutTime) - Date.now();
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockoutTime(Math.ceil(timeLeft / 1000));
      } else {
        localStorage.removeItem('loginLockoutTime');
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || lockoutTime <= 0) return;

    const interval = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          localStorage.removeItem('loginLockoutTime');
          localStorage.removeItem('loginAttempts');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  const handleLogin = async () => {
    setError('');

    if (isLocked) {
      setError(`계정이 잠금 상태입니다. ${lockoutTime}초 후 다시 시도해주세요.`);
      return;
    }

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Call backend login API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Login failed');
      }

      // Reset attempts on successful login
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginLockoutTime');

      // Store authentication tokens and user information
      const { accessToken, refreshToken, user } = result.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userType', user.userType);
      localStorage.setItem('username', user.firstName || email.split('@')[0]);
      localStorage.setItem('userEmail', user.email);
      
      // Store signup completion status from backend
      localStorage.setItem('hasVerifiedBankAccount', String(user.hasVerifiedBankAccount || false));
      localStorage.setItem('hasKYCDocument', String(user.hasKYCDocument || false));
      localStorage.setItem('hasTransactionPIN', String(user.hasTransactionPIN || false));

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      console.log('✅ Login successful:', user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      
      // Increment failed attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      if (newAttempts >= 5) {
        // Lock account for 30 minutes
        const lockoutEndTime = Date.now() + 30 * 60 * 1000;
        localStorage.setItem('loginLockoutTime', lockoutEndTime.toString());
        setIsLocked(true);
        setLockoutTime(30 * 60);
        setError('비밀번호 오류가 5회 이상 발생했습니다. 계정이 30분간 잠금되었습니다.');
      } else {
        const attemptsLeft = 5 - newAttempts;
        setError(`${errorMsg} (${attemptsLeft}회 남음)`);
      }

      console.error('❌ Login error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
              <p className="text-gray-600">계정에 접속하세요</p>
            </div>


            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLocked && !loading) {
                      handleLogin();
                    }
                  }}
                  disabled={isLocked || loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <Link
                    href="/login/reset-password"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    비밀번호 잊음?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLocked && !loading) {
                        handleLogin();
                      }
                    }}
                    disabled={isLocked || loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '숨기기' : '보기'}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLocked || loading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-600 select-none cursor-pointer"
                >
                  아이디 기억하기
                </label>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={loading || isLocked}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </Button>
            </div>


            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-medium">보안 안내:</span> 계정 보안을 위해 5회 로그인 실패 후 30분간 계정이 자동 잠금됩니다.
              </p>
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
              <div>
                <span className="text-sm text-gray-600">아이디를 모르세요? </span>
                <Link
                  href="/login/forgot-email"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  이메일 찾기
                </Link>
              </div>
              <div>
                <span className="text-sm text-gray-600">계정이 없으세요? </span>
                <Link
                  href="/signup"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

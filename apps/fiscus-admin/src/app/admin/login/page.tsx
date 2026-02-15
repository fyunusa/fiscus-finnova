'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * BMAI_1: Admin Login
 * Purpose: Secure admin system access
 * Security:
 * - ID/password authentication
 * - 5 failed attempts → 30 min account lock
 * - IP whitelist restriction (optional)
 * - Session timeout: 30 minutes
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
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
    const storedAttempts = localStorage.getItem('adminLoginAttempts');
    const storedLockoutTime = localStorage.getItem('adminLoginLockoutTime');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockoutTime) {
      const timeLeft = parseInt(storedLockoutTime) - Date.now();
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockoutTime(Math.ceil(timeLeft / 1000));
      } else {
        localStorage.removeItem('adminLoginLockoutTime');
        localStorage.removeItem('adminLoginAttempts');
      }
    }

    // Load remembered admin ID
    const rememberedAdminId = localStorage.getItem('rememberedAdminId');
    if (rememberedAdminId) {
      setAdminId(rememberedAdminId);
      setRememberMe(true);
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || lockoutTime <= 0) return;

    const interval = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          localStorage.removeItem('adminLoginLockoutTime');
          localStorage.removeItem('adminLoginAttempts');
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

    if (!adminId || !password) {
      setError('관리자 ID와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with backend authentication API
      // const response = await fetch('/api/auth/admin/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ adminId, password, rememberMe }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - replace with real API response
      // For demo: admin/admin123 works
      const isAuthenticated = adminId === 'admin' && password === 'admin123';

      if (isAuthenticated) {
        // Reset attempts on successful login
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('adminLoginLockoutTime');

        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberedAdminId', adminId);
        } else {
          localStorage.removeItem('rememberedAdminId');
        }

        // Set session timeout (30 minutes)
        const sessionTimeout = Date.now() + 30 * 60 * 1000;
        localStorage.setItem('adminSessionExpiry', sessionTimeout.toString());

        // Redirect to dashboard
        router.push('/admin');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      // Increment failed attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('adminLoginAttempts', newAttempts.toString());

      if (newAttempts >= 5) {
        // Lock account for 30 minutes
        const lockoutEndTime = Date.now() + 30 * 60 * 1000;
        localStorage.setItem('adminLoginLockoutTime', lockoutEndTime.toString());
        setIsLocked(true);
        setLockoutTime(30 * 60);
        setError('로그인 실패가 5회 이상 발생했습니다. 계정이 30분간 잠금되었습니다.');
      } else {
        const attemptsLeft = 5 - newAttempts;
        setError(`관리자 ID 또는 비밀번호가 올바르지 않습니다. (${attemptsLeft}회 남음)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FISCUS</h1>
          <p className="text-blue-200">관리자 시스템</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">관리자 로그인</h2>
            <p className="text-gray-600 text-sm">보안 접속을 위해 로그인하세요</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-5">
            {/* Admin ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관리자 ID
              </label>
              <input
                type="text"
                placeholder="관리자 ID를 입력하세요"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLocked && !loading) {
                    handleLogin();
                  }
                }}
                disabled={isLocked || loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">비밀번호</label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  비밀번호 잊음?
                </Link>
              </div>
              <div className="relative">
                <input
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 text-sm"
                  disabled={isLocked || loading}
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
                ID 기억하기
              </label>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || isLocked}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-medium">🔒 보안 안내:</span> 계정 보안을 위해 5회 로그인 실패 후 30분간 계정이 자동 잠금됩니다. 세션은 30분 후 자동 종료됩니다.
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-medium">📝 데모 계정:</span> ID: admin / 비밀번호: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

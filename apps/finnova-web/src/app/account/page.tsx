'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, CreditCard, LogOut, FileText, Bell, Settings, Eye, Home, ArrowRight, ChevronDown, Download, Upload, EyeOff, X, AlertCircle } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';
import * as userService from '@/services/user.service';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'bank' | 'kyc' | 'documents' | 'notifications' | 'preferences' | 'withdrawal'>('overview');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [pinForm, setPinForm] = useState({ current: '', new: '', confirm: '' });
  const [pinSetupForm, setPinSetupForm] = useState({ pin: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedDocId, setExpandedDocId] = useState<string | null>('1');
  const [selectedDocCategory, setSelectedDocCategory] = useState<'all' | 'required' | 'collateral' | 'additional'>('all');
  const [pendingSteps, setPendingSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [kycDocuments, setKycDocuments] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string>('');

  const [userProfile, setUserProfile] = useState({
    name: '김철수',
    email: 'kim.chulsu@example.com',
    phone: '010-1234-5678',
    memberType: '개인 투자자',
    investorType: '일반',
    virtualAccount: '1002-123-456789',
    joinDate: '2024-02-14',
  });

  // Clear error messages when switching tabs
  useEffect(() => {
    if (activeTab === 'security') {
      setApiError('');
    }
  }, [activeTab]);

  // Check account creation status and pending signup steps on mount
  useEffect(() => {
    const accessToken = getAccessToken();
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');

    if (!accessToken) {
      router.push('/login');
      return;
    }

    // Update user profile from localStorage
    setUserProfile(prev => ({
      ...prev,
      name: username || prev.name,
      email: userEmail || prev.email,
      memberType: userType === 'corporate' ? '법인 투자자' : '개인 투자자',
      investorType: userType === 'corporate' ? '승인' : '일반',
    }));

    // Determine pending steps based on user type
    const incomplete: number[] = [];
    
    if (userType === 'corporate') {
      // Corporate users need to complete steps 6-10 after signup
      // Step 11 is shown upon account creation, not needed in pending list
      incomplete.push(6, 7, 8, 9, 10);
    } else {
      // Individual users: check specific completion flags
      const hasVerifiedBankAccount = localStorage.getItem('hasVerifiedBankAccount') === 'true';
      const hasKYCDocument = localStorage.getItem('hasKYCDocument') === 'true';
      const hasTransactionPIN = localStorage.getItem('hasTransactionPIN') === 'true';

      if (!hasVerifiedBankAccount) incomplete.push(6);
      // Step 7 (1-Won Transfer) is not cached, we'll skip it for now
      if (!hasKYCDocument) incomplete.push(8);
      if (!hasTransactionPIN) incomplete.push(9);
    }

    setPendingSteps(incomplete);

    // Load bank accounts from API
    loadBankAccounts(accessToken);
    loadKYCDocuments(accessToken);

    setIsLoading(false);
  }, [router]);

  const loadBankAccounts = async (token: string) => {
    try {
      const response = await userService.getBankAccounts(token);
      setBankAccounts(response.data || []);
      setApiError('');
    } catch (error: any) {
      console.error('Failed to load bank accounts:', error);
      setApiError('계좌 정보를 불러올 수 없습니다');
      setBankAccounts([]);
    }
  };

  const loadKYCDocuments = async (token: string) => {
    try {
      const response = await userService.getKYCDocuments(token);
      setKycDocuments(response.data || []);
      setApiError('');
    } catch (error: any) {
      console.error('Failed to load KYC documents:', error);
      setApiError('KYC 문서를 불러올 수 없습니다');
      setKycDocuments([]);
    }
  };

  const refreshUserData = async (token: string) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token available');
        return;
      }

      // Call refresh endpoint to get updated login data with latest flags
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();
      
      if (result.success && result.data?.user) {
        const user = result.data.user;
        const userType = localStorage.getItem('userType');
        
        // Update localStorage with new flags
        localStorage.setItem('hasVerifiedBankAccount', String(user.hasVerifiedBankAccount || false));
        localStorage.setItem('hasKYCDocument', String(user.hasKYCDocument || false));
        localStorage.setItem('hasTransactionPIN', String(user.hasTransactionPIN || false));
        localStorage.setItem('accessToken', result.data.accessToken);
        
        // Recalculate pending steps based on user type
        const incomplete: number[] = [];
        
        if (userType === 'corporate') {
          // Corporate users need steps 6-10 (step 11 shown upon account creation)
          incomplete.push(6, 7, 8, 9, 10);
        } else {
          // Individual users: check specific completion flags
          if (!user.hasVerifiedBankAccount) incomplete.push(6);
          if (!user.hasKYCDocument) incomplete.push(8);
          if (!user.hasTransactionPIN) incomplete.push(9);
        }
        
        setPendingSteps(incomplete);
        setSuccessMessage('데이터가 업데이트되었습니다');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleSetPIN = async () => {
    if (pinSetupForm.pin !== pinSetupForm.confirm) {
      setApiError('PIN이 일치하지 않습니다');
      return;
    }

    if (pinSetupForm.pin.length !== 4 || !/^\d+$/.test(pinSetupForm.pin)) {
      setApiError('PIN은 4자리 숫자여야 합니다');
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      await userService.setTransactionPIN(pinSetupForm.pin, token);
      setSuccessMessage('PIN이 설정되었습니다');
      setPinSetupForm({ pin: '', confirm: '' });
      setShowPinSetupModal(false);
      
      // Refresh user data to update pending steps
      await refreshUserData(token);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to set PIN:', error);
      setApiError(error.message || 'PIN 설정에 실패했습니다');
      setTimeout(() => setApiError(''), 3000);
    }
  };

  const quickStats = [
    { label: '총 투자액', value: '₩5,000,000', icon: '💰', color: 'from-blue-500 to-blue-600' },
    { label: '누적 수익', value: '₩125,000', icon: '📈', color: 'from-green-500 to-green-600' },
    { label: '가용 잔액', value: '₩1,234,567', icon: '💳', color: 'from-purple-500 to-purple-600' },
  ];

  const handlePasswordChange = async () => {
    console.log('Password change button clicked', { passwordForm });
    
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      console.log('Validation failed: empty fields');
      setApiError('모든 필드를 입력해주세요');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      console.log('Validation failed: passwords do not match');
      setApiError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (passwordForm.new.length < 8) {
      console.log('Validation failed: password too short');
      setApiError('새 비밀번호는 8자 이상이어야 합니다');
      return;
    }

    try {
      console.log('Password validation passed, making API call');
      const token = getAccessToken();
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Calling API endpoint...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.message || '비밀번호 변경에 실패했습니다');
      }

      console.log('Password changed successfully');
      setSuccessMessage('비밀번호가 변경되었습니다');
      setApiError('');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Password change error:', error);
      setApiError(error.message || '비밀번호 변경 중 오류가 발생했습니다');
      setTimeout(() => setApiError(''), 5000);
    }
  };

  const handlePinChange = async () => {
    console.log('PIN change button clicked', { pinForm });
    
    if (!pinForm.current || !pinForm.new || !pinForm.confirm) {
      console.log('PIN validation failed: empty fields');
      setApiError('모든 필드를 입력해주세요');
      return;
    }

    if (![pinForm.current, pinForm.new, pinForm.confirm].every(p => p.length === 4 && /^\d+$/.test(p))) {
      console.log('PIN validation failed: invalid format');
      setApiError('PIN은 4자리 숫자여야 합니다');
      return;
    }

    if (pinForm.new !== pinForm.confirm) {
      console.log('PIN validation failed: PINs do not match');
      setApiError('새 PIN이 일치하지 않습니다');
      return;
    }

    try {
      console.log('PIN validation passed, making API call');
      const token = getAccessToken();
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Calling API endpoint for PIN change...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/change-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPin: pinForm.current,
          newPin: pinForm.new,
        }),
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'PIN 변경에 실패했습니다');
      }

      console.log('PIN changed successfully');
      setSuccessMessage('PIN이 변경되었습니다');
      setApiError('');
      setPinForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('PIN change error:', error);
      setApiError(error.message || 'PIN 변경 중 오류가 발생했습니다');
      setTimeout(() => setApiError(''), 5000);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('정말로 이 계좌를 삭제하시겠습니까?')) return;
    
    try {
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      await userService.deleteBankAccount(accountId, token);
      setSuccessMessage('계좌가 삭제되었습니다');
      loadBankAccounts(token);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      setApiError('계좌 삭제에 실패했습니다');
      setTimeout(() => setApiError(''), 3000);
    }
  };

  const handleAddAccount = () => {
    // Navigate to account registration page
    alert('계좌 등록 페이지로 이동합니다');
  };

  const handleUploadKYC = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Convert FileList to object with named files
      const uploadData: { idDocument?: File; selfieDocument?: File } = {};
      if (files.length > 0) uploadData.idDocument = files[0];
      if (files.length > 1) uploadData.selfieDocument = files[1];

      await userService.uploadKYCDocuments(uploadData, token);
      setSuccessMessage('KYC 문서가 업로드되었습니다');
      loadKYCDocuments(token);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to upload KYC documents:', error);
      setApiError('KYC 문서 업로드에 실패했습니다');
      setTimeout(() => setApiError(''), 3000);
    }
  };

  const categoryLabels = {
    required: { ko: '필수', color: 'text-red-600 bg-red-50' },
    collateral: { ko: '담보', color: 'text-blue-600 bg-blue-50' },
    additional: { ko: '추가', color: 'text-purple-600 bg-purple-50' },
  };

  const tabs = [
    { id: 'overview', label: '개요', icon: Home },
    { id: 'profile', label: '프로필', icon: User },
    { id: 'security', label: '보안', icon: Lock },
    { id: 'bank', label: '계좌', icon: CreditCard },
    { id: 'kyc', label: 'KYC', icon: Eye },
    { id: 'documents', label: '서류', icon: FileText },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'preferences', label: '설정', icon: Settings },
    { id: 'withdrawal', label: '탈퇴', icon: LogOut },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-2xl font-bold">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                <p className="text-blue-100 mt-1">{userProfile.memberType} • {userProfile.investorType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Pending Steps Banner */}
          {pendingSteps.length > 0 && (
            <Card className="mb-8 bg-amber-50 border-l-4 border-amber-600 p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 mb-2">완료되지 않은 가입 단계가 있습니다</h3>
                  <p className="text-amber-800 text-sm mb-4">
                    회원가입을 완료하려면 다음 단계들을 진행해주세요:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pendingSteps.includes(6) && (
                      <button
                        onClick={() => setActiveTab('bank')}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        6단계: 계좌 등록
                      </button>
                    )}
                    {pendingSteps.includes(7) && (
                      <Link
                        href="/signup/individual/verify-account"
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        7단계: 계좌 확인
                      </Link>
                    )}
                    {pendingSteps.includes(8) && (
                      <button
                        onClick={() => setActiveTab('kyc')}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        8단계: KYC 인증
                      </button>
                    )}
                    {pendingSteps.includes(9) && (
                      <button
                        onClick={() => setShowPinSetupModal(true)}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        9단계: 거래 PIN 설정
                      </button>
                    )}
                    {pendingSteps.includes(10) && (
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        10단계: 문서 검증
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-t-lg shadow-md border-b border-gray-200 overflow-x-auto">
            <div className="flex flex-nowrap">
              {tabs.map((tab) => {
                const TabIcon = tab.icon as any;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-4 font-medium text-sm whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TabIcon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg shadow-md p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">계정 개요</h2>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {quickStats.map((stat) => (
                    <Card key={stat.label} className="bg-white shadow-md p-6 overflow-hidden border border-gray-200">
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-10 -mt-10`} />
                      <div className="relative">
                        <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Dashboard Button */}
                <div className="mb-12">
                  <Link href="/dashboard">
                    <Button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all">
                      📊 Go to Investment Dashboard
                    </Button>
                  </Link>
                </div>

                {/* Account Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">계정 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm mb-1">이메일</p>
                    <p className="text-lg font-semibold text-gray-900">{userProfile.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm mb-1">휴대폰</p>
                    <p className="text-lg font-semibold text-gray-900">{userProfile.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm mb-1">가상계좌</p>
                    <p className="text-lg font-semibold text-gray-900">{userProfile.virtualAccount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm mb-1">가입일</p>
                    <p className="text-lg font-semibold text-gray-900">{userProfile.joinDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">프로필 관리</h2>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <Input
                      type="text"
                      defaultValue={userProfile.name}
                      disabled={localStorage.getItem('userType') === 'corporate'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                    {localStorage.getItem('userType') === 'corporate' && (
                      <p className="text-xs text-gray-500 mt-1">법인 사용자는 이름을 변경할 수 없습니다</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <Input
                      type="email"
                      defaultValue={userProfile.email}
                      disabled={localStorage.getItem('userType') === 'corporate'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                    {localStorage.getItem('userType') === 'corporate' && (
                      <p className="text-xs text-gray-500 mt-1">법인 사용자는 이메일을 변경할 수 없습니다</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰</label>
                    <Input
                      type="tel"
                      defaultValue={userProfile.phone}
                      disabled={localStorage.getItem('userType') === 'corporate'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                    {localStorage.getItem('userType') === 'corporate' && (
                      <p className="text-xs text-gray-500 mt-1">법인 사용자는 휴대폰번호를 변경할 수 없습니다</p>
                    )}
                  </div>
                  <Button
                    disabled={localStorage.getItem('userType') === 'corporate'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    변경 사항 저장
                  </Button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">보안 설정</h2>
                
                {successMessage && (
                  <Card className="bg-green-50 border-l-4 border-green-600 p-4 mb-8">
                    <p className="text-green-700 font-semibold">{successMessage}</p>
                  </Card>
                )}

                {apiError && (
                  <Card className="bg-red-50 border-l-4 border-red-600 p-4 mb-8">
                    <p className="text-red-700 font-semibold">{apiError}</p>
                  </Card>
                )}

                <div className="space-y-8 max-w-2xl">
                  {/* Password Change */}
                  <Card className="bg-gray-50 p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="text-red-600" size={24} />
                      <h3 className="text-xl font-semibold text-gray-900">비밀번호 변경</h3>
                    </div>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder="현재 비밀번호"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <Input
                        type="password"
                        placeholder="새 비밀번호"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="relative">
                        <Input
                          type={showPasswords ? "text" : "password"}
                          placeholder="새 비밀번호 확인"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-3 top-2 text-gray-600"
                        >
                          {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <Button
                        onClick={handlePasswordChange}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                      >
                        비밀번호 변경
                      </Button>
                    </div>
                  </Card>

                  {/* PIN Change */}
                  <Card className="bg-gray-50 p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="text-red-600" size={24} />
                      <h3 className="text-xl font-semibold text-gray-900">거래 PIN 변경</h3>
                    </div>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder="현재 PIN (4자리)"
                        value={pinForm.current}
                        onChange={(e) => setPinForm({...pinForm, current: e.target.value})}
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                      />
                      <Input
                        type="password"
                        placeholder="새 PIN (4자리)"
                        value={pinForm.new}
                        onChange={(e) => setPinForm({...pinForm, new: e.target.value})}
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                      />
                      <Input
                        type="password"
                        placeholder="새 PIN 확인 (4자리)"
                        value={pinForm.confirm}
                        onChange={(e) => setPinForm({...pinForm, confirm: e.target.value})}
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                      />
                      <Button
                        onClick={handlePinChange}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                      >
                        PIN 변경
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Bank Accounts Tab */}
            {activeTab === 'bank' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">계좌 관리</h2>
                <p className="text-gray-600 mb-6">
                  입출금할 계좌를 등록하고 관리하세요
                </p>
                <Link href="/account/bank-accounts">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                    계좌 관리 페이지로 이동
                  </Button>
                </Link>
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">KYC 인증</h2>
                <p className="text-gray-600 mb-6">
                  신분증 사본과 셀카를 업로드하여 본인확인을 완료하세요
                </p>
                <Link href="/account/kyc">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
                    KYC 인증 페이지로 이동
                  </Button>
                </Link>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">서류 관리</h2>
                <p className="text-gray-600 mb-6">
                  제출된 서류 목록입니다. 새로운 서류를 추가하거나 기존 서류를 수정할 수 있습니다.
                </p>
                <Link href="/account/documents">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                    서류 관리 페이지로 이동
                  </Button>
                </Link>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">알림 설정</h2>
                <div className="space-y-4 max-w-2xl">
                  {[
                    { label: '이메일 알림', description: '중요한 계정 변경사항 알림' },
                    { label: 'SMS 알림', description: '거래 관련 알림' },
                    { label: '마케팅 알림', description: '신상품 및 이벤트 소식' },
                  ].map((item) => (
                    <Card key={item.label} className="bg-gray-50 p-6 border border-gray-200 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-6 h-6 text-blue-600 rounded" />
                    </Card>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  설정 저장
                </Button>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">개인 설정</h2>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>한국어</option>
                      <option>English</option>
                      <option>中文</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">테마</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>라이트 (기본)</option>
                      <option>다크</option>
                      <option>시스템 설정</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시간 형식</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>24시간 형식</option>
                      <option>12시간 형식</option>
                    </select>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                    설정 저장
                  </Button>
                </div>
              </div>
            )}

            {/* Withdrawal Tab */}
            {activeTab === 'withdrawal' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">계정 탈퇴</h2>
                <Card className="bg-red-50 border border-red-200 p-6 mb-6">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ 주의</h3>
                  <p className="text-red-800 mb-4">
                    계정을 탈퇴하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <ul className="space-y-2 text-red-800 text-sm">
                    <li>• 모든 투자 계정이 해지됩니다</li>
                    <li>• 보유 자산이 정산됩니다</li>
                    <li>• 개인정보가 완전히 삭제됩니다</li>
                  </ul>
                </Card>
                <div className="max-w-2xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">탈퇴 사유 (선택사항)</label>
                  <textarea
                    rows={4}
                    placeholder="탈퇴 이유를 입력해주세요..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold">
                    계정 탈퇴하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PIN Setup Modal */}
        {showPinSetupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-white p-8 rounded-lg max-w-md w-full mx-4 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">PIN 설정</h2>
                <button
                  onClick={() => {
                    setShowPinSetupModal(false);
                    setPinSetupForm({ pin: '', confirm: '' });
                    setApiError('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {apiError && (
                <Card className="bg-red-50 border border-red-200 p-4 mb-4">
                  <p className="text-red-700 text-sm">{apiError}</p>
                </Card>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN (4자리 숫자)</label>
                  <input
                    type="password"
                    placeholder="0000"
                    maxLength={4}
                    value={pinSetupForm.pin}
                    onChange={(e) => setPinSetupForm({...pinSetupForm, pin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN 확인</label>
                  <input
                    type="password"
                    placeholder="0000"
                    maxLength={4}
                    value={pinSetupForm.confirm}
                    onChange={(e) => setPinSetupForm({...pinSetupForm, confirm: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    거래 시 인증에 필요한 4자리 PIN을 설정하세요. 꼭 기억해두세요!
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPinSetupModal(false);
                      setPinSetupForm({ pin: '', confirm: '' });
                      setApiError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSetPIN}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    PIN 설정
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

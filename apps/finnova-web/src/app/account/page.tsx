'use client';

import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import { User, Lock, CreditCard, LogOut, FileText, Bell, Settings, Eye, Home, ArrowRight, ChevronDown, Download, Upload, EyeOff, X } from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'bank' | 'kyc' | 'documents' | 'notifications' | 'preferences' | 'withdrawal'>('overview');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [pinForm, setPinForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedDocId, setExpandedDocId] = useState<string | null>('1');
  const [selectedDocCategory, setSelectedDocCategory] = useState<'all' | 'required' | 'collateral' | 'additional'>('all');

  const [userProfile, setUserProfile] = useState({
    name: '김철수',
    email: 'kim.chulsu@example.com',
    phone: '010-1234-5678',
    memberType: '개인 투자자',
    investorType: '일반',
    virtualAccount: '1002-123-456789',
    joinDate: '2024-02-14',
  });

  const quickStats = [
    { label: '총 투자액', value: '₩5,000,000', icon: '💰', color: 'from-blue-500 to-blue-600' },
    { label: '누적 수익', value: '₩125,000', icon: '📈', color: 'from-green-500 to-green-600' },
    { label: '가용 잔액', value: '₩1,234,567', icon: '💳', color: 'from-purple-500 to-purple-600' },
  ];

  // KYC Documents
  const kycDocuments = [
    {
      id: '1',
      name: '신분증 사본',
      description: '유효한 신분증 (주민등록증, 운전면허증, 여권 등)',
      category: 'required',
      isRequired: true,
      fileType: 'PDF, JPG, PNG',
      notes: [
        '만료된 신분증은 인정되지 않습니다',
        '양면 모두 선명하게 제출하세요',
      ],
    },
    {
      id: '2',
      name: '주민등록등본',
      description: '최근 3개월 이내 발급한 주민등록등본',
      category: 'required',
      isRequired: true,
      fileType: 'PDF',
      notes: [
        '주소 변경 내역이 포함되어야 합니다',
        '인터넷 발급 본으로 가능합니다',
      ],
    },
    {
      id: '3',
      name: '통장 사본',
      description: '최근 3개월 통장 거래 내역',
      category: 'required',
      isRequired: true,
      fileType: 'PDF, JPG',
      notes: [
        '예금주명이 명확히 드러나야 합니다',
        '월별 거래 내역이 모두 포함되어야 합니다',
      ],
    },
  ];

  // Bank Accounts
  const bankAccounts = [
    {
      id: '1',
      bankName: '국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '김철수',
      isDefault: true,
      status: 'verified',
    },
    {
      id: '2',
      bankName: '우리은행',
      accountNumber: '456-789-012345',
      accountHolder: '김철수',
      isDefault: false,
      status: 'verified',
    },
  ];

  const handlePasswordChange = () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.current) {
      setSuccessMessage('비밀번호가 변경되었습니다');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handlePinChange = () => {
    if (pinForm.new === pinForm.confirm && pinForm.new.length === 4 && pinForm.current) {
      setSuccessMessage('PIN이 변경되었습니다');
      setPinForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <Input
                      type="email"
                      defaultValue={userProfile.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰</label>
                    <Input
                      type="tel"
                      defaultValue={userProfile.phone}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
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
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <Card key={account.id} className="bg-gray-50 p-6 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{account.bankName}</h3>
                            {account.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                기본 계좌
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              account.status === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {account.status === 'verified' ? '인증완료' : '대기중'}
                            </span>
                          </div>
                          <p className="text-gray-600">계좌번호: {account.accountNumber}</p>
                          <p className="text-gray-600">예금주: {account.accountHolder}</p>
                        </div>
                        <Button className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                          삭제
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  + 계좌 추가
                </Button>
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">KYC 인증</h2>
                <div className="space-y-4">
                  {kycDocuments.map((doc) => (
                    <Card key={doc.id} className="bg-white border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                        className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryLabels[doc.category as keyof typeof categoryLabels].color}`}>
                              {categoryLabels[doc.category as keyof typeof categoryLabels].ko}
                            </span>
                            {doc.isRequired && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                필수
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
                          <p className="text-gray-600 mt-1">{doc.description}</p>
                        </div>
                        <ChevronDown
                          size={24}
                          className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                            expandedDocId === doc.id ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {expandedDocId === doc.id && (
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">제출 요구사항</h4>
                              <ul className="space-y-2">
                                {doc.notes.map((note, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">파일 정보</h4>
                              <div className="bg-white rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-semibold">지원 형식:</span> {doc.fileType}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">최대 크기:</span> 10MB
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                  <Download size={16} />
                                  예시
                                </Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                  <Upload size={16} />
                                  업로드
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
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
      </div>
    </Layout>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Lock, AlertCircle, MoreVertical, Mail } from 'lucide-react';

/**
 * BMEM_1: Member Management
 * Comprehensive member management with search, filters, and detail tabs
 */
export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Mock data
  const members = [
    {
      id: 'M001',
      name: '박준호',
      email: 'park.junho@example.com',
      phone: '010-1234-5678',
      ci: 'CI_20240101001',
      investorType: 'general',
      registrationDate: '2024-01-01',
      status: 'active',
      investmentTotal: 50000000,
      loanTotal: 0,
      transactions: 45,
      lastLogin: '2024-01-28',
    },
    {
      id: 'M002',
      name: '김영미',
      email: 'kim.young@example.com',
      phone: '010-5678-1234',
      ci: 'CI_20240102001',
      investorType: 'qualified',
      registrationDate: '2024-01-02',
      status: 'active',
      investmentTotal: 250000000,
      loanTotal: 125000000,
      transactions: 156,
      lastLogin: '2024-01-28',
    },
    {
      id: 'M003',
      name: '이준석',
      email: 'lee.jun@example.com',
      phone: '010-9012-3456',
      ci: 'CI_20240103001',
      investorType: 'general',
      registrationDate: '2024-01-05',
      status: 'suspended',
      investmentTotal: 75000000,
      loanTotal: 0,
      transactions: 32,
      lastLogin: '2024-01-25',
    },
    {
      id: 'M004',
      name: '정수진',
      email: 'jung.sujin@example.com',
      phone: '010-3456-7890',
      ci: 'CI_20240104001',
      investorType: 'premium',
      registrationDate: '2024-01-08',
      status: 'active',
      investmentTotal: 500000000,
      loanTotal: 0,
      transactions: 234,
      lastLogin: '2024-01-28',
    },
  ];

  const filtered = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.ci.includes(searchTerm);
    
    const matchesType = filterType === 'all' || member.investorType === filterType;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedMemberData = members.find(m => m.id === selectedMember);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
          <p className="text-gray-600 mt-2">회원 정보 조회 및 관리</p>
        </div>
        <Link
          href="/admin/members/invite"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          회원 초대
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="이름, 이메일, 전화, CI로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">투자자 유형</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="general">일반 투자자</option>
              <option value="qualified">적격 투자자</option>
              <option value="premium">프리미엄 투자자</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="suspended">일시중지</option>
              <option value="withdrawn">탈퇴</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">회원 ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">투자 금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((member) => (
                    <tr 
                      key={member.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedMember === member.id
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedMember(member.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₩{member.investmentTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status === 'active' ? '활성' : '일시중지'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ChevronRight className="text-gray-400" size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 px-6">
                <p className="text-gray-500 text-lg">해당 회원이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedMemberData ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <h3 className="text-xl font-bold">{selectedMemberData.name}</h3>
                <p className="text-blue-100 text-sm mt-1">{selectedMemberData.id}</p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap px-6" aria-label="Tabs">
                  {[
                    { id: 'basic', label: '기본정보' },
                    { id: 'investment', label: '투자' },
                    { id: 'loan', label: '대출' },
                    { id: 'transaction', label: '거래' },
                    { id: 'sms', label: 'SMS' },
                    { id: 'inquiry', label: '문의' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">이메일</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedMemberData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">전화번호</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedMemberData.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">CI</p>
                      <p className="text-sm text-gray-900 mt-1 font-mono">{selectedMemberData.ci}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">투자자 유형</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedMemberData.investorType === 'general' && '일반 투자자'}
                        {selectedMemberData.investorType === 'qualified' && '적격 투자자'}
                        {selectedMemberData.investorType === 'premium' && '프리미엄 투자자'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">가입일</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedMemberData.registrationDate}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <Lock size={16} />
                        계정 일시중지
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'investment' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-blue-600 font-semibold">총 투자 금액</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        ₩{selectedMemberData.investmentTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>활성 투자: 3건</p>
                      <p>총 수익: ₩2,345,000</p>
                      <p>평균 수익률: 4.2%</p>
                    </div>
                  </div>
                )}

                {activeTab === 'loan' && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-purple-600 font-semibold">총 대출 금액</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        ₩{selectedMemberData.loanTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>활성 대출: 0건</p>
                      <p>총 이자: ₩0</p>
                    </div>
                  </div>
                )}

                {activeTab === 'transaction' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-green-600 font-semibold">총 거래건</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{selectedMemberData.transactions}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>마지막 로그인: {selectedMemberData.lastLogin}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'sms' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">총 발송: 23건</p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Mail size={16} />
                      SMS 발송
                    </button>
                  </div>
                )}

                {activeTab === 'inquiry' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">총 문의: 2건</p>
                    <div className="text-sm text-gray-600">
                      <p>답변 대기: 0건</p>
                      <p>완료: 2건</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>회원을 선택하면 상세정보가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 회원</p>
          <p className="text-2xl font-bold text-blue-700">{members.length}명</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">활성 회원</p>
          <p className="text-2xl font-bold text-green-700">{members.filter(m => m.status === 'active').length}명</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">총 투자액</p>
          <p className="text-2xl font-bold text-purple-700">
            ₩{(members.reduce((sum, m) => sum + m.investmentTotal, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">프리미엄 회원</p>
          <p className="text-2xl font-bold text-orange-700">
            {members.filter(m => m.investorType === 'premium').length}명
          </p>
        </div>
      </div>
    </div>
  );
}

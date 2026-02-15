'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Download, FileText } from 'lucide-react';

/**
 * BMEM_3: Withdrawn Members
 * Track terminated member accounts for compliance
 */
export default function WithdrawnMembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');

  // Mock data
  const withdrawnMembers = [
    {
      id: 'WM001',
      name: '박영수',
      email: 'park.young@example.com',
      phone: '010-1234-5678',
      memberType: 'investor',
      withdrawalDate: '2024-01-10',
      reason: 'User request',
      totalInvestment: 50000000,
      totalLoan: 0,
      finalBalance: 0,
      auditStatus: 'completed',
    },
    {
      id: 'WM002',
      name: '최수정',
      email: 'choi.sujeong@example.com',
      phone: '010-5678-1234',
      memberType: 'borrower',
      withdrawalDate: '2024-01-12',
      reason: 'Loan completion',
      totalInvestment: 0,
      totalLoan: 125000000,
      finalBalance: 0,
      auditStatus: 'completed',
    },
    {
      id: 'WM003',
      name: '정문영',
      email: 'jung.moon@example.com',
      phone: '010-9012-3456',
      memberType: 'both',
      withdrawalDate: '2024-01-18',
      reason: 'Account closure',
      totalInvestment: 75000000,
      totalLoan: 45000000,
      finalBalance: 5000000,
      auditStatus: 'pending',
    },
  ];

  const reasons = ['all', 'request', 'completion', 'closure', 'other'];

  const filtered = withdrawnMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    return matchesSearch;
  });

  const handleExportAudit = (id: string) => {
    alert(`${id} 감시 보고서를 다운로드합니다.`);
  };

  const handleViewDetails = (id: string) => {
    alert(`${id} 상세 정보를 조회합니다.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">탈퇴 회원 관리</h1>
        <p className="text-gray-600 mt-2">회원 탈퇴 이력을 관리하고 감시 상태를 추적합니다</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="회원명, 이메일 또는 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">탈퇴 사유</label>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="request">사용자 요청</option>
              <option value="completion">계약 완료</option>
              <option value="closure">계정 폐쇄</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">회원 ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">회원 유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">탈퇴일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">투자 금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">최종 잔액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">감시 상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {member.memberType === 'both' ? '투자자/대출자' : member.memberType === 'investor' ? '투자자' : '대출자'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.withdrawalDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₩{member.totalInvestment.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₩{member.finalBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.auditStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.auditStatus === 'completed' ? '완료' : '진행 중'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(member.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      상세보기
                    </button>
                    <button
                      onClick={() => handleExportAudit(member.id)}
                      className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                    >
                      <Download size={16} />
                      감시 보고서
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500 text-lg">탈퇴 회원이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">총 탈퇴 회원</p>
          <p className="text-2xl font-bold text-gray-900">{withdrawnMembers.length}명</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 투자 금액</p>
          <p className="text-2xl font-bold text-blue-700">
            ₩{withdrawnMembers.reduce((sum, m) => sum + m.totalInvestment, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">총 대출 금액</p>
          <p className="text-2xl font-bold text-purple-700">
            ₩{withdrawnMembers.reduce((sum, m) => sum + m.totalLoan, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">감시 완료</p>
          <p className="text-2xl font-bold text-green-700">
            {withdrawnMembers.filter(m => m.auditStatus === 'completed').length}명
          </p>
        </div>
      </div>
    </div>
  );
}

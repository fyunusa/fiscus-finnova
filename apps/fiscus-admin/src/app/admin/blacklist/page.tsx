'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Trash2, Eye } from 'lucide-react';

/**
 * BMEM_2: Blacklist Management
 * Manage blocked users and blacklist status
 */
export default function BlacklistPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');

  // Mock data
  const blacklistedMembers = [
    {
      id: 'BL001',
      name: '이순신',
      email: 'lee.soon@example.com',
      reason: 'Multiple payment defaults',
      addedBy: 'Admin',
      addedDate: '2024-01-15',
      amount: 45000000,
    },
    {
      id: 'BL002',
      name: '홍길동',
      email: 'hong.gildong@example.com',
      reason: 'Fraud suspicion',
      addedBy: 'Admin',
      addedDate: '2024-01-20',
      amount: 0,
    },
    {
      id: 'BL003',
      name: '김유신',
      email: 'kim.yusin@example.com',
      reason: 'Account abuse',
      addedBy: 'Admin',
      addedDate: '2024-01-25',
      amount: 12000000,
    },
  ];

  const reasons = ['all', 'fraud', 'defaults', 'abuse', 'other'];

  const filtered = blacklistedMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleRemove = (id: string) => {
    if (confirm('정말 블랙리스트에서 제거하시겠습니까?')) {
      alert(`${id} 회원을 블랙리스트에서 제거했습니다.`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">블랙리스트 관리</h1>
        <p className="text-gray-600 mt-2">차단된 회원 목록을 관리합니다</p>
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
                placeholder="회원명 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">차단 사유</label>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="fraud">사기</option>
              <option value="defaults">연체</option>
              <option value="abuse">악용</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">차단 사유</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">추가자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">추가일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                      {member.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.addedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.addedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href="/admin/members"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Eye size={16} />
                      보기
                    </Link>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      제거
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500 text-lg">차단된 회원이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600">총 차단 회원</p>
          <p className="text-2xl font-bold text-red-700">{blacklistedMembers.length}명</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">미상환 금액</p>
          <p className="text-2xl font-bold text-orange-700">
            ₩{blacklistedMembers.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">최근 추가</p>
          <p className="text-2xl font-bold text-blue-700">
            {blacklistedMembers[blacklistedMembers.length - 1]?.addedDate}
          </p>
        </div>
      </div>
    </div>
  );
}

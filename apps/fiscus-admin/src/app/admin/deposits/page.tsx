'use client';

import React, { useState } from 'react';
import { Search, CreditCard } from 'lucide-react';

export default function DepositsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const deposits = [
    {
      id: 'DEP001',
      memberId: 'MEM001',
      memberName: '김준호',
      amount: 10000000,
      method: '계좌이체',
      status: 'completed',
      depositDate: '2024-02-15',
      approvedDate: '2024-02-15',
    },
    {
      id: 'DEP002',
      memberId: 'MEM002',
      memberName: '이순신',
      amount: 5000000,
      method: '카드',
      status: 'pending',
      depositDate: '2024-02-15',
      approvedDate: null,
    },
  ];

  const filtered = deposits.filter(d => {
    const matchesSearch = 
      d.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">입금 관리</h1>
        <p className="text-gray-600 mt-2">회원 입금 내역을 관리합니다</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="회원명 또는 ID로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="completed">완료</option>
              <option value="pending">대기</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">입금ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">회원명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">입금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">입금방법</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">입금일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{deposit.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{deposit.memberName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">₩{(deposit.amount / 1000000).toFixed(0)}백만</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{deposit.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{deposit.depositDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      deposit.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deposit.status === 'completed' ? '완료' : '대기'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">입금 내역이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 입금액</p>
          <p className="text-2xl font-bold text-blue-700">
            ₩{(deposits.reduce((sum, d) => sum + d.amount, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">완료</p>
          <p className="text-2xl font-bold text-green-700">
            {deposits.filter(d => d.status === 'completed').length}건
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600">대기중</p>
          <p className="text-2xl font-bold text-yellow-700">
            {deposits.filter(d => d.status === 'pending').length}건
          </p>
        </div>
      </div>
    </div>
  );
}

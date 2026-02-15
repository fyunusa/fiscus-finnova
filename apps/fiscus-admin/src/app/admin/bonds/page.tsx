'use client';

import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

export default function BondsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const bonds = [
    {
      id: 'BON001',
      productName: '건설감리채권',
      borrowerName: '한국건설회사',
      borrowerType: 'company',
      amount: 300000000,
      repaymentRate: 8.5,
      status: 'active',
      issuanceDate: '2024-01-15',
      repaymentDate: '2025-01-15',
      outstandingBalance: 300000000,
      paidAmount: 0,
    },
    {
      id: 'BON002',
      productName: '무역금융채권',
      borrowerName: '트레이딩파트너즈',
      borrowerType: 'company',
      amount: 150000000,
      repaymentRate: 7.8,
      status: 'repaying',
      issuanceDate: '2024-01-10',
      repaymentDate: '2025-07-10',
      outstandingBalance: 100000000,
      paidAmount: 50000000,
    },
  ];

  const filtered = bonds.filter(b => {
    const matchesSearch = 
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">채권 관리</h1>
        <p className="text-gray-600 mt-2">채권 및 대출 상품을 관리합니다</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="상품명 또는 차입자명으로 검색..."
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
              <option value="active">진행중</option>
              <option value="repaying">상환중</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">차입자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">발행액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이자율</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">미결제</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((bond) => (
                <tr key={bond.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{bond.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bond.borrowerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(bond.amount / 100000000).toFixed(0)}억</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{bond.repaymentRate}%</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(bond.outstandingBalance / 100000000).toFixed(0)}억</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      bond.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {bond.status === 'active' ? '진행중' : '상환중'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">채권 정보가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 발행액</p>
          <p className="text-2xl font-bold text-blue-700">
            ₩{(bonds.reduce((sum, b) => sum + b.amount, 0) / 100000000).toFixed(0)}억
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">총 미결제</p>
          <p className="text-2xl font-bold text-purple-700">
            ₩{(bonds.reduce((sum, b) => sum + b.outstandingBalance, 0) / 100000000).toFixed(0)}억
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">상환액</p>
          <p className="text-2xl font-bold text-orange-700">
            ₩{(bonds.reduce((sum, b) => sum + b.paidAmount, 0) / 100000000).toFixed(0)}억
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

export default function InvestmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const investments = [
    {
      id: 'INV001',
      productName: '강남아파트담보대출',
      investorName: '이순신',
      investorType: 'individual',
      amount: 50000000,
      investmentRate: 6.5,
      status: 'active',
      investmentDate: '2024-01-15',
      expectedReturn: 3250000,
    },
    {
      id: 'INV002',
      productName: '신용카드매출채권',
      investorName: '삼성투자자산',
      investorType: 'company',
      amount: 100000000,
      investmentRate: 7.2,
      status: 'completed',
      investmentDate: '2024-01-10',
      expectedReturn: 8640000,
    },
  ];

  const filtered = investments.filter(inv => {
    const matchesSearch = 
      inv.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.investorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">투자 관리</h1>
        <p className="text-gray-600 mt-2">투자자 투자 현황을 관리합니다</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="상품명 또는 투자자명으로 검색..."
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
              <option value="completed">완료</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">투자자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">투자액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이자율</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">예상 수익</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.investorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(inv.amount / 100000000).toFixed(0)}억</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{inv.investmentRate}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      inv.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {inv.status === 'active' ? '진행중' : '완료'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(inv.expectedReturn / 1000000).toFixed(0)}백만</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">투자 내역이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 투자액</p>
          <p className="text-2xl font-bold text-blue-700">
            ₩{(investments.reduce((sum, inv) => sum + inv.amount, 0) / 100000000).toFixed(0)}억
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">투자 건수</p>
          <p className="text-2xl font-bold text-purple-700">{investments.length}건</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">총 예상 수익</p>
          <p className="text-2xl font-bold text-orange-700">
            ₩{(investments.reduce((sum, inv) => sum + inv.expectedReturn, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
      </div>
    </div>
  );
}

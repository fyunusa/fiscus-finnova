'use client';

import React, { useState } from 'react';
import { Search, DollarSign } from 'lucide-react';

export default function DistributionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const distributions = [
    {
      id: 'DIST001',
      productName: '강남아파트담보대출',
      distributionDate: '2024-02-15',
      totalAmount: 5000000,
      principalAmount: 3000000,
      interestAmount: 2000000,
      investorCount: 156,
      status: 'distributed',
      distributionType: 'monthly',
    },
    {
      id: 'DIST002',
      productName: '신용카드매출채권',
      distributionDate: '2024-02-20',
      totalAmount: 8000000,
      principalAmount: 5000000,
      interestAmount: 3000000,
      investorCount: 89,
      status: 'distributed',
      distributionType: 'final',
    },
  ];

  const filtered = distributions.filter(d => {
    const matchesSearch = d.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">수익 배분 관리</h1>
        <p className="text-gray-600 mt-2">투자자에 대한 이자 및 원금 배분을 관리합니다</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="상품명으로 검색..."
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
              <option value="distributed">배분완료</option>
              <option value="pending">대기중</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">배분일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">원금</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">합계</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">투자자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((dist) => (
                <tr key={dist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dist.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dist.distributionDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(dist.principalAmount / 1000000).toFixed(0)}백만</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(dist.interestAmount / 1000000).toFixed(0)}백만</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">₩{(dist.totalAmount / 1000000).toFixed(0)}백만</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{dist.investorCount}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">배분 내역이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 배분액</p>
          <p className="text-2xl font-bold text-blue-700">
            ₩{(distributions.reduce((sum, d) => sum + d.totalAmount, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">총 원금</p>
          <p className="text-2xl font-bold text-purple-700">
            ₩{(distributions.reduce((sum, d) => sum + d.principalAmount, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">총 이자</p>
          <p className="text-2xl font-bold text-orange-700">
            ₩{(distributions.reduce((sum, d) => sum + d.interestAmount, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
      </div>
    </div>
  );
}

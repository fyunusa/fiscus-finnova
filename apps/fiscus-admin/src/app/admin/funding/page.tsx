'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, Users } from 'lucide-react';

/**
 * BFUN_1: Funding Products Management
 * Manage investment funding products
 */
export default function FundingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const fundingProducts = [
    {
      id: 'FP001',
      title: '강남아파트담보대출',
      status: 'funding_open',
      goalAmount: 250000000,
      fundedAmount: 187500000,
      investors: 156,
      interestRate: 6.5,
      duration: 24,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
    },
    {
      id: 'FP002',
      title: '신용카드매출채권',
      status: 'completed',
      goalAmount: 100000000,
      fundedAmount: 100000000,
      investors: 89,
      interestRate: 7.2,
      duration: 12,
      startDate: '2024-01-10',
      endDate: '2024-01-25',
    },
    {
      id: 'FP003',
      title: '소상공인비즈니스론',
      status: 'scheduled',
      goalAmount: 150000000,
      fundedAmount: 0,
      investors: 0,
      interestRate: 8.0,
      duration: 36,
      startDate: '2024-02-01',
      endDate: '2024-03-01',
    },
  ];

  const filtered = fundingProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">펀딩 상품 관리</h1>
        <p className="text-gray-600 mt-2">투자 상품의 펀딩 상태를 관리합니다</p>
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
              <option value="scheduled">예정</option>
              <option value="funding_open">펀딩중</option>
              <option value="completed">완료</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">목표액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">펀딩액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">진행률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">투자자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((product) => {
                const progress = (product.fundedAmount / product.goalAmount) * 100;
                return (
                  <tr 
                    key={product.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'funding_open' ? 'bg-blue-100 text-blue-800' :
                        product.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status === 'funding_open' ? '펀딩중' :
                         product.status === 'completed' ? '완료' : '예정'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">₩{(product.goalAmount / 100000000).toFixed(1)}억</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₩{(product.fundedAmount / 100000000).toFixed(1)}억</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{progress.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.investors}명</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500 text-lg">펀딩 상품이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 상품</p>
          <p className="text-2xl font-bold text-blue-700">{fundingProducts.length}건</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600">펀딩중</p>
          <p className="text-2xl font-bold text-yellow-700">
            {fundingProducts.filter(p => p.status === 'funding_open').length}건
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">펀딩완료</p>
          <p className="text-2xl font-bold text-green-700">
            {fundingProducts.filter(p => p.status === 'completed').length}건
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">총 투자자</p>
          <p className="text-2xl font-bold text-purple-700">
            {fundingProducts.reduce((sum, p) => sum + p.investors, 0)}명
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Search, Building2 } from 'lucide-react';

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const businesses = [
    {
      id: 'BIZ001',
      name: 'ABC건설',
      businessNum: '123-45-67890',
      ceoName: '김철수',
      industry: '건설',
      status: 'active',
      registeredDate: '2024-01-10',
      totalLoans: 500000000,
      activeLoans: 250000000,
    },
    {
      id: 'BIZ002',
      name: 'XYZ물류',
      businessNum: '234-56-78901',
      ceoName: '이영희',
      industry: '물류',
      status: 'active',
      registeredDate: '2024-01-15',
      totalLoans: 300000000,
      activeLoans: 150000000,
    },
  ];

  const filtered = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">사업자 관리</h1>
        <p className="text-gray-600 mt-2">등록된 사업자 정보를 관리합니다</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="사업자명으로 검색..."
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
              <option value="active">활성</option>
              <option value="inactive">휴면</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">사업자명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">사업자번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">대표명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">업종</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">활성대출</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{business.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{business.businessNum}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{business.ceoName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{business.industry}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">활성</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(business.activeLoans / 100000000).toFixed(0)}억</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">등록된 사업자가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 사업자</p>
          <p className="text-2xl font-bold text-blue-700">{businesses.length}개</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">총 대출액</p>
          <p className="text-2xl font-bold text-purple-700">
            ₩{(businesses.reduce((sum, b) => sum + b.totalLoans, 0) / 100000000).toFixed(0)}억
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">활성 대출액</p>
          <p className="text-2xl font-bold text-orange-700">
            ₩{(businesses.reduce((sum, b) => sum + b.activeLoans, 0) / 100000000).toFixed(0)}억
          </p>
        </div>
      </div>
    </div>
  );
}

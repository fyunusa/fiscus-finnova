'use client';

import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';

export default function TaxPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const taxRecords = [
    {
      id: 'TAX001',
      memberId: 'MEM001',
      memberName: '김준호',
      income: 50000000,
      withholding: 5000000,
      year: 2024,
      status: 'issued',
      issuedDate: '2024-01-31',
    },
    {
      id: 'TAX002',
      memberId: 'MEM002',
      memberName: '이순신',
      income: 30000000,
      withholding: 3000000,
      year: 2024,
      status: 'pending',
      issuedDate: null,
    },
  ];

  const filtered = taxRecords.filter(t => {
    const matchesSearch = 
      t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">세무 관리</h1>
        <p className="text-gray-600 mt-2">회원 세무 정보 및 원천징수를 관리합니다</p>
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
              <option value="issued">발급완료</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">세무ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">회원명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">과세소득</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">원천징수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">연도</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.memberName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₩{(record.income / 1000000).toFixed(0)}백만</td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600">₩{(record.withholding / 1000000).toFixed(0)}백만</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.year}년</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      record.status === 'issued' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status === 'issued' ? '발급완료' : '대기'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">세무 기록이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 과세소득</p>
          <p className="text-2xl font-bold text-blue-700">
            ₩{(taxRecords.reduce((sum, t) => sum + t.income, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600">총 원천징수</p>
          <p className="text-2xl font-bold text-red-700">
            ₩{(taxRecords.reduce((sum, t) => sum + t.withholding, 0) / 1000000).toFixed(0)}백만
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">발급완료</p>
          <p className="text-2xl font-bold text-green-700">
            {taxRecords.filter(t => t.status === 'issued').length}건
          </p>
        </div>
      </div>
    </div>
  );
}
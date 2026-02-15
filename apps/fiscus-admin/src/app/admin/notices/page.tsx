'use client';

import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';

export default function NoticesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const notices = [
    {
      id: 'NOT001',
      title: '2024년 상반기 플랫폼 정기점검 안내',
      content: '플랫폼 시스템 업그레이드를 위해 정기점검을 실시합니다.',
      noticeType: 'maintenance',
      status: 'active',
      createdDate: '2024-02-10',
      startDate: '2024-02-20',
      endDate: '2024-02-28',
      author: '관리자',
    },
    {
      id: 'NOT002',
      title: '새로운 펀딩 상품 안내',
      content: '신규 펀딩 상품이 출시되었습니다.',
      noticeType: 'product',
      status: 'active',
      createdDate: '2024-02-14',
      startDate: '2024-02-14',
      endDate: null,
      author: '관리자',
    },
  ];

  const filtered = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
        <p className="text-gray-600 mt-2">플랫폼 공지사항을 관리합니다</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="공지사항명으로 검색..."
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
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">등록자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">등록일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{notice.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {notice.noticeType === 'maintenance' ? '정기점검' : '신상품'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{notice.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{notice.createdDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      notice.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notice.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">공지사항이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 공지사항</p>
          <p className="text-2xl font-bold text-blue-700">{notices.length}건</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">활성</p>
          <p className="text-2xl font-bold text-green-700">
            {notices.filter(n => n.status === 'active').length}건
          </p>
        </div>
      </div>
    </div>
  );
}
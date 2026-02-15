'use client';

import React, { useState } from 'react';
import { Search, ChevronRight, FileText, Trash2 } from 'lucide-react';

/**
 * BBUS_1: Loan Applications Management
 * Manage loan applications through various states (application → approval → funding → repayment)
 */
export default function LoanApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  const loanStatuses = {
    'draft': '작성중',
    'submitted': '제출됨',
    'under_review': '심사중',
    'approved': '승인됨',
    'rejected': '거절됨',
    'pending_funding': '펀딩 대기',
    'funded': '펀딩됨',
    'repaying': '상환중',
    'completed': '완료됨',
    'default': '연체됨',
  };

  // Mock data
  const loanApplications = [
    {
      id: 'LOAN001',
      borrowerName: '김기철',
      borrowerId: 'M001',
      loanAmount: 50000000,
      loanType: '신용대출',
      status: 'under_review',
      interestRate: 8.5,
      term: 24,
      submittedDate: '2024-01-15',
      approvalDate: null,
      fundingDate: null,
      creditScore: 750,
      debt: 10000000,
      income: 60000000,
      purpose: '사업자금',
    },
    {
      id: 'LOAN002',
      borrowerName: '박준호',
      borrowerId: 'M002',
      loanAmount: 120000000,
      loanType: '담보대출',
      status: 'funded',
      interestRate: 6.8,
      term: 36,
      submittedDate: '2024-01-08',
      approvalDate: '2024-01-12',
      fundingDate: '2024-01-20',
      creditScore: 820,
      debt: 0,
      income: 150000000,
      purpose: '주택구입',
    },
    {
      id: 'LOAN003',
      borrowerName: '이순신',
      borrowerId: 'M003',
      loanAmount: 30000000,
      loanType: '사업자대출',
      status: 'approved',
      interestRate: 9.5,
      term: 12,
      submittedDate: '2024-01-10',
      approvalDate: '2024-01-18',
      fundingDate: null,
      creditScore: 680,
      debt: 25000000,
      income: 40000000,
      purpose: '운영자금',
    },
    {
      id: 'LOAN004',
      borrowerName: '정수진',
      borrowerId: 'M004',
      loanAmount: 200000000,
      loanType: '신용대출',
      status: 'rejected',
      interestRate: 0,
      term: 24,
      submittedDate: '2024-01-05',
      approvalDate: null,
      fundingDate: null,
      creditScore: 550,
      debt: 80000000,
      income: 50000000,
      purpose: '투자',
    },
  ];

  const filtered = loanApplications.filter(loan => {
    const matchesSearch = 
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const selectedLoanData = loanApplications.find(l => l.id === selectedLoan);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending_funding': 'bg-yellow-100 text-yellow-800',
      'funded': 'bg-green-100 text-green-800',
      'repaying': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'default': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대출 신청 관리</h1>
        <p className="text-gray-600 mt-2">대출 신청 및 심사 상태를 관리합니다</p>
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
                placeholder="차용자명, 대출ID, 대출종류로 검색..."
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
              {Object.entries(loanStatuses).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loans Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">대출ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">차용자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">금리</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((loan) => (
                    <tr 
                      key={loan.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedLoan === loan.id
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLoan(loan.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.borrowerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₩{(loan.loanAmount / 100000000).toFixed(1)}억
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.interestRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                          {loanStatuses[loan.status as keyof typeof loanStatuses]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ChevronRight className="text-gray-400" size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 px-6">
                <p className="text-gray-500 text-lg">해당 대출이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedLoanData ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
                <h3 className="text-xl font-bold">{selectedLoanData.id}</h3>
                <p className="text-purple-100 text-sm mt-1">{selectedLoanData.borrowerName}</p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex px-6" aria-label="Tabs">
                  {[
                    { id: 'details', label: '기본정보' },
                    { id: 'review', label: '심사' },
                    { id: 'funding', label: '펀딩' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">대출금액</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        ₩{selectedLoanData.loanAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">대출종류</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.loanType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">금리</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">기간</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.term}개월</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">용도</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.purpose}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">신청일</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.submittedDate}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-blue-600 font-semibold">신용점수</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{selectedLoanData.creditScore}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">월소득</p>
                      <p className="text-sm text-gray-900 mt-1">₩{selectedLoanData.income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">보유 부채</p>
                      <p className="text-sm text-gray-900 mt-1">₩{selectedLoanData.debt.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">부채 비율</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {((selectedLoanData.debt / selectedLoanData.income) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'funding' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">승인일</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.approvalDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">펀딩일</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLoanData.fundingDate || '대기 중'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">상태</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedLoanData.status)} mt-1 inline-block`}>
                        {loanStatuses[selectedLoanData.status as keyof typeof loanStatuses]}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                  문서 보기
                </button>
                <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium">
                  상태 변경
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>대출을 선택하면 상세정보가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">총 대출</p>
          <p className="text-2xl font-bold text-blue-700">{loanApplications.length}건</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">심사중</p>
          <p className="text-2xl font-bold text-purple-700">
            {loanApplications.filter(l => l.status === 'under_review').length}건
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">승인됨</p>
          <p className="text-2xl font-bold text-green-700">
            {loanApplications.filter(l => l.status === 'approved' || l.status === 'funded').length}건
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">펀딩됨</p>
          <p className="text-2xl font-bold text-orange-700">
            {loanApplications.filter(l => l.status === 'funded').length}건
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600">거절됨</p>
          <p className="text-2xl font-bold text-red-700">
            {loanApplications.filter(l => l.status === 'rejected').length}건
          </p>
        </div>
      </div>
    </div>
  );
}

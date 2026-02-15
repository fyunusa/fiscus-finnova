'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { Check, Clock, Phone, MessageSquare } from 'lucide-react';

interface Application {
  id: string;
  applicationNo: string;
  applicantName: string;
  loanAmount: number;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  progress: number;
  steps: {
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    date?: string;
  }[];
}

const mockApplications: Application[] = [
  {
    id: '1',
    applicationNo: 'APP-2024-001',
    applicantName: '김철수',
    loanAmount: 100000000,
    appliedDate: '2024-02-10',
    status: 'approved',
    progress: 100,
    steps: [
      { name: '신청 접수', status: 'completed', date: '2024-02-10' },
      { name: '서류 검토', status: 'completed', date: '2024-02-12' },
      { name: '신용 심사', status: 'completed', date: '2024-02-14' },
      { name: '최종 승인', status: 'completed', date: '2024-02-15' },
    ],
  },
  {
    id: '2',
    applicationNo: 'APP-2024-002',
    applicantName: '이영희',
    loanAmount: 50000000,
    appliedDate: '2024-02-16',
    status: 'reviewing',
    progress: 60,
    steps: [
      { name: '신청 접수', status: 'completed', date: '2024-02-16' },
      { name: '서류 검토', status: 'in-progress', date: '' },
      { name: '신용 심사', status: 'pending' },
      { name: '최종 승인', status: 'pending' },
    ],
  },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return '승인 완료';
    case 'reviewing':
      return '심사 중';
    case 'rejected':
      return '거절';
    default:
      return '대기 중';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'reviewing':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function StatusPage() {
  const [selectedApp, setSelectedApp] = useState<Application>(mockApplications[0]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">대출 신청 현황</h1>
            <p className="text-blue-100 text-lg">
              대출 신청 상태를 확인하세요
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Application List */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-md p-4">
                <h3 className="font-bold text-gray-900 mb-4">신청 목록</h3>
                <div className="space-y-3">
                  {mockApplications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedApp.id === app.id
                          ? 'bg-blue-100 border-l-4 border-blue-600'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <p className="text-xs text-gray-500 mb-1">{app.applicationNo}</p>
                      <p className="font-semibold text-sm text-gray-900">{app.applicantName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {(app.loanAmount / 10000).toLocaleString()}만원
                      </p>
                      <Badge className={`inline-block mt-2 text-xs px-2 py-1 ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Content - Application Details */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Application Info Card */}
                <Card className="bg-white shadow-md p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">신청번호</p>
                      <p className="font-bold text-lg text-gray-900">
                        {selectedApp.applicationNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">신청인</p>
                      <p className="font-bold text-lg text-gray-900">
                        {selectedApp.applicantName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">신청 금액</p>
                      <p className="font-bold text-lg text-gray-900">
                        {(selectedApp.loanAmount / 10000).toLocaleString()}만원
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">상태</p>
                      <Badge className={`inline-block px-3 py-1 text-sm font-semibold ${getStatusColor(selectedApp.status)}`}>
                        {getStatusLabel(selectedApp.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">전체 진행률</p>
                      <p className="text-sm font-bold text-blue-600">{selectedApp.progress}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                        style={{ width: `${selectedApp.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-8">
                    <p className="text-lg font-bold text-gray-900 mb-8">신청 진행 과정</p>
                    <div className="relative">
                      {selectedApp.steps.map((step, index) => (
                        <div key={index} className="mb-8 flex gap-6">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-colors ${
                                step.status === 'completed'
                                  ? 'bg-green-600'
                                  : step.status === 'in-progress'
                                  ? 'bg-blue-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              {step.status === 'completed' ? (
                                <Check size={24} />
                              ) : step.status === 'in-progress' ? (
                                <Clock size={24} className="animate-spin" />
                              ) : (
                                <Clock size={24} />
                              )}
                            </div>
                            {index < selectedApp.steps.length - 1 && (
                              <div className="w-1 h-12 bg-gray-300 mt-2" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="pt-2 pb-8 flex-1">
                            <p className="font-bold text-gray-900 text-lg">{step.name}</p>
                            {step.date && (
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(step.date).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            )}
                            {step.status === 'in-progress' && (
                              <p className="text-sm text-blue-600 font-semibold mt-1">
                                진행 중입니다
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white shadow-md p-6">
                    <MessageSquare className="text-blue-600 mb-4" size={28} />
                    <h4 className="font-bold text-gray-900 mb-2">상담 신청</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      궁금한 점이 있으신가요?
                    </p>
                    <Link href="/loan/consultation">
                      <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 rounded-lg">
                        상담 신청하기
                      </Button>
                    </Link>
                  </Card>

                  <Card className="bg-white shadow-md p-6">
                    <Phone className="text-green-600 mb-4" size={28} />
                    <h4 className="font-bold text-gray-900 mb-2">고객 지원</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      전화로 문의하세요
                    </p>
                    <Button className="w-full bg-green-100 hover:bg-green-200 text-green-600 font-semibold py-2 rounded-lg">
                      1577-XXXX (평일 9AM-6PM)
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { ArrowLeft, FileText, DollarSign, Calendar, MapPin, CheckCircle, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { loanService, LoanApplication } from '@/services/loanService';
import { paymentService } from '@/services/paymentService';
import { formatCurrencyShort } from '@/lib/formatCurrency';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loanAccount, setLoanAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loanService.getApplication(params.id);
        setApplication(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : '신청 정보를 불러올 수 없습니다.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [params.id]);

  // Load loan account details if application has a loan account
  useEffect(() => {
    if (application?.loanAccountId && (application.status === 'active' || application.status === 'approved')) {
      setIsLoadingAccount(true);
      paymentService
        .getLoanAccount(application.loanAccountId)
        .then((account) => {
          setLoanAccount(account);
        })
        .catch((error) => {
          console.error('Failed to fetch loan account:', error);
        })
        .finally(() => {
          setIsLoadingAccount(false);
        });
    }
  }, [application?.loanAccountId, application?.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', label: '활성' };
      case 'approved':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', label: '승인' };
      case 'pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', label: '대기중' };
      case 'submitted':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', label: '제출됨' };
      case 'rejected':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', label: '거절' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', label: status };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">신청 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !application) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/loan/my-loans">
              <Button className="mb-6 flex items-center gap-2 bg-gray-200 text-gray-900 hover:bg-gray-300">
                <ArrowLeft size={20} />
                돌아가기
              </Button>
            </Link>

            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">오류</h2>
              <p className="text-gray-600 mb-8">{error || '신청 정보를 찾을 수 없습니다.'}</p>
              <Link href="/loan/my-loans">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg">
                  내 대출로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statusColor = getStatusColor(application.status);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/loan/my-loans" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4">
              <ArrowLeft size={20} />
              <span>내 대출로 돌아가기</span>
            </Link>
            <h1 className="text-4xl font-bold mb-2">신청 상세 정보</h1>
            <p className="text-blue-200">신청번호: {application.applicationNo}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Status Card */}
            <div className={`${statusColor.bg} border-2 ${statusColor.border} rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">현황 상태</p>
                  <p className={`text-2xl font-bold ${statusColor.text}`}>{statusColor.label}</p>
                </div>
                <CheckCircle className={`w-12 h-12 ${statusColor.text}`} />
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Amount */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">신청 금액</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrencyShort(application.requestedLoanAmount)}
                </p>
              </div>

              {/* Loan Period */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900">대출 기간</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {application.approvedLoanPeriod ? `${application.approvedLoanPeriod}개월` : '심사 중'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {application.status === 'pending' && '승인 대기 중'}
                  {application.status === 'submitted' && '심사 중'}
                  {application.status === 'approved' && '승인됨'}
                  {application.status === 'active' && '활성'}
                  {application.status === 'rejected' && '거절됨'}
                </p>
              </div>

              {/* Collateral Type */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">담보 유형</h3>
                <p className="text-lg font-semibold text-gray-900 mb-2">{application.collateralType}</p>
                <p className="text-xs text-gray-500">담보 평가액: {formatCurrencyShort(application.collateralValue)}</p>
              </div>

              {/* Application Dates */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">신청 날짜</h3>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {new Date(application.createdAt).toLocaleDateString('ko-KR')}
                </p>
                <p className="text-xs text-gray-500">
                  수정일: {new Date(application.updatedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            {/* Loan Account Details - Show when active/approved and loaded */}
            {loanAccount && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상환 현황</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Amount Paid */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="w-6 h-6 text-purple-600" />
                      <h3 className="text-sm font-semibold text-gray-900">납부액</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrencyShort(loanAccount.totalPaid)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">누적 상환액</p>
                  </div>

                  {/* Remaining Principal Balance */}
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                      <h3 className="text-sm font-semibold text-gray-900">잔액</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrencyShort(loanAccount.principalBalance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">남은 원금</p>
                  </div>

                  {/* Total Outstanding (Principal + Interest) */}
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-6 h-6 text-red-600" />
                      <h3 className="text-sm font-semibold text-gray-900">총 미지급액</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrencyShort(Number(loanAccount.principalBalance) + Number(loanAccount.totalInterestAccrued))}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">이자 포함</p>
                  </div>
                </div>
              </div>
            )}

            {isLoadingAccount && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <p className="text-gray-600">상환 정보 로드 중...</p>
              </div>
            )}

            {/* Collateral Address */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-semibold text-gray-900">담보 주소</h3>
              </div>
              <p className="text-gray-700 ml-9 mb-4">{application.collateralAddress}</p>

              {application.collateralDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 ml-9">
                  <p className="text-sm text-blue-900 font-semibold mb-1">담보 상세 정보</p>
                  <p className="text-sm text-blue-800">{application.collateralDetails}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-8 flex gap-3">
              <Link href="/loan/my-loans" className="flex-1">
                <Button className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300 py-3 rounded-lg font-semibold">
                  돌아가기
                </Button>
              </Link>
              {application.status === 'pending' && (
                <Link href={`/loan/application/${application.id}/edit`} className="flex-1">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-lg font-semibold">
                    수정하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

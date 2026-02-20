'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, Alert } from '@/components/ui';
import { DollarSign, TrendingUp, Loader, Wallet, Bell, X } from 'lucide-react';
import { formatCurrencyShort } from '@/lib/formatCurrency';
import { paymentService } from '@/services/paymentService';

interface LoanCardItemProps {
  item: any;
  getStatusColor: (status: string) => any;
  onOpenPaymentModal: (loanAccountId: string) => void;
}

interface PendingPayment {
  loanAccountId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
}

function LoanCardItemContent({ item, getStatusColor, onOpenPaymentModal }: LoanCardItemProps) {
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [checkingError, setCheckingError] = useState('');
  const [checkingSuccess, setCheckingSuccess] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [loanAccount, setLoanAccount] = useState<any>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  // Load pending payment on mount
  useEffect(() => {
    const pendingPaymentJson = sessionStorage.getItem('pendingPayment');
    if (pendingPaymentJson) {
      try {
        const payment: PendingPayment = JSON.parse(pendingPaymentJson);
        if (payment.loanAccountId === item.loanAccountId) {
          setPendingPayment(payment);
        }
      } catch (error) {
        console.error('Failed to parse pending payment:', error);
      }
    }
  }, [item.loanAccountId]);

  // Load loan account details
  useEffect(() => {
    if (item.loanAccountId && (item.status === 'active' || item.status === 'approved')) {
      setIsLoadingAccount(true);
      paymentService
        .getLoanAccount(item.loanAccountId)
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
  }, [item.loanAccountId, item.status]);

  const handleCheckPaymentStatus = async () => {
    if (!pendingPayment) return;

    setIsCheckingStatus(true);
    setCheckingError('');
    setCheckingSuccess('');

    try {
      const response = await paymentService.checkRepaymentStatus(
        pendingPayment.loanAccountId,
        pendingPayment.paymentKey,
        pendingPayment.orderId,
        pendingPayment.amount
      );

      if (!response.success) {
        setCheckingError(response.message || 'Failed to check payment status');
        return;
      }

      const data = response.data;

      if (data.isProcessed) {
        // Payment successful
        setCheckingSuccess('✅ 결제가 완료되었습니다!');
        sessionStorage.removeItem('pendingPayment');
        setPendingPayment(null);
        
        // Redirect to my-loans after 2 seconds
        setTimeout(() => {
          window.location.href = '/loan/my-loans';
        }, 2000);
      } else {
        // Payment still pending
        setCheckingError(`결제 상태: ${data.status}. 잠시 후 다시 확인해주세요.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check payment status';
      setCheckingError(message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const statusInfo = getStatusColor(item.status);

  return (
    <div
      className={`${statusInfo.bg} border-2 ${statusInfo.border} rounded-xl p-6 hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs text-gray-600 font-semibold mb-1">신청번호</p>
          <p className="text-lg font-bold text-gray-900">{item.applicationNo}</p>
        </div>
        <div className="flex items-center gap-2 relative">
          {pendingPayment && (
            <>
              <button
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="relative inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-yellow-100 transition-colors flex-shrink-0"
                title="결제 상태 확인"
              >
                <Bell
                  size={20}
                  className="text-yellow-600 animate-bounce"
                />
                <span className="absolute w-2 h-2 bg-yellow-600 rounded-full top-1 right-1"></span>
              </button>

              {/* Mini Notification Popup */}
              {showNotificationPopup && (
                <div className="absolute right-0 top-10 bg-white border border-yellow-300 rounded-lg shadow-lg p-4 w-80 z-50">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-yellow-900">결제 처리 중</p>
                    <button
                      onClick={() => setShowNotificationPopup(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Payment Status Messages */}
                  {checkingSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 text-sm">{checkingSuccess}</p>
                    </div>
                  )}
                  {checkingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 text-sm">{checkingError}</p>
                    </div>
                  )}

                  {!checkingSuccess && !checkingError && (
                    <p className="text-yellow-800 text-sm mb-4">
                      결제가 진행 중입니다. 아래의 버튼을 클릭하여 상태를 확인해주세요.
                    </p>
                  )}

                  {!checkingSuccess && (
                    <Button
                      onClick={() => {
                        handleCheckPaymentStatus();
                      }}
                      disabled={isCheckingStatus}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {isCheckingStatus ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          확인 중...
                        </>
                      ) : (
                        '결제 상태 확인'
                      )}
                    </Button>
                  )}

                  {checkingSuccess && (
                    <Button
                      onClick={() => {
                        setShowNotificationPopup(false);
                        window.location.href = '/loan/my-loans';
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      계속
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          <Badge className={`${statusInfo.badge} px-3 py-1 text-xs font-semibold`}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 border-opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">신청금액</p>
            <p className="font-bold text-gray-900">
              {formatCurrencyShort(item.requestedLoanAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">신청일</p>
            <p className="font-bold text-gray-900">
              {new Date(item.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>

        {/* Loan Account Info - Show for all loans */}
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">납부액 (상환액)</p>
              <p className="font-bold text-gray-900">
                {loanAccount ? formatCurrencyShort(loanAccount.totalPaid) : '₩0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">잔액 (남은금액)</p>
              <p className="font-bold text-gray-900">
                {loanAccount ? formatCurrencyShort(loanAccount.principalBalance) : '₩0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">총 미지급액 (이자 포함)</p>
              <p className="font-bold text-gray-900">
                {loanAccount ? formatCurrencyShort(Number(loanAccount.principalBalance) + Number(loanAccount.totalInterestAccrued)) : '₩0'}
              </p>
            </div>
          </div>
        </>

        {/* Loading indicator when fetching active loan account */}
        {isLoadingAccount && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader size={20} className="text-gray-400 animate-spin" />
            </div>
            <div>
              <p className="text-xs text-gray-600">대출 정보 로드 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pending Payment Status - Hidden, messages shown in popup */}
      {pendingPayment && (
        <div className="hidden">
          {/* Status messages now displayed in popup */}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Link href={`/loan/application/${item.id}`} className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
            상세보기
          </Button>
        </Link>
        {(item.status === 'active' || item.status === 'approved') && item.loanAccountId && !pendingPayment && (
          <Button
            onClick={() => onOpenPaymentModal(item.loanAccountId!)}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg"
          >
            결제하기
          </Button>
        )}
        {(item.status === 'active' || item.status === 'approved') && !item.loanAccountId && !pendingPayment && (
          <Button
            disabled
            className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-lg cursor-not-allowed"
            title="대출 실행 준비 중입니다"
          >
            결제 준비중
          </Button>
        )}
        {item.status === 'pending' && !pendingPayment && (
          <Link href={`/loan/application/${item.id}/edit`} className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
              수정
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function LoanCardItem(props: LoanCardItemProps) {
  return (
    <Suspense fallback={<div className="bg-gray-100 rounded-xl p-6 animate-pulse h-80" />}>
      <LoanCardItemContent {...props} />
    </Suspense>
  );
}

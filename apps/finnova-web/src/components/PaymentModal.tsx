'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { paymentService, LoanAccount } from '@/services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  loanAccountId: string;
  onClose: () => void;
  onPaymentSuccess?: (transactionId: string) => void;
}

export function PaymentModal({
  isOpen,
  loanAccountId,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success' | 'error'>(
    'amount'
  );
  const [loanAccount, setLoanAccount] = useState<LoanAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const loadLoanAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const account = await paymentService.getLoanAccount(loanAccountId);
      setLoanAccount(account);
      setPaymentAmount(account.nextPaymentAmount.toString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load loan account';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loanAccountId]);

  // Load loan account on modal open
  useEffect(() => {
    if (isOpen) {
      loadLoanAccount();
    }
  }, [isOpen, loadLoanAccount]);

  const handlePaymentClick = () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('유효한 결제 금액을 입력해주세요');
      return;
    }

    if (loanAccount && amount > (Number(loanAccount.principalBalance) + Number(loanAccount.totalInterestAccrued))) {
      setError('설정된 금액이 총 미지급액(이자포함)을 초과합니다');
      return;
    }

    setError(null);
    setStep('confirm');
  };

  const handleConfirmPayment = async () => {
    try {
      setStep('processing');
      setError(null);

      // Step 1: Initiate payment with Toss to get real paymentKey and orderId
      const amount = parseFloat(paymentAmount);
      const initiateResponse = await paymentService.initiateRepayment(loanAccountId, amount);

      if (!initiateResponse.success) {
        setError('Failed to initiate payment with Toss Payments');
        setStep('error');
        return;
      }

      const { paymentKey, orderId, checkoutUrl } = initiateResponse.data;

      // Step 2: Store payment details in sessionStorage for later polling
      // This ensures we can check payment status when user returns from Toss checkout
      sessionStorage.setItem(
        'pendingPayment',
        JSON.stringify({
          loanAccountId,
          paymentKey,
          orderId,
          amount,
          initiatedAt: new Date().toISOString(),
        })
      );

      // Step 3: Redirect user to Toss checkout page
      // Customer will complete payment there (virtual account or other method)
      // When payment completes, Toss will redirect back to /loan/my-loans with query params
      // The my-loans page will detect the redirect and poll for payment completion
      window.location.href = checkoutUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setError(message);
      setStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">대출금 납부</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : step === 'amount' ? (
            <div className="space-y-6">
              {/* Loan Info */}
              {loanAccount && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">남은 원금</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₩{Number(loanAccount.principalBalance).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">총 미지급액 (이자포함)</p>
                      <p className="text-lg font-bold text-red-600">
                        ₩{(Number(loanAccount.principalBalance) + Number(loanAccount.totalInterestAccrued)).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">다음 납부액</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₩{Number(loanAccount.nextPaymentAmount).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">다음 납부일</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(loanAccount.nextPaymentDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">월 이자</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {Number(loanAccount.annualInterestRate)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  납부 금액 (원)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="납부 금액을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  * 다음 납부액보다 크거나 같아야 합니다
                </p>
              </div>

              {/* Quick Buttons */}
              {loanAccount && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentAmount(loanAccount.nextPaymentAmount.toString())}
                    className="px-3 py-2 bg-gray-100 text-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    다음 납부액 (₩{(loanAccount.nextPaymentAmount / 1000000).toFixed(1)}M)
                  </button>
                  <button
                    onClick={() => setPaymentAmount((Number(loanAccount.principalBalance) + Number(loanAccount.totalInterestAccrued)).toString())}
                    className="px-3 py-2 bg-gray-100 text-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    전액 납부
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePaymentClick}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          ) : step === 'confirm' ? (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-semibold">
                  다음 금액으로 결제를 진행하시겠습니까?
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">결제 금액</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₩{parseFloat(paymentAmount).toLocaleString('ko-KR')}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-semibold mb-1">💳 결제 방법</p>
                <p>가상계좌 입금 (자동 확인)</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('amount')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  결제하기
                </button>
              </div>
            </div>
          ) : step === 'processing' ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 font-semibold">결제 처리 중...</p>
              <p className="text-xs text-gray-500 text-center">
                잠시만 기다려주세요. 결제가 처리되는 중입니다.
              </p>
            </div>
          ) : step === 'success' ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 mb-1">결제 완료!</p>
                <p className="text-sm text-gray-600 mb-4">
                  ₩{parseFloat(paymentAmount).toLocaleString('ko-KR')} 결제되었습니다.
                </p>
                {successData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-left space-y-2">
                    <p className="text-xs">
                      <span className="text-gray-600">남은 원금:</span>
                      <span className="font-bold text-gray-900 float-right">
                        ₩{successData.newBalance.toLocaleString('ko-KR')}
                      </span>
                    </p>
                    <p className="text-xs">
                      <span className="text-gray-600">다음 납부액:</span>
                      <span className="font-bold text-gray-900 float-right">
                        ₩{successData.nextPaymentAmount.toLocaleString('ko-KR')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 mb-1">결제 실패</p>
                <p className="text-sm text-red-600 mb-4">{error}</p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setStep('amount')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  종료
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

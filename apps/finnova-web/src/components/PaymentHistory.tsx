'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import type { RepaymentTransaction } from '@/services/paymentService';
import { paymentService } from '@/services/paymentService';

interface PaymentHistoryProps {
  loanAccountId: string;
  showHeader?: boolean;
  maxItems?: number;
}

export function PaymentHistory({
  loanAccountId,
  showHeader = true,
  maxItems = 10,
}: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<RepaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getRepaymentHistory(loanAccountId);
      const sorted = data.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      setTransactions(sorted.slice(0, maxItems));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payment history';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loanAccountId, maxItems]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-2" />
        <span className="text-gray-600">거래내역을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-900">오류</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div>
          <h3 className="text-lg font-bold text-gray-900">결제 내역</h3>
          <p className="text-sm text-gray-600">최근 거래 현황</p>
        </div>
      )}

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((item) => (
            <div key={item.transactionNo} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">대출금 상환</p>
                      <p className="text-lg font-bold text-green-600">
                        +₩{item.paymentAmount.toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">거래번호: {item.transactionNo}</p>
                    <div className="grid grid-cols-3 gap-4 text-xs mb-2">
                      <div>
                        <p className="text-gray-600">원금</p>
                        <p className="font-semibold text-gray-900">
                          ₩{item.principalApplied?.toLocaleString('ko-KR') || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">이자</p>
                        <p className="font-semibold text-gray-900">
                          ₩{item.interestApplied?.toLocaleString('ko-KR') || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">상태</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {item.status === 'completed' ? '완료' : item.status === 'pending' ? '대기' : '실패'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.paymentDate).toLocaleDateString('ko-KR')} · 
                      {new Date(item.paymentDate).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">결제 내역이 없습니다</p>
            <p className="text-sm text-gray-500">아직 결제 거래가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

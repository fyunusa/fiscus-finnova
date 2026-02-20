'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { RepaymentSchedule as RepaymentScheduleType } from '@/services/paymentService';
import { paymentService } from '@/services/paymentService';

interface RepaymentScheduleComponentProps {
  loanAccountId: string;
  showHeader?: boolean;
}

export function RepaymentSchedule({
  loanAccountId,
  showHeader = true,
}: RepaymentScheduleComponentProps) {
  const [schedule, setSchedule] = useState<RepaymentScheduleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getRepaymentSchedule(loanAccountId);
      setSchedule(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load repayment schedule';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loanAccountId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: '납부됨' };
      case 'UNPAID':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: '미납부' };
      case 'OVERDUE':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '연체' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-2" />
        <span className="text-gray-600">일정을 불러오는 중...</span>
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
          <h3 className="text-lg font-bold text-gray-900">상환 일정</h3>
          <p className="text-sm text-gray-600">대출금 상환 계획 및 현황</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">월차</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">예정일</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">원금</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">이자</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">합계</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedule.length > 0 ? (
                schedule.map((item, index) => {
                  const statusInfo = getStatusColor(item.status);
                  const totalAmount = item.principalPayment + item.interestPayment;
                  return (
                    <tr key={index} className={statusInfo.bg}>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">
                        {item.month}개월
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {new Date(item.scheduledPaymentDate).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        ₩{item.principalPayment.toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        ₩{item.interestPayment.toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        ₩{totalAmount.toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.text} ${statusInfo.bg} border ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    상환 일정이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {schedule.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 grid grid-cols-3 gap-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-semibold">총 상환액</p>
              <p className="text-lg font-bold text-gray-900">
                ₩{schedule
                  .reduce((sum, item) => sum + item.principalPayment + item.interestPayment, 0)
                  .toLocaleString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">탕감 기간</p>
              <p className="text-lg font-bold text-gray-900">{schedule.length}개월</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">미납부</p>
              <p className="text-lg font-bold text-yellow-600">
                {schedule.filter((s) => s.status === 'UNPAID' || s.status === 'OVERDUE').length}회
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

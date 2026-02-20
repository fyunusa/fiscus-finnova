'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { paymentService } from '@/services/paymentService';

interface VirtualAccountProps {
  loanAccountId: string;
  showHeader?: boolean;
}

export function VirtualAccount({ loanAccountId, showHeader = true }: VirtualAccountProps) {
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadVirtualAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getVirtualAccount(loanAccountId);
      setAccountData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load virtual account';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loanAccountId]);

  useEffect(() => {
    loadVirtualAccount();
  }, [loadVirtualAccount]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-2" />
        <span className="text-gray-600">계좌 정보를 불러오는 중...</span>
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

  if (!accountData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div>
          <h3 className="text-lg font-bold text-gray-900">가상계좌</h3>
          <p className="text-sm text-gray-600">아래 계좌로 직접 입금하실 수 있습니다</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 space-y-4">
        {/* Bank Name */}
        <div>
          <p className="text-xs text-gray-600 font-semibold mb-1">은행</p>
          <p className="text-lg font-bold text-gray-900">{accountData.bankName || '토스뱅크'}</p>
        </div>

        {/* Account Number */}
        <div>
          <p className="text-xs text-gray-600 font-semibold mb-2">계좌번호</p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-lg font-mono font-bold text-gray-900 flex-1">
              {accountData.accountNumber || '계정을 불러올 수 없습니다'}
            </p>
            <button
              onClick={() => handleCopy(accountData.accountNumber, 'account')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copiedField === 'account' ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <p className="text-xs text-gray-600 font-semibold mb-1">계좌 유효 기간</p>
          <p className="text-sm font-semibold text-gray-900">
            {accountData.expiryDate
              ? new Date(accountData.expiryDate).toLocaleDateString('ko-KR')
              : '장기 계좌'}
          </p>
        </div>

        {/* Balance */}
        <div>
          <p className="text-xs text-gray-600 font-semibold mb-1">잔액</p>
          <p className="text-lg font-bold text-blue-600">
            ₩{(accountData.balance || 0).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
          <AlertCircle size={18} />
          입금 안내
        </p>
        <ul className="text-sm text-amber-800 space-y-1 ml-6 list-disc">
          <li>타 은행에서 입금 가능합니다</li>
          <li>계좌 유효 기간이 지나면 새로운 계좌가 발급됩니다</li>
          <li>입금 후 자동으로 상환액에 반영됩니다 (최대 1시간)</li>
          <li>의뢰금이 다를 경우 연락 바랍니다</li>
        </ul>
      </div>
    </div>
  );
}

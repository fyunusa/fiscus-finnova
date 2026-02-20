'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PropertyValuationProps {
  address: string;
  claimedValue?: number;
  onValidation?: (result: any) => void;
  readOnly?: boolean;
}

export function PropertyValuation({
  address,
  claimedValue,
  onValidation,
  readOnly = false,
}: PropertyValuationProps) {
  const [valuation, setValuation] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'valuation' | 'validation'>('valuation');
  const [autoLoaded, setAutoLoaded] = useState(false);

  const validateCollateral = React.useCallback(async () => {
    if (!address || !claimedValue) {
      setError('주소와 담보 평가액을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post('/loans/property/validate', {
        address,
        claimedValue,
      });

      if (data.success) {
        setValidation(data.data);
        onValidation?.(data.data);
      } else {
        setError('담보 검증 중 오류가 발생했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '담보 검증 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, claimedValue, onValidation]);

  // Auto-load validation when address and claimed value change
  React.useEffect(() => {
    if (address && claimedValue && !autoLoaded && !readOnly) {
      setAutoLoaded(true);
      validateCollateral();
    }
  }, [address, claimedValue, autoLoaded, readOnly, validateCollateral]);

  const fetchValuation = async () => {
    if (!address) {
      setError('주소를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.get(`/loans/property/valuation?address=${encodeURIComponent(address)}`);

      if (data.success && data.data) {
        setValuation(data.data);
      } else {
        setError('부동산 시세 정보를 가져올 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '시세 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acceptable':
        return 'text-green-600';
      case 'overvalued':
        return 'text-orange-600';
      case 'undervalued':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'acceptable':
        return 'bg-green-50';
      case 'overvalued':
        return 'bg-orange-50';
      case 'undervalued':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-300 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">부동산 평가</h3>
          <p className="text-sm text-gray-500 mt-1">{address}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('valuation')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'valuation'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          시세 정보
        </button>
        {claimedValue && (
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'validation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            담보 검증
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Valuation Tab */}
      {activeTab === 'valuation' && (
        <div className="space-y-4">
          <button
            onClick={fetchValuation}
            disabled={loading || readOnly}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            시세 조회
          </button>

          {valuation && (
            <div className="space-y-4">
              {/* Market Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">추정 가격</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₩{(valuation.estimatedValue / 100000000).toFixed(1)}억
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">평당 가격</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₩{(valuation.unitPrice / 1000000).toFixed(1)}백만
                  </p>
                </div>
              </div>

              {/* Market Trend */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                {valuation.marketTrend === 'rising' && (
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                {valuation.marketTrend === 'falling' && (
                  <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {valuation.marketTrend === 'rising' && '상승 추세'}
                    {valuation.marketTrend === 'falling' && '하락 추세'}
                    {valuation.marketTrend === 'stable' && '안정적'}
                  </p>
                  <p className="text-sm text-gray-600">
                    최근 {valuation.transactionFrequency}건의 거래 기반
                  </p>
                </div>
              </div>

              {/* Recent Transactions */}
              {valuation.recentTransactions && valuation.recentTransactions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">최근 거래 사례</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {valuation.recentTransactions.slice(0, 3).map((txn: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{txn.addressDetail}</p>
                            <p className="text-gray-600">
                              {txn.area}㎡ · {txn.floor}층
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₩{(txn.price / 100000000).toFixed(1)}억
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{txn.transactionDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && claimedValue && (
        <div className="space-y-4">
          <button
            onClick={validateCollateral}
            disabled={loading || readOnly}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            담보 검증
          </button>

          {validation && (
            <div className={`p-4 border rounded-lg space-y-3 ${getStatusBgColor(validation.status)}`}>
              {/* Status */}
              <div className="flex items-start gap-3">
                {validation.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getStatusColor(validation.status)}`} />
                )}
                <div>
                  <p className={`font-medium ${getStatusColor(validation.status)}`}>
                    {validation.status === 'acceptable' && '적정 가격'}
                    {validation.status === 'overvalued' && '고평가됨'}
                    {validation.status === 'undervalued' && '저평가됨'}
                    {validation.status === 'unverifiable' && '검증 불가'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{validation.message}</p>
                </div>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-current border-opacity-20">
                <div>
                  <p className="text-xs text-gray-600 mb-1">청구한 가격</p>
                  <p className="font-semibold text-gray-900">
                    ₩{(validation.claimedValue / 100000000).toFixed(1)}억
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">시장 추정가</p>
                  <p className="font-semibold text-gray-900">
                    {validation.marketEstimate > 0 ? (
                      `₩${(validation.marketEstimate / 100000000).toFixed(1)}억`
                    ) : (
                      <span className="text-gray-500">검증 불가</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Variance */}
              {validation.variance !== 0 && validation.marketEstimate > 0 && (
                <div className="pt-3 border-t border-current border-opacity-20">
                  <p className="text-xs text-gray-600 mb-1">편차</p>
                  <p className={`font-semibold ${validation.variance > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                    {validation.variance > 0 ? '+' : ''}₩{(validation.variance / 100000000).toFixed(1)}억 ({validation.variancePercent.toFixed(1)}%)
                  </p>
                </div>
              )}

              {/* Unverifiable Note */}
              {validation.status === 'unverifiable' && validation.marketEstimate === 0 && (
                <div className="pt-3 border-t border-current border-opacity-20 bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                  <p className="font-medium mb-1">📋 수동 검증 필요</p>
                  <p>공식 기록에서 검증할 수 없습니다. 관리자가 수동으로 검증하겠습니다.</p>
                  <p className="mt-1 font-medium">제출되는 담보 가치: ₩{(validation.claimedValue / 100000000).toFixed(1)}억</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyValuation;

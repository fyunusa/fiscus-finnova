'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function CorporatePinPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const pinRules = {
    exactlyFour: pin.length === 4,
    noSequential:
      pin.length >= 4 &&
      !(
        (pin === '0123' || pin === '1234' || pin === '2345' || pin === '3456' ||
          pin === '4567' || pin === '5678' || pin === '6789' || pin === '9876' ||
          pin === '8765' || pin === '7654' || pin === '6543' || pin === '5432' ||
          pin === '4321' || pin === '3210') as boolean
      ),
    noRepetitive:
      pin.length >= 4 &&
      !(
        (pin === '0000' || pin === '1111' || pin === '2222' || pin === '3333' ||
          pin === '4444' || pin === '5555' || pin === '6666' || pin === '7777' ||
          pin === '8888' || pin === '9999') as boolean
      ),
  };

  const isPinValid = Object.values(pinRules).every(Boolean);
  const isPinMatching = pin && pinConfirm && pin === pinConfirm;
  const canProceed = isPinValid && isPinMatching;

  const handleNext = async () => {
    if (!canProceed) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/signup/corporate/complete');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              거래용 PIN 설정
            </h1>
            <p className="text-gray-600">
              9 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                거래 확인용 PIN을 설정해주세요
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                투자 거래 및 중요 설정 변경 시 사용됩니다.
              </p>

              <div className="space-y-6">
                {/* PIN Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    PIN (4자리 숫자)
                  </label>
                  <div className="relative">
                    <Input
                      type={showPin ? 'text' : 'password'}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      disabled={loading}
                      maxLength={4}
                      className="text-center text-3xl tracking-widest font-bold pr-10"
                    />
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Validation Rules */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      {pinRules.exactlyFour ? (
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          pinRules.exactlyFour ? 'text-gray-900' : 'text-gray-600'
                        }
                      >
                        정확히 4자리 숫자
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {pinRules.noSequential ? (
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          pinRules.noSequential ? 'text-gray-900' : 'text-gray-600'
                        }
                      >
                        연속된 숫자 불가 (1234, 4321 등)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {pinRules.noRepetitive ? (
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          pinRules.noRepetitive ? 'text-gray-900' : 'text-gray-600'
                        }
                      >
                        같은 숫자 반복 불가 (1111, 2222 등)
                      </span>
                    </div>
                  </div>
                </div>

                {/* PIN Confirm */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    PIN 확인
                  </label>
                  <div className="relative">
                    <Input
                      type={showPinConfirm ? 'text' : 'password'}
                      placeholder="••••"
                      value={pinConfirm}
                      onChange={(e) =>
                        setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      disabled={loading}
                      maxLength={4}
                      className="text-center text-3xl tracking-widest font-bold pr-10"
                    />
                    <button
                      onClick={() => setShowPinConfirm(!showPinConfirm)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showPinConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {pinConfirm && (
                    <div
                      className={`flex items-center gap-2 text-sm mt-2 ${
                        isPinMatching ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPinMatching ? (
                        <Check size={16} />
                      ) : (
                        <X size={16} />
                      )}
                      {isPinMatching ? 'PIN이 일치합니다' : 'PIN이 일치하지 않습니다'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!canProceed && (
              <Alert type="warning" className="mb-6">
                PIN 설정을 완료해주세요.
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                이전
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                loading={loading}
                disabled={!canProceed}
              >
                다음
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

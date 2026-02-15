import React from 'react';
import { Button, Input } from './index';

interface InvestmentCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate: number;
  period: number;
}

export const InvestmentCalculatorModal: React.FC<InvestmentCalculatorModalProps> = ({
  isOpen,
  onClose,
  rate,
  period,
}) => {
  const [amount, setAmount] = React.useState('');
  const expectedReturn = amount ? (parseFloat(amount) * (rate / 100) * (period / 12)).toFixed(0) : '0';
  const totalAmount = amount ? (parseFloat(amount) + parseFloat(expectedReturn)).toFixed(0) : '0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">투자 수익 계산기</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">투자 금액 (원)</label>
              <Input
                type="number"
                placeholder="투자 금액을 입력하세요"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">예상 수익금</p>
                  <p className="text-lg font-bold text-blue-600">₩{parseInt(expectedReturn).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">총 수령액</p>
                  <p className="text-lg font-bold text-gray-900">₩{parseInt(totalAmount).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                수익률: {rate}% | 기간: {period}개월
              </p>
            </div>
          </div>

          <Button variant="primary" onClick={onClose} className="w-full">
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

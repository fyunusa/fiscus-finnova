import React from 'react';
import { Button, Input, Select } from './index';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string, method: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState('transfer');
  const [error, setError] = React.useState('');

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('올바른 금액을 입력해주세요');
      return;
    }
    onConfirm(amount, method);
    setAmount('');
    setMethod('transfer');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">입금</h2>
          <p className="text-gray-600 text-sm mb-6">입금할 금액을 입력하세요</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">금액 (원)</label>
              <Input
                type="number"
                placeholder="금액을 입력하세요"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">입금 방법</label>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="transfer">계좌이체</option>
                <option value="card">신용카드</option>
                <option value="mobile">휴대폰</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button variant="primary" onClick={handleConfirm} className="flex-1">
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

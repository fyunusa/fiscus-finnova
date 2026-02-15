import React from 'react';
import { Button, Input } from './index';

interface PINAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

export const PINAuthModal: React.FC<PINAuthModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');

  const handleConfirm = () => {
    if (pin.length !== 6) {
      setError('6자리 PIN을 입력해주세요');
      return;
    }
    onConfirm(pin);
    setPin('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">본인 확인</h2>
          <p className="text-gray-600 text-sm mb-6">등록된 PIN을 입력해주세요</p>

          <div className="mb-6">
            <Input
              type="password"
              placeholder="6자리 PIN 입력"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
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

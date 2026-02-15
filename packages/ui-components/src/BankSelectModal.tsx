import React from 'react';
import Button from './Button';

interface BankSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bank: string) => void;
}

const BANKS = [
  { id: 1, name: '국민은행', logo: 'KB' },
  { id: 2, name: '우리은행', logo: 'WB' },
  { id: 3, name: '신한은행', logo: 'SH' },
  { id: 4, name: 'IBK기업은행', logo: 'IB' },
  { id: 5, name: 'NH농협은행', logo: 'NH' },
  { id: 6, name: '하나은행', logo: 'HA' },
  { id: 7, name: '카카오뱅크', logo: 'KK' },
  { id: 8, name: '토스뱅크', logo: 'TO' },
];

export const BankSelectModal: React.FC<BankSelectModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">계좌 등록 은행 선택</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {BANKS.map((bank) => (
              <button
                key={bank.id}
                onClick={() => {
                  onSelect(bank.name);
                  onClose();
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-center"
              >
                <div className="text-2xl font-bold text-blue-600 mb-2">{bank.logo}</div>
                <div className="text-sm font-medium text-gray-900">{bank.name}</div>
              </button>
            ))}
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            취소
          </Button>
        </div>
      </div>
    </div>
  );
};

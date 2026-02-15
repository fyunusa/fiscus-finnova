'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function BankAccountsPage() {
  const [selectedBank, setSelectedBank] = useState('');
  const [verificationStep, setVerificationStep] = useState('select');
  const [wonAmount, setWonAmount] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [currentAccount] = useState({
    bank: '국민은행',
    accountNumber: '123-456-789123',
    accountHolder: '김철수',
    verificationStatus: '완료'
  });

  const banks = [
    { id: 'kb', name: '국민은행' },
    { id: 'shinhan', name: '신한은행' },
    { id: 'woori', name: '우리은행' },
    { id: 'hana', name: '하나은행' },
    { id: 'ibk', name: '기업은행' }
  ];

  const handleVerifyBank = () => {
    if (selectedBank && wonAmount === '1') {
      setVerificationStep('verify');
    }
  };

  const handleConfirmVerification = () => {
    if (verificationInput === '1') {
      setIsVerified(true);
      setVerificationStep('confirmed');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">계좌 관리</h1>
            <p className="text-green-100 mt-2">결제 계좌를 등록하고 관리하세요</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Current Account */}
          <Card className="bg-white shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">현재 등록된 계좌</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">은행</p><p className="font-semibold">{currentAccount.bank}</p></div>
              <div><p className="text-sm text-gray-600">계좌번호</p><p className="font-semibold font-mono">{currentAccount.accountNumber}</p></div>
              <div><p className="text-sm text-gray-600">예금주명</p><p className="font-semibold">{currentAccount.accountHolder}</p></div>
              <div><p className="text-sm text-gray-600">인증 상태</p><p className="font-semibold text-green-600">{currentAccount.verificationStatus}</p></div>
            </div>
          </Card>

          {/* Bank Selection */}
          <Card className="bg-white shadow-md p-8">
            <h3 className="text-xl font-bold mb-6">계좌 변경하기</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">은행 선택</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">선택하세요</option>
                  {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                </select>
              </div>
              
              {verificationStep === 'select' && selectedBank && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">1원 입금액 확인</label>
                    <Input type="number" placeholder="1원을 입금받고 숫자를 입력하세요" value={wonAmount} onChange={(e) => setWonAmount(e.target.value)} />
                  </div>
                  <Button onClick={handleVerifyBank} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded">
                    인증하기
                  </Button>
                </>
              )}

              {verificationStep === 'verify' && (
                <>
                  <Input type="text" placeholder="입금 확인 코드" value={verificationInput} onChange={(e) => setVerificationInput(e.target.value)} />
                  <Button onClick={handleConfirmVerification} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded">
                    확인
                  </Button>
                </>
              )}

              {verificationStep === 'confirmed' && isVerified && (
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded border border-green-200">
                  <CheckCircle className="text-green-600" />
                  <p className="text-green-700 font-semibold">계좌 인증이 완료되었습니다</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

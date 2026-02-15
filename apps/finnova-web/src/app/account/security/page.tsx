'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function SecurityPage() {
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [pinForm, setPinForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordChange = () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.current) {
      setSuccessMessage('비밀번호가 변경되었습니다');
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
  };

  const handlePinChange = () => {
    if (pinForm.new === pinForm.confirm && pinForm.new.length === 4 && pinForm.current) {
      setSuccessMessage('PIN이 변경되었습니다');
      setPinForm({ current: '', new: '', confirm: '' });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">보안 설정</h1>
            <p className="text-red-100 mt-2">비밀번호와 PIN을 변경하세요</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {successMessage && (
            <Card className="bg-green-50 border-l-4 border-green-600 p-4 mb-8">
              <p className="text-green-700 font-semibold">{successMessage}</p>
            </Card>
          )}

          {/* Password Change */}
          <Card className="bg-white shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-red-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">비밀번호 변경</h2>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="현재 비밀번호"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="새 비밀번호"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-600 mt-2">• 8자 이상 • 영문, 숫자, 특수문자 포함</p>
              </div>

              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="새 비밀번호 확인"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-gray-600"
                >
                  {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Button
                onClick={handlePasswordChange}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
              >
                비밀번호 변경
              </Button>
            </div>
          </Card>

          {/* PIN Change */}
          <Card className="bg-white shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-red-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">거래 PIN 변경</h2>
            </div>

            <div className="space-y-6">
              <Input
                type="password"
                placeholder="현재 PIN (4자리)"
                value={pinForm.current}
                onChange={(e) => setPinForm({...pinForm, current: e.target.value})}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
              />

              <Input
                type="password"
                placeholder="새 PIN (4자리)"
                value={pinForm.new}
                onChange={(e) => setPinForm({...pinForm, new: e.target.value})}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
              />

              <Input
                type="password"
                placeholder="새 PIN 확인 (4자리)"
                value={pinForm.confirm}
                onChange={(e) => setPinForm({...pinForm, confirm: e.target.value})}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
              />

              <Button
                onClick={handlePinChange}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
              >
                PIN 변경
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

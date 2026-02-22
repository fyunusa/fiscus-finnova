'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import { Eye, EyeOff, Lock, Loader, CheckCircle } from 'lucide-react';
import { setTransactionPIN, getTransactionPINStatus, TransactionPIN } from '@/services/user.service';import { getAccessToken } from '@/lib/auth';
export default function SecurityPage() {
  const router = useRouter();
  const [pinStatus, setPinStatus] = useState<TransactionPIN | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinLoading, setPinLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // PIN Form State
  const [pinForm, setPinForm] = useState({ pin: '', confirm: '' });
  const [showPIN, setShowPIN] = useState(false);

  // Password Form State (TODO: Implement backend endpoint)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    loadPINStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPINStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await getTransactionPINStatus();
      setPinStatus(response.data || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load PIN status';
      console.error('Error loading PIN status:', err);
      // Don't show error if it's just "PIN not set yet"
      if (!message.includes('not found')) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPIN = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setPinLoading(true);
      setError('');
      setSuccess('');

      // Validation
      if (!pinForm.pin || !pinForm.confirm) {
        setError('Both PIN fields are required');
        setPinLoading(false);
        return;
      }

      if (pinForm.pin.length !== 4 || pinForm.confirm.length !== 4) {
        setError('PIN must be exactly 4 digits');
        setPinLoading(false);
        return;
      }

      if (!/^\d+$/.test(pinForm.pin)) {
        setError('PIN must contain only digits');
        setPinLoading(false);
        return;
      }

      if (pinForm.pin !== pinForm.confirm) {
        setError('PIN and confirmation do not match');
        setPinLoading(false);
        return;
      }

      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await setTransactionPIN(pinForm.pin);

      if (response.success) {
        setSuccess('Transaction PIN set successfully!');
        setPinForm({ pin: '', confirm: '' });
        await loadPINStatus();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set PIN';
      setError(message);
      console.error('Error setting PIN:', err);
    } finally {
      setPinLoading(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.current) {
      setSuccess('Password changed successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Please ensure current password is entered and new passwords match');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Security Settings</h1>
            <p className="text-red-100 mt-2">Manage your password and transaction PIN</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Error/Success Messages */}
          {error && <Alert type="error" message={error} className="mb-6" />}
          {success && <Alert type="success" message={success} className="mb-6" />}

          {/* Password Change */}
          <Card className="bg-white shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-red-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-600 mt-2">• At least 8 characters • Include letters, numbers, and special characters</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-10 text-gray-600"
                >
                  {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Button
                onClick={handlePasswordChange}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
              >
                Change Password
              </Button>
            </div>
          </Card>

          {/* Transaction PIN */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-md p-8 border-l-4 border-blue-600 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction PIN Status</h3>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin text-blue-600" size={16} />
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : pinStatus?.isSet ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-green-700 font-medium">PIN is set and active</p>
                  </div>
                ) : (
                  <p className="text-yellow-700 font-medium">No PIN set yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* PIN Setup/Change Form */}
          <Card className="bg-white shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-red-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">{pinStatus?.isSet ? 'Change' : 'Set'} Transaction PIN</h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your transaction PIN is a 4-digit code used to verify sensitive transactions. Keep it secure and never share it.
            </p>

            <form onSubmit={handleSetPIN} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN (4 digits)</label>
                <div className="relative">
                  <Input
                    type={showPIN ? 'text' : 'password'}
                    placeholder="Enter 4-digit PIN"
                    value={pinForm.pin}
                    onChange={(e) => setPinForm({ ...pinForm, pin: e.target.value.slice(0, 4) })}
                    maxLength={4}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-3xl tracking-widest font-mono"
                    disabled={pinLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPIN(!showPIN)}
                    className="absolute right-3 top-4 text-gray-600"
                  >
                    {showPIN ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm PIN (4 digits)</label>
                <Input
                  type={showPIN ? 'text' : 'password'}
                  placeholder="Confirm 4-digit PIN"
                  value={pinForm.confirm}
                  onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value.slice(0, 4) })}
                  maxLength={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-3xl tracking-widest font-mono"
                  disabled={pinLoading}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">PIN Requirements:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Must be exactly 4 digits</li>
                  <li>• Must contain only numbers (0-9)</li>
                  <li>• Example: 1234</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={pinLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {pinLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Setting PIN...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {pinStatus?.isSet ? 'Change PIN' : 'Set PIN'}
                  </>
                )}
              </Button>
            </form>

            {pinStatus?.isLocked && (
              <Alert
                type="warning"
                message="Your account is temporarily locked due to multiple failed PIN attempts. Please try again later."
                className="mt-6"
              />
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

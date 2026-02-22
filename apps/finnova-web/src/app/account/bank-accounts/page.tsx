'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import { CreditCard, CheckCircle, Trash2, Star, Plus, AlertCircle, Loader, Copy, XCircle } from 'lucide-react';
import { getBankAccounts, createBankAccount, setDefaultBankAccount, deleteBankAccount, BankAccount } from '@/services/user.service';
import { getVirtualAccountInfo, createVirtualAccount, VirtualAccountInfo } from '@/services/virtual-account.service';
import { getAccessToken } from '@/lib/auth';
import { getPendingVirtualAccountRequest, checkVirtualAccountStatus, confirmVirtualAccountPayment } from '@/services/virtual-account.service';

const SUPPORTED_BANKS = [
  { code: 'bk_111', name: '국민은행' },
  { code: 'bk_004', name: '우리은행' },
  { code: 'bk_020', name: '신한은행' },
  { code: 'bk_081', name: '하나은행' },
  { code: 'bk_088', name: '신협' },
  { code: 'bk_003', name: '기업은행' },
];

export default function BankAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isCreatingVirtualAccount, setIsCreatingVirtualAccount] = useState(false);
  const [isRetryingCompletion, setIsRetryingCompletion] = useState(false);
  const [pendingAccountMessage, setPendingAccountMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolder: '',
  });

  // Load bank accounts and virtual account on mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle payment success callback from Toss
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    const paymentKey = searchParams.get('paymentKey');

    if (paymentStatus === 'success' && paymentKey) {
      completeVirtualAccountCreation(paymentKey);
      // Clean up URL
      window.history.replaceState({}, document.title, '/account/bank-accounts');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      setPendingAccountMessage('');
      
      const token = getAccessToken();

      if (!token) {
        // Clear pending state on logout
        sessionStorage.removeItem('vaRequestId');
        setVirtualAccount(null);
        router.push('/login');
        return;
      }

      const [accountsResponse, vaResponse, pendingRequestResponse] = await Promise.all([
        getBankAccounts(),
        getVirtualAccountInfo(),
        getPendingVirtualAccountRequest(),
      ]);

      setAccounts(accountsResponse.data || []);
      
      // Handle virtual account response
      if (vaResponse.success && vaResponse.data) {
        // Virtual account exists
        setVirtualAccount(vaResponse.data);
        setPendingAccountMessage('');
        // Clear any pending request from sessionStorage since account is ready
        sessionStorage.removeItem('vaRequestId');
      } else if (!vaResponse.success) {
        // Virtual account not found - check if there's a pending request from backend
        setVirtualAccount(null);
        
        if (pendingRequestResponse.success && pendingRequestResponse.data) {
          // There's a pending request from the backend
          const pendingRequest = pendingRequestResponse.data;
          setPendingAccountMessage(pendingRequest.message);
          
          // Store the requestId for later use if needed
          if (!sessionStorage.getItem('vaRequestId')) {
            sessionStorage.setItem('vaRequestId', pendingRequest.requestId);
          }
        } else {
          // No pending request and no account
          setPendingAccountMessage('');
          sessionStorage.removeItem('vaRequestId');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsAdding(true);
      setError('');
      setSuccess('');

      if (!formData.bankCode || !formData.accountNumber || !formData.accountHolder) {
        setError('All fields are required');
        setIsAdding(false);
        return;
      }

      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await createBankAccount(formData);
      
      if (response.success) {
        setSuccess('Bank account added successfully!');
        setFormData({ bankCode: '', accountNumber: '', accountHolder: '' });
        await loadData();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add bank account';
      setError(message);
      console.error('Error adding bank account:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      setError('');
      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      await setDefaultBankAccount(accountId);
      setSuccess('Default account updated!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update default account';
      setError(message);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      setError('');
      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      await deleteBankAccount(accountId);
      setSuccess('Account deleted successfully!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setError(message);
    }
  };

  const completeVirtualAccountCreation = async (paymentKey?: string) => {
    try {
      // Get the requestId from sessionStorage
      const requestId = sessionStorage.getItem('vaRequestId');
      if (!requestId) {
        console.warn('No request ID found in sessionStorage');
        return;
      }

      // Call the confirmation endpoint to confirm payment and issue account
      const response = await confirmVirtualAccountPayment(requestId);

      if (response.success) {
        // Check response type
        const data = response.data as any;
        if (data.accountNumber) {
          // Account successfully created!
          setVirtualAccount(data);
          setPendingAccountMessage('');
          setError('');
          setSuccess('🎉 Virtual account created successfully!');
          setTimeout(() => setSuccess(''), 5000);
          // Clear the requestId from sessionStorage
          sessionStorage.removeItem('vaRequestId');
        } else if (data.status === 'WAITING_DEPOSIT') {
          // Payment confirmed but awaiting approval in dashboard
          setPendingAccountMessage(
            `${data.message} ${data.nextSteps ? '\n\n' + data.nextSteps : ''}`,
          );
          setError('');
          // Keep the requestId so user can check status later
          sessionStorage.setItem('vaRequestId', requestId);
        } else if (data.status === 'PENDING') {
          // Still pending from initial checkout
          setPendingAccountMessage(data.message);
          setError('');
          sessionStorage.setItem('vaRequestId', requestId);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm virtual account';
      console.error('Error confirming virtual account:', err);
      setError(message);
    }
  };

  const handleCheckAccountStatus = async () => {
    try {
      setIsRetryingCompletion(true);
      setError('');

      // Get the requestId from sessionStorage
      const requestId = sessionStorage.getItem('vaRequestId');
      if (!requestId) {
        setError('No pending request found');
        setIsRetryingCompletion(false);
        return;
      }

      // Call confirmation endpoint to check payment status and confirm if needed
      const response = await confirmVirtualAccountPayment(requestId);

      if (response.success) {
        // Check if the response contains actual account data
        const data = response.data as any;
        if (data.accountNumber) {
          // Account successfully created!
          setVirtualAccount(data);
          setPendingAccountMessage('');
          setSuccess('🎉 Your virtual account is now ready!');
          setTimeout(() => setSuccess(''), 5000);
          // Clear the requestId from sessionStorage
          sessionStorage.removeItem('vaRequestId');
        } else if (data.status === 'WAITING_DEPOSIT') {
          // Payment confirmed but awaiting approval
          setPendingAccountMessage(
            `${data.message} ${data.nextSteps ? '\n\n' + data.nextSteps : ''}`,
          );
        } else if (data.status === 'PENDING') {
          // Still pending, keep the message
          setPendingAccountMessage(data.message);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check account status';
      console.error('Error checking account status:', err);
      setError(message);
    } finally {
      setIsRetryingCompletion(false);
    }
  };

  const handleCreateVirtualAccount = async () => {
    try {
      setIsCreatingVirtualAccount(true);
      setError('');
      setSuccess('');

      const response = await createVirtualAccount();

      if (response.success && response.data) {
        // Check if this is a checkout URL response (new account requesting payment)
        const data = response.data as any;
        if (data.checkoutUrl && data.requiresUserAction) {
          // Show success message and redirect to checkout
          setSuccess('Redirecting to payment gateway...');
          // Store the requestId in sessionStorage for later use
          sessionStorage.setItem('vaRequestId', data.requestId);
          // Redirect to checkout URL
          setTimeout(() => {
            window.location.href = data.checkoutUrl;
          }, 1000);
        } else {
          // This is a completed virtual account
          setVirtualAccount(data);
          setSuccess('Virtual account created successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create virtual account';
      setError(message);
      console.error('Error creating virtual account:', err);
    } finally {
      setIsCreatingVirtualAccount(false);
    }
  };

  const handleCopyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccountNumber(true);
    setTimeout(() => setCopiedAccountNumber(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'verified') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">Verified</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">Pending</span>;
  };

  const getDefaultAccount = (accounts: BankAccount[]) => accounts.find(acc => acc.isDefault);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Bank Account Management</h1>
            <p className="text-green-100 mt-2">Add and manage your bank accounts</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Error/Success Messages */}
          {error && <Alert type="error" message={error} className="mb-6" />}
          {success && <Alert type="success" message={success} className="mb-6" />}

          {/* Virtual Account Section */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-green-600" size={32} />
            </div>
          ) : (
            <Card className={`${virtualAccount ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-600'} shadow-md p-8 mb-8`}>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    {virtualAccount ? (
                      <>
                        <CheckCircle className="text-blue-600" size={20} />
                        <h2 className="text-2xl font-bold text-gray-900">Virtual Account</h2>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-orange-600" size={20} />
                        <h2 className="text-2xl font-bold text-gray-900">Create Virtual Account</h2>
                      </>
                    )}
                  </div>

                  {virtualAccount ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Account Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg font-mono">{virtualAccount.accountNumber}</p>
                          <button
                            onClick={() => handleCopyAccountNumber(virtualAccount.accountNumber)}
                            className="p-1 hover:bg-blue-200 rounded transition"
                            title="Copy account number"
                          >
                            <Copy size={16} className="text-blue-600" />
                          </button>
                        </div>
                        {copiedAccountNumber && (
                          <p className="text-xs text-blue-600 mt-1">Copied!</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Account Name</p>
                        <p className="font-semibold text-lg">{virtualAccount.accountName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                        <p className="font-semibold text-lg">₩{(virtualAccount.availableBalance / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full font-medium">Active</span>
                      </div>
                    </div>
                  ) : pendingAccountMessage ? (
                    <div className="space-y-4">
                      <Alert type="warning">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-yellow-900 mb-2">Virtual Account Pending</p>
                            <p className="text-yellow-800 text-sm mb-4">{pendingAccountMessage}</p>
                            <Button
                              onClick={handleCheckAccountStatus}
                              disabled={isRetryingCompletion}
                              className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                              {isRetryingCompletion ? (
                                <>
                                  <Loader size={16} className="animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                <>
                                  Check Status
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700 font-medium">You don&apos;t have a virtual account yet. Create one to enable higher transaction limits and better visibility of your funds.</p>
                      <Button
                        onClick={handleCreateVirtualAccount}
                        disabled={isCreatingVirtualAccount}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isCreatingVirtualAccount ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus size={18} />
                            Create Virtual Account
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Default Account */}
          {getDefaultAccount(accounts) && (
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 shadow-md p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="text-green-600" size={20} fill="currentColor" />
                    <h2 className="text-2xl font-bold text-gray-900">Default Account</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bank</p>
                      <p className="font-semibold text-lg">{SUPPORTED_BANKS.find(b => b.code === getDefaultAccount(accounts)!.bankCode)?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Number</p>
                      <p className="font-semibold text-lg font-mono">{getDefaultAccount(accounts)!.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Holder</p>
                      <p className="font-semibold text-lg">{getDefaultAccount(accounts)!.accountHolder}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      {getStatusBadge(getDefaultAccount(accounts)!.status)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* All Accounts */}
          <Card className="bg-white shadow-md p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Your Accounts ({accounts.length})</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-green-600" size={32} />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded border border-gray-200">
                <CreditCard className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-gray-600 font-medium">No bank accounts yet</p>
                <p className="text-gray-500 text-sm mt-1">Add one below to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {account.isDefault && <Star className="text-yellow-500" size={16} fill="currentColor" />}
                        <h3 className="font-semibold text-gray-900">{SUPPORTED_BANKS.find(b => b.code === account.bankCode)?.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Account: <span className="font-mono">{account.accountNumber}</span> ({account.accountHolder})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(account.status)}
                      {!account.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(account.id)}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          Set Default
                        </Button>
                      )}
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete account"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Add New Account Form */}
          <Card className="bg-white shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="text-green-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Add Bank Account</h2>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                <select
                  value={formData.bankCode}
                  onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a bank</option>
                  {SUPPORTED_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <Input
                  type="text"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder</label>
                <Input
                  type="text"
                  placeholder="Enter account holder name"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isAdding}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Bank Account
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

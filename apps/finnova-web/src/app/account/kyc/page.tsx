'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock, AlertCircle, Download, Trash2 } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';
import * as userService from '@/services/user.service';

interface KYCDocument {
  id: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected' | 'supplement';
  documentUrl?: string;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string | null;
  adminReviewedAt?: string | null;
}

export default function KYCPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadKYCDocuments(token);
  }, [router]);

  const loadKYCDocuments = async (token: string) => {
    try {
      const response = await userService.getKYCDocuments(token);
      setDocuments(response.data || []);
      setErrorMessage('');
    } catch (error: any) {
      console.error('Failed to load KYC documents:', error);
      setErrorMessage('KYC 문서를 불러올 수 없습니다');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('정말로 이 문서를 삭제하시겠습니까?')) return;

    try {
      setErrorMessage('');

      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      await userService.deleteKYCDocument(documentId, token);
      setSuccessMessage('문서가 삭제되었습니다');
      
      // Reload documents
      loadKYCDocuments(token);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to delete KYC document:', error);
      setErrorMessage(error.message || '문서 삭제에 실패했습니다');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setErrorMessage('');

      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Convert FileList to object with named files
      const uploadData: { idDocument?: File; selfieDocument?: File } = {};
      if (files.length > 0) uploadData.idDocument = files[0];
      if (files.length > 1) uploadData.selfieDocument = files[1];

      await userService.uploadKYCDocuments(uploadData, token);
      setSuccessMessage('KYC 문서가 업로드되었습니다');
      
      // Reset file input
      if (e.target) e.target.value = '';
      
      // Reload documents
      loadKYCDocuments(token);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to upload KYC documents:', error);
      setErrorMessage(error.message || 'KYC 문서 업로드에 실패했습니다');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return <FileText className="text-blue-600" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      approved: { color: 'bg-green-100 text-green-800', label: '승인됨' },
      rejected: { color: 'bg-red-100 text-red-800', label: '반려됨' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '대기중' },
      supplement: { color: 'bg-blue-100 text-blue-800', label: '보완 필요' },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/account">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft size={20} />
                계정으로 돌아가기
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">KYC 인증</h1>
            <p className="text-gray-600 mt-2">신분증 사본과 셀카를 업로드하여 본인확인을 완료하세요</p>
          </div>

          {/* Messages */}
          {successMessage && (
            <Card className="mb-6 bg-green-50 border-l-4 border-green-600 p-4">
              <p className="text-green-700 font-semibold">{successMessage}</p>
            </Card>
          )}

          {errorMessage && (
            <Card className="mb-6 bg-red-50 border-l-4 border-red-600 p-4">
              <p className="text-red-700 font-semibold">{errorMessage}</p>
            </Card>
          )}

          {/* Upload Area */}
          <Card className="mb-8 p-8 bg-white shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">문서 업로드</h2>

            <div className="mb-6">
              <label htmlFor="file-upload" className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <Upload className="mx-auto text-gray-400 mb-4" size={32} />
                  <p className="text-lg font-semibold text-gray-900 mb-2">파일을 업로드하세요</p>
                  <p className="text-sm text-gray-600 mb-4">신분증 사본 및 셀카 이미지를 선택하세요</p>
                  <p className="text-xs text-gray-500">PNG, JPG - 최대 10MB</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 제출 가이드</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 신분증 사본: 주민등록증, 운전면허증, 여권 등 (양면)</li>
                <li>• 셀카: 신분증과 함께 있는 사진</li>
                <li>• 파일은 선명하고 명확해야 합니다</li>
                <li>• 최대 2개 파일까지 업로드 가능합니다</li>
              </ul>
            </div>
          </Card>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">업로드된 문서</h2>
              
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-white p-6 shadow-md border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {doc.documentType || '문서'}
                          </h3>
                          {getStatusBadge(doc.status)}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>업로드 일시: {new Date(doc.createdAt).toLocaleString('ko-KR')}</p>
                          {doc.adminReviewedAt && (
                            <p>검토 일시: {new Date(doc.adminReviewedAt).toLocaleString('ko-KR')}</p>
                          )}
                          {doc.rejectionReason && (
                            <p className="text-red-600 font-semibold">
                              반려 사유: {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {doc.documentUrl && (
                        <Button
                          onClick={() => window.open(doc.documentUrl, '_blank')}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <Download size={16} />
                          보기
                        </Button>
                      )}
                      {doc.status === 'pending' && (
                        <Button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {documents.length === 0 && !isLoading && (
            <Card className="p-8 text-center bg-gray-50 border border-gray-200">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-2">업로드된 문서가 없습니다</p>
              <p className="text-gray-500 text-sm">위의 업로드 버튼을 클릭하여 문서를 업로드하세요</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

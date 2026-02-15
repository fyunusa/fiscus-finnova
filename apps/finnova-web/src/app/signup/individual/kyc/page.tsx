'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';

interface FileUpload {
  idFile: File | null;
  selfieFile: File | null;
}

export default function KYCUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileUpload>({
    idFile: null,
    selfieFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  const handleFileSelect = (field: keyof FileUpload, file: File | null) => {
    setError('');

    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`파일 크기가 너무 큽니다. 최대 10MB까지 가능합니다`);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPG, PNG, PDF 형식만 지원합니다');
      return;
    }

    setFiles(prev => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleProceed = async () => {
    setError('');

    if (!files.idFile) {
      setError('신분증 사본을 업로드해주세요');
      return;
    }

    if (!files.selfieFile) {
      setError('셀카(신분증 인증샷)를 업로드해주세요');
      return;
    }

    setLoading(true);

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/signup/individual/pin');
    } catch (err) {
      setError('파일 업로드 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getFilePreview = (file: File | null) => {
    if (!file) return null;
    return file.name;
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">8 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">본인 확인 서류</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              본인 확인 서류 업로드
            </h1>
            <p className="text-gray-600 mt-2">
              KYC(Know Your Customer) 요건을 위해 서류를 업로드해주세요
            </p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <div className="space-y-8 mb-8">
            {/* ID Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                신분증 사본 (필수)
              </label>
              <p className="text-xs text-gray-600 mb-4">
                주민등록증 또는 운전면허증의 사본을 제출해주세요
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                   onClick={() => document.getElementById('idFileInput')?.click()}>
                {files.idFile ? (
                  <>
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-600 mb-1">파일이 선택되었습니다</p>
                    <p className="text-xs text-gray-600">{getFilePreview(files.idFile)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(prev => ({ ...prev, idFile: null }));
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                    >
                      재선택
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">파일을 선택하세요</p>
                    <p className="text-xs text-gray-500">JPG, PNG, PDF (최대 10MB)</p>
                  </>
                )}
                <input
                  id="idFileInput"
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileSelect('idFile', e.target.files?.[0] || null)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Selfie with ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                셀카 (신분증 인증샷) (필수)
              </label>
              <p className="text-xs text-gray-600 mb-4">
                신분증을 들고 있는 얼굴이 보이는 사진을 제출해주세요 (신원 확인용)
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                   onClick={() => document.getElementById('selfieFileInput')?.click()}>
                {files.selfieFile ? (
                  <>
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-600 mb-1">파일이 선택되었습니다</p>
                    <p className="text-xs text-gray-600">{getFilePreview(files.selfieFile)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(prev => ({ ...prev, selfieFile: null }));
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                    >
                      재선택
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">파일을 선택하세요</p>
                    <p className="text-xs text-gray-500">JPG, PNG, PDF (최대 10MB)</p>
                  </>
                )}
                <input
                  id="selfieFileInput"
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileSelect('selfieFile', e.target.files?.[0] || null)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Alert type="info" className="mb-6 text-sm">
            <strong>안내:</strong> 업로드 된 서류는 보안 암호화 방식으로 저장되며, KYC 검증 목적으로만 사용됩니다.
          </Alert>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              이전
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1"
              variant="primary"
              disabled={!files.idFile || !files.selfieFile || loading}
            >
              {loading ? '업로드 중...' : '다음 단계로'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';
import { Upload, File, X } from 'lucide-react';

interface FileUpload {
  file: File | null;
  preview: string;
  name: string;
}

interface UploadedDocuments {
  businessRegistration: FileUpload;
  representativeId: FileUpload;
  certificateOfRepresentative: FileUpload;
  accountBookCopy: FileUpload;
}

export default function CorporateDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<UploadedDocuments>({
    businessRegistration: { file: null, preview: '', name: '사업자등록증' },
    representativeId: { file: null, preview: '', name: '대표자 신분증' },
    certificateOfRepresentative: { file: null, preview: '', name: '대표자 인증서' },
    accountBookCopy: { file: null, preview: '', name: '통장 사본 (예금주확인)' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    documentKey: keyof UploadedDocuments
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!allowedFileTypes.includes(file.type)) {
      setError('JPG, PNG, PDF 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxFileSize) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setError('');

    // Create preview for images
    let preview = '';
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocuments((prev) => ({
          ...prev,
          [documentKey]: {
            file,
            preview: e.target?.result as string,
            name: documents[documentKey].name,
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocuments((prev) => ({
        ...prev,
        [documentKey]: {
          file,
          preview: '',
          name: documents[documentKey].name,
        },
      }));
    }
  };

  const handleRemoveFile = (documentKey: keyof UploadedDocuments) => {
    setDocuments((prev) => ({
      ...prev,
      [documentKey]: {
        file: null,
        preview: '',
        name: documents[documentKey].name,
      },
    }));
  };

  const allUploaded = Object.values(documents).every((doc) => doc.file !== null);

  const handleNext = async () => {
    if (!allUploaded) return;

    setLoading(true);
    try {
      // 실제로는 파일 업로드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/signup/corporate/pin');
    } catch (err) {
      setError('파일 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              법인 서류 제출
            </h1>
            <p className="text-gray-600">
              8 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                필수 서류를 업로드해주세요
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                모든 서류는 명확하게 촬영되어야 하며, JPG, PNG, PDF 형식으로 10MB 이하여야 합니다.
              </p>

              <div className="space-y-6">
                {Object.entries(documents).map(([key, doc]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {doc.name}
                        </span>
                        <span className="text-xs text-red-600 font-semibold">
                          (필수)
                        </span>
                      </div>
                      {doc.file && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          완료
                        </span>
                      )}
                    </div>

                    {doc.file ? (
                      <div className="space-y-2">
                        {doc.preview ? (
                          <img
                            src={doc.preview}
                            alt="preview"
                            className="w-full h-40 object-cover rounded border border-gray-300"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-300">
                            <File size={20} className="text-gray-600" />
                            <span className="text-sm text-gray-700 truncate">
                              {doc.file.name}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveFile(key as keyof UploadedDocuments)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                        >
                          <X size={16} />
                          파일 제거
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          파일을 선택하거나 드래그하세요
                        </span>
                        <span className="text-xs text-gray-600 mt-1">
                          JPG, PNG, PDF (최대 10MB)
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) =>
                            handleFileSelect(e, key as keyof UploadedDocuments)
                          }
                          disabled={loading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <Alert type="error" className="mb-6">{error}</Alert>}

            <Alert type="info" className="mb-6">
              <strong>안내:</strong> 제출하신 서류는 법인 계정 인증을 위해 사용되며, 보안이 강화된 시스템에서 관리됩니다.
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                이전
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                loading={loading}
                disabled={!allUploaded}
              >
                다음
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

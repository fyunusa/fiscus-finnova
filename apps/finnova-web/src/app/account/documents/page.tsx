'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import { FileText, Upload, Loader, CheckCircle, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { uploadKYCDocuments, getKYCDocuments, KYCDocument } from '@/services/user.service';
import { getAccessToken } from '@/lib/auth';

const DOCUMENT_TYPES = {
  id_copy: { label: 'ID Copy', description: 'Copy of your valid ID (passport, driver license, etc.)' },
  selfie_with_id: { label: 'Selfie with ID', description: 'Selfie photo holding your ID' },
};

const STATUS_STYLES = {
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  approved: { color: 'text-green-600', bg: 'bg-green-50', label: 'Approved' },
  rejected: { color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
  supplement: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Need Supplement' },
};

export default function AccountDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // File upload refs
  const idDocumentRef = useRef<HTMLInputElement>(null);
  const selfieDocumentRef = useRef<HTMLInputElement>(null);

  // File state
  const [selectedFiles, setSelectedFiles] = useState<{ idDocument?: File; selfieDocument?: File }>({});

  useEffect(() => {
    loadKYCDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadKYCDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await getKYCDocuments(token);
      setDocuments(response.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load KYC documents';
      setError(message);
      console.error('Error loading KYC documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type: 'idDocument' | 'selfieDocument', file: File | null) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF, WebP, SVG)');
        return;
      }

      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFiles((prev) => ({ ...prev, [type]: file }));
      setError('');
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError('');
      setSuccess('');

      if (!selectedFiles.idDocument && !selectedFiles.selfieDocument) {
        setError('Please select at least one document');
        setUploading(false);
        return;
      }

      const token = getAccessToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await uploadKYCDocuments(selectedFiles, token);

      if (response.success) {
        setSuccess('KYC documents uploaded successfully!');
        setSelectedFiles({});
        if (idDocumentRef.current) idDocumentRef.current.value = '';
        if (selfieDocumentRef.current) selfieDocumentRef.current.value = '';

        await loadKYCDocuments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload KYC documents';
      setError(message);
      console.error('Error uploading KYC documents:', err);
    } finally {
      setUploading(false);
    }
  };

  const getDocument = (type: 'id_copy' | 'selfie_with_id') => {
    return documents.find((doc) => doc.documentType === type);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">KYC Documents</h1>
            <p className="text-blue-100 text-lg">Upload and manage your identity verification documents</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Error/Success Messages */}
          {error && <Alert type="error" message={error} className="mb-6" />}
          {success && <Alert type="success" message={success} className="mb-6" />}

          {/* Uploaded Documents */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Documents</h2>

            {loading ? (
              <Card className="bg-white shadow-md p-12 flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={32} />
              </Card>
            ) : documents.length === 0 ? (
              <Card className="bg-white shadow-md p-8 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 font-medium mb-1">No documents uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload your KYC documents below to get started</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className={`shadow-md p-6 border-l-4 ${STATUS_STYLES[doc.status as keyof typeof STATUS_STYLES]?.bg || 'bg-white'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <FileText className={`mt-1 flex-shrink-0 ${STATUS_STYLES[doc.status as keyof typeof STATUS_STYLES]?.color}`} size={24} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {DOCUMENT_TYPES[doc.documentType as keyof typeof DOCUMENT_TYPES]?.label}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[doc.status as keyof typeof STATUS_STYLES]?.color} ${STATUS_STYLES[doc.status as keyof typeof STATUS_STYLES]?.bg}`}>
                              {STATUS_STYLES[doc.status as keyof typeof STATUS_STYLES]?.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{DOCUMENT_TYPES[doc.documentType as keyof typeof DOCUMENT_TYPES]?.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Uploaded</p>
                              <p className="font-medium text-gray-900">{formatDate(doc.createdAt)}</p>
                            </div>
                            {doc.status === 'rejected' && doc.rejectionReason && (
                              <div className="col-span-2">
                                <p className="text-gray-600">Rejection Reason</p>
                                <p className="font-medium text-red-600">{doc.rejectionReason}</p>
                              </div>
                            )}
                            {doc.status === 'approved' && doc.adminReviewedAt && (
                              <div>
                                <p className="text-gray-600">Approved</p>
                                <p className="font-medium text-gray-900">{formatDate(doc.adminReviewedAt)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="View document"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upload Section */}
          <Card className="bg-white shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ID Document Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {DOCUMENT_TYPES.id_copy.label}
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">{DOCUMENT_TYPES.id_copy.description}</p>
                <div
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => idDocumentRef.current?.click()}
                >
                  <FileText className="mx-auto mb-2 text-blue-400" size={32} />
                  {selectedFiles.idDocument ? (
                    <>
                      <p className="font-medium text-gray-900">{selectedFiles.idDocument.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFiles.idDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF or WEBP (max. 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={idDocumentRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect('idDocument', e.target.files?.[0] || null)}
                />
              </div>

              {/* Selfie Document Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {DOCUMENT_TYPES.selfie_with_id.label}
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">{DOCUMENT_TYPES.selfie_with_id.description}</p>
                <div
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => selfieDocumentRef.current?.click()}
                >
                  <FileText className="mx-auto mb-2 text-blue-400" size={32} />
                  {selectedFiles.selfieDocument ? (
                    <>
                      <p className="font-medium text-gray-900">{selectedFiles.selfieDocument.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFiles.selfieDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF or WEBP (max. 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={selfieDocumentRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect('selfieDocument', e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading || (!selectedFiles.idDocument && !selectedFiles.selfieDocument)}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Documents
                </>
              )}
            </Button>
          </Card>

          {/* Requirements Info */}
          <Card className="bg-blue-50 shadow-md p-8 mt-8 border-l-4 border-blue-600">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Document Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✓ Before Upload</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Ensure document is clear and readable</li>
                  <li>• Use supported image formats (JPG, PNG, GIF, WebP)</li>
                  <li>• Keep file size under 10MB</li>
                  <li>• Make sure your face is clearly visible (for selfie)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✓ Processing</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Documents are reviewed manually by our team</li>
                  <li>• Typically processed within 24-48 hours</li>
                  <li>• You&apos;ll be notified of approval or rejection</li>
                  <li>• Resubmit if additional supplements are requested</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

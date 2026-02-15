'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  FileText,
  TrendingUp,
} from 'lucide-react';

export default function UpgradeSuccessPage() {
  const applicationRef = 'APP-1739523600-ABC1234';
  const selectedType = 'income-qualified'; // 또는 'experienced'
  const estimatedReviewTime = '1-3 영업일';

  const typeInfo = {
    'income-qualified': {
      title: '소득 적격 투자자',
      icon: '📈',
      newLimit: '1,000만원',
      benefits: [
        '투자 한도 상향 (연 1,000만원)',
        '우수 상품 우선 배치',
        '높은 수익률 상품 접근 가능',
        '전용 투자 상담 지원',
      ],
    },
    'experienced': {
      title: '경험 많은 투자자',
      icon: '⭐',
      newLimit: '2,000만원',
      benefits: [
        '투자 한도 상향 (연 2,000만원)',
        '프리미엄 상품 접근 가능',
        '전용 투자 컨설팅 제공',
        '우선 상품 정보 제공',
      ],
    },
  };

  const info = typeInfo[selectedType as keyof typeof typeInfo] || typeInfo['income-qualified'];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        {/* Success Card */}
        <div className="mb-8">
          <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">신청이 접수되었습니다</h1>
            <p className="text-gray-600 mb-6">
              투자자 등급 상향 신청이 성공적으로 접수되었습니다.
            </p>

            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <p className="text-gray-600 text-sm mb-2">신청 번호</p>
              <p className="font-mono text-2xl font-bold text-blue-600 break-all">{applicationRef}</p>
            </div>

            <p className="text-sm text-gray-600 italic">
              이 번호로 신청 진행 상황을 확인할 수 있습니다. 안전히 보관하세요.
            </p>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">심사 일정</h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="w-1 h-12 bg-green-600 mt-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-gray-900">신청 접수 완료</h3>
                <p className="text-sm text-gray-600 mt-1">2024-02-14 10:30</p>
                <p className="text-sm text-gray-700 mt-2">
                  {info.title} 상향 신청이 접수되었습니다. 제출된 서류를 검토하고 있습니다.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  ⏱
                </div>
                <div className="w-1 h-12 bg-gray-300 mt-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-gray-900">서류 심사</h3>
                <p className="text-sm text-gray-600 mt-1">진행 중 - 예상 완료: {estimatedReviewTime}</p>
                <p className="text-sm text-gray-700 mt-2">
                  제출하신 서류가 검토 중입니다. 1-3 영업일 내 결과를 통보하겠습니다.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold text-lg">
                  📧
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">결과 통보</h3>
                <p className="text-sm text-gray-600 mt-1">대기 중</p>
                <p className="text-sm text-gray-700 mt-2">
                  심사 완료 후 이메일 및 SMS로 결과를 통보할 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Info */}
        <Card className="p-6 mb-8 bg-blue-50 border border-blue-200">
          <div className="flex gap-4">
            <AlertCircle size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">중요 안내</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 심사 결과는 등록된 이메일과 휴대폰으로 통보됩니다</li>
                <li>• 제출된 서류가 부실하거나 요구사항을 충족하지 않을 경우 승인이 거절될 수 있습니다</li>
                <li>• 거절된 경우, 60일 후 재신청할 수 있습니다</li>
                <li>• 신청 번호로 진행 상황을 언제든 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Expected Benefits */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-600" />
            승인 시 제공 혜택
          </h2>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 text-sm mb-2">새로운 투자 한도</p>
            <h3 className="text-3xl font-bold text-green-600">{info.newLimit}</h3>
            <p className="text-sm text-gray-600 mt-2">기존: 500만원 / 연</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {info.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">다음 단계</h2>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h3 className="font-semibold text-gray-900">심사 결과 기다리기</h3>
                <p className="text-sm text-gray-600 mt-1">
                  1-3 영업일 내 심사 결과를 통보하겠습니다. 이메일과 SMS를 확인해주세요.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h3 className="font-semibold text-gray-900">등급 활성화</h3>
                <p className="text-sm text-gray-600 mt-1">
                  심사 승인 후 새로운 투자자 등급이 자동으로 활성화됩니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h3 className="font-semibold text-gray-900">투자 시작</h3>
                <p className="text-sm text-gray-600 mt-1">
                  새로운 한도로 더 많은 상품에 투자할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6 mb-8 bg-yellow-50 border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-4">문의하기</h3>
          <p className="text-sm text-gray-700 mb-3">
            신청 후 궁금한 점이 있으신가요? 다음 방법으로 문의하실 수 있습니다.
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>📧 이메일: support@finnova.com</p>
            <p>📞 전화: 1644-1234 (평일 09:00-18:00)</p>
            <p>💬 카카오톡: @핀노바</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/dashboard/investments" className="flex-1">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3">
              <TrendingUp size={18} className="mr-2" />
              투자 대시보드로
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold py-3">
              <Home size={18} className="mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* Application Details (collapsible) */}
        <Card className="p-6 mt-8 bg-gray-50">
          <details className="cursor-pointer">
            <summary className="font-semibold text-gray-900 flex items-center gap-2">
              <span>📋 신청 상세 정보</span>
            </summary>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">신청 등급</span>
                <span className="font-medium text-gray-900">{info.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">신청일</span>
                <span className="font-medium text-gray-900">2024-02-14 10:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예상 심사 완료</span>
                <span className="font-medium text-gray-900">2024-02-17</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock size={14} />
                  심사 중
                </span>
              </div>
            </div>
          </details>
        </Card>
      </div>
    </Layout>
  );
}

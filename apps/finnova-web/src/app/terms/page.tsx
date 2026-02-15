'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';
import { ChevronDown } from 'lucide-react';

interface TermsSection {
  id: string;
  title: string;
  content: string;
}

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['service']);

  const termsSections: TermsSection[] = [
    {
      id: 'service',
      title: '서비스 이용약관',
      content: `제1장 총칙

제1조 (목적)
본 약관은 핀노바 주식회사(이하 "회사")가 제공하는 온라인 금융 서비스의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
1. "서비스"란 회사가 제공하는 온라인 금융 플랫폼 및 이를 통해 제공되는 모든 서비스를 말합니다.
2. "이용자"란 회사의 서비스를 이용하는 개인 또는 법인을 말합니다.
3. "회원"이란 본 약관에 동의하고 회사에 회원가입을 한 이용자를 말합니다.

제2장 이용약관의 효력 및 변경

제3조 (약관의 효력)
본 약관은 회원가입 시 동의하면 이용자와 회사 간에 법적 구속력을 가집니다.

제4조 (약관의 변경)
회사는 필요한 경우 사전 공지를 통해 본 약관을 변경할 수 있습니다. 변경된 약관은 공지일로부터 7일 후 효력을 발생합니다.

제3장 서비스의 이용신청 및 이용계약 체결

제5조 (이용신청)
이용자가 서비스를 이용하려면 회원가입을 신청해야 합니다. 회원가입에 필요한 정보는 회사가 정한 양식에 따라 입력해야 합니다.

제6조 (가입 거절)
회사는 다음 경우에 가입신청을 거절할 수 있습니다:
1. 실명이 아닌 경우
2. 이전에 본 서비스 이용약관 위반으로 강제탈퇴된 경우
3. 기타 회사가 정한 기준에 미치지 못하는 경우`,
    },
    {
      id: 'privacy',
      title: '개인정보처리방침',
      content: `1. 개인정보의 수집 및 이용

회사는 다음의 목적을 위해 개인정보를 수집 및 이용합니다:
- 서비스 제공 및 계약 이행
- 회원관리 및 본인확인
- 서비스 개선 및 신규 서비스 개발
- 마케팅 및 이용자 분석
- 관계법령에 따른 의무 이행

2. 수집하는 개인정보의 항목

회사는 다음의 개인정보를 수집합니다:
- 필수정보: 성명, 생년월일, 휴대폰번호, 이메일, 주소
- 선택정보: 직업, 관심사항, 혼인상태 등
- 금융정보: 계좌번호, 신용등급 정보

3. 개인정보의 보유 및 이용기간

수집된 개인정보는 다음 기간 동안 보유 및 이용됩니다:
- 회원탈퇴 시까지 (단, 관계법령에서 정한 기간은 그 기간)
- 금융거래 기록: 5년
- 전자금융거래 기록: 5년`,
    },
    {
      id: 'investment',
      title: '온라인투자연계금융 이용약관',
      content: `온라인투자연계금융의 이용약관

제1조 (목적)
본 약관은 온라인투자연계금융법(이하 "법")에 따라 투자자와 핀노바 주식회사(이하 "회사") 간에 체결되는 온라인투자연계금융의 이용 조건과 절차, 회사와 투자자의 권리 및 의무 등을 규정합니다.

제2조 (정의)
본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
1. "투자자"는 온라인투자연계금융에 참여하는 자연인 또는 법인입니다.
2. "차입자"는 온라인투자연계금융을 통해 자금을 차입하는 자입니다.
3. "크라우드펀딩"은 온라인 플랫폼을 통해 다수의 투자자로부터 자금을 조성하는 것입니다.

제3조 (투자자 자격)
1. 투자자는 다음 중 하나에 해당해야 합니다:
   - 만 18세 이상의 대한민국 국민
   - 대한민국에 등록된 법인
   - 외국인 (현지법 허용 범위 내)

2. 투자한도:
   - 일반투자자: 플랫폼당 연간 5,000만원
   - 소득적격투자자: 플랫폼당 연간 1억원
   - 경험많은투자자: 플랫폼당 연간 2억원`,
    },
    {
      id: 'loan',
      title: '온라인대출 이용약관',
      content: `온라인대출 이용약관

제1조 (목적)
본 약관은 핀노바 주식회사(이하 "회사")가 제공하는 온라인 대출 서비스의 이용 조건과 절차를 규정합니다.

제2조 (서비스 개요)
회사는 다음의 대출 상품을 제공합니다:
- 부동산담보 대출
- 신용대출
- 사업자 대출

제3조 (대출신청)
1. 대출신청자는 회사가 정한 양식에 따라 신청해야 합니다.
2. 필요한 서류를 제출해야 합니다.
3. 신청 정보는 정확해야 합니다.

제4조 (신청자격)
1. 대출신청자는 만 18세 이상이어야 합니다.
2. 신용도 기준을 만족해야 합니다.
3. 기타 회사가 정한 기준을 충족해야 합니다.`,
    },
    {
      id: 'transaction',
      title: '전자금융거래 이용약관',
      content: `전자금융거래 이용약관

제1조 (목적)
본 약관은 「전자금융거래법」에 따라 핀노바 주식회사(이하 "회사")가 제공하는 전자금융서비스의 이용 조건과 절차를 규정합니다.

제2조 (정의)
1. "전자금융거래"란 이용자가 전자적 방법으로 금융거래를 하는 것입니다.
2. "전자금융서비스"란 회사가 제공하는 인터넷뱅킹, 계좌이체, 결제 등의 서비스입니다.

제3조 (서비스 제공)
회사는 다음의 전자금융서비스를 제공합니다:
- 가상계좌 서비스
- 계좌이체 서비스
- 결제 대행 서비스
- 거래 정보 조회 서비스

제4조 (보안)
1. 이용자는 비밀번호를 안전하게 관리해야 합니다.
2. 이용자는 거래 후 로그아웃해야 합니다.
3. 의심거래는 즉시 신고해야 합니다.`,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">약관 및 정책</h1>
          <p className="text-lg text-gray-600">
            핀노바 서비스 이용을 위한 모든 약관과 정책을 한 곳에서 확인하세요
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4">
          {termsSections.map((section) => (
            <Card
              key={section.id}
              className="overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors"
            >
              {/* Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900 text-left">{section.title}</h2>
                <ChevronDown
                  className={`w-6 h-6 text-gray-400 transform transition-transform ${
                    expandedSections.includes(section.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Content */}
              {expandedSections.includes(section.id) && (
                <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      동의합니다
                    </Button>
                    <Button variant="outline" className="flex-1">
                      다운로드
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">약관에 동의하시겠습니까?</h3>
          <div className="flex flex-col space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              모든 약관에 동의하고 진행
            </Button>
            <Button variant="outline" className="w-full">
              취소
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">약관에 대한 궁금한 사항이 있으신가요?</p>
          <Button variant="outline">고객 지원팀 연락하기</Button>
        </div>
      </div>
    </Layout>
  );
}
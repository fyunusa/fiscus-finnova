'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { X, Eye, MessageSquare, Heart, Share2, Calendar, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  category: 'notice' | 'event' | 'update' | 'maintenance';
  date: string;
  views: number;
  likes: number;
  comments: number;
  excerpt: string;
  fullContent: string;
  image?: string;
}

const CATEGORIES = [
  { id: 'all', label: '전체', emoji: '📢' },
  { id: 'notice', label: '공지사항', emoji: '📋' },
  { id: 'event', label: '이벤트', emoji: '🎉' },
  { id: 'update', label: '업데이트', emoji: '✨' },
  { id: 'maintenance', label: '점검', emoji: '🔧' },
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: '2월 투자상품 신규 출시 안내',
    category: 'notice',
    date: '2026-02-15',
    views: 1234,
    likes: 89,
    comments: 12,
    excerpt: '더 나은 수익을 원하시는 투자자분들을 위해 새로운 상품이 출시되었습니다.',
    fullContent: `안녕하세요, 핀노바입니다.

더 나은 수익을 원하시는 투자자분들을 위해 새로운 상품이 출시되었습니다.

📊 신규 상품 안내
- 상품명: 강남 프리미엄 오피스텔 담보대출
- 연이율: 9.5%
- 투자기간: 12개월
- 모집금액: 5억원
- 최소투자: 100만원

🎯 특징
- 프리미엄 입지의 오피스텔 담보
- 안정적인 현금흐름
- 높은 담보인정가액 비율 (LTV 70%)

💰 기대수익률
- 연 9.5% 이상 기대 가능
- 월 정기 배당금 지급

자세한 내용은 투자상품 페이지에서 확인하실 수 있습니다.

감사합니다.`,
  },
  {
    id: '2',
    title: '신년 이벤트: 신규 투자자 100% 캐시백!',
    category: 'event',
    date: '2026-02-10',
    views: 5678,
    likes: 234,
    comments: 45,
    excerpt: '신규 투자자분들을 위한 특별한 신년 이벤트를 준비했습니다.',
    fullContent: `🎊 신년 특별 이벤트 🎊

신규 투자자분들을 위한 특별한 신년 이벤트를 준비했습니다!

🎁 이벤트 내용
- 기간: 2026.02.01 ~ 2026.02.28
- 신규 투자자 가입 후 첫 투자 시 투자금액의 100% 캐시백
- 최대 캐시백: 1,000,000원

📋 참여 방법
1. 신규 회원가입 (링크)
2. 본인확인 완료
3. 투자상품 선택 및 투자
4. 자동으로 캐시백 지급 (영업일 기준 3일 이내)

⚠️ 유의사항
- 신규 가입자만 참여 가능
- 최소 투자액: 100만원 이상
- 이벤트 중복 참여 불가
- 취소 시 캐시백 회수

더 많은 정보는 이벤트 페이지를 참고해주세요.`,
  },
  {
    id: '3',
    title: '시스템 정기 점검 안내 (2월 20일)',
    category: 'maintenance',
    date: '2026-02-12',
    views: 3456,
    likes: 123,
    comments: 28,
    excerpt: '더 나은 서비스 제공을 위해 시스템 정기 점검을 실시합니다.',
    fullContent: `시스템 정기 점검 안내

더 나은 서비스 제공을 위해 시스템 정기 점검을 실시합니다.

⏰ 점검 일시
- 일시: 2026년 2월 20일 (목요일)
- 시간: 23:00 ~ 06:00 (예상 시간)

🔧 점검 내용
- 서버 업그레이드
- 데이터베이스 최적화
- 보안 강화
- 성능 개선

⚠️ 점검 중 안내
- 서비스 이용이 불가능합니다
- 투자/대출 신청이 불가능합니다
- 거래는 가능합니다 (별도 공지 참고)

불편을 드려 죄송하며, 더 좋은 서비스로 돌아오겠습니다.

감사합니다.`,
  },
  {
    id: '4',
    title: '앱 v2.5.0 업데이트 릴리즈',
    category: 'update',
    date: '2026-02-08',
    views: 2345,
    likes: 156,
    comments: 34,
    excerpt: '더 빠르고 안전한 거래를 위한 앱 업데이트가 출시되었습니다.',
    fullContent: `앱 v2.5.0 업데이트 릴리즈

더 빠르고 안전한 거래를 위한 앱 업데이트가 출시되었습니다.

✨ 주요 업데이트 사항
- 거래 속도 30% 향상
- 새로운 대시보드 디자인
- 지문/얼굴 인식 로그인 추가
- 다크모드 지원
- 버그 수정 및 성능 개선

🎯 개선 사항
1. 투자 필터링 옵션 확대
2. 대출 신청 프로세스 단순화
3. 거래 내역 검색 기능 추가
4. 공지사항 알림 개선

다운로드 링크: App Store / Google Play

업데이트에 참여해주셔서 감사합니다!`,
  },
  {
    id: '5',
    title: '개인정보 보호 정책 업데이트',
    category: 'notice',
    date: '2026-02-05',
    views: 1890,
    likes: 67,
    comments: 15,
    excerpt: '더 강화된 개인정보 보호정책이 적용됩니다.',
    fullContent: `개인정보 보호 정책 업데이트

더 강화된 개인정보 보호정책이 적용됩니다.

📋 변경 사항
- 적용일: 2026년 3월 1일
- 암호화 강도 상향 (AES-256)
- 데이터 보유 기간 단축
- 제3자 공유 금지 강화

🔒 보안 개선
- 2단계 인증 의무화
- 생체 인증 추가 지원
- 거래 알림 실시간 제공

📄 자세한 내용은 약관 페이지에서 확인하세요.`,
  },
];

export default function AnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(DEMO_ANNOUNCEMENTS[0]);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filteredAnnouncements =
    selectedCategory === 'all'
      ? DEMO_ANNOUNCEMENTS
      : DEMO_ANNOUNCEMENTS.filter((ann) => ann.category === selectedCategory);

  const toggleLike = (id: string) => {
    const newLiked = new Set(liked);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLiked(newLiked);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">공지사항 & 이벤트</h1>
          <p className="text-gray-600">핀노바의 최신 소식을 한눈에 확인하세요</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements List */}
          <div className="lg:col-span-1">
            <div className="space-y-3 max-h-screen overflow-y-auto pr-2">
              {filteredAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedAnnouncement?.id === announcement.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <div className="space-y-2">
                    {/* Category Badge */}
                    <Badge
                      className={`text-xs font-semibold w-fit ${
                        announcement.category === 'notice'
                          ? 'bg-blue-100 text-blue-800'
                          : announcement.category === 'event'
                            ? 'bg-purple-100 text-purple-800'
                            : announcement.category === 'update'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {announcement.category === 'notice'
                        ? '📋 공지'
                        : announcement.category === 'event'
                          ? '🎉 이벤트'
                          : announcement.category === 'update'
                            ? '✨ 업데이트'
                            : '🔧 점검'}
                    </Badge>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {announcement.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-gray-600 line-clamp-2">{announcement.excerpt}</p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(announcement.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {announcement.views}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Announcement Detail Modal */}
          <div className="lg:col-span-2">
            {selectedAnnouncement ? (
              <Card className="border-2 border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      className={`text-xs font-semibold ${
                        selectedAnnouncement.category === 'notice'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedAnnouncement.category === 'event'
                            ? 'bg-purple-100 text-purple-800'
                            : selectedAnnouncement.category === 'update'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {selectedAnnouncement.category === 'notice'
                        ? '📋 공지'
                        : selectedAnnouncement.category === 'event'
                          ? '🎉 이벤트'
                          : selectedAnnouncement.category === 'update'
                            ? '✨ 업데이트'
                            : '🔧 점검'}
                    </Badge>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">{selectedAnnouncement.title}</h2>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedAnnouncement.date).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      조회 {selectedAnnouncement.views}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">
                    {selectedAnnouncement.fullContent}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t pt-6 flex items-center justify-between">
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleLike(selectedAnnouncement.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          liked.has(selectedAnnouncement.id)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked.has(selectedAnnouncement.id) ? 'fill-current' : ''}`} />
                        {selectedAnnouncement.likes + (liked.has(selectedAnnouncement.id) ? 1 : 0)}
                      </button>

                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        댓글 {selectedAnnouncement.comments}
                      </button>

                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Share2 className="w-4 h-4" />
                        공유
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-2 border-gray-200 p-12 text-center">
                <p className="text-gray-500">공지사항을 선택해주세요</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

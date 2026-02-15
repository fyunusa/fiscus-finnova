'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Input } from '@/components/ui';
import { Plus, MessageSquare, Clock, AlertCircle, CheckCircle, Search, ChevronRight } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: 'account' | 'investment' | 'loan' | 'technical' | 'other';
  status: 'open' | 'pending' | 'closed';
  date: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  fullMessage: string;
  replies: number;
  lastReply: string;
}

const CATEGORIES = [
  { id: 'all', label: '전체', emoji: '📩' },
  { id: 'account', label: '계정 문제', emoji: '👤' },
  { id: 'investment', label: '투자', emoji: '💰' },
  { id: 'loan', label: '대출', emoji: '🏦' },
  { id: 'technical', label: '기술 문제', emoji: '🔧' },
  { id: 'other', label: '기타', emoji: '📋' },
];

const DEMO_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    subject: '투자금 출금이 안 됩니다',
    category: 'investment',
    status: 'pending',
    date: '2026-02-14',
    priority: 'high',
    description: '어제 신청한 투자금 100만원이 아직 출금되지 않았습니다.',
    fullMessage: `안녕하세요,

어제 신청한 투자금 100만원이 아직 출금되지 않았습니다. 계좌 확인을 부탁드립니다.

신청 정보:
- 신청일: 2026-02-13 15:30
- 금액: 1,000,000원
- 출금 계좌: 신한은행 xxx-xxx-xxxx

빠른 처리 부탁드립니다.`,
    replies: 2,
    lastReply: '2026-02-14 09:30 (담당자)',
  },
  {
    id: 'TKT-002',
    subject: '로그인 비밀번호 리셋이 필요합니다',
    category: 'account',
    status: 'open',
    date: '2026-02-13',
    priority: 'high',
    description: '비밀번호를 잊어버려서 리셋이 필요합니다.',
    fullMessage: `비밀번호를 잊어버려서 리셋이 필요합니다. 메일로 리셋 링크를 보내주세요.

등록된 이메일: user@example.com
가입일: 2025-01-15`,
    replies: 1,
    lastReply: '2026-02-13 14:20 (자동)',
  },
  {
    id: 'TKT-003',
    subject: '투자 상품이 궁금합니다',
    category: 'investment',
    status: 'closed',
    date: '2026-02-10',
    priority: 'low',
    description: '강남 오피스텔 담보대출 상품에 대해 문의드립니다.',
    fullMessage: `강남 오피스텔 담보대출 상품에 대해 문의드립니다.

몇 가지 궁금한 점이 있습니다:
1. LTV 70%는 어떻게 계산되나요?
2. 월정 배당금 지급은 언제인가요?
3. 조기 상환 시 수수료가 있나요?

자세한 설명 부탁드립니다.`,
    replies: 3,
    lastReply: '2026-02-11 10:15 (담당자)',
  },
  {
    id: 'TKT-004',
    subject: '앱이 자꾸 강제종료됩니다',
    category: 'technical',
    status: 'pending',
    date: '2026-02-11',
    priority: 'medium',
    description: 'iOS 앱이 투자 페이지에서 자꾸 강제종료됩니다.',
    fullMessage: `iOS 앱이 투자 페이지에서 자꾸 강제종료됩니다.

정보:
- 기기: iPhone 14
- iOS 버전: 17.3
- 앱 버전: 2.4.1
- 발생 상황: 특정 투자 상품 클릭 시

최근 앱 업데이트 후 문제가 생겼습니다.`,
    replies: 1,
    lastReply: '2026-02-11 16:45 (담당자)',
  },
  {
    id: 'TKT-005',
    subject: '대출 신청 서류 제출',
    category: 'loan',
    status: 'open',
    date: '2026-02-09',
    priority: 'medium',
    description: '대출 신청에 필요한 서류가 뭔가요?',
    fullMessage: `대출 신청에 필요한 서류가 뭔가요?

부동산담보대출을 신청하려고 합니다. 어떤 서류를 준비해야 하나요?

- 증명 사진
- 신분증
- 기타?

상세 리스트를 부탁드립니다.`,
    replies: 1,
    lastReply: '2026-02-09 11:20 (자동)',
  },
];

export default function TicketsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(DEMO_TICKETS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const filteredTickets = DEMO_TICKETS.filter((ticket) => {
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return '답변 대기';
      case 'pending':
        return '검토 중';
      case 'closed':
        return '완료';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '긴급';
      case 'medium':
        return '일반';
      case 'low':
        return '낮음';
      default:
        return priority;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">고객 지원</h1>
              <p className="text-gray-600">질문이나 문제를 접수하고 진행 상황을 확인하세요</p>
            </div>
            <Button
              onClick={() => setShowNewTicketForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 문의 작성
            </Button>
          </div>
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
          {/* Tickets List */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="문의 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tickets */}
            <div className="space-y-3 max-h-screen overflow-y-auto pr-2">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedTicket?.id === ticket.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="space-y-3">
                    {/* ID & Priority */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{ticket.id}</span>
                      <Badge className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </div>

                    {/* Subject */}
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {ticket.subject}
                    </h3>

                    {/* Status & Date */}
                    <div className="flex items-center justify-between text-xs">
                      <Badge className={`text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <span className="text-gray-500">{ticket.date}</span>
                    </div>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.replies} 댓글
                      </span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ticket Detail Modal */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="border-2 border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm opacity-90 mb-2">{selectedTicket.id}</p>
                      <h2 className="text-3xl font-bold mb-4">{selectedTicket.subject}</h2>
                    </div>
                    <Badge className={`text-xs font-semibold ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </Badge>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {selectedTicket.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityLabel(selectedTicket.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {selectedTicket.replies} 댓글
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">원문</h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selectedTicket.fullMessage}
                    </div>
                  </div>

                  {/* Reply Info */}
                  <div className="mb-8 pb-8 border-b">
                    <h3 className="font-semibold text-gray-900 mb-3">최근 답변</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">{selectedTicket.lastReply}</p>
                      <p className="text-sm text-gray-700">
                        {selectedTicket.status === 'closed'
                          ? '문제가 해결되었습니다. 추가 질문이 있으시면 새로운 문의를 작성해주세요.'
                          : selectedTicket.status === 'pending'
                            ? '담당자가 검토 중입니다. 곧 답변드리겠습니다.'
                            : '담당자가 답변을 준비 중입니다.'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {selectedTicket.status !== 'closed' && (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                        답변 달기
                      </Button>
                    )}
                    <Button variant="outline" className="px-6 py-2 border border-gray-300 rounded-lg">
                      문의 종료
                    </Button>
                    <Button variant="outline" className="px-6 py-2 border border-gray-300 rounded-lg">
                      편집
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-2 border-gray-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">문의를 선택해주세요</p>
              </Card>
            )}
          </div>
        </div>

        {/* New Ticket Modal */}
        {showNewTicketForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">새 문의 작성</h2>
                <button
                  onClick={() => setShowNewTicketForm(false)}
                  className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    카테고리 *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.slice(1).map((cat) => (
                      <button
                        key={cat.id}
                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left text-sm font-medium"
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    제목 *
                  </label>
                  <Input
                    type="text"
                    placeholder="문의 제목을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    내용 *
                  </label>
                  <textarea
                    placeholder="자세한 내용을 입력하세요..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    우선순위
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'low', label: '낮음', color: 'border-blue-300 hover:bg-blue-50' },
                      { value: 'medium', label: '일반', color: 'border-orange-300 hover:bg-orange-50' },
                      { value: 'high', label: '긴급', color: 'border-red-300 hover:bg-red-50' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        className={`px-4 py-2 border-2 rounded-lg transition font-medium text-sm ${opt.color}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                    문의 제출
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewTicketForm(false)}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-lg font-medium"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

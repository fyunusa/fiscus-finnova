'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Input, Alert } from '@/components/ui';
import { Plus, MessageSquare, Clock, CheckCircle, Search, ChevronRight } from 'lucide-react';
import {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  closeInquiry,
  addComment,
  type Inquiry,
  type CreateInquiryPayload,
} from '@/services/inquiry.service';

const CATEGORIES = [
  { id: 'all', label: '전체', emoji: '📩' },
  { id: 'account', label: '계정 문제', emoji: '👤' },
  { id: 'investment', label: '투자', emoji: '💰' },
  { id: 'loan', label: '대출', emoji: '🏦' },
  { id: 'technical', label: '기술 문제', emoji: '🔧' },
  { id: 'other', label: '기타', emoji: '📋' },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Inquiry[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Inquiry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New ticket form state
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState<CreateInquiryPayload>({
    subject: '',
    message: '',
    category: 'other',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInquiries(
        selectedCategory !== 'all' ? selectedCategory : undefined,
      );
      setTickets(data);
    } catch (err) {
      setError('문의 목록을 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSelectTicket = async (ticket: Inquiry) => {
    try {
      const detail = await getInquiry(ticket.id);
      setSelectedTicket(detail);
    } catch {
      setSelectedTicket(ticket);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;

    setSubmitting(true);
    try {
      await createInquiry(newTicket);
      setShowNewTicketForm(false);
      setNewTicket({ subject: '', message: '', category: 'other', priority: 'medium' });
      await fetchTickets();
    } catch (err) {
      console.error('Failed to create inquiry:', err);
      setError('문의 생성에 실패했습니다. 로그인 여부를 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await closeInquiry(selectedTicket.id);
      setSelectedTicket(updated);
      await fetchTickets();
    } catch (err) {
      console.error('Failed to close inquiry:', err);
    }
  };

  const handleEditStart = () => {
    if (!selectedTicket) return;
    setEditSubject(selectedTicket.subject);
    setEditMessage(selectedTicket.message);
    setEditMode(true);
  };

  const handleEditSave = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await updateInquiry(selectedTicket.id, {
        subject: editSubject,
        message: editMessage,
      });
      setSelectedTicket(updated);
      setEditMode(false);
      await fetchTickets();
    } catch (err) {
      console.error('Failed to update inquiry:', err);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !commentText.trim()) return;
    setAddingComment(true);
    try {
      await addComment(selectedTicket.id, commentText);
      setCommentText('');
      // Refresh the detail
      const updated = await getInquiry(selectedTicket.id);
      setSelectedTicket(updated);
      await fetchTickets();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setAddingComment(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    return ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return '답변 대기';
      case 'pending': return '검토 중';
      case 'closed': return '완료';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '긴급';
      case 'medium': return '일반';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

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

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="space-y-3 max-h-screen overflow-y-auto pr-2">
                  {filteredTickets.length === 0 ? (
                    <Card className="p-8 text-center">
                      <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">문의가 없습니다</p>
                    </Card>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className={`p-4 cursor-pointer transition-all border-2 ${selectedTicket?.id === ticket.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                          }`}
                      onClick={() => handleSelectTicket(ticket)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">
                            {ticket.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {ticket.subject}
                        </h3>

                        <div className="flex items-center justify-between text-xs">
                          <Badge className={`text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          <span className="text-gray-500">{formatDate(ticket.createdAt)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.repliesCount} 댓글
                          </span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Card>
                  ))
                  )}
                </div>
            )}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="border-2 border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm opacity-90 mb-2">
                        {selectedTicket.id.slice(0, 8).toUpperCase()}
                      </p>
                      {editMode ? (
                        <Input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="text-xl font-bold bg-white/20 text-white border-white/30 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <h2 className="text-3xl font-bold mb-4">{selectedTicket.subject}</h2>
                      )}
                    </div>
                    <Badge className={`text-xs font-semibold ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityLabel(selectedTicket.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {selectedTicket.repliesCount} 댓글
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">원문</h3>
                    {editMode ? (
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                      />
                    ) : (
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {selectedTicket.message}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-gray-900 mb-3">댓글</h3>
                      <div className="space-y-3">
                        {selectedTicket.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-4 rounded-lg border ${comment.isAdminReply
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">
                                {comment.isAdminReply ? '담당자' : comment.user?.name || '사용자'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="mb-8 pb-8 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3">답변 달기</h3>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="답변을 입력하세요..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 mb-3"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addingComment}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                      >
                        {addingComment ? '전송 중...' : '답변 전송'}
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {editMode ? (
                      <>
                        <Button
                          onClick={handleEditSave}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => setEditMode(false)}
                          variant="outline"
                          className="px-6 py-2 border border-gray-300 rounded-lg"
                        >
                          취소
                        </Button>
                      </>
                    ) : (
                      <>
                          {selectedTicket.status !== 'closed' && (
                            <Button
                              onClick={handleCloseTicket}
                              variant="outline"
                              className="px-6 py-2 border border-gray-300 rounded-lg"
                            >
                              문의 종료
                            </Button>
                          )}
                          <Button
                            onClick={handleEditStart}
                            variant="outline"
                            className="px-6 py-2 border border-gray-300 rounded-lg"
                          >
                            편집
                          </Button>
                      </>
                    )}
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
                        onClick={() => setNewTicket({ ...newTicket, category: cat.id })}
                        className={`p-3 border-2 rounded-lg transition text-left text-sm font-medium ${newTicket.category === cat.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                          }`}
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
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
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
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
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
                        onClick={() => setNewTicket({ ...newTicket, priority: opt.value })}
                        className={`px-4 py-2 border-2 rounded-lg transition font-medium text-sm ${newTicket.priority === opt.value
                            ? 'ring-2 ring-blue-500 ' + opt.color
                            : opt.color
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleCreateTicket}
                    disabled={!newTicket.subject.trim() || !newTicket.message.trim() || submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    {submitting ? '제출 중...' : '문의 제출'}
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

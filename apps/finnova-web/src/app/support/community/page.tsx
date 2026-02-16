'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Input } from '@/components/ui';
import Link from 'next/link';

interface CommunityPost {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  likes: number;
  lastActivity: string;
  avatar: string;
  excerpt: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setPosts([
        {
          id: '1',
          title: '투자 포트폴리오 관리 팁을 공유합니다',
          author: '투자자A',
          category: 'tips',
          replies: 24,
          views: 512,
          likes: 48,
          lastActivity: '2시간 전',
          avatar: '👤',
          excerpt: '오래된 투자 경험을 바탕으로 효과적인 포트폴리오 관리 방법을 공유합니다...',
        },
        {
          id: '2',
          title: '대출 상환 기간 연장 가능한가요?',
          author: '대출자B',
          category: 'loan',
          replies: 8,
          views: 156,
          likes: 12,
          lastActivity: '3시간 전',
          avatar: '👤',
          excerpt: '현재 대출 상품의 상환 기간을 연장할 수 있는지 알고 싶습니다...',
        },
        {
          id: '3',
          title: '투자 수익이 기대보다 적네요',
          author: '투자자C',
          category: 'investment',
          replies: 15,
          views: 287,
          likes: 31,
          lastActivity: '5시간 전',
          avatar: '👤',
          excerpt: '작년 대비 올해 투자 수익률이 낮아진 것 같습니다. 다른 분들은 어떠신가요?',
        },
        {
          id: '4',
          title: '새로운 상품 추천받습니다',
          author: '초보자D',
          category: 'tips',
          replies: 19,
          views: 403,
          likes: 42,
          lastActivity: '6시간 전',
          avatar: '👤',
          excerpt: '투자 초보자입니다. 초보자 친화적인 상품 추천받을 수 있을까요?',
        },
        {
          id: '5',
          title: '앱 오류 보고합니다',
          author: '사용자E',
          category: 'bug',
          replies: 5,
          views: 89,
          likes: 3,
          lastActivity: '8시간 전',
          avatar: '👤',
          excerpt: '대시보드 로딩 중 간헐적으로 오류가 발생합니다...',
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const categories = [
    { id: 'all', name: '전체', icon: '📋', color: 'gray' },
    { id: 'investment', name: '투자', icon: '📈', color: 'green' },
    { id: 'loan', name: '대출', icon: '💰', color: 'blue' },
    { id: 'tips', name: '팁/노하우', icon: '💡', color: 'yellow' },
    { id: 'bug', name: '버그 신고', icon: '🐛', color: 'red' },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'investment': return 'bg-green-100 text-green-800';
      case 'loan': return 'bg-blue-100 text-blue-800';
      case 'tips': return 'bg-yellow-100 text-yellow-800';
      case 'bug': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📋';
  };

  const breadcrumbItems = [
      { label: '홈', href: '/' },
      { label: '지원', href: '/support' },
      { label: '커뮤니티', href: '#' },
    ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.href}>
                  {index > 0 && <span className="text-gray-300">/</span>}
                  <Link
                    href={item.href}
                    className={index === breadcrumbItems.length - 1 
                      ? "text-blue-600 font-medium" 
                      : "hover:text-gray-700"
                    }
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
                <p className="mt-2 text-gray-600">
                  피스커스 커뮤니티에서 경험을 나누고 질문하세요
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                새 글 작성
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">총 게시글</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">1,247</p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </Card>
            <Card className="bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">활성 회원</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">3,842</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </Card>
            <Card className="bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">오늘 답변</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
                </div>
                <div className="text-4xl">💬</div>
              </div>
            </Card>
            <Card className="bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">평균 응답 시간</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">42분</p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                검색
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">로딩 중...</span>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-white shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                        {post.avatar}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{post.excerpt}</p>
                        </div>
                        <Badge className={`flex-shrink-0 ml-2 ${getCategoryColor(post.category)}`}>
                          {getCategoryIcon(post.category)} {categories.find(c => c.id === post.category)?.name}
                        </Badge>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>작성자: {post.author}</span>
                        <span>·</span>
                        <span>{post.lastActivity}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 flex items-center gap-6 ml-4 text-right">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{post.replies}</p>
                        <p className="text-xs text-gray-500">답변</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{post.views}</p>
                        <p className="text-xs text-gray-500">조회</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">❤️ {post.likes}</p>
                        <p className="text-xs text-gray-500">좋아요</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="bg-white shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  다른 검색어나 카테고리를 시도해보세요
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  전체 보기
                </Button>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredPosts.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 {filteredPosts.length}개 글 중 1-{Math.min(5, filteredPosts.length)}개 표시
              </p>
              <div className="flex gap-2">
                <Button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  이전
                </Button>
                <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  1
                </Button>
                <Button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Sliders,
  Heart,
  TrendingUp,
  Home,
  CreditCard,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  type: 'apartment' | 'credit-card' | 'business-loan';
  rate: number;
  period: number;
  fundingGoal: number;
  fundingCurrent: number;
  minInvestment: number;
  borrowerType: string;
  status: 'recruiting' | 'funding' | 'ending-soon' | 'closed';
  badge?: string;
  createdAt?: Date;
}

const MOCK_PRODUCTS: Product[] = [
  // Apartment products
  {
    id: 'apt-001',
    title: '강남구 아파트 담보 대출',
    type: 'apartment',
    rate: 8.5,
    period: 12,
    fundingGoal: 100000000,
    fundingCurrent: 75000000,
    minInvestment: 1000000,
    borrowerType: '개인',
    status: 'funding',
    badge: '인기',
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 'apt-002',
    title: '서초동 빌라 담보 대출',
    type: 'apartment',
    rate: 7.8,
    period: 18,
    fundingGoal: 80000000,
    fundingCurrent: 20000000,
    minInvestment: 2000000,
    borrowerType: '개인',
    status: 'recruiting',
    badge: '신규',
    createdAt: new Date('2024-12-20'),
  },
  {
    id: 'apt-003',
    title: '목동 재건축 아파트 대출',
    type: 'apartment',
    rate: 9.2,
    period: 24,
    fundingGoal: 150000000,
    fundingCurrent: 145000000,
    minInvestment: 5000000,
    borrowerType: '법인',
    status: 'ending-soon',
    badge: '마감임박',
    createdAt: new Date('2024-12-01'),
  },

  // Credit card products
  {
    id: 'cc-001',
    title: '골프용품 쇼핑몰 신용카드 외상채권',
    type: 'credit-card',
    rate: 9.5,
    period: 6,
    fundingGoal: 50000000,
    fundingCurrent: 42000000,
    minInvestment: 1000000,
    borrowerType: '개인사업자',
    status: 'funding',
    badge: '고수익',
    createdAt: new Date('2024-12-10'),
  },
  {
    id: 'cc-002',
    title: '뷰티샵 체인 신용카드 외상채권',
    type: 'credit-card',
    rate: 8.2,
    period: 9,
    fundingGoal: 40000000,
    fundingCurrent: 15000000,
    minInvestment: 500000,
    borrowerType: '개인사업자',
    status: 'recruiting',
    badge: '신규',
    createdAt: new Date('2024-12-18'),
  },
  {
    id: 'cc-003',
    title: '카페 프랜차이즈 신용카드 외상채권',
    type: 'credit-card',
    rate: 10.5,
    period: 3,
    fundingGoal: 30000000,
    fundingCurrent: 28500000,
    minInvestment: 1000000,
    borrowerType: '개인사업자',
    status: 'ending-soon',
    badge: '마감임박',
    createdAt: new Date('2024-12-05'),
  },

  // Business loan products
  {
    id: 'bl-001',
    title: 'IT 스타트업 운영자금 대출',
    type: 'business-loan',
    rate: 10.5,
    period: 24,
    fundingGoal: 150000000,
    fundingCurrent: 105000000,
    minInvestment: 2000000,
    borrowerType: '법인',
    status: 'funding',
    badge: '인기',
    createdAt: new Date('2024-12-12'),
  },
  {
    id: 'bl-002',
    title: '식품제조 중소기업 설비자금',
    type: 'business-loan',
    rate: 8.8,
    period: 36,
    fundingGoal: 200000000,
    fundingCurrent: 50000000,
    minInvestment: 5000000,
    borrowerType: '법인',
    status: 'recruiting',
    badge: '신규',
    createdAt: new Date('2024-12-17'),
  },
];

export default function InvestmentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'popular' | 'new' | 'ending' | 'high'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    minRate: 5,
    maxRate: 15,
    minPeriod: 1,
    maxPeriod: 36,
    types: ['apartment', 'credit-card', 'business-loan'] as string[],
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = MOCK_PRODUCTS.filter(
      (p) =>
        p.rate >= filters.minRate &&
        p.rate <= filters.maxRate &&
        p.period >= filters.minPeriod &&
        p.period <= filters.maxPeriod &&
        filters.types.includes(p.type) &&
        (searchQuery === '' ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.borrowerType.includes(searchQuery))
    );

    // Apply tab sorting
    switch (activeTab) {
      case 'popular':
        products = products.sort((a, b) => b.fundingCurrent - a.fundingCurrent);
        break;
      case 'new':
        products = products.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
      case 'ending':
        products = products
          .filter((p) => p.status === 'ending-soon')
          .sort((a, b) => {
            const fundingPercentA = a.fundingCurrent / a.fundingGoal;
            const fundingPercentB = b.fundingCurrent / b.fundingGoal;
            return fundingPercentB - fundingPercentA;
          });
        break;
      case 'high':
        products = products.sort((a, b) => b.rate - a.rate);
        break;
    }

    return products;
  }, [activeTab, filters, searchQuery]);

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return <Home size={20} className="text-blue-600" />;
      case 'credit-card':
        return <CreditCard size={20} className="text-purple-600" />;
      case 'business-loan':
        return <Briefcase size={20} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getProductUrl = (product: Product) => {
    switch (product.type) {
      case 'apartment':
        return `/investment/apartment/${product.id}`;
      case 'credit-card':
        return `/investment/credit-card/${product.id}`;
      case 'business-loan':
        return `/investment/business-loan/${product.id}`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recruiting':
        return <Badge variant="success">모집 중</Badge>;
      case 'funding':
        return <Badge variant="info">펀딩 중</Badge>;
      case 'ending-soon':
        return <Badge variant="warning">마감 임박</Badge>;
      case 'closed':
        return <Badge variant="default">모집 완료</Badge>;
    }
  };

  const fundingPercent = (current: number, goal: number) => {
    return Math.round((current / goal) * 100);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">투자 상품</h1>
            <p className="text-blue-100">
              안정적인 수익을 제공하는 다양한 투자 상품들을 한 곳에서 만나보세요.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="상품 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Sliders size={20} />
                필터
              </button>
              <Link href="/investment/corporate-consultation">
                <Button variant="secondary">기업 컨설팅</Button>
              </Link>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 border-t">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    수익률: {filters.minRate}% ~ {filters.maxRate}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    value={filters.minRate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minRate: Math.min(Number(e.target.value), prev.maxRate),
                      }))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    투자 기간: {filters.minPeriod} ~ {filters.maxPeriod}개월
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="36"
                    value={filters.maxPeriod}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPeriod: Math.max(Number(e.target.value), prev.minPeriod),
                      }))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">상품 유형</label>
                  <div className="space-y-2">
                    {[
                      { id: 'apartment', label: '부동산 담보' },
                      { id: 'credit-card', label: '신용카드 외상' },
                      { id: 'business-loan', label: '기업대출' },
                    ].map((type) => (
                      <label key={type.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type.id as any)}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              types: e.target.checked
                                ? [...prev.types, type.id as any]
                                : prev.types.filter((t) => t !== type.id),
                            }))
                          }
                          className="rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setFilters({
                        minRate: 5,
                        maxRate: 15,
                        minPeriod: 1,
                        maxPeriod: 36,
                        types: ['apartment', 'credit-card', 'business-loan'],
                      });
                      setSearchQuery('');
                    }}
                  >
                    초기화
                  </Button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 -mx-4 px-4 overflow-x-auto">
              {[
                { id: 'popular' as const, label: '인기상품' },
                { id: 'new' as const, label: '신규상품' },
                { id: 'ending' as const, label: '마감임박' },
                { id: 'high' as const, label: '고수익' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 whitespace-nowrap font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">일치하는 상품이 없습니다.</p>
              <p className="text-gray-500 text-sm mt-2">다른 필터로 다시 시도해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const fundingPct = fundingPercent(product.fundingCurrent, product.fundingGoal);
                return (
                  <Link key={product.id} href={getProductUrl(product)}>
                    <Card className="h-full hover:shadow-lg transition cursor-pointer group">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-200 flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition">
                            {getProductIcon(product.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm">
                              {product.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">{product.borrowerType}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(product.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 transition"
                        >
                          <Heart
                            size={16}
                            className={`transition ${
                              favorites.has(product.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Rate and Period */}
                      <div className="p-4 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">연 수익률</p>
                          <p className="text-lg font-bold text-green-600">{product.rate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">기간</p>
                          <p className="text-lg font-bold text-gray-900">{product.period}M</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">최소투자</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.floor(product.minInvestment / 1000000)}만
                          </p>
                        </div>
                      </div>

                      {/* Funding Progress */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-600">펀딩 진행</p>
                          <p className="text-sm font-bold text-blue-600">{fundingPct}%</p>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${fundingPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex gap-2">
                          {getStatusBadge(product.status)}
                          {product.badge && (
                            <Badge variant={product.badge === '고수익' ? 'success' : 'info'}>
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

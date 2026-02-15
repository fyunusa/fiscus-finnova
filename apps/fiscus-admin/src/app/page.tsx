'use client';

import Link from 'next/link';

export default function AdminHome() {
  const dashboardCards = [
    {
      title: '총 투자금액',
      value: '₩2,500억',
      change: '+12.5%',
      color: 'blue',
    },
    {
      title: '활성 상품',
      value: '42건',
      change: '+3건',
      color: 'green',
    },
    {
      title: '총 투자자',
      value: '45,000명',
      change: '+2,100명',
      color: 'purple',
    },
    {
      title: '상환율',
      value: '98.2%',
      change: '+0.5%',
      color: 'blue',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">FISCUS ADMIN</h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                프로필
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-6 min-h-screen">
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-2 bg-blue-600 rounded-lg font-semibold">
              대시보드
            </Link>
            <Link href="/admin/members" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              회원 관리
            </Link>
            <Link href="/admin/products" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              상품 관리
            </Link>
            <Link href="/admin/investments" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              투자 관리
            </Link>
            <Link href="/admin/loans" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              대출 관리
            </Link>
            <Link href="/admin/repayments" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              상환 관리
            </Link>
            <Link href="/admin/reports" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              보고서
            </Link>
            <Link href="/admin/settings" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              설정
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                <p className={`text-sm font-semibold ${
                  card.color === 'blue' ? 'text-blue-600' :
                  card.color === 'green' ? 'text-green-600' :
                  'text-purple-600'
                }`}>
                  {card.change}
                </p>
              </div>
            ))}
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Investments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 투자</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">상품</th>
                    <th className="text-right py-2 text-gray-600">금액</th>
                    <th className="text-left py-2 text-gray-600">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2">상품 {i}</td>
                      <td className="text-right">₩{i * 10}M</td>
                      <td><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">완료</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Loans */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 대출</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">차입자</th>
                    <th className="text-right py-2 text-gray-600">금액</th>
                    <th className="text-left py-2 text-gray-600">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2">차입자 {i}</td>
                      <td className="text-right">₩{i * 15}M</td>
                      <td><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">진행중</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

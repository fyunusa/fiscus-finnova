'use client';

import React from 'react';
import Link from 'next/link';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { label: '대시보드', href: '/admin', icon: '📊' },
    { label: '회원 관리', href: '/admin/members', icon: '👥' },
    { label: '사업자 관리', href: '/admin/businesses', icon: '🏢' },
    { label: '펀딩 상품', href: '/admin/funding', icon: '💰' },
    { label: '대출 관리', href: '/admin/loans', icon: '🏦' },
    { label: '투자 내역', href: '/admin/investments', icon: '📈' },
    { label: '채권 관리', href: '/admin/bonds', icon: '📋' },
    { label: '배분 관리', href: '/admin/distribution', icon: '🔀' },
    { label: '입금 관리', href: '/admin/deposits', icon: '⬇️' },
    { label: '출금 관리', href: '/admin/withdrawals', icon: '⬆️' },
    { label: '세무 관리', href: '/admin/tax', icon: '📄' },
    { label: '로그', href: '/admin/logs', icon: '📝' },
    { label: '공지사항', href: '/admin/notices', icon: '📢' },
    { label: '보고서', href: '/admin/reports', icon: '📊' },
    { label: '사기 탐지', href: '/admin/fraud-detection', icon: '🚨' },
    { label: '시스템', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-gray-900 text-white overflow-y-auto transition-transform z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto`}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;

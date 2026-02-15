import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'FISCUS - 관리자 시스템',
  description: 'P2P 투자 플랫폼 관리자 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}

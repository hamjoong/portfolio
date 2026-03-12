import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import CategoryMenu from "@/components/layout/CategoryMenu";
import Footer from "@/components/layout/Footer";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hjuk Shopping Mall | 쇼핑의 새로운 진화",
  description: "최신 트렌드와 고품질 상품을 Hjuk Shopping Mall에서 만나보세요.",
};

/**
 * 애플리케이션의 최상위 레이아웃입니다.
 * [이유] 모든 페이지에 공통적으로 적용되는 헤더, 푸터, 전역 상태 공급자(Providers)를
 * 설정하여 일관된 인터페이스와 환경을 제공하기 위함입니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <CategoryMenu />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

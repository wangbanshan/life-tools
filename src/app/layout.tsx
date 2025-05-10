import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { AuthStatus } from "@/components/auth/AuthStatus";

// 使用Inter字体，这是服务器组件，不需要"use client"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "生活工具集 - 早睡早起打卡",
  description: "记录你的作息时间，养成健康的生活习惯",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container mx-auto p-4">
                <nav className="flex justify-between items-center">
                  <Link href="/" className="text-xl font-bold">生活工具集</Link>
                  <div className="flex items-center gap-4">
                    <AuthStatus />
                  </div>
                </nav>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6">
              <div className="container mx-auto text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} 生活工具集 - 保持健康的生活方式</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

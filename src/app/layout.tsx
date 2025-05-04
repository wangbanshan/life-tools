import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "生活工具集 - 早睡早起打卡",
  description: "实用工具集，让生活更美好",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container mx-auto p-4">
                <nav className="flex justify-between items-center">
                  <a href="/" className="text-xl font-bold">生活工具集</a>
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

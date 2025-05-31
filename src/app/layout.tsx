import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { NetworkStatus } from "@/components/pwa/NetworkStatus";

// 使用Inter字体，这是服务器组件，不需要"use client"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "生活工具集 - 早睡早起打卡",
  description: "记录你的作息时间，养成健康的生活习惯",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "生活工具",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="生活工具" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <NetworkStatus />
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
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}

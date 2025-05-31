"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// 扩展Navigator接口以包含standalone属性
interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 检查是否已经显示过提示或用户已拒绝
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    const lastPromptTime = localStorage.getItem('pwa-install-prompt-time');
    const now = Date.now();
    
    // 如果用户已经永久拒绝，不再显示
    if (hasSeenPrompt === 'permanent') {
      return;
    }
    
    // 如果最近24小时内显示过，不再显示
    if (lastPromptTime && (now - parseInt(lastPromptTime)) < 24 * 60 * 60 * 1000) {
      return;
    }

    // 检测iOS设备
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 检测是否已经是standalone模式
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as ExtendedNavigator).standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // 如果已经是standalone模式，不显示提示
    if (isStandaloneMode) {
      return;
    }

    // 监听beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 延迟3秒显示，避免页面加载时立即弹出
      setTimeout(() => {
        setShowInstallPrompt(true);
        localStorage.setItem('pwa-install-prompt-time', now.toString());
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 如果是iOS且不是standalone模式，延迟显示iOS安装提示
    if (isIOSDevice && !isStandaloneMode) {
      setTimeout(() => {
        setShowInstallPrompt(true);
        localStorage.setItem('pwa-install-prompt-time', now.toString());
      }, 5000); // iOS延迟5秒显示
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('用户接受了安装提示');
        localStorage.setItem('pwa-install-prompt-dismissed', 'permanent');
      } else {
        console.log('用户拒绝了安装提示');
        localStorage.setItem('pwa-install-prompt-dismissed', 'temporary');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = (permanent = false) => {
    setShowInstallPrompt(false);
    if (permanent) {
      localStorage.setItem('pwa-install-prompt-dismissed', 'permanent');
    } else {
      localStorage.setItem('pwa-install-prompt-dismissed', 'temporary');
    }
  };

  // 如果已经是standalone模式，不显示提示
  if (isStandalone) {
    return null;
  }

  // 如果不显示提示，不渲染
  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">安装生活工具集应用</h3>
            {isIOS ? (
              <p className="text-xs text-muted-foreground mb-3">
                点击 Safari 底部的分享按钮 <span className="mx-1">⬆️</span>，然后选择&ldquo;添加到主屏幕&rdquo;
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">
                将应用添加到主屏幕，获得更好的使用体验
              </p>
            )}
            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <Button size="sm" onClick={handleInstallClick} className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  安装
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => handleDismiss(false)}>
                稍后
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDismiss(true)} className="text-xs">
                不再提醒
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDismiss(false)}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 
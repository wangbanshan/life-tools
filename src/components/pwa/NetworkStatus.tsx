"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineBanner(true);
      } else {
        // 延迟隐藏横幅，让用户看到重新连接的状态
        setTimeout(() => setShowOfflineBanner(false), 3000);
      }
    };

    // 初始状态
    updateOnlineStatus();

    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!showOfflineBanner) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-white text-sm transition-all duration-300 ${
      isOnline 
        ? 'bg-green-600' 
        : 'bg-red-600'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>网络已恢复</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>网络连接已断开，部分功能可能受限</span>
          </>
        )}
      </div>
    </div>
  );
} 
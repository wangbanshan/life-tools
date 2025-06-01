"use client";

import { useAuthStore } from '@/lib/stores/useAuthStore';
import { UserAvatar } from './UserAvatar';
import { AuthButtons } from './AuthButtons';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export function AuthStatus() {
  const { user, initialize, initialized, isLoading } = useAuthStore();
  const [showContent, setShowContent] = useState(false);
  
  // 初始化认证状态
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);
  
  // 延迟显示内容，确保平滑过渡
  useEffect(() => {
    if (initialized && !isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [initialized, isLoading]);
  
  // 加载状态：始终显示头像形状的骨架屏
  if (!showContent) {
    return (
      <Skeleton className="h-9 w-9 rounded-full" />
    );
  }
  
  return (
    <div className="transition-opacity duration-300 ease-in-out">
      {user ? <UserAvatar /> : <AuthButtons />}
    </div>
  );
} 
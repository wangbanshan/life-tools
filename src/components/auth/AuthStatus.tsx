"use client";

import { useAuthStore } from '@/lib/stores/useAuthStore';
import { UserAvatar } from './UserAvatar';
import { AuthButtons } from './AuthButtons';
import { useEffect } from 'react';

export function AuthStatus() {
  const { user, initialize, initialized, isLoading } = useAuthStore();
  
  // 初始化认证状态
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);
  
  if (isLoading && !initialized) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>
    );
  }
  
  return user ? <UserAvatar /> : <AuthButtons />;
} 
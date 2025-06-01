"use client";

import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import { useState } from "react";

export function UserAvatar() {
  const { user, profile, signOut, isLoading } = useAuthStore();
  const [imageLoading, setImageLoading] = useState(true);
  
  // 如果正在加载用户信息，显示骨架屏
  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!user) return null;
  
  // 获取用户名展示
  const displayName = profile?.username || user.email || user.id.substring(0, 8);
  
  // 获取头像URL
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  
  // 获取用户名首字母作为Fallback
  const initials = displayName.charAt(0).toUpperCase();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="outline-none">
        <div className="relative h-9 w-9 flex items-center justify-center cursor-pointer">
          {imageLoading && avatarUrl && (
            <Skeleton className="absolute inset-0 h-9 w-9 rounded-full" />
          )}
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={avatarUrl || undefined} 
              alt={displayName}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              className={imageLoading ? "opacity-0" : "opacity-100 transition-opacity duration-200"}
            />
            <AvatarFallback className={imageLoading && avatarUrl ? "opacity-0" : "opacity-100"}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{displayName}</p>
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <div className="flex w-full items-center" onClick={signOut}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
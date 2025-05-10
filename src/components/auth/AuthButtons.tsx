"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { FaGoogle, FaGithub } from "react-icons/fa";

interface AuthButtonsProps {
  className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
  const { signInWithGoogle, signInWithGithub, isLoading } = useAuthStore();

  return (
    <div className={`flex gap-4 ${className || ''}`}>
      <Button
        variant="outline"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <FaGoogle className="h-4 w-4" />
        <span>谷歌登录</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={signInWithGithub}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <FaGithub className="h-4 w-4" />
        <span>GitHub 登录</span>
      </Button>
    </div>
  );
} 
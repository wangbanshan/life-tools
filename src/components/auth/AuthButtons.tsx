"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { FaGoogle, FaGithub, FaUser } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthButtonsProps {
  className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
  const { signInWithGoogle, signInWithGithub, isLoading } = useAuthStore();

  return (
    <div className={`${className || ''}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoading}
            data-auth-button
          >
            <FaUser className="h-4 w-4" />
            <span className="hidden sm:inline">登录</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaGoogle className="h-4 w-4" />
            <span>谷歌登录</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={signInWithGithub}
            disabled={isLoading}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaGithub className="h-4 w-4" />
            <span>GitHub 登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 
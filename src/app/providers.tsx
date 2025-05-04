"use client";

import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster />
    </>
  );
}

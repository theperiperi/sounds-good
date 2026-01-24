"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");

  useEffect(() => {
    if (loading) return;

    // If Supabase is not configured, allow access to auth page to show setup instructions
    if (!isConfigured && !isAuthPage) {
      router.replace("/auth");
      return;
    }

    // If not authenticated and not on auth page, redirect to auth
    if (!user && !isAuthPage && isConfigured) {
      router.replace("/auth");
      return;
    }

    // If authenticated and on auth page, redirect to learn
    if (user && isAuthPage) {
      router.replace("/learn");
      return;
    }
  }, [user, loading, isConfigured, isAuthPage, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // If not configured, only show auth page
  if (!isConfigured && !isAuthPage) {
    return null;
  }

  // If not authenticated and not on auth page, don't render
  if (!user && !isAuthPage && isConfigured) {
    return null;
  }

  // If authenticated and on auth page, don't render (will redirect)
  if (user && isAuthPage) {
    return null;
  }

  return <>{children}</>;
}

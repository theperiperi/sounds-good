"use client";

import { Navigation } from "@/components/layout/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navigation />
      <div className="pt-16">{children}</div>
    </AuthGuard>
  );
}

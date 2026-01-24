"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown, Loader2 } from "lucide-react";

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/auth">
        <Button size="sm" className="gradient-gold text-black hover:opacity-90">
          Sign In
        </Button>
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={displayName}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center text-black text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="text-sm text-foreground hidden sm:block">
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-lg bg-card border border-border shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>

          <Link
            href="/learn"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <User className="w-4 h-4" />
            My Progress
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

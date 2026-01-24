"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Piano, BookOpen, Music, PenTool, Music2 } from "lucide-react";
import { MidiStatus } from "@/components/keyboard/MidiStatus";
import { UserMenu } from "@/components/auth/UserMenu";
import { ModeToggle } from "@/components/ui/mode-toggle";

const tabs = [
  { href: "/", label: "Free Play", icon: Piano },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/play", label: "Play Songs", icon: Music },
  { href: "/compose", label: "Compose", icon: PenTool },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-glow-gold-sm group-hover:shadow-glow-gold transition-shadow">
              <Music2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-serif font-bold text-xl gradient-gold-text">
              Sounds Good
            </span>
          </Link>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const isActive =
                tab.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(tab.href);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? "gradient-gold text-black shadow-glow-gold-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Theme toggle, MIDI status & User */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <MidiStatus />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

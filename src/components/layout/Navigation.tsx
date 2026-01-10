"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MidiStatus } from "@/components/keyboard/MidiStatus";

const tabs = [
  { href: "/", label: "Free Play", icon: "🎹" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/play", label: "Play Songs", icon: "🎵" },
  { href: "/compose", label: "Compose", icon: "✏️" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎼</span>
            <span className="font-bold text-xl">Sounds Good</span>
          </Link>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const isActive =
                tab.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* MIDI status */}
          <MidiStatus />
        </div>
      </div>
    </nav>
  );
}

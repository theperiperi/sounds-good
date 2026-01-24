import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Sounds Good - Master Piano with World-Class Interactive Learning",
  description:
    "Transform your piano journey with Sounds Good. Interactive lessons, MIDI support, music theory visualization, and AI-powered sheet music transcription. Start learning today.",
  keywords: [
    "piano lessons",
    "learn piano online",
    "music theory",
    "MIDI piano",
    "interactive piano",
    "piano education",
    "ABRSM grades",
    "sheet music",
    "piano practice",
  ],
  openGraph: {
    title: "Sounds Good - Premium Piano Education",
    description:
      "Master the piano with world-class instruction and interactive learning",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sounds Good - Premium Piano Education",
    description:
      "Master the piano with world-class instruction and interactive learning",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} min-h-screen antialiased relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {/* Decorative background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="blur-spot blur-spot-gold w-[600px] h-[600px] -top-48 -left-48 opacity-30" />
              <div className="blur-spot blur-spot-gold w-[500px] h-[500px] top-1/3 -right-48 opacity-20" />
              <div className="blur-spot blur-spot-gold w-[400px] h-[400px] bottom-0 left-1/3 opacity-15" />
            </div>

            {/* Content */}
            <div className="relative z-10">{children}</div>

            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

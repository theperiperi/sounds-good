import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "Sounds Good - Learn Piano",
  description: "Interactive keyboard learning and music theory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navigation />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}

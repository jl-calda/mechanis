import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Mechanis - Structural Engineering Tools",
  description:
    "Steel profile viewer, bolt layout calculator, weld calculator, and material database for structural engineers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark antialiased">
      <body className="flex min-h-full bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 md:ml-52">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

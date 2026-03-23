import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="flex min-h-full bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <Sidebar />
            <main className="flex-1 md:ml-52">
              <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6 md:pt-6 lg:px-8">
                {children}
              </div>
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

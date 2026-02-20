import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout";
import { Providers } from "@/providers/SessionProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afrozone AutoGlobal",
  description: "Admin Dashboard for Afrozone AutoGlobal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ReactQueryProvider>
            <AuthProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                  {children}
                  <Toaster />
                </main>
              </div>
            </AuthProvider>
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}

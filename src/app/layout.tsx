import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wayan Tisna - Software Developer",
  description: "Professional portfolio of I Wayan Tisna Adi Muliart, a Middle to Senior Software Developer specialized in Laravel, React, and Next.js",
  keywords: "Developer, Laravel, React, Next.js, REST API, Full-stack",
  metadataBase: new URL("https://wayantisna.com"),
  openGraph: {
    title: "Wayan Tisna - Software Developer",
    description: "Professional portfolio and blog",
    url: "https://wayantisna.com",
    siteName: "Wayan Tisna Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wayan Tisna - Software Developer",
    description: "Professional portfolio and blog",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900 dark:text-white transition-colors duration-300`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}


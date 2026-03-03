import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wayantisna.com"),
  title: {
    default: "Wayan Tisna | Software Developer Portfolio",
    template: "%s | Wayan Tisna",
  },
  description:
    "Professional portfolio, technical blog, and engineering tools by I Wayan Tisna Adi Muliart. Expertise: Laravel, REST API, SQL Server, Nuxt.js, Vue.js, React.js, and Next.js.",
  keywords: [
    "I Wayan Tisna Adi Muliart",
    "Wayan Tisna",
    "software developer portfolio",
    "Laravel developer",
    "REST API developer",
    "SQL Server optimization",
    "Nuxt.js developer",
    "Vue.js developer",
    "React.js developer",
    "Next.js developer",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Wayan Tisna | Software Developer Portfolio",
    description:
      "Portfolio and engineering blog covering Laravel, REST API, SQL Server, and modern frontend development.",
    url: "https://wayantisna.com",
    siteName: "Wayan Tisna Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wayan Tisna | Software Developer Portfolio",
    description:
      "Portfolio and engineering blog by I Wayan Tisna Adi Muliart.",
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
        className={`${manrope.variable} ${jetBrainsMono.variable} antialiased text-slate-900 dark:text-white transition-colors duration-300`}
      >
        <RootProvider
          search={{
            options: {
              api: "/api/search",
              type: "fetch",
            },
          }}
          theme={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

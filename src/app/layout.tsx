import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Poppins } from 'next/font/google';

export const metadata: Metadata = {
  title: "Sugar Connect",
  description: "Find your sweet connection.",
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/heart.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/heart.svg" />
        <link rel="shortcut icon" href="/heart.svg" />
      </head>
      <body className={`${poppins.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

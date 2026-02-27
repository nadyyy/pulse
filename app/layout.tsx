import type { Metadata } from "next";

import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse Commerce",
  description: "High-performance Nike-style storefront starter with Prisma + Postgres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Header />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}

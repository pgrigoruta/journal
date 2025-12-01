import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journal",
  description: "A journal application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="dark:bg-gray-900">{children}</body>
    </html>
  );
}


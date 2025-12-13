import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Full Stack SaaS Starter",
  description: "Generic starter kit for modern web applications.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

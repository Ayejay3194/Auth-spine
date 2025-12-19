import React from "react";
import "./globals.css";

export const metadata = { title: "Ops Dashboard", description: "Operations + Finance + Employee Management" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

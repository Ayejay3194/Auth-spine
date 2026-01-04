import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Modular Platform V1",
  description: "Modules 33–47 wired into a Next.js skeleton",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}

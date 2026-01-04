import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Universal Professional Platform V1",
  description: "Vertical-agnostic core + vertical intelligence + network effects",
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

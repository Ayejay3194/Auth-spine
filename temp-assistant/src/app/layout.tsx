export const metadata = { title: "Non‑LLM Assistant Demo", description: "Rule-based assistant engines" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body style={{ fontFamily:"ui-sans-serif, system-ui", margin:0, padding:20 }}>{children}</body></html>);
}

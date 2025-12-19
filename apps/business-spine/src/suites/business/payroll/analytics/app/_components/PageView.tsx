
"use client";
import { usePageView } from "@/lib/hooks/useTrack";

export default function PageView({ name }: { name?: string }) {
  usePageView(name ?? "page_view");
  return null;
}

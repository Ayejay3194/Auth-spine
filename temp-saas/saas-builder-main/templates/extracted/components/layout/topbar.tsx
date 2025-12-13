"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";

export function Topbar() {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
      <div className="font-semibold text-sm">Dashboard</div>
      <div className="flex items-center gap-3">
        <ModeToggle />
      </div>
    </header>
  );
}

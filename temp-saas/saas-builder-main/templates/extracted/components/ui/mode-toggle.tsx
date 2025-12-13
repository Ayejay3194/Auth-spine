"use client";

import { useEffect, useState } from "react";

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggle = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center rounded-md border border-border px-3 py-1 text-xs hover:bg-accent"
    >
      Toggle theme
    </button>
  );
}

"use client";

import { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");

  return (
    <div className="border border-border rounded-lg p-6 w-full max-w-sm space-y-4 bg-card">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <input
        type="email"
        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">
        Continue
      </button>
    </div>
  );
}

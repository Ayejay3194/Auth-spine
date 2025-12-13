'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function SignUpPage() {
  const [email, setEmail] = useState('newuser@example.com');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app, call sign-up API. Here, just redirect.
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-700 p-6 bg-slate-900/60"
      >
        <h1 className="text-xl font-semibold">Create account</h1>
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </main>
  );
}

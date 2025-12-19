export function CupertinoBlankTW() {
  return (
    <div className="min-h-screen grid place-items-center bg-zinc-100 dark:bg-zinc-900">
      <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl p-7 shadow-xl text-center">
        <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-zinc-500/15 grid place-items-center">⎯</div>
        <h1 className="text-lg font-semibold">Nothing here yet</h1>
        <p className="text-sm opacity-60 mb-4">Waiting for data.</p>
        <button className="px-4 py-2 rounded-lg bg-fuchsia-500 text-white">Get Started</button>
      </div>
    </div>
  );
}

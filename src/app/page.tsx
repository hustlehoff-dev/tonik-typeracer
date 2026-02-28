import { GameArena } from '@/components/GameArena';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100">
          Tonik<span className="text-violet-400">Racer</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Real-time multiplayer typing competition
        </p>
      </header>

      <GameArena />

      <footer className="mt-12 text-center text-xs text-zinc-600">
        Paste disabled for fair play · Stats persist across sessions
      </footer>
    </main>
  );
}

'use client';

import { GameProvider } from '@/context/GameContext';
import GameLobby from '@/components/GameLobby';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-500 to-purple-600">
      <h1 className="text-4xl font-bold text-white mb-8">Keyboard Challenge Game</h1>
      <GameProvider>
        <GameLobby />
      </GameProvider>
    </main>
  );
}
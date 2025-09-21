'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import GameBoard from './GameBoard';

const GameLobby: React.FC = () => {
  const { gameId, isConnected, isGameStarted, createGame, joinGame } = useGame();
  const [gameIdInput, setGameIdInput] = useState('');

  // If not connected to socket server yet
  if (!isConnected) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Connecting to server...</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If game has started, show the game board
  if (isGameStarted) {
    return <GameBoard />;
  }

  // If game ID exists but game hasn't started yet
  if (gameId) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Waiting for opponent</h2>
        <p className="text-center mb-4">Share this game ID with your friend:</p>
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 font-mono text-xl">
            {gameId}
          </div>
          <button
            className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              navigator.clipboard.writeText(gameId);
            }}
          >
            Copy
          </button>
        </div>
        <div className="flex justify-center">
          <div className="animate-bounce rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Initial lobby screen
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-center mb-6">Join or Create a Game</h2>
      
      <div className="mb-6">
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={createGame}
        >
          Create New Game
        </button>
      </div>
      
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-gray-500">OR</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
          Enter Game ID
        </label>
        <input
          type="text"
          id="gameId"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={gameIdInput}
          onChange={(e) => setGameIdInput(e.target.value)}
          placeholder="Enter game ID"
        />
      </div>
      
      <button
        className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        onClick={() => joinGame(gameIdInput)}
        disabled={!gameIdInput}
      >
        Join Game
      </button>
    </div>
  );
};

export default GameLobby;

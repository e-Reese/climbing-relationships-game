'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import GameBoard from './GameBoard';

const GameLobby: React.FC = () => {
  const { gameId, isConnected, isGameStarted, connectionError, createGame, joinGame } = useGame();
  const [gameIdInput, setGameIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newGameId = await createGame();
      if (!newGameId) {
        setError('Failed to create game. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while creating the game.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameIdInput.trim()) {
      setError('Please enter a valid game ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const success = await joinGame(gameIdInput.trim());
      if (!success) {
        setError('Failed to join game. Please check the game ID and try again.');
      }
    } catch (err) {
      setError('An error occurred while joining the game.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // If not connected to server yet
  if (!isConnected) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">
          {connectionError ? 'Connection Issue' : 'Connecting to server...'}
        </h2>
        
        <div className="mb-6">
          {connectionError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-4">
              <p className="font-bold mb-1">Connection status:</p>
              <p className="text-sm">{connectionError}</p>
            </div>
          )}
          
          <div className="flex flex-col items-center my-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Attempting to connect...</p>
          </div>
          
          <div className="text-sm text-gray-700 mb-4">
            <p className="mb-2">If connection persists:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The server may still be starting up</li>
              <li>Check if you're connected to the internet</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh Page
          </button>
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
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <button
          className={`w-full py-3 ${
            isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          } text-white rounded-lg transition-colors`}
          onClick={handleCreateGame}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create New Game'}
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
          disabled={isLoading}
        />
      </div>
      
      <button
        className={`w-full py-3 ${
          isLoading || !gameIdInput ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
        } text-white rounded-lg transition-colors`}
        onClick={handleJoinGame}
        disabled={isLoading || !gameIdInput}
      >
        {isLoading ? 'Joining...' : 'Join Game'}
      </button>
    </div>
  );
};

export default GameLobby;
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import GameHeader from './GameHeader';
import GameControls from './GameControls';
import RhythmGame from './RhythmGame';
import KeyBoard from './KeyBoard';
import { GAME_KEYS } from '@/types/game';

const GameBoard: React.FC = () => {
  const {
    gameState,
    startGame,
    startTurn,
    completeTurn,
    hitNote,
    missNote,
    resetGame,
  } = useGameState();

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const isPlaying = gameState.gamePhase === 'playing';
  
  useKeyboardInput({
    onKeyPress: (key: string) => {
      if (isPlaying) {
        setPressedKeys(prev => new Set(prev).add(key));
        setTimeout(() => {
          setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        }, 150);
        
        hitNote(key, Date.now());
      }
    },
    isActive: isPlaying,
  });

  // Check for turn completion
  useEffect(() => {
    if (isPlaying && gameState.notes.length > 0) {
      const allNotesProcessed = gameState.notes.every(note => note.hit);
      if (allNotesProcessed) {
        setTimeout(() => {
          completeTurn();
        }, 1000);
      }
    }
  }, [gameState.notes, isPlaying, completeTurn]);

  const handleKeyPress = (key: string) => {
    if (isPlaying) {
      setPressedKeys(prev => new Set(prev).add(key));
      setTimeout(() => {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 150);
      
      hitNote(key, Date.now());
    }
  };

  const handleNoteMiss = (noteId: string) => {
    missNote(noteId);
  };

  return (
    <div className="min-h-screen game-container flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Game Header */}
          <GameHeader
            players={gameState.players}
            currentPlayer={gameState.currentPlayer}
            currentTurn={gameState.currentTurn}
            maxTurns={gameState.maxTurns}
            gamePhase={gameState.gamePhase}
          />

          {/* Rhythm Game Area */}
          {gameState.gamePhase !== 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm rounded-lg p-6"
            >
              <RhythmGame
                notes={gameState.notes}
                onNoteHit={hitNote}
                onNoteMiss={handleNoteMiss}
                gamePhase={gameState.gamePhase}
                noteSpeed={gameState.noteSpeed}
              />
            </motion.div>
          )}

          {/* Keyboard */}
          {gameState.gamePhase !== 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <KeyBoard
                onKeyPress={handleKeyPress}
                pressedKeys={pressedKeys}
                isActive={isPlaying}
              />
            </motion.div>
          )}

          {/* Game Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <GameControls
              gamePhase={gameState.gamePhase}
              currentPlayer={gameState.currentPlayer}
              onStartGame={startGame}
              onStartTurn={startTurn}
              onResetGame={resetGame}
            />
          </motion.div>

          {/* Instructions */}
          {gameState.gamePhase === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-black/30 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
              <div className="text-white/80 space-y-2">
                <p>🎯 Hit the falling notes when they reach the target line</p>
                <p>⌨️ Use keys A, S, D, F, G to hit the corresponding notes</p>
                <p>⭐ Perfect hits (green) give more points than good hits (yellow)</p>
                <p>🔄 Take turns - each player gets {gameState.maxTurns} turns</p>
                <p>🏆 The player with the highest score wins!</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GameBoard;

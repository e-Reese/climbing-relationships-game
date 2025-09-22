'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameControlsProps {
  gamePhase: string;
  currentPlayer: number;
  onStartGame: () => void;
  onStartTurn: (playerIndex: number) => void;
  onResetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gamePhase,
  currentPlayer,
  onStartGame,
  onStartTurn,
  onResetGame,
}) => {
  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)' },
    tap: { scale: 0.95 }
  };

  if (gamePhase === 'waiting') {
    return (
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={onStartGame}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          🎮 Start Game
        </motion.button>
      </motion.div>
    );
  }

  if (gamePhase === 'turnComplete') {
    return (
      <motion.div 
        className="flex justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={() => onStartTurn(1 - currentPlayer)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Next Player
        </motion.button>
        
        <motion.button
          onClick={onResetGame}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Reset Game
        </motion.button>
      </motion.div>
    );
  }

  if (gamePhase === 'gameComplete') {
    return (
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={onResetGame}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          🎉 Play Again
        </motion.button>
      </motion.div>
    );
  }

  return null;
};

export default GameControls;

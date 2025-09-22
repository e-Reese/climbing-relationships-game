'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GAME_KEYS } from '@/types/game';

interface KeyBoardProps {
  onKeyPress: (key: string) => void;
  pressedKeys: Set<string>;
  isActive: boolean;
}

const KeyBoard: React.FC<KeyBoardProps> = ({ onKeyPress, pressedKeys, isActive }) => {
  const keyColors = {
    'A': 'bg-red-500',
    'S': 'bg-blue-500', 
    'D': 'bg-green-500',
    'F': 'bg-yellow-500',
    'G': 'bg-purple-500',
  };

  const keyVariants = {
    pressed: { 
      scale: 0.95,
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)'
    },
    normal: { 
      scale: 1,
      boxShadow: '0 0 0px rgba(255, 255, 255, 0)'
    }
  };

  return (
    <div className="flex justify-center gap-4 mb-8">
      {GAME_KEYS.map((key) => (
        <motion.button
          key={key}
          className={`
            w-20 h-20 rounded-xl border-2 border-white/30 
            flex items-center justify-center text-white font-bold text-2xl
            transition-all duration-150 ease-in-out
            ${keyColors[key as keyof typeof keyColors]}
            ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          `}
          onClick={() => isActive && onKeyPress(key)}
          disabled={!isActive}
          variants={keyVariants}
          animate={pressedKeys.has(key) ? 'pressed' : 'normal'}
          whileHover={isActive ? { scale: 1.05 } : {}}
          whileTap={isActive ? { scale: 0.95 } : {}}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
};

export default KeyBoard;

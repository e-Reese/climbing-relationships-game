'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@/types/game';

interface GameHeaderProps {
  players: Player[];
  currentPlayer: number;
  currentTurn: number;
  maxTurns: number;
  gamePhase: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  players,
  currentPlayer,
  currentTurn,
  maxTurns,
  gamePhase,
}) => {
  const getPhaseText = () => {
    switch (gamePhase) {
      case 'waiting':
        return 'Press Start to Begin';
      case 'playing':
        return `${players[currentPlayer].name}'s Turn`;
      case 'turnComplete':
        return 'Turn Complete!';
      case 'gameComplete':
        const winner = players[0].score > players[1].score ? players[0] : 
                      players[1].score > players[0].score ? players[1] : null;
        if (winner) {
          return `🎉 ${winner.name} Wins! 🎉`;
        } else {
          return '🤝 It\'s a Tie! 🤝';
        }
      default:
        return '';
    }
  };

  return (
    <div className="w-full bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6">
      {/* Game Title */}
      <motion.h1 
        className="text-4xl font-bold text-center text-white mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎵 Rhythm Heroes 🎵
      </motion.h1>

      {/* Game Phase */}
      <motion.div 
        className="text-center mb-6"
        key={gamePhase}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xl text-yellow-300 font-semibold">
          {getPhaseText()}
        </span>
      </motion.div>

      {/* Turn Counter / Final Score */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/20 rounded-full px-6 py-2">
          {gamePhase === 'gameComplete' ? (
            <div className="text-center">
              <div className="text-white font-bold text-lg">Final Scores</div>
              <div className="text-sm text-gray-300">
                {players[0].name}: {players[0].score.toLocaleString()} | {players[1].name}: {players[1].score.toLocaleString()}
              </div>
            </div>
          ) : (
            <span className="text-white font-bold text-lg">
              Turn {currentTurn} / {maxTurns}
            </span>
          )}
        </div>
      </div>

      {/* Player Scores */}
      <div className="grid grid-cols-2 gap-4">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${index === currentPlayer && gamePhase === 'playing'
                ? 'bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-500/25'
                : 'bg-white/10 border-white/20'
              }
            `}
            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                {player.name}
                {index === currentPlayer && gamePhase === 'playing' && (
                  <motion.span 
                    className="ml-2 text-yellow-300"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⭐
                  </motion.span>
                )}
              </h3>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-400">
                  {player.score.toLocaleString()}
                </div>
                
                <div className="text-sm text-gray-300">
                  Streak: <span className="text-yellow-300 font-bold">{player.currentStreak}</span>
                </div>
                
                <div className="text-sm text-gray-300">
                  Best: <span className="text-purple-300 font-bold">{player.bestStreak}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameHeader;

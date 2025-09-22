'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RhythmNote, GAME_KEYS } from '@/types/game';

interface RhythmGameProps {
  notes: RhythmNote[];
  onNoteHit: (key: string, timestamp: number) => void;
  onNoteMiss: (noteId: string) => void;
  gamePhase: string;
  noteSpeed: number;
}

const RhythmGame: React.FC<RhythmGameProps> = ({
  notes,
  onNoteHit,
  onNoteMiss,
  gamePhase,
  noteSpeed,
}) => {
  const [activeNotes, setActiveNotes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newActiveNotes = new Map<string, number>();

      notes.forEach(note => {
        // Note becomes active when it's time to start falling
        const noteStartTime = note.timestamp - noteSpeed;
        if (!note.hit && now >= noteStartTime) {
          newActiveNotes.set(note.id, now);
        }
        
        // Check for missed notes (after they should have been hit)
        if (!note.hit && now > note.timestamp + 500) {
          console.log('Note missed:', note.id, 'timestamp:', note.timestamp, 'now:', now);
          onNoteMiss(note.id);
        }
      });

      setActiveNotes(newActiveNotes);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [notes, gamePhase, noteSpeed, onNoteMiss]);

  const getNoteColor = (note: RhythmNote, isActive: boolean) => {
    if (note.hit) {
      return note.perfect ? 'bg-green-500' : 'bg-yellow-500';
    }
    if (isActive) {
      return 'bg-blue-500';
    }
    return 'bg-purple-500';
  };

  const getNotePosition = (position: number) => {
    const positions = [0, 1, 2, 3, 4];
    const leftOffset = positions[position] * 120 + 60; // 120px spacing, 60px center offset
    return leftOffset;
  };

  return (
    <div className="relative w-full h-96 bg-black/20 rounded-lg overflow-hidden">
      {/* Target line */}
      <div className="absolute bottom-20 left-0 right-0 h-1 bg-white/50 z-10"></div>
      
      {/* Key indicators */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
        {GAME_KEYS.map((key, index) => (
          <div
            key={key}
            className="w-16 h-16 bg-gray-700 border-2 border-gray-500 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ marginLeft: index === 0 ? 0 : 0 }}
          >
            {key}
          </div>
        ))}
      </div>

      {/* Falling notes */}
      <AnimatePresence>
        {notes.map((note) => {
          const isActive = activeNotes.has(note.id);
          const noteStartTime = note.timestamp - noteSpeed;
          const noteProgress = isActive 
            ? Math.max(0, Math.min(1, (Date.now() - noteStartTime) / noteSpeed))
            : 0;

          if (note.hit || noteProgress > 1.2) return null;

          return (
            <motion.div
              key={note.id}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white ${getNoteColor(note, isActive)}`}
              style={{
                left: `${getNotePosition(note.position)}px`,
                bottom: `${20 + (1 - noteProgress) * 280}px`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.1 }}
            >
              {note.key}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Hit effects */}
      {notes.filter(note => note.hit).map((note) => (
        <motion.div
          key={`effect-${note.id}`}
          className="absolute w-16 h-16 rounded-full border-4 border-green-400 pointer-events-none"
          style={{
            left: `${getNotePosition(note.position) - 8}px`,
            bottom: '64px',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
};

export default RhythmGame;

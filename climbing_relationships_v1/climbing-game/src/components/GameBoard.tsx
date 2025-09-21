'use client';

import { useEffect, useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';

const GameBoard: React.FC = () => {
  const { 
    playerNumber, 
    isYourTurn, 
    keySequence,
    keyPresses,
    lastScore,
    totalScore,
    isGameOver,
    isSequenceActive,
    sequenceStartTime,
    climber1Position,
    climber2Position,
    recordKeyPress,
    startSequence
  } = useGame();
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const [climber1Moving, setClimber1Moving] = useState<boolean>(false);
  const [climber2Moving, setClimber2Moving] = useState<boolean>(false);
  
  // Debug logging
  useEffect(() => {
    console.log("GameBoard state:", {
      isYourTurn,
      isSequenceActive,
      sequenceStartTime,
      keySequence: keySequence.length > 0 ? `${keySequence.length} keys` : "empty"
    });
  }, [isYourTurn, isSequenceActive, sequenceStartTime, keySequence]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isYourTurn && isSequenceActive) {
        const key = e.key.toUpperCase();
        console.log("Key pressed:", key);
        recordKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isYourTurn, isSequenceActive, recordKeyPress]);
  
  // Animation frame for timing
  useEffect(() => {
    console.log("Animation effect triggered:", { isSequenceActive, sequenceStartTime });
    
    if (isSequenceActive && sequenceStartTime) {
      console.log("Starting animation frame");
      
      const animate = () => {
        const elapsed = Date.now() - sequenceStartTime;
        setCurrentTime(elapsed);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    } else if (!isSequenceActive) {
      // Reset current time when sequence is not active
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isSequenceActive, sequenceStartTime]);
  
  // Track climber position changes
  const prevClimber1Y = useRef(climber1Position.y);
  const prevClimber2Y = useRef(climber2Position.y);
  
  useEffect(() => {
    // Check if climber 1 has moved up
    if (climber1Position.y < prevClimber1Y.current) {
      console.log("Climber 1 moved up from", prevClimber1Y.current, "to", climber1Position.y);
      setClimber1Moving(true);
      
      // Reset the animation state after animation completes
      const timer = setTimeout(() => {
        setClimber1Moving(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    prevClimber1Y.current = climber1Position.y;
  }, [climber1Position.y]);
  
  useEffect(() => {
    // Check if climber 2 has moved up
    if (climber2Position.y < prevClimber2Y.current) {
      console.log("Climber 2 moved up from", prevClimber2Y.current, "to", climber2Position.y);
      setClimber2Moving(true);
      
      // Reset the animation state after animation completes
      const timer = setTimeout(() => {
        setClimber2Moving(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    prevClimber2Y.current = climber2Position.y;
  }, [climber2Position.y]);
  
  // Game over screen
  if (isGameOver) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
        <p className="mb-6">Both climbers reached the top of the mountain!</p>
        
        {/* Mountain with climbers at the top */}
        <div className="relative w-full h-64 mb-6">
          {/* Mountain background */}
          <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
               style={{ backgroundImage: "url('/assets/Mountain_v1.png')" }}>
          </div>
          
          {/* Climber 1 at top left */}
          <div className="absolute w-12 h-12 bg-contain bg-center bg-no-repeat" 
               style={{ 
                 backgroundImage: "url('/assets/Climber1_v1.png')",
                 left: '25%',
                 top: '10%',
                 transform: 'translate(-50%, -50%)' 
               }}>
          </div>
          
          {/* Climber 2 at top right */}
          <div className="absolute w-12 h-12 bg-contain bg-center bg-no-repeat" 
               style={{ 
                 backgroundImage: "url('/assets/Climber2_v1.png')",
                 left: '75%',
                 top: '10%',
                 transform: 'translate(-50%, -50%)' 
               }}>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Play Again
        </button>
      </div>
    );
  }

  // Handle begin button click
  const handleBeginClick = () => {
    console.log("Begin button clicked");
    startSequence();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {playerNumber === 1 ? 'Player 1' : 'Player 2'}
        </h2>
        <div className="text-xl font-bold">
          Score: {totalScore}
        </div>
      </div>
      
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 text-xs">
        <p>isYourTurn: {isYourTurn ? 'true' : 'false'}</p>
        <p>isSequenceActive: {isSequenceActive ? 'true' : 'false'}</p>
        <p>sequenceStartTime: {sequenceStartTime || 'null'}</p>
        <p>currentTime: {currentTime}</p>
        <p>keySequence length: {keySequence.length}</p>
        <p>keyPresses length: {keyPresses.length}</p>
        <p>Climber 1 position: x={climber1Position.x}, y={climber1Position.y}</p>
        <p>Climber 2 position: x={climber2Position.x}, y={climber2Position.y}</p>
      </div>
      
      {/* Mountain and Climbers */}
      <div className="relative w-full h-64 mb-6">
        {/* Mountain background */}
        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
             style={{ backgroundImage: "url('/assets/Mountain_v1.png')" }}>
        </div>
        
        {/* Climber 1 */}
        <div 
          className={`absolute w-14 h-14 bg-contain bg-center bg-no-repeat ${climber1Moving ? 'animate-bounce' : ''}`}
          style={{ 
            backgroundImage: "url('/assets/Climber1_v1.png')",
            left: `${climber1Position.x}%`,
            top: `${climber1Position.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy animation
            filter: climber1Moving 
              ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.9))' // Green glow when moving
              : playerNumber === 1 
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' // Blue highlight for player 1
                : 'none'
          }}>
          {/* Movement indicator */}
          {climber1Moving && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 font-bold animate-pulse">
              ↑↑↑
            </div>
          )}
        </div>
        
        {/* Climber 2 */}
        <div 
          className={`absolute w-14 h-14 bg-contain bg-center bg-no-repeat ${climber2Moving ? 'animate-bounce' : ''}`}
          style={{ 
            backgroundImage: "url('/assets/Climber2_v1.png')",
            left: `${climber2Position.x}%`,
            top: `${climber2Position.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy animation
            filter: climber2Moving 
              ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.9))' // Green glow when moving
              : playerNumber === 2 
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' // Blue highlight for player 2
                : 'none'
          }}>
          {/* Movement indicator */}
          {climber2Moving && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 font-bold animate-pulse">
              ↑↑↑
            </div>
          )}
        </div>
      </div>
      
      {/* Turn Status and Begin Button */}
      <div className="mb-6 text-center">
        {isYourTurn ? (
          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <p className="text-lg font-bold text-green-700 mb-3">Your turn!</p>
            {!isSequenceActive && (
              <button 
                onClick={handleBeginClick}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              >
                Begin
              </button>
            )}
            {isSequenceActive && <p className="text-gray-700">Press the keys as they reach the bottom!</p>}
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <p className="text-lg font-bold text-gray-700">Waiting for other player...</p>
          </div>
        )}
      </div>
      
      {/* Last Score Display */}
      {lastScore && (
        <div className="mb-6 p-4 rounded-lg text-center bg-purple-100 border border-purple-300">
          <p className="text-lg font-bold text-purple-700">
            Last Performance: Grade {lastScore.grade}
          </p>
          <p className="text-gray-700">
            {lastScore.points} points | {lastScore.accuracy}% accuracy | {lastScore.correctKeys}/5 correct
          </p>
        </div>
      )}
      
      {/* Guitar Hero Style Track */}
      <div className="relative h-64 bg-gray-900 rounded-lg mb-6 overflow-hidden">
        {/* Note Highway */}
        <div className="absolute inset-0 flex">
          {['A', 'S', 'D', 'F', 'G'].map((lane, index) => (
            <div 
              key={lane} 
              className="flex-1 border-r border-gray-700 flex flex-col items-center"
              style={{ backgroundColor: index % 2 === 0 ? 'rgba(50, 50, 50, 0.3)' : 'rgba(30, 30, 30, 0.3)' }}
            >
              <div className="w-full h-8 bg-gray-800 flex items-center justify-center text-white font-bold">
                {lane}
              </div>
            </div>
          ))}
        </div>
        
        {/* Notes */}
        {isSequenceActive && sequenceStartTime && keySequence.map((note, index) => {
          const isPast = currentTime > note.timing;
          const isPressed = keyPresses[index]?.key === note.key;
          
          // Calculate position based on timing
          const position = isPast ? 100 : Math.min(100, (currentTime / note.timing) * 100);
          
          // Determine which lane to show the note in
          const laneIndex = ['A', 'S', 'D', 'F', 'G'].indexOf(note.key);
          const lane = laneIndex >= 0 ? laneIndex : 0;
          
          return (
            <div 
              key={index}
              className={`absolute w-1/5 h-8 rounded-md flex items-center justify-center font-bold text-white
                ${isPast && !isPressed ? 'bg-red-500' : isPast && isPressed ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{
                left: `${lane * 20}%`,
                top: `${position}%`,
                opacity: isPast ? (isPressed ? 0.7 : 0.4) : 1
              }}
            >
              {note.key}
            </div>
          );
        })}
        
        {/* Hit Line */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white"></div>
      </div>
      
      {/* Key Press Display */}
      <div className="flex justify-center space-x-4 mb-6">
        {['A', 'S', 'D', 'F', 'G'].map((key) => (
          <div 
            key={key}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold border-2
              ${keyPresses.some(press => press.key === key) 
                ? 'bg-green-500 text-white border-green-700' 
                : 'bg-gray-200 text-gray-700 border-gray-400'}`}
          >
            {key}
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="text-center text-gray-600">
        <p>Press the keys as they reach the bottom of the track.</p>
        <p className="mt-2">Try to match the timing for a better score!</p>
      </div>
    </div>
  );
};

export default GameBoard;
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
    turnCount,
    recordKeyPress,
    startSequence
  } = useGame();
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const [climber1Moving, setClimber1Moving] = useState<boolean>(false);
  const [climber2Moving, setClimber2Moving] = useState<boolean>(false);
  
  // Debug logging
  useEffect(() => {
    console.log('GameBoard state:', { 
      playerNumber, 
      isYourTurn,
      isSequenceActive,
      climber1Position,
      climber2Position,
      turnCount
    });
  }, [playerNumber, isYourTurn, isSequenceActive, climber1Position, climber2Position, turnCount]);
  
  // Track previous Y positions to detect movement
  const prevClimber1YRef = useRef<number>(climber1Position.y);
  const prevClimber2YRef = useRef<number>(climber2Position.y);
  
  // Use state to force re-render when climbers move
  const [climber1LastMoved, setClimber1LastMoved] = useState<number>(0);
  const [climber2LastMoved, setClimber2LastMoved] = useState<number>(0);
  
  // Detect climber 1 movement
  useEffect(() => {
    const prevY = prevClimber1YRef.current;
    const currentY = climber1Position.y;
    
    if (prevY !== currentY) {
      console.log(`Climber 1 moved from ${prevY} to ${currentY}`);
      setClimber1Moving(true);
      setClimber1LastMoved(Date.now()); // Update timestamp to force re-render
      
      // Store new position
      prevClimber1YRef.current = currentY;
      
      // Reset moving state after animation
      const timer = setTimeout(() => {
        setClimber1Moving(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [climber1Position.y]);
  
  // Detect climber 2 movement
  useEffect(() => {
    const prevY = prevClimber2YRef.current;
    const currentY = climber2Position.y;
    
    if (prevY !== currentY) {
      console.log(`Climber 2 moved from ${prevY} to ${currentY}`);
      setClimber2Moving(true);
      setClimber2LastMoved(Date.now()); // Update timestamp to force re-render
      
      // Store new position
      prevClimber2YRef.current = currentY;
      
      // Reset moving state after animation
      const timer = setTimeout(() => {
        setClimber2Moving(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [climber2Position.y]);
  
  // Animation frame for the rhythm game
  useEffect(() => {
    if (isSequenceActive && sequenceStartTime) {
      const updateTime = () => {
        setCurrentTime(Date.now() - sequenceStartTime);
        animationRef.current = requestAnimationFrame(updateTime);
      };
      
      animationRef.current = requestAnimationFrame(updateTime);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }
  }, [isSequenceActive, sequenceStartTime]);
  
  // Handle keyboard input for the rhythm game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isYourTurn && isSequenceActive && keySequence) {
        // Only process arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          recordKeyPress(e.key);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isYourTurn, isSequenceActive, keySequence, recordKeyPress]);
  
  // Game over screen
  if (isGameOver) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
        <p className="mb-2">Both climbers reached the top of the mountain!</p>
        <p className="mb-4 text-blue-600 font-semibold">
          Completed in {turnCount} {turnCount === 1 ? 'move' : 'moves'} out of 10
        </p>
        <p className="mb-6 text-gray-600">
          ({Math.ceil(turnCount/2)} complete game turns)
        </p>
        
        {/* Mountain with climbers at the top */}
        <div className="relative w-full h-64 mb-6">
          {/* Mountain background */}
          <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
               style={{ backgroundImage: "url('./assets/Mountain_v1.png')" }}>
          </div>
          
          {/* Climber 1 at top left */}
          <div className="absolute w-12 h-12 bg-contain bg-center bg-no-repeat" 
               style={{ 
                 backgroundImage: "url('./assets/Climber1_v1.png')",
                 left: '25%',
                 top: '10%',
                 transform: 'translate(-50%, -50%)' 
               }}>
          </div>
          
          {/* Climber 2 at top right */}
          <div className="absolute w-12 h-12 bg-contain bg-center bg-no-repeat" 
               style={{ 
                 backgroundImage: "url('./assets/Climber2_v1.png')",
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
    startSequence();
  };

  // Calculate progress for each key in the sequence
  const getKeyProgress = (index: number): number => {
    if (!isSequenceActive || !sequenceStartTime || !keySequence) return 0;
    
    // Sum up all timing values up to this index
    let targetTime = 0;
    for (let i = 0; i <= index; i++) {
      targetTime += keySequence.timing[i] || 0;
    }
    
    // Calculate progress percentage
    const progress = Math.min(currentTime / targetTime, 1);
    return progress;
  };
  
  // Get the current key from the sequence
  const getCurrentKeyIndex = (): number => {
    if (!isSequenceActive || !keySequence) return -1;
    
    let totalTime = 0;
    for (let i = 0; i < keySequence.keys.length; i++) {
      totalTime += keySequence.timing[i] || 0;
      if (currentTime < totalTime) {
        return i;
      }
    }
    
    return keySequence.keys.length - 1;
  };
  
  // Get the current key to display
  const currentKeyIndex = getCurrentKeyIndex();
  const currentKey = keySequence && currentKeyIndex >= 0 ? keySequence.keys[currentKeyIndex] : '';
  
  // Convert arrow key to display symbol
  const keyToSymbol = (key: string): string => {
    switch (key) {
      case 'ArrowUp': return '↑';
      case 'ArrowDown': return '↓';
      case 'ArrowLeft': return '←';
      case 'ArrowRight': return '→';
      default: return key;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Game info */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-bold">Player {playerNumber}</span>
            {isYourTurn && <span className="ml-2 text-green-500 font-bold">(Your Turn)</span>}
          </div>
          <div className="text-gray-700">
            Score: <span className="font-bold">{totalScore}</span>
          </div>
        </div>
        
        {/* Turn counter and progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Move: {turnCount}/10</span>
            <span>{Math.ceil(turnCount/2)}/5 game turns</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(turnCount / 10) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-2">
          <div>Climber 1: x={climber1Position.x.toFixed(0)}%, y={climber1Position.y.toFixed(0)}%</div>
          <div>Climber 2: x={climber2Position.x.toFixed(0)}%, y={climber2Position.y.toFixed(0)}%</div>
        </div>
      </div>
      
      {/* Mountain and climbers */}
      <div className="relative w-full max-w-2xl h-96 mb-8">
        {/* Mountain background */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
          style={{ backgroundImage: "url('./assets/Mountain_v1.png')" }}
        ></div>
        
        {/* Climber 1 */}
        <div
          className={`absolute w-16 h-16 bg-contain bg-center bg-no-repeat z-10 ${climber1Moving ? 'animate-bounce' : ''}`}
          style={{
            backgroundImage: "url('./assets/Climber1_v1.png')",
            left: `${climber1Position.x}%`,
            top: `${climber1Position.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 2s cubic-bezier(0.34, 1.56, 0.64, 1)', // Slower, bouncier animation
            filter: climber1Moving 
              ? 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.9)) brightness(1.2)' // Enhanced green glow when moving
              : playerNumber === 1 
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' // Blue highlight for player 1
                : 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))'
          }}
          data-testid="climber1"
          data-position={`x:${climber1Position.x},y:${climber1Position.y}`}
          key={`climber1-${climber1Position.y}-${climber1LastMoved}`} // Force re-render when position changes
        >
          {/* Movement indicator */}
          {climber1Moving && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-lg animate-pulse">
              ↑↑↑
              <div className="text-xs mt-1">Moving up!</div>
            </div>
          )}
          
          {/* Player label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            P1
          </div>
        </div>
        
        {/* Climber 2 */}
        <div 
          className={`absolute w-16 h-16 bg-contain bg-center bg-no-repeat z-10 ${climber2Moving ? 'animate-bounce' : ''}`}
          style={{ 
            backgroundImage: "url('./assets/Climber2_v1.png')",
            left: `${climber2Position.x}%`,
            top: `${climber2Position.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 2s cubic-bezier(0.34, 1.56, 0.64, 1)', // Slower, bouncier animation
            filter: climber2Moving 
              ? 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.9)) brightness(1.2)' // Enhanced green glow when moving
              : playerNumber === 2 
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' // Blue highlight for player 2
                : 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))'
          }}
          data-testid="climber2"
          data-position={`x:${climber2Position.x},y:${climber2Position.y}`}
          key={`climber2-${climber2Position.y}-${climber2LastMoved}`} // Force re-render when position changes
        >
          {/* Movement indicator */}
          {climber2Moving && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-lg animate-pulse">
              ↑↑↑
              <div className="text-xs mt-1">Moving up!</div>
            </div>
          )}
          
          {/* Player label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            P2
          </div>
        </div>
      </div>
      
      {/* Rhythm game section */}
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        {isYourTurn ? (
          <>
            <h3 className="text-lg font-bold mb-4 text-center">Your Turn</h3>
            
            {!isSequenceActive ? (
              <div className="flex justify-center">
              <button 
                onClick={handleBeginClick}
                  className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
              >
                Begin
              </button>
          </div>
        ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">
                    {currentKey ? keyToSymbol(currentKey) : ''}
                  </div>
                  <div className="text-sm text-gray-600">
                    Press the arrow key when it appears
          </div>
      </div>
      
                {/* Progress bars for each key */}
                <div className="space-y-2">
                  {keySequence && keySequence.keys.map((key, index) => (
                    <div key={index} className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all duration-100 ease-linear ${
                          index < keyPresses.length
                            ? 'bg-green-500'
                            : index === currentKeyIndex
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                        style={{
                          width: `${
                            index < keyPresses.length
                              ? 100
                              : index === currentKeyIndex
                              ? getKeyProgress(index) * 100
                              : 0
                          }%`
                        }}
                      ></div>
                      <div className="absolute right-1 top-0 text-xs text-gray-700">
                        {keyToSymbol(key)}
              </div>
            </div>
          ))}
        </div>
        
                {/* Key presses feedback */}
                <div className="flex justify-center space-x-2 mt-4">
                  {keyPresses.map((_, index) => (
            <div 
              key={index}
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs"
                    >
                      ✓
                    </div>
                  ))}
                  {Array(keySequence ? keySequence.keys.length - keyPresses.length : 0)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-6 h-6 rounded-full bg-gray-200"
                      ></div>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <h3 className="text-lg font-bold mb-2">Waiting for other player</h3>
            <div className="animate-pulse text-blue-500">●</div>
            </div>
        )}
        
        {/* Last score display */}
        {lastScore && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="font-bold">Last Score: {lastScore.points}</div>
              {lastScore.accuracy && (
                <div className="text-sm text-gray-600">
                  Accuracy: {lastScore.accuracy.map(a => Math.round(a)).join('%, ')}%
                </div>
              )}
      </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
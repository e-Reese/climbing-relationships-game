import { useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface GameEventsOptions {
  gameId?: string;
  playerId?: string;
  onConnected?: (data: any) => void;
  onGameStart?: (data: any) => void;
  onTurnResult?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useGameEvents = (options: GameEventsOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(options.gameId || null);
  
  // Safely access localStorage (only available in browser)
  const getStoredPlayerId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('playerId');
    }
    return null;
  };
  
  const [playerId, setPlayerId] = useState<string | null>(options.playerId || null);
  
  // Initialize player ID if we don't have one - only runs on client side
  useEffect(() => {
    // Check for stored player ID
    const storedId = getStoredPlayerId();
    
    if (storedId && !playerId) {
      // Use stored ID if available
      setPlayerId(storedId);
      console.log('Using stored player ID:', storedId);
    } else if (!playerId) {
      // Generate new ID if none exists
      const newPlayerId = uuidv4();
      setPlayerId(newPlayerId);
      
      // Save to localStorage (safe in useEffect as it only runs on client)
      if (typeof window !== 'undefined') {
        localStorage.setItem('playerId', newPlayerId);
      }
      console.log('Generated new player ID:', newPlayerId);
    } else {
      console.log('Using provided player ID:', playerId);
    }
  }, []);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const eventHandlersRef = useRef({
    onConnected: options.onConnected,
    onGameStart: options.onGameStart,
    onTurnResult: options.onTurnResult,
    onError: options.onError
  });
  
  // Update handlers if they change
  useEffect(() => {
    eventHandlersRef.current = {
      onConnected: options.onConnected,
      onGameStart: options.onGameStart,
      onTurnResult: options.onTurnResult,
      onError: options.onError
    };
  }, [options.onConnected, options.onGameStart, options.onTurnResult, options.onError]);
  
  // Create a game
  const createGame = useCallback(async () => {
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create game: ${response.status}`);
      }
      
      const data = await response.json();
      setGameId(data.gameId);
      
      // Generate a player ID if we don't have one
      if (!playerId) {
        const newPlayerId = uuidv4();
        setPlayerId(newPlayerId);
        // Safe to use localStorage here as this is a callback that only runs in the browser
        if (typeof window !== 'undefined') {
          localStorage.setItem('playerId', newPlayerId);
        }
      }
      
      return data.gameId;
    } catch (error) {
      setConnectionError((error as Error).message);
      eventHandlersRef.current.onError?.(error as Error);
      return null;
    }
  }, [playerId]);
  
  // Join a game
  const joinGame = useCallback(async (gameIdToJoin: string) => {
    try {
      // If we already have a game ID and it's the same as the one we're trying to join,
      // and we're already connected, just return
      if (gameId === gameIdToJoin && isConnected) {
        return true;
      }
      
      let playerIdToUse = playerId;
      if (!playerIdToUse) {
        playerIdToUse = uuidv4();
        setPlayerId(playerIdToUse);
        // Safe to use localStorage here as this is a callback that only runs in the browser
        if (typeof window !== 'undefined') {
          localStorage.setItem('playerId', playerIdToUse);
        }
      }
      
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId: gameIdToJoin,
          playerId: playerIdToUse
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to join game: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If the server returned a different player ID, use that
      if (data.playerId && data.playerId !== playerIdToUse) {
        setPlayerId(data.playerId);
        // Safe to use localStorage here as this is a callback that only runs in the browser
        if (typeof window !== 'undefined') {
          localStorage.setItem('playerId', data.playerId);
        }
        playerIdToUse = data.playerId;
      }
      
      setGameId(gameIdToJoin);
      
      // Connect to SSE after joining
      connectToSSE(gameIdToJoin, playerIdToUse);
      
      return true;
    } catch (error) {
      setConnectionError((error as Error).message);
      eventHandlersRef.current.onError?.(error as Error);
      return false;
    }
  }, [gameId, playerId, isConnected, connectToSSE]);
  
  // Complete a sequence
  const completeSequence = useCallback(async (keyPresses: number[]) => {
    if (!gameId || !playerId) {
      setConnectionError('No active game or player');
      return false;
    }
    
    try {
      const response = await fetch('/api/game/sequence-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId,
          playerId,
          keyPresses
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete sequence: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      setConnectionError((error as Error).message);
      eventHandlersRef.current.onError?.(error as Error);
      return false;
    }
  }, [gameId, playerId]);
  
  // Connect to SSE
  const connectToSSE = useCallback((gameIdToUse: string, playerIdToUse: string) => {
    // Skip SSE connection on server-side
    if (typeof window === 'undefined') {
      console.log('Skipping SSE connection on server-side');
      return () => {};
    }
    
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    try {
      console.log(`Connecting to SSE with gameId: ${gameIdToUse}, playerId: ${playerIdToUse}`);
      const url = `/api/sse?gameId=${gameIdToUse}&playerId=${playerIdToUse}`;
      const eventSource = new EventSource(url);
      
      // Set connection status immediately to show we're trying to connect
      setConnectionError('Connecting to server...');
      
      let connectionTimeout = setTimeout(() => {
        console.warn('SSE connection timeout after 5 seconds');
        setConnectionError('Connection timeout. Server might be unavailable.');
        eventSource.close();
      }, 5000);
      
      eventSource.onopen = () => {
        console.log('SSE connection opened');
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionError(null);
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setConnectionError('Failed to connect to game server. The API route might not be ready yet.');
        eventHandlersRef.current.onError?.(new Error('SSE connection error'));
        
        // Close the errored connection
        eventSource.close();
        
        // Auto-reconnect after a delay, but limit retries
        if (eventSourceRef.current === eventSource) {
          console.log('Will attempt to reconnect in 3 seconds...');
          setTimeout(() => {
            connectToSSE(gameIdToUse, playerIdToUse);
          }, 3000);
        }
      };
      
      // Set up event listeners
      eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        console.log('SSE connected event:', data);
        setIsConnected(true);
        setConnectionError(null);
        eventHandlersRef.current.onConnected?.(data);
      });
      
      eventSource.addEventListener('game-start', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        console.log('Game started:', data);
        eventHandlersRef.current.onGameStart?.(data);
      });
      
      eventSource.addEventListener('turn-result', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        console.log('Turn result:', data);
        eventHandlersRef.current.onTurnResult?.(data);
      });
      
      eventSourceRef.current = eventSource;
      
      return () => {
        clearTimeout(connectionTimeout);
        eventSource.close();
      };
    } catch (error) {
      console.error('Error setting up SSE connection:', error);
      setConnectionError(`Failed to set up connection: ${(error as Error).message}`);
      return () => {};
    }
  }, []);
  
  // Initialize connection when we have a player ID
  useEffect(() => {
    if (playerId) {
      // Use a temporary game ID for initial connection if we don't have one
      const tempGameId = gameId || 'lobby';
      console.log(`Initializing connection with playerId: ${playerId}, gameId: ${tempGameId}`);
      connectToSSE(tempGameId, playerId);
    }
    
    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [playerId, connectToSSE, gameId]);
  
  return {
    isConnected,
    connectionError,
    gameId,
    playerId,
    createGame,
    joinGame,
    completeSequence
  };
};

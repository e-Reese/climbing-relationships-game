import { useEffect, useCallback } from 'react';
import { GAME_KEYS } from '@/types/game';

interface UseKeyboardInputProps {
  onKeyPress: (key: string) => void;
  isActive: boolean;
}

export const useKeyboardInput = ({ onKeyPress, isActive }: UseKeyboardInputProps) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;

    const pressedKey = event.key.toUpperCase();
    
    if (GAME_KEYS.includes(pressedKey)) {
      event.preventDefault();
      onKeyPress(pressedKey);
    }
  }, [onKeyPress, isActive]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

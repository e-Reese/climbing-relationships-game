import { NextRequest } from 'next/server';
import { createGame } from '../../../../lib/gameManager';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const gameId = createGame();
    
    return new Response(JSON.stringify({ gameId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return new Response(JSON.stringify({ error: 'Failed to create game' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

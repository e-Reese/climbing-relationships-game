import { NextRequest } from 'next/server';
import { completeSequence } from '../../../../lib/gameManager';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, playerId, keyPresses } = body;
    
    if (!gameId || !playerId || !keyPresses) {
      return new Response(JSON.stringify({ error: 'Game ID, player ID, and key presses are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const success = completeSequence(gameId, playerId, keyPresses);
    
    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to complete sequence' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error completing sequence:', error);
    return new Response(JSON.stringify({ error: 'Failed to complete sequence' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

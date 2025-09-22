import { NextRequest } from 'next/server';
import { joinGame } from '../../../../lib/gameManager';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId } = body;
    
    if (!gameId) {
      return new Response(JSON.stringify({ error: 'Game ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate a unique player ID if not provided
    let playerId = body.playerId;
    if (!playerId) {
      playerId = uuidv4();
    }
    
    const success = joinGame(gameId, playerId);
    
    if (success) {
      return new Response(JSON.stringify({ success: true, playerId }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to join game' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error joining game:', error);
    return new Response(JSON.stringify({ error: 'Failed to join game' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

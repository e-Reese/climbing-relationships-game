import { NextRequest } from 'next/server';

// In-memory store for active connections
// In production, you would use a more scalable solution like Redis
const connections = new Map<string, ReadableStreamController<Uint8Array>>();

// In-memory game state (will be replaced with Vercel KV or similar)
export const games = new Map<string, any>();

// Helper to send event to a specific game's players
export function sendEventToGame(gameId: string, event: string, data: any) {
  // Find all connections for this game
  for (const [connectionId, controller] of connections.entries()) {
    if (connectionId.startsWith(`${gameId}:`)) {
      try {
        const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(eventData));
      } catch (error) {
        console.error(`Error sending to ${connectionId}:`, error);
      }
    }
  }
}

// Helper to send event to a specific player
export function sendEventToPlayer(playerId: string, event: string, data: any) {
  for (const [connectionId, controller] of connections.entries()) {
    if (connectionId.includes(`:${playerId}`)) {
      try {
        const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(eventData));
      } catch (error) {
        console.error(`Error sending to ${playerId}:`, error);
      }
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const gameId = searchParams.get('gameId');
    const playerId = searchParams.get('playerId');
    
    if (!gameId || !playerId) {
      return new Response('Game ID and Player ID are required', { status: 400 });
    }

    console.log(`SSE connection request: gameId=${gameId}, playerId=${playerId}`);

    // Create a unique connection ID combining game and player
    const connectionId = `${gameId}:${playerId}`;

    // Set up SSE
    const stream = new ReadableStream({
      start(controller) {
        // Store the controller for this connection
        connections.set(connectionId, controller);
        
        console.log(`SSE connection established: ${connectionId}`);
        
        // Send initial connection event immediately
        const connectEvent = `event: connected\ndata: ${JSON.stringify({
          gameId: gameId,
          playerId: playerId,
          timestamp: Date.now(),
          message: "Connection established"
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(connectEvent));
        
        // Send a quick ping to ensure connection is working
        setTimeout(() => {
          try {
            controller.enqueue(new TextEncoder().encode(': quick-ping\n\n'));
          } catch (e) {
            console.error('Error sending quick ping:', e);
          }
        }, 1000);
        
        // Keep-alive interval
        const interval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(': ping\n\n'));
          } catch (e) {
            console.error('Error sending ping, cleaning up connection:', e);
            clearInterval(interval);
            connections.delete(connectionId);
          }
        }, 30000);
      },
      cancel() {
        // Clean up when client disconnects
        console.log(`SSE connection closed: ${connectionId}`);
        connections.delete(connectionId);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('Error in SSE route:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

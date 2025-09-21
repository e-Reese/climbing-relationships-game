import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Store active games
const games = new Map();
// Store active connections
const connections = new Map();

// Generate random key for the game
const generateRandomKey = () => {
  const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return keys.charAt(Math.floor(Math.random() * keys.length));
};

// Socket.io server handler
export async function GET(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
    return NextResponse.json(
      { error: 'Socket server URL not configured' },
      { status: 500 }
    );
  }

  try {
    // Return a simple response for health check
    return NextResponse.json({ status: 'Socket server is running' });
  } catch (err) {
    console.error('Socket server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// This is a workaround for Socket.io with Next.js App Router
// The actual socket server will be initialized in a separate server.js file
export async function POST(req: NextRequest) {
  return NextResponse.json({ status: 'Socket server is running' });
}
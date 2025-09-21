import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Socket, Server as SocketIOServer } from 'socket.io';

// Define the server type to avoid using 'any'
interface CustomSocket {
  server: {
    io?: Socket;
    [key: string]: unknown;
  };
}

// Extend the NextRequest type to include our custom socket
interface CustomNextRequest extends NextRequest {
  socket: CustomSocket;
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const customRequest = request as CustomNextRequest;
  
  // Add socket.io server to the request object if it doesn't exist
  if (!customRequest.socket.server) {
    customRequest.socket.server = {};
  }
  
  if (!customRequest.socket.server.io) {
    customRequest.socket.server.io = null as unknown as Socket;
  }
  
  return NextResponse.next();
}

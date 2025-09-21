import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Socket } from 'socket.io';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Add socket.io server to the request object if it doesn't exist
  if (!request.socket.server) {
    request.socket.server = {} as any;
  }
  
  if (!request.socket.server.io) {
    request.socket.server.io = null as unknown as Socket;
  }
  
  return NextResponse.next();
}

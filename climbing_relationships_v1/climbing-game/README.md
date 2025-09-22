# Climbing Relationships Game

A multiplayer climbing game where two players work together to climb a mountain by completing rhythm-based challenges.

## Features

- Real-time multiplayer gameplay using Server-Sent Events (SSE)
- Rhythm-based gameplay mechanics
- Visual climbing progress on a shared mountain
- Turn-based gameplay with 10 total moves (5 per player)
- Deployed as a single Vercel application

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Next.js Edge API Routes with Server-Sent Events (SSE)
- **Deployment**: Vercel

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
cd climbing-game
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application is designed to be deployed as a single Vercel application. The game uses Server-Sent Events (SSE) instead of WebSockets to enable deployment on Vercel's serverless platform.

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in the Vercel dashboard
3. Deploy!

## How to Play

1. One player creates a game and shares the game ID with another player
2. The second player joins using the game ID
3. Players take turns pressing arrow keys in the rhythm shown on screen
4. After each successful turn, a player's climber moves up the mountain
5. The game ends when both climbers reach the top or after 10 total moves

## Game Architecture

- **Edge API Routes**: Handle game state and player actions
- **Server-Sent Events (SSE)**: Provide real-time updates to clients
- **In-memory Game State**: Stores game data (can be replaced with Vercel KV for production)
- **React Context**: Manages client-side game state and UI updates

## Notes

- In a production environment, consider using Vercel KV or another persistent storage solution instead of in-memory game state
- The game currently supports only two players per game
- Games are automatically cleaned up when both players disconnect
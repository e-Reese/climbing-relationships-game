# Guitar Hero Style Keyboard Challenge

A two-player online rhythm game built with Next.js and Socket.io where players take turns pressing keys in sequence with precise timing.

## Game Rules

1. Two players connect to the same game room
2. Players take turns playing through a sequence of 5 keys
3. When it's your turn, press the "Begin" button to start the sequence
4. Keys appear on a Guitar Hero style track and move toward the hit line
5. Players must press the correct keys when they reach the bottom of the track
6. After completing a sequence, the player receives a grade (S, A, B, C, D, F) based on accuracy and timing
7. Points are awarded based on performance, and it becomes the other player's turn
8. The game continues until one player disconnects

## Scoring System

- **Timing Accuracy:**
  - Perfect (< 100ms): 100 points
  - Great (< 200ms): 75 points
  - Good (< 300ms): 50 points
  - OK (< 500ms): 25 points
  - Poor (≥ 500ms): 10 points

- **Grades:**
  - S: 95-100% accuracy
  - A: 90-94% accuracy
  - B: 80-89% accuracy
  - C: 70-79% accuracy
  - D: 60-69% accuracy
  - F: Below 60% accuracy

## Technologies Used

- Next.js
- TypeScript
- Socket.io for real-time communication
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd climbing-game
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

### Running the Game

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### How to Play

1. The first player creates a game and gets a game ID
2. They share this game ID with the second player
3. The second player enters the game ID to join
4. Once both players are connected, the game starts
5. The first player will see a "Begin" button - click it to start your turn
6. A sequence of 5 keys will appear on the track
7. Press each key as it reaches the bottom of the track (hit line)
8. After completing the sequence, you'll receive a grade and score
9. Then it's the other player's turn - they'll need to press their "Begin" button
10. The game continues until one player disconnects

## Controls

The game uses the following keys:
- A, S, D, F, G

## Debug Information

The game includes a debug panel showing:
- Whether it's your turn
- Whether the sequence is active
- The current timing information
- Number of keys in the sequence
- Number of keys pressed so far

## Future Improvements

- Add more lanes and keys for increased difficulty
- Implement different difficulty levels
- Add custom songs and note patterns
- Create a multiplayer scoreboard
- Add sound effects and music
- Implement user authentication
- Add mobile support with touch controls
# 🎵 Rhythm Heroes

A two-player turn-based rhythm game built with Next.js, inspired by Guitar Hero. Players take turns hitting falling notes to score points and compete for the highest score!

## 🎮 How to Play

1. **Start the Game**: Click "Start Game" to begin
2. **Hit Notes**: Use the A, S, D, F, G keys to hit falling notes when they reach the target line
3. **Score Points**: 
   - Perfect hits (green) = 100 points
   - Good hits (yellow) = 50 points
   - Miss = 0 points and resets your streak
4. **Take Turns**: Players alternate turns, each getting 10 turns total
5. **Win**: The player with the highest score after all turns wins!

## 🚀 Features

- **Turn-based Gameplay**: No real-time connection needed
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Built with Framer Motion
- **Score Tracking**: Tracks scores, streaks, and best streaks
- **Visual Feedback**: Color-coded hits and effects
- **Vercel Ready**: Optimized for single deployment

## 🛠️ Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Custom Hooks**: Game state management

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration!

The app is configured for static export and is ready for Vercel deployment.

## 🎯 Game Mechanics

- **Note Speed**: 2 seconds for notes to fall from top to target line
- **Hit Windows**: 
  - Perfect: ±100ms
  - Good: ±200ms
- **Turn System**: Each player gets 10 turns with 5 notes per turn
- **Scoring**: Points accumulate with streak bonuses

## 🎨 Customization

You can easily customize the game by modifying:

- `src/types/game.ts`: Game configuration and types
- `src/hooks/useGameState.ts`: Game logic and state management
- `tailwind.config.js`: Styling and animations
- `src/components/`: UI components and layout

## 📱 Mobile Support

The game is fully responsive and works on mobile devices with touch controls for the keyboard buttons.

---

Built with ❤️ using Next.js and modern web technologies.

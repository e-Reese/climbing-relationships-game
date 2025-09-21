const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Store active games
const games = new Map();
// Store active connections
const connections = new Map();

// Generate random key sequence for the game
const generateKeySequence = (length = 5) => {
  const keys = ['A', 'S', 'D', 'F', 'G']; // Using only these keys for Guitar Hero style
  let sequence = [];
  
  for (let i = 0; i < length; i++) {
    sequence.push({
      key: keys[Math.floor(Math.random() * keys.length)],
      timing: 1000 + (i * 1000) // Timing in ms (1 second apart)
    });
  }
  
  console.log("Generated sequence:", JSON.stringify(sequence));
  return sequence;
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle joining a game
    socket.on('join-game', (gameId) => {
      console.log('Join game request:', gameId);
      
      // If game doesn't exist, create it
      if (!games.has(gameId)) {
        const keySequence = generateKeySequence();
        const newGame = {
          id: gameId,
          players: [],
          currentPlayerIndex: 0,
          keySequence: keySequence,
          scores: [0, 0],
          climber1Position: { x: 25, y: 90 }, // Start at bottom left of mountain
          climber2Position: { x: 75, y: 90 }, // Start at bottom right of mountain
          isGameOver: false
        };
        games.set(gameId, newGame);
        console.log('Created new game:', gameId, 'with sequence:', JSON.stringify(keySequence));
      }
      
      const game = games.get(gameId);
      
      // Add player to the game if not already full
      if (game.players.length < 2) {
        game.players.push(socket.id);
        connections.set(socket.id, gameId);
        
        socket.join(gameId);
        socket.emit('game-joined', { 
          gameId, 
          playerNumber: game.players.length,
          isYourTurn: game.players.length === 1 // First player starts
        });
        
        console.log('Player joined game:', socket.id, 'as player', game.players.length);
        
        // If game is now full, start the game
        if (game.players.length === 2) {
          console.log('Game is full, starting game:', gameId);
          io.to(gameId).emit('game-start', { 
            keySequence: game.keySequence,
            currentPlayer: game.players[0]
          });
        }
      } else {
        console.log('Game is already full:', gameId);
        socket.emit('game-full');
      }
    });
    
    // Handle sequence completion
    socket.on('sequence-complete', ({ gameId, keyPresses }) => {
      console.log('Sequence complete:', gameId, JSON.stringify(keyPresses));
      
      const game = games.get(gameId);
      
      if (!game) {
        console.log('Game not found:', gameId);
        return;
      }
      
      const playerIndex = game.players.indexOf(socket.id);
      
      // Check if it's this player's turn
      if (playerIndex === game.currentPlayerIndex) {
        // Calculate score based on timing accuracy
        const score = calculateScore(game.keySequence, keyPresses);
        console.log('Score calculated:', score);
        
        // Store the score
        game.scores[playerIndex] += score.points;
        
        // Move climber based on player number (0 = player 1, 1 = player 2)
        const moveAmount = Math.min(10, 5 + (score.correctKeys * 1)); // Move 5-10 units based on performance
        
        if (playerIndex === 0) {
          // Move player 1's climber
          game.climber1Position.y = Math.max(10, game.climber1Position.y - moveAmount);
        } else {
          // Move player 2's climber
          game.climber2Position.y = Math.max(10, game.climber2Position.y - moveAmount);
        }
        
        // Check if both climbers reached the top
        const bothReachedTop = game.climber1Position.y <= 10 && game.climber2Position.y <= 10;
        game.isGameOver = bothReachedTop;
        
        // Switch turns if game not over
        if (!game.isGameOver) {
          game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 2;
          // Generate new key sequence
          game.keySequence = generateKeySequence();
        }
        
        // Emit result to all players in the game
        io.to(gameId).emit('turn-result', {
          player: socket.id,
          score: score,
          totalScore: game.scores[playerIndex],
          nextPlayer: game.isGameOver ? null : game.players[game.currentPlayerIndex],
          keySequence: game.keySequence,
          climber1Pos: game.climber1Position,
          climber2Pos: game.climber2Position,
          isGameOver: game.isGameOver
        });
        
        console.log('Turn completed, next player:', game.players[game.currentPlayerIndex]);
      } else {
        console.log('Not player\'s turn:', socket.id);
      }
    });
    
    // Handle creating a new game
    socket.on('create-game', () => {
      const gameId = uuidv4().substring(0, 6);
      console.log('Created game with ID:', gameId);
      socket.emit('game-created', { gameId });
    });
    
    // Debug endpoint to check game state
    socket.on('debug-game-state', ({ gameId }) => {
      const game = games.get(gameId);
      if (game) {
        socket.emit('debug-game-state-response', {
          game: {
            id: game.id,
            players: game.players,
            currentPlayerIndex: game.currentPlayerIndex,
            keySequence: game.keySequence,
            scores: game.scores,
            climber1Position: game.climber1Position,
            climber2Position: game.climber2Position,
            isGameOver: game.isGameOver
          }
        });
      } else {
        socket.emit('debug-game-state-response', { game: null });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const gameId = connections.get(socket.id);
      
      if (gameId && games.has(gameId)) {
        const game = games.get(gameId);
        
        // Remove player from game
        const playerIndex = game.players.indexOf(socket.id);
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1);
          console.log('Player disconnected from game:', socket.id, gameId);
        }
        
        // Notify remaining player
        if (game.players.length > 0) {
          console.log('Notifying remaining player of disconnection');
          io.to(gameId).emit('player-disconnected');
        } else {
          // Remove empty game
          console.log('Removing empty game:', gameId);
          games.delete(gameId);
        }
      }
      
      // Remove connection
      connections.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });
  });

  // Calculate score based on timing accuracy
  function calculateScore(expectedSequence, actualPresses) {
    let points = 0;
    let grade = 'F';
    let accuracy = 0;
    let correctKeys = 0;
    
    console.log('Calculating score for:');
    console.log('Expected:', JSON.stringify(expectedSequence));
    console.log('Actual:', JSON.stringify(actualPresses));
    
    // Check each key press against expected sequence
    for (let i = 0; i < expectedSequence.length; i++) {
      const expected = expectedSequence[i];
      const actual = actualPresses[i];
      
      if (!actual) continue;
      
      // Check if key is correct
      if (actual.key === expected.key) {
        correctKeys++;
        
        // Calculate timing accuracy (how close to the expected timing)
        const timingDiff = Math.abs(actual.timing - expected.timing);
        
        // Award points based on timing accuracy
        if (timingDiff < 100) { // Perfect: < 100ms
          points += 100;
        } else if (timingDiff < 200) { // Great: < 200ms
          points += 75;
        } else if (timingDiff < 300) { // Good: < 300ms
          points += 50;
        } else if (timingDiff < 500) { // Ok: < 500ms
          points += 25;
        } else { // Poor: >= 500ms
          points += 10;
        }
      }
    }
    
    // Calculate accuracy percentage
    accuracy = Math.round((correctKeys / expectedSequence.length) * 100);
    
    // Determine grade based on accuracy
    if (accuracy >= 95) grade = 'S';
    else if (accuracy >= 90) grade = 'A';
    else if (accuracy >= 80) grade = 'B';
    else if (accuracy >= 70) grade = 'C';
    else if (accuracy >= 60) grade = 'D';
    else grade = 'F';
    
    return {
      points,
      grade,
      accuracy,
      correctKeys
    };
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
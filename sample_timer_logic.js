// Core Timer Logic - Sample Implementation

class BoardGameTimer {
  constructor() {
    this.gameState = {
      mode: 1,
      players: [],
      currentPlayer: 0,
      isPaused: false,
      startTime: null,
      lastUpdateTime: null
    };
    this.timerInterval = null;
    this.updateCallback = null;
  }

  // Initialize game with players and mode
  initGame(players, mode, template = null) {
    this.gameState = {
      mode: mode,
      players: players.map((player, index) => ({
        id: index,
        name: player.name,
        color: player.color,
        totalTime: 0,
        turnTime: template?.average_turn_time || 60, // Mode 2 only
        roundTime: template?.average_round_time || 1800, // Mode 2 only
        isOvertime: false,
        turnsCount: 0
      })),
      currentPlayer: 0,
      isPaused: false,
      startTime: performance.now(),
      lastUpdateTime: performance.now()
    };
  }

  // Start/Resume timer
  start() {
    if (this.gameState.isPaused) {
      this.gameState.lastUpdateTime = performance.now();
      this.gameState.isPaused = false;
    }
    
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 100); // Update every 100ms for smooth display
  }

  // Pause timer
  pause() {
    this.gameState.isPaused = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Update timer logic
  updateTimer() {
    if (this.gameState.isPaused) return;

    const now = performance.now();
    const deltaTime = (now - this.gameState.lastUpdateTime) / 1000; // Convert to seconds
    this.gameState.lastUpdateTime = now;

    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];

    if (this.gameState.mode === 1) {
      // Mode 1: Track total time per player
      currentPlayer.totalTime += deltaTime;
    } else {
      // Mode 2: Countdown timers
      currentPlayer.turnTime -= deltaTime;
      currentPlayer.roundTime -= deltaTime;

      // Check for overtime
      if (currentPlayer.turnTime <= 0 || currentPlayer.roundTime <= 0) {
        currentPlayer.isOvertime = true;
      }
    }

    // Trigger UI update
    if (this.updateCallback) {
      this.updateCallback(this.gameState);
    }
  }

  // Advance to next player (called on screen touch)
  nextPlayer() {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    currentPlayer.turnsCount++;

    // Reset turn timer for Mode 2
    if (this.gameState.mode === 2) {
      currentPlayer.turnTime = this.gameState.template?.average_turn_time || 60;
      currentPlayer.isOvertime = false;
    }

    // Move to next player
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
  }

  // End game and return statistics
  endGame() {
    this.pause();
    
    const gameStats = {
      mode: this.gameState.mode,
      totalDuration: (performance.now() - this.gameState.startTime) / 1000,
      players: this.gameState.players.map(player => ({
        name: player.name,
        color: player.color,
        totalTime: player.totalTime,
        turnsCount: player.turnsCount,
        averageTurnTime: player.turnsCount > 0 ? player.totalTime / player.turnsCount : 0,
        wasOvertime: player.isOvertime
      }))
    };

    return gameStats;
  }

  // Set callback for UI updates
  onUpdate(callback) {
    this.updateCallback = callback;
  }

  // Get current game state
  getState() {
    return { ...this.gameState };
  }
}

// Usage Example:
/*
const timer = new BoardGameTimer();

// Initialize with 4 players
timer.initGame([
  { name: "Alice", color: "#FF5733" },
  { name: "Bob", color: "#33FF57" },
  { name: "Charlie", color: "#3357FF" },
  { name: "Diana", color: "#FF33F5" }
], 1); // Mode 1

// Set up UI update callback
timer.onUpdate((gameState) => {
  updateUI(gameState);
});

// Start the game
timer.start();

// Touch screen to advance player
document.addEventListener('touchstart', () => {
  timer.nextPlayer();
});

// Pause/Resume
document.getElementById('pauseBtn').addEventListener('click', () => {
  if (timer.getState().isPaused) {
    timer.start();
  } else {
    timer.pause();
  }
});
*/
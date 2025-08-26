class TimerEngine {
    constructor(gameData) {
        this.players = gameData.players.map((player, index) => ({
            name: player.name,
            color: player.color,
            id: index, // Use simple sequential index
            totalTime: 0,
            turnsCount: 0,
            isActive: index === 0
        }));
        
        this.mode = gameData.mode;
        this.currentPlayerIndex = 0;
        this.isPaused = false;
        this.startTime = null;
        this.lastUpdateTime = null;
        this.timerInterval = null;
        this.updateCallback = null;
    }

    start() {
        const wasResuming = this.isPaused;
        
        if (this.isPaused) {
            // Resume from pause
            this.lastUpdateTime = performance.now();
            this.isPaused = false;
        } else {
            // Fresh start
            this.startTime = performance.now();
            this.lastUpdateTime = this.startTime;
        }
        
        // Play resume sound if resuming
        if (wasResuming && window.SoundManager) {
            console.log('Triggering resume sound');
            window.SoundManager.playResume();
        }

        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 200); // Update every 200ms for smoother display

        this.triggerUpdate();
    }

    pause() {
        this.isPaused = true;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Play pause sound and haptic
        if (window.SoundManager) {
            console.log('Triggering pause sound');
            window.SoundManager.playPause();
        }
        if (window.HapticManager) {
            window.HapticManager.vibratePause();
        }
        
        this.triggerUpdate();
    }

    updateTimer() {
        if (this.isPaused) return;

        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // Update current player's time (Mode 1: accumulate time)
        if (this.mode === 1) {
            this.players[this.currentPlayerIndex].totalTime += deltaTime;
        }

        this.triggerUpdate();
        
        // Auto-save game state every 5 seconds
        if (Math.floor(now / 1000) % 5 === 0) {
            this.saveGameState();
        }
    }
    
    saveGameState() {
        if (window.StorageManager) {
            const gameState = {
                mode: this.mode,
                players: this.players,
                currentPlayerIndex: this.currentPlayerIndex,
                isPaused: this.isPaused,
                startTime: this.startTime,
                gameStarted: true
            };
            window.StorageManager.saveGameState(gameState);
        }
    }

    nextPlayer() {
        if (this.isPaused) return;

        // Get current player before changing
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        // Mark current player as inactive and increment their turn count
        currentPlayer.isActive = false;
        currentPlayer.turnsCount++;

        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // Mark new current player as active
        this.players[this.currentPlayerIndex].isActive = true;

        this.triggerUpdate();
        
        // Play turn change sound and haptic
        if (window.SoundManager) {
            console.log('Triggering turn change sound from nextPlayer');
            window.SoundManager.playTurnChange();
        }
        if (window.HapticManager) {
            window.HapticManager.vibrateTurnChange();
        }
        
        // Save state after player change
        this.saveGameState();
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getGameStats() {
        const totalGameTime = this.startTime ? (performance.now() - this.startTime) / 1000 : 0;
        
        return {
            totalGameTime,
            players: this.players.map(player => ({
                name: player.name,
                color: player.color,
                totalTime: player.totalTime,
                turnsCount: player.turnsCount,
                averageTurnTime: player.turnsCount > 0 ? player.totalTime / player.turnsCount : 0
            }))
        };
    }

    onUpdate(callback) {
        this.updateCallback = callback;
    }

    triggerUpdate() {
        if (this.updateCallback) {
            this.updateCallback({
                currentPlayer: this.getCurrentPlayer(),
                players: this.players,
                isPaused: this.isPaused,
                mode: this.mode
            });
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    end() {
        this.pause();
        
        // Clear the timer interval completely
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Clear saved game state when game ends
        if (window.StorageManager) {
            window.StorageManager.clearGameState();
        }
        
        return this.getGameStats();
    }
}
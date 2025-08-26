class CountdownTimer extends TimerEngine {
    constructor(gameData, template = null) {
        super(gameData);
        
        // Default template values if none provided
        this.template = template || {
            turn_time_seconds: 60,
            round_time_seconds: 1800
        };
        
        this.initializeCountdowns();
    }

    initializeCountdowns() {
        this.players.forEach(player => {
            player.turnTime = this.template.turn_time_seconds;
            player.roundTime = this.template.round_time_seconds;
            player.isOvertime = false;
            player.overtimeSeconds = 0;
        });
    }

    updateTimer() {
        if (this.isPaused) return;

        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        const currentPlayer = this.players[this.currentPlayerIndex];

        if (this.mode === 2) {
            // Mode 2: Countdown both timers
            currentPlayer.turnTime -= deltaTime;
            currentPlayer.roundTime -= deltaTime;

            // Track overtime
            if (currentPlayer.turnTime <= 0 || currentPlayer.roundTime <= 0) {
                if (!currentPlayer.isOvertime) {
                    currentPlayer.isOvertime = true;
                }
                currentPlayer.overtimeSeconds += deltaTime;
            }

            // Track total time for statistics
            currentPlayer.totalTime += deltaTime;
        } else {
            // Mode 1: Regular time tracking
            currentPlayer.totalTime += deltaTime;
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
                template: this.template,
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

        // Reset turn timer for Mode 2 (but not round timer)
        if (this.mode === 2) {
            currentPlayer.turnTime = this.template.turn_time_seconds;
            currentPlayer.isOvertime = false; // Reset overtime for new turn
        }

        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // Mark new current player as active
        this.players[this.currentPlayerIndex].isActive = true;

        this.triggerUpdate();
    }

    formatTime(seconds) {
        const isNegative = seconds < 0;
        const absSeconds = Math.abs(seconds);
        const mins = Math.floor(absSeconds / 60);
        const secs = Math.floor(absSeconds % 60);
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return isNegative ? `-${timeStr}` : timeStr;
    }

    getGameStats() {
        const totalGameTime = this.startTime ? (performance.now() - this.startTime) / 1000 : 0;
        
        return {
            totalGameTime,
            mode: this.mode,
            template: this.template,
            players: this.players.map(player => ({
                name: player.name,
                color: player.color,
                totalTime: player.totalTime,
                turnsCount: player.turnsCount,
                averageTurnTime: player.turnsCount > 0 ? player.totalTime / player.turnsCount : 0,
                finalTurnTime: player.turnTime,
                finalRoundTime: player.roundTime,
                wasOvertime: player.isOvertime,
                overtimeSeconds: player.overtimeSeconds || 0
            }))
        };
    }
}
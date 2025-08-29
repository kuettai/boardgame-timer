class TimerEngine {
    constructor(gameData) {
        this.players = gameData.players.map((player, index) => ({
            name: player.name,
            color: player.color,
            id: player.id !== undefined ? player.id : index,
            totalTime: player.totalTime || 0,
            turnsCount: player.turnsCount || 0,
            isActive: player.isActive !== undefined ? player.isActive : (index === 0)
        }));
        
        this.mode = gameData.mode;
        this.turnFlow = gameData.turnFlow || 'sequential';
        this.globalTurnNumber = gameData.globalTurnNumber || 0;
        this.currentPlayerIndex = gameData.currentPlayerIndex || 0;
        this.isPaused = gameData.isPaused || false;
        this.startTime = gameData.startTime || null;
        this.totalGameTime = gameData.totalGameTime || 0;
        this.lastUpdateTime = null;
        this.timerInterval = null;
        this.updateCallback = null;
        this.turnHistory = [];
        this.maxHistoryItems = 10;
        this.lastSaveSecond = -1;
    }

    start() {
        const wasResuming = this.isPaused;
        
        if (this.isPaused) {
            // Resume from pause
            this.lastUpdateTime = performance.now();
            this.isPaused = false;
        } else if (this.startTime) {
            // Resume from saved state - adjust startTime to account for elapsed time
            const now = performance.now();
            this.lastUpdateTime = now;
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

        // Update total game time (always)
        this.totalGameTime += deltaTime;

        // Update current player's time (Mode 1: accumulate time)
        if (this.mode === 1) {
            this.players[this.currentPlayerIndex].totalTime += deltaTime;
        }

        this.triggerUpdate();
        
        // Auto-save game state every 5 seconds (with debounce)
        const currentSecond = Math.floor(now / 1000);
        if (currentSecond % 5 === 0 && currentSecond !== this.lastSaveSecond) {
            this.lastSaveSecond = currentSecond;
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
                turnFlow: this.turnFlow,
                globalTurnNumber: this.globalTurnNumber,
                totalGameTime: this.totalGameTime,
                gameStarted: true
            };

            window.StorageManager.saveGameState(gameState);
        }
    }

    nextPlayer() {
        if (this.isPaused) return;

        // Get current player before changing
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        // Record turn in history
        this.recordTurn(currentPlayer);
        
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

    recordTurn(player) {
        // Calculate turn time based on mode
        let turnTime = 0;
        
        if (this.mode === 1) {
            // Mode 1: Calculate time spent this turn
            const lastHistory = this.turnHistory.find(h => h.playerId === player.id);
            const previousTotal = lastHistory ? lastHistory.previousTotal : 0;
            turnTime = player.totalTime - previousTotal;
        } else {
            // Mode 2: Time used from turn timer
            turnTime = (this.template?.turn_time_seconds || 60) - (player.turnTime || 0);
        }
        
        // Increment global turn number
        this.globalTurnNumber++;
            
        const historyItem = {
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            turnTime: Math.max(0, turnTime),
            timestamp: Date.now(),
            turnNumber: this.globalTurnNumber,
            previousTotal: player.totalTime
        };
        
        this.turnHistory.unshift(historyItem);
        
        // Keep only recent turns
        if (this.turnHistory.length > this.maxHistoryItems) {
            this.turnHistory = this.turnHistory.slice(0, this.maxHistoryItems);
        }
        
        this.updateTurnHistoryDisplay();
    }
    
    updateTurnHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (this.turnHistory.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 1rem;">No turns yet</div>';
            return;
        }
        
        historyList.innerHTML = this.turnHistory.map(item => `
            <div class="history-item" style="border-left-color: ${item.playerColor}">
                <span class="history-turn">#${item.turnNumber}</span>
                <span class="history-player">${item.playerName}</span>
                <span class="history-time">${this.formatTime(item.turnTime)}</span>
            </div>
        `).join('');
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
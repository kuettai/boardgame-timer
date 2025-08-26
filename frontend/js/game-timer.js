class GameTimer {
    constructor() {
        this.timerEngine = null;
        this.handleTouch = null;
        this.isInitialized = false;
        this.uiEffects = null;
        this.lastPlayerIndex = -1;
    }

    init(gameData) {
        // Clean up any existing game first
        this.cleanup();
        
        // Use CountdownTimer for Mode 2, regular TimerEngine for Mode 1
        if (gameData.mode === 2) {
            this.timerEngine = new CountdownTimer(gameData, gameData.template);
        } else {
            this.timerEngine = new TimerEngine(gameData);
        }
        
        this.uiEffects = window.UIEffects;
        this.lastPlayerIndex = -1;
        
        // Only setup UI and events if not already initialized
        if (!this.isInitialized) {
            this.setupUI();
            this.bindEvents();
            this.setupTouchHandler();
            this.isInitialized = true;
        } else {
            // Just setup UI for existing handlers
            this.setupUI();
        }
        
        // Start the timer
        this.timerEngine.start();
        
        // Play game start sound and haptic
        if (window.SoundManager) {
            window.SoundManager.playGameStart();
        }
        if (window.HapticManager) {
            window.HapticManager.vibrateGameStart();
        }
        
        // Activate screen wake lock during game
        if (window.WakeLockManager) {
            window.WakeLockManager.requestWakeLock();
        }
        
        console.log('Game Timer initialized with mode:', gameData.mode);
    }
    
    resume(savedState) {
        // Clean up any existing game first
        this.cleanup();
        
        // Restore timer engine with saved state
        if (savedState.mode === 2) {
            this.timerEngine = new CountdownTimer(savedState, savedState.template);
        } else {
            this.timerEngine = new TimerEngine(savedState);
        }
        
        // Restore game state
        this.timerEngine.players = savedState.players;
        this.timerEngine.currentPlayerIndex = savedState.currentPlayerIndex;
        this.timerEngine.isPaused = savedState.isPaused;
        this.timerEngine.startTime = savedState.startTime;
        
        this.uiEffects = window.UIEffects;
        this.lastPlayerIndex = -1;
        
        // Setup UI and events
        if (!this.isInitialized) {
            this.setupUI();
            this.bindEvents();
            this.setupTouchHandler();
            this.isInitialized = true;
        } else {
            this.setupUI();
        }
        
        // Resume the timer if it wasn't paused
        if (!savedState.isPaused) {
            this.timerEngine.start();
        } else {
            this.timerEngine.triggerUpdate();
        }
        
        console.log('Game resumed from saved state');
    }

    setupUI() {
        this.timerEngine.onUpdate((gameState) => {
            this.updateDisplay(gameState);
        });
        
        // Initial display update
        setTimeout(() => {
            this.updateDisplay({
                currentPlayer: this.timerEngine.getCurrentPlayer(),
                players: this.timerEngine.players,
                isPaused: false,
                mode: this.timerEngine.mode
            });
        }, 100);
    }

    updateDisplay(gameState) {
        // Update current player display
        const currentPlayerEl = document.getElementById('current-player');
        const timerValueEl = document.getElementById('timer-value');
        const allPlayersEl = document.getElementById('all-players');
        const pauseBtn = document.getElementById('pause-btn');

        if (currentPlayerEl && gameState.currentPlayer) {
            // Check if player changed for animation
            const currentIndex = gameState.players.findIndex(p => p.isActive);
            if (this.lastPlayerIndex !== -1 && this.lastPlayerIndex !== currentIndex) {
                this.uiEffects?.animatePlayerChange(currentPlayerEl);
                this.uiEffects?.flashScreen(gameState.currentPlayer.color + '20', 150);
            }
            this.lastPlayerIndex = currentIndex;
            
            currentPlayerEl.textContent = gameState.currentPlayer.name;
            currentPlayerEl.style.backgroundColor = gameState.currentPlayer.color;
            currentPlayerEl.style.color = this.getContrastColor(gameState.currentPlayer.color);
        }

        // Update timer value
        if (timerValueEl && gameState.currentPlayer) {
            const timeToShow = gameState.mode === 1 ? 
                gameState.currentPlayer.totalTime : 
                gameState.currentPlayer.turnTime || 0;
            timerValueEl.textContent = this.timerEngine.formatTime(timeToShow);
            
            // Add overtime styling for Mode 2
            if (gameState.mode === 2 && gameState.currentPlayer.isOvertime) {
                this.uiEffects?.applyOvertimeEffect(timerValueEl, true);
            } else {
                this.uiEffects?.applyOvertimeEffect(timerValueEl, false);
            }
            
            // Remove heartbeat animation - it's distracting
            // this.uiEffects?.animateTimerUpdate(timerValueEl);
        }

        // Update all players display
        if (allPlayersEl) {
            allPlayersEl.innerHTML = '';
            const playerElements = [];
            
            gameState.players.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-time smooth-transition';
                playerDiv.style.borderLeftColor = player.color;
                
                if (player.isActive) {
                    playerDiv.style.backgroundColor = player.color + '20';
                    playerDiv.classList.add('active-player');
                }
                
                // Add overtime indicator
                if (player.isOvertime) {
                    playerDiv.classList.add('overtime-player');
                }
                
                playerElements.push(playerDiv);

                let displayContent = `
                    <div style="font-weight: bold; color: ${player.color}">
                        ${player.name}
                        ${player.isOvertime ? ' 😞' : ''}
                    </div>
                `;
                
                if (gameState.mode === 1) {
                    displayContent += `
                        <div>${this.timerEngine.formatTime(player.totalTime)}</div>
                        <div style="font-size: 0.8em; opacity: 0.7">Turns: ${player.turnsCount}</div>
                    `;
                } else {
                    displayContent += `
                        <div style="font-size: 0.9em">
                            Turn: ${this.timerEngine.formatTime(player.turnTime)}
                        </div>
                        <div style="font-size: 0.9em">
                            Round: ${this.timerEngine.formatTime(player.roundTime)}
                        </div>
                        <div style="font-size: 0.8em; opacity: 0.7">Turns: ${player.turnsCount}</div>
                    `;
                }
                
                playerDiv.innerHTML = displayContent;
                allPlayersEl.appendChild(playerDiv);
                
                // Remove fade-in to prevent blinking
                // this.uiEffects?.fadeInElement(playerDiv);
            });
        }

        // Update pause button
        if (pauseBtn) {
            pauseBtn.textContent = gameState.isPaused ? 'Resume' : 'Pause';
        }

        // Update pause visual state
        const gameScreen = document.getElementById('game-screen');
        const timerDisplay = document.getElementById('timer-display');
        
        if (gameState.isPaused) {
            gameScreen.classList.add('paused');
            timerDisplay.classList.add('paused');
            
            // Show pause overlay if not exists
            if (!document.getElementById('pause-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'pause-overlay';
                overlay.className = 'pause-overlay';
                overlay.innerHTML = `
                    <div class="pause-content">
                        <div class="pause-icon">⏸️</div>
                        <div class="pause-text">GAME PAUSED</div>
                        <div class="pause-subtitle">Touch Resume to continue</div>
                    </div>
                `;
                gameScreen.appendChild(overlay);
            }
        } else {
            gameScreen.classList.remove('paused');
            timerDisplay.classList.remove('paused');
            
            // Remove pause overlay
            const overlay = document.getElementById('pause-overlay');
            if (overlay) {
                overlay.remove();
            }
        }

        // Update page title with current player (for background tabs)
        document.title = gameState.isPaused ? 
            'PAUSED - BoardGame Timer' : 
            `${gameState.currentPlayer?.name || 'Player'}'s Turn - BoardGame Timer`;
    }

    setupTouchHandler() {
        const gameScreen = document.getElementById('game-screen');
        
        // Remove existing listeners to prevent duplicates
        if (this.handleTouch) {
            gameScreen.removeEventListener('touchstart', this.handleTouch);
            gameScreen.removeEventListener('click', this.handleTouch);
        }
        
        let lastTouchTime = 0;
        const touchDebounceMs = 300;

        this.handleTouch = (e) => {
            // Don't advance if clicking on control buttons
            if (e.target.tagName === 'BUTTON') return;
            
            const now = Date.now();
            if (now - lastTouchTime < touchDebounceMs) return;
            lastTouchTime = now;

            if (this.timerEngine) {
                if (!this.timerEngine.isPaused) {
                    // Create touch ripple effect
                    const rect = gameScreen.getBoundingClientRect();
                    const x = (e.clientX || e.touches?.[0]?.clientX || rect.width / 2) - rect.left;
                    const y = (e.clientY || e.touches?.[0]?.clientY || rect.height / 2) - rect.top;
                    
                    this.uiEffects?.createTouchRipple(x, y, gameScreen);
                    
                    console.log('Touch detected, advancing player');
                    this.timerEngine.nextPlayer();
                } else {
                    // Game is paused - show visual feedback
                    this.uiEffects?.shakeElement(document.getElementById('pause-overlay'));
                }
            }
        };

        // Handle both touch and click events
        gameScreen.addEventListener('touchstart', this.handleTouch, { passive: true });
        gameScreen.addEventListener('click', this.handleTouch);
    }

    bindEvents() {
        // Pause/Resume button
        document.getElementById('pause-btn').addEventListener('click', (e) => {
            this.uiEffects?.animateButtonPress(e.target);
            
            if (this.timerEngine.isPaused) {
                this.timerEngine.start();
            } else {
                this.timerEngine.pause();
            }
        });

        // End game button
        document.getElementById('end-game-btn').addEventListener('click', (e) => {
            this.uiEffects?.animateButtonPress(e.target);
            this.endGame();
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.timerEngine && !this.timerEngine.isPaused) {
                // Optionally pause when tab is hidden
                console.log('Tab hidden - timer continues running');
            }
        });
    }

    endGame() {
        if (!this.timerEngine) return;

        const confirmEnd = confirm('Are you sure you want to end the game?');
        if (!confirmEnd) return;

        const gameStats = this.timerEngine.end();
        this.showGameStats(gameStats);
    }

    showGameStats(stats) {
        // Enhanced stats display for both modes
        let statsText = `Game Ended!\n\nTotal Game Time: ${this.timerEngine.formatTime(stats.totalGameTime)}\n`;
        statsText += `Mode: ${stats.mode === 1 ? 'Time Tracking' : 'Countdown Timer'}\n\nPlayer Stats:\n`;
        
        stats.players.forEach(player => {
            statsText += `\n${player.name}:\n`;
            statsText += `  Total Time: ${this.timerEngine.formatTime(player.totalTime)}\n`;
            statsText += `  Turns: ${player.turnsCount}\n`;
            
            if (player.turnsCount > 0) {
                statsText += `  Avg Turn: ${this.timerEngine.formatTime(player.averageTurnTime)}\n`;
            }
            
            if (stats.mode === 2) {
                statsText += `  Final Turn Time: ${this.timerEngine.formatTime(player.finalTurnTime)}\n`;
                statsText += `  Final Round Time: ${this.timerEngine.formatTime(player.finalRoundTime)}\n`;
                if (player.wasOvertime) {
                    statsText += `  Overtime: ${this.timerEngine.formatTime(player.overtimeSeconds)}\n`;
                }
            }
        });

        // Play game end sound
        if (window.SoundManager) {
            console.log('Triggering game end sound');
            window.SoundManager.playGameEnd();
        }
        
        alert(statsText);

        // Release wake lock when game ends
        if (window.WakeLockManager) {
            window.WakeLockManager.releaseWakeLock();
        }
        
        // Clean up game state
        this.cleanup();

        // Return to setup screen
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('setup-screen').classList.add('active');
        document.title = 'BoardGame Timer';
        
        // Reset player setup for clean state
        if (window.app && window.app.playerSetup) {
            window.app.playerSetup.resetForNewGame();
        }
    }

    cleanup() {
        // Clean up timer engine
        if (this.timerEngine) {
            this.timerEngine.pause();
            if (this.timerEngine.timerInterval) {
                clearInterval(this.timerEngine.timerInterval);
                this.timerEngine.timerInterval = null;
            }
            this.timerEngine.updateCallback = null;
            this.timerEngine = null;
        }
        
        // Reset state but keep touch handler
        this.lastPlayerIndex = -1;
    }

    getContrastColor(hexColor) {
        // Simple contrast calculation
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }
}

// Make GameTimer globally available
window.GameTimer = new GameTimer();
class PlayerSetup {
    constructor() {
        this.players = [];
        this.maxPlayers = 8;
        this.minPlayers = 2;
        this.usedColors = new Set();
        this.defaultColors = [
            '#FF5733', '#33FF57', '#3357FF', '#FF33F5',
            '#FFFF33', '#33FFFF', '#FF8C33', '#8C33FF'
        ];
        
        this.init();
    }

    init() {
        this.addDefaultPlayers();
        this.bindEvents();
        this.updateUI();
    }

    addDefaultPlayers() {
        this.addPlayer('Player 1', this.defaultColors[0]);
        this.addPlayer('Player 2', this.defaultColors[1]);
    }

    bindEvents() {
        document.getElementById('add-player').addEventListener('click', (e) => {
            window.UIEffects?.animateButtonPress(e.target);
            
            if (this.players.length < this.maxPlayers) {
                const nextColor = this.getNextAvailableColor();
                this.addPlayer(`Player ${this.players.length + 1}`, nextColor);
            }
        });

        document.getElementById('start-game').addEventListener('click', (e) => {
            window.UIEffects?.animateButtonPress(e.target);
            
            if (this.validateSetup()) {
                this.startGame();
            } else {
                window.UIEffects?.shakeElement(e.target);
            }
        });

        // Mode selection change handler
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleTemplateSelection();
            });
        });
        
        // Template selection change handler
        document.querySelectorAll('input[name="template"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleCustomTimers();
            });
        });
    }

    toggleTemplateSelection() {
        const mode = this.getGameMode();
        const templateSection = document.getElementById('template-selection');
        
        if (mode === 2) {
            templateSection.style.display = 'block';
        } else {
            templateSection.style.display = 'none';
        }
    }
    
    toggleCustomTimers() {
        const template = document.querySelector('input[name="template"]:checked');
        const customTimers = document.getElementById('custom-timers');
        
        if (template && template.value === 'custom') {
            customTimers.style.display = 'block';
        } else {
            customTimers.style.display = 'none';
        }
    }

    addPlayer(name, color) {
        if (this.players.length >= this.maxPlayers) return;

        const player = {
            id: Date.now() + Math.random(), // Unique ID
            name: name,
            color: color,
            totalTime: 0,
            turnsCount: 0
        };

        this.players.push(player);
        this.usedColors.add(color);
        this.renderPlayersList();
        this.updatePlayerCount();
        this.updateStartButton();
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index > -1 && this.players.length > this.minPlayers) {
            const player = this.players[index];
            this.usedColors.delete(player.color);
            this.players.splice(index, 1);
            this.renderPlayersList(); // Force full re-render
            this.updatePlayerCount();
            this.updateStartButton();
        }
    }

    // This method is now handled by event delegation above
    // Keeping for backward compatibility but not used
    updatePlayer(playerId, field, value) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        if (field === 'color') {
            this.usedColors.delete(player.color);
            this.usedColors.add(value);
        }

        player[field] = value;
        this.updatePlayerCount();
        this.updateStartButton();
    }
    
    resetForNewGame() {
        // Reset any game-specific state but keep player data
        this.updatePlayerCount();
        this.updateStartButton();
    }

    getNextAvailableColor() {
        return this.defaultColors.find(color => !this.usedColors.has(color)) || '#888888';
    }

    validateSetup() {
        const names = this.players.map(p => p.name.trim().toLowerCase());
        const colors = this.players.map(p => p.color);

        // Check for empty names
        if (this.players.some(p => !p.name.trim())) {
            this.showError('All players must have names');
            return false;
        }

        // Check for duplicate names
        if (new Set(names).size !== names.length) {
            this.showError('Player names must be unique');
            return false;
        }

        // Check for duplicate colors
        if (new Set(colors).size !== colors.length) {
            this.showError('Player colors must be unique');
            return false;
        }

        return true;
    }

    showError(message) {
        // Simple alert for now - can be enhanced with better UI
        alert(message);
    }

    updateUI() {
        this.updatePlayerCount();
        this.updateStartButton();
        // Don't auto re-render to preserve input focus
        // Re-rendering is now handled explicitly in add/remove methods
    }

    renderPlayersList() {
        const container = document.getElementById('players-list');
        
        // Store current focus
        const activeElement = document.activeElement;
        const focusedPlayerIndex = activeElement && activeElement.classList.contains('player-name') ? 
            Array.from(container.querySelectorAll('.player-name')).indexOf(activeElement) : -1;
        
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            playerDiv.style.borderLeftColor = player.color;
            playerDiv.dataset.playerId = player.id;

            playerDiv.innerHTML = `
                <span class="player-number">${index + 1}</span>
                <input type="text" class="player-name" value="${player.name}" 
                       placeholder="Player name" maxlength="20" data-player-id="${player.id}">
                <input type="color" class="color-picker" value="${player.color}" data-player-id="${player.id}">
                ${this.players.length > this.minPlayers ? 
                    `<button class="remove-player" data-player-id="${player.id}">×</button>` : ''}
            `;

            container.appendChild(playerDiv);
        });
        
        // Restore focus
        if (focusedPlayerIndex >= 0 && focusedPlayerIndex < container.querySelectorAll('.player-name').length) {
            const nameInputs = container.querySelectorAll('.player-name');
            nameInputs[focusedPlayerIndex].focus();
        }
        
        // Bind events using delegation
        this.bindPlayerEvents();
    }
    
    bindPlayerEvents() {
        const container = document.getElementById('players-list');
        
        // Remove existing listeners
        container.removeEventListener('input', this.handlePlayerInput);
        container.removeEventListener('change', this.handlePlayerChange);
        container.removeEventListener('click', this.handlePlayerClick);
        
        // Add event listeners using delegation
        this.handlePlayerInput = (e) => {
            if (e.target.classList.contains('player-name')) {
                const playerId = parseFloat(e.target.dataset.playerId);
                const player = this.players.find(p => p.id === playerId);
                if (player) {
                    player.name = e.target.value;
                    this.updatePlayerCount();
                    this.updateStartButton();
                }
            }
        };
        
        this.handlePlayerChange = (e) => {
            if (e.target.classList.contains('color-picker')) {
                const playerId = parseFloat(e.target.dataset.playerId);
                const player = this.players.find(p => p.id === playerId);
                if (player) {
                    this.usedColors.delete(player.color);
                    this.usedColors.add(e.target.value);
                    player.color = e.target.value;
                    
                    const playerItem = e.target.closest('.player-item');
                    if (playerItem) {
                        playerItem.style.borderLeftColor = e.target.value;
                    }
                }
            }
        };
        
        this.handlePlayerClick = (e) => {
            if (e.target.classList.contains('remove-player')) {
                const playerId = parseFloat(e.target.dataset.playerId);
                this.removePlayer(playerId);
            }
        };
        
        container.addEventListener('input', this.handlePlayerInput);
        container.addEventListener('change', this.handlePlayerChange);
        container.addEventListener('click', this.handlePlayerClick);
    }

    updatePlayerCount() {
        document.getElementById('player-count').textContent = this.players.length;
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-game');
        const addBtn = document.getElementById('add-player');
        
        startBtn.disabled = this.players.length < this.minPlayers;
        addBtn.disabled = this.players.length >= this.maxPlayers;
        
        if (this.players.length >= this.maxPlayers) {
            addBtn.textContent = 'Maximum Players Reached';
        } else {
            addBtn.textContent = '+ Add Player';
        }
    }

    getGameMode() {
        const modeInput = document.querySelector('input[name="mode"]:checked');
        return parseInt(modeInput.value);
    }

    getTemplate() {
        const templateInput = document.querySelector('input[name="template"]:checked');
        const templateType = templateInput ? templateInput.value : 'standard';
        
        if (templateType === 'custom') {
            // Get custom timer values (handle 0 values properly)
            const turnMinutesInput = document.getElementById('turn-minutes').value;
            const turnSecondsInput = document.getElementById('turn-seconds').value;
            const roundMinutesInput = document.getElementById('round-minutes').value;
            const roundSecondsInputValue = document.getElementById('round-seconds').value;
            
            const turnMinutes = turnMinutesInput === '' ? 0 : parseInt(turnMinutesInput);
            const turnSeconds = turnSecondsInput === '' ? 0 : parseInt(turnSecondsInput);
            const roundMinutes = roundMinutesInput === '' ? 1 : parseInt(roundMinutesInput);
            const roundSecondsValue = roundSecondsInputValue === '' ? 0 : parseInt(roundSecondsInputValue);
            
            return {
                turn_time_seconds: (turnMinutes * 60) + turnSeconds,
                round_time_seconds: (roundMinutes * 60) + roundSecondsValue
            };
        }
        
        const templates = {
            quick: { turn_time_seconds: 30, round_time_seconds: 900 },
            standard: { turn_time_seconds: 60, round_time_seconds: 1800 },
            long: { turn_time_seconds: 90, round_time_seconds: 3600 }
        };
        
        return templates[templateType];
    }

    getPlayerData() {
        const gameData = {
            players: this.players.map(p => ({
                name: p.name.trim(),
                color: p.color,
                totalTime: 0,
                turnsCount: 0
            })),
            mode: this.getGameMode()
        };
        
        if (gameData.mode === 2) {
            gameData.template = this.getTemplate();
        }
        
        return gameData;
    }

    startGame() {
        const startBtn = document.getElementById('start-game');
        
        // Add loading state
        startBtn.classList.add('loading');
        startBtn.disabled = true;
        startBtn.textContent = 'Starting Game...';
        
        // Small delay for visual feedback
        setTimeout(() => {
            const gameData = this.getPlayerData();
        
        // Ensure we have clean player data with proper indexing
        gameData.players = gameData.players.map((player, index) => ({
            name: player.name,
            color: player.color,
            index: index // Clean sequential index
        }));
        
        // Hide setup screen, show game screen with animation
        const setupScreen = document.getElementById('setup-screen');
        const gameScreen = document.getElementById('game-screen');
        
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active', 'screen-transition');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            gameScreen.classList.remove('screen-transition');
        }, 300);
        
            // Initialize game
            if (window.GameTimer) {
                window.GameTimer.init(gameData);
            } else {
                console.log('Game starting with:', gameData);
            }
            
            // Reset button state
            startBtn.classList.remove('loading');
            startBtn.disabled = false;
            startBtn.textContent = 'Start Game';
        }, 500); // 500ms delay for loading effect
    }
}
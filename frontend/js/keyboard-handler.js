class KeyboardHandler {
    constructor() {
        this.isEnabled = false;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    handleKeyPress(e) {
        // Don't handle keys if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const setupScreen = document.getElementById('setup-screen');
        const gameScreen = document.getElementById('game-screen');
        const isInGame = gameScreen.classList.contains('active');
        const isInSetup = setupScreen.classList.contains('active');

        // Setup screen shortcuts
        if (isInSetup) {
            switch (e.code) {
                case 'Enter':
                    e.preventDefault();
                    const startBtn = document.getElementById('start-game');
                    if (startBtn && !startBtn.disabled) {
                        startBtn.click();
                    }
                    break;
            }
        }

        // Game screen shortcuts
        if (isInGame && window.GameTimer && window.GameTimer.timerEngine) {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!window.GameTimer.timerEngine.isPaused) {
                        window.GameTimer.timerEngine.nextPlayer();
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    const pauseBtn = document.getElementById('pause-btn');
                    if (pauseBtn) {
                        pauseBtn.click();
                    }
                    break;
            }
        }
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}

// Make KeyboardHandler globally available
window.KeyboardHandler = new KeyboardHandler();
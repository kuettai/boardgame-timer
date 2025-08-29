class StorageManager {
    constructor() {
        this.GAME_STATE_KEY = 'boardgame_timer_state';
        this.SETTINGS_KEY = 'boardgame_timer_settings';
    }

    // Save current game state
    saveGameState(gameData) {
        try {
            const stateToSave = {
                ...gameData,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.warn('Failed to save game state:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    // Load saved game state
    loadGameState() {
        try {
            const saved = localStorage.getItem(this.GAME_STATE_KEY);
            if (!saved) return null;

            const gameState = JSON.parse(saved);

            
            // Check if state is too old (24 hours)
            if (Date.now() - gameState.timestamp > 24 * 60 * 60 * 1000) {
                this.clearGameState();
                return null;
            }

            return gameState;
        } catch (error) {
            console.warn('Failed to load game state:', error);
            this.clearGameState();
            return null;
        }
    }

    // Clear saved game state
    clearGameState() {
        try {
            localStorage.removeItem(this.GAME_STATE_KEY);
        } catch (error) {
            console.warn('Failed to clear game state:', error);
        }
    }

    // Check if there's a saved game
    hasSavedGame() {
        const saved = this.loadGameState();
        return saved !== null;
    }

    // Save user settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    // Load user settings
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.SETTINGS_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return {};
        }
    }

    // Handle storage errors (quota exceeded, etc.)
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            // Try to free up space by clearing old data
            this.clearGameState();
            console.warn('Storage quota exceeded, cleared old game data');
        }
    }

    // Get storage usage info
    getStorageInfo() {
        try {
            const gameState = localStorage.getItem(this.GAME_STATE_KEY);
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            
            return {
                gameStateSize: gameState ? gameState.length : 0,
                settingsSize: settings ? settings.length : 0,
                totalSize: (gameState?.length || 0) + (settings?.length || 0),
                hasGameState: !!gameState,
                hasSettings: !!settings
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Make StorageManager globally available
window.StorageManager = new StorageManager();
class HapticManager {
    constructor() {
        this.isSupported = 'vibrate' in navigator;
        this.isEnabled = true;
        this.init();
    }

    init() {
        // Load haptic preferences
        const savedEnabled = localStorage.getItem('boardgame-timer-haptics');
        this.isEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;
    }

    // Different vibration patterns for different actions
    vibrateTurnChange() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate(50); // Short pulse
        }
    }

    vibrateGameStart() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate([100, 50, 100]); // Double pulse
        }
    }

    vibrateGameEnd() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate([100, 50, 100, 50, 100, 50, 200]); // Celebratory pattern
        }
    }

    vibratePause() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate(150); // Medium pulse
        }
    }

    vibrateButton() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate(30); // Light tap
        }
    }

    vibrateOvertime() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate([100, 50, 100, 50, 100]); // Alert pattern
        }
    }
    
    vibrateTurnAlert() {
        if (this.isEnabled && this.isSupported) {
            navigator.vibrate([75, 25, 75]); // Quick double pulse for warnings
        }
    }

    toggleHaptics() {
        this.isEnabled = !this.isEnabled;
        this.saveSettings();
        
        // Test vibration if enabled
        if (this.isEnabled) {
            this.vibrateButton();
        }
        
        return this.isEnabled;
    }

    saveSettings() {
        localStorage.setItem('boardgame-timer-haptics', this.isEnabled.toString());
    }

    getSettings() {
        return {
            enabled: this.isEnabled,
            supported: this.isSupported
        };
    }
}

// Make HapticManager globally available
window.HapticManager = new HapticManager();
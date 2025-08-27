class WakeLockManager {
    constructor() {
        this.wakeLock = null;
        this.isSupported = 'wakeLock' in navigator;
    }

    async requestWakeLock() {
        if (!this.isSupported) {
            console.log('Wake Lock API not supported');
            return false;
        }

        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');
            
            // Listen for wake lock release
            this.wakeLock.addEventListener('release', () => {
                console.log('Screen wake lock released');
                this.wakeLock = null;
            });
            
            return true;
        } catch (err) {
            console.error('Failed to activate wake lock:', err);
            return false;
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                console.log('Wake lock released manually');
            } catch (err) {
                console.error('Failed to release wake lock:', err);
            }
        }
    }

    // Handle visibility change (when user switches tabs/apps)
    handleVisibilityChange() {
        if (document.visibilityState === 'visible' && !this.wakeLock) {
            // Re-request wake lock when returning to app
            this.requestWakeLock();
        }
    }

    // Initialize wake lock management
    init() {
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.releaseWakeLock();
        });
    }

    // Get wake lock status
    isActive() {
        return this.wakeLock !== null;
    }
}

// Make WakeLockManager globally available
window.WakeLockManager = new WakeLockManager();
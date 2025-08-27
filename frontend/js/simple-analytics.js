// Simple, privacy-first analytics
class SimpleAnalytics {
    constructor() {
        this.enabled = false; // Set to true to enable
        this.endpoint = 'https://your-api-endpoint.com/analytics'; // Your endpoint
    }

    // Track page view
    trackPageView() {
        if (!this.enabled) return;
        
        this.sendEvent('page_view', {
            url: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent.substring(0, 100) // Truncated for privacy
        });
    }

    // Track app installation
    trackAppInstall() {
        if (!this.enabled) return;
        
        this.sendEvent('app_install', {
            timestamp: new Date().toISOString()
        });
    }

    // Track game start
    trackGameStart(mode, playerCount) {
        if (!this.enabled) return;
        
        this.sendEvent('game_start', {
            mode: mode,
            player_count: playerCount,
            timestamp: new Date().toISOString()
        });
    }

    // Send event to your backend
    async sendEvent(eventType, data) {
        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventType,
                    data: data
                })
            });
        } catch (error) {
            // Silently fail - don't break the app
            console.debug('Analytics error:', error);
        }
    }
}

// Make available globally
window.SimpleAnalytics = new SimpleAnalytics();
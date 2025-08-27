// Main App Initialization
class App {
    constructor() {
        this.playerSetup = null;
        this.gameTimer = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Initialize player setup
        this.playerSetup = new PlayerSetup();
        
        // Check for saved game and show resume option
        this.checkForSavedGame();
        
        // Prevent screen sleep on mobile
        this.preventScreenSleep();
        
        // Handle back button / navigation
        this.handleNavigation();
        
        // Handle dynamic viewport height for mobile
        this.handleViewportHeight();
        
        console.log('BoardGame Timer initialized');
        
        // Register service worker for PWA
        this.registerServiceWorker();
        
        // Initialize wake lock manager
        if (window.WakeLockManager) {
            window.WakeLockManager.init();
        }
        
        // Initialize sound controls
        this.initSoundControls();
        
        // Handle PWA install prompt
        this.handlePWAInstall();
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            console.log('New service worker available');
                        });
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
    
    handlePWAInstall() {
        let deferredPrompt;
        
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('Install prompt available');
            
            // Show install button
            this.showInstallButton(deferredPrompt);
        });
        
        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });
        
        // Hide install button if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            console.log('App running in standalone mode');
            this.hideInstallButton();
        }
        
        // Show manual install button only if no automatic prompt and not dismissed
        setTimeout(() => {
            if (!document.getElementById('install-banner') && 
                localStorage.getItem('install-banner-dismissed') !== 'true') {
                console.log('No install prompt detected, showing manual button');
                this.showManualInstallButton();
            }
        }, 2000);
    }
    
    showInstallButton(deferredPrompt) {
        // Check if user dismissed install banner
        if (localStorage.getItem('install-banner-dismissed') === 'true') {
            return;
        }
        
        // Create install banner if not exists
        if (!document.getElementById('install-banner')) {
            const installBanner = document.createElement('div');
            installBanner.id = 'install-banner';
            installBanner.className = 'install-banner';
            installBanner.innerHTML = `
                <div class="install-content">
                    <span>📱 Install as App</span>
                    <div class="install-actions">
                        <button id="install-btn" class="btn-install">Install</button>
                        <button id="dismiss-install" class="btn-dismiss">✕</button>
                    </div>
                </div>
            `;
            
            // Add to setup screen
            const setupScreen = document.getElementById('setup-screen');
            setupScreen.insertBefore(installBanner, setupScreen.firstChild);
            
            // Bind install button
            document.getElementById('install-btn').onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    this.hideInstallButton();
                    deferredPrompt = null;
                });
            };
            
            // Bind dismiss button
            document.getElementById('dismiss-install').onclick = () => {
                localStorage.setItem('install-banner-dismissed', 'true');
                this.hideInstallButton();
            };
        }
    }
    
    hideInstallButton() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.remove();
        }
    }
    
    initSoundControls() {
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle && window.SoundManager) {
            // Set initial state
            this.updateSoundButton();
            
            // Bind click event
            soundToggle.addEventListener('click', () => {
                console.log('Sound button clicked');
                
                // Enable audio context on first user interaction
                window.SoundManager.enableAudioContext();
                
                // Toggle sounds
                const enabled = window.SoundManager.toggleSounds();
                console.log('Sounds now:', enabled ? 'enabled' : 'disabled');
                
                this.updateSoundButton();
                
                // Test sound immediately
                if (enabled) {
                    setTimeout(() => {
                        console.log('Playing test sound after enable');
                        window.SoundManager.playButton();
                    }, 200);
                }
            });
        }
    }
    
    updateSoundButton() {
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle && window.SoundManager) {
            const settings = window.SoundManager.getSettings();
            soundToggle.textContent = settings.enabled ? '🔊' : '🔇';
            soundToggle.title = `${settings.enabled ? 'Disable' : 'Enable'} sound effects`;
            
            if (settings.enabled) {
                soundToggle.classList.remove('disabled');
            } else {
                soundToggle.classList.add('disabled');
            }
        }
    }
    
    showManualInstallButton() {
        // Check if user dismissed install banner
        if (localStorage.getItem('install-banner-dismissed') === 'true') {
            return;
        }
        
        const installBanner = document.createElement('div');
        installBanner.id = 'install-banner';
        installBanner.className = 'install-banner';
        installBanner.innerHTML = `
            <div class="install-content">
                <span>📱 Add to Home Screen</span>
                <div class="install-actions">
                    <button id="install-btn" class="btn-install">How?</button>
                    <button id="dismiss-install" class="btn-dismiss">✕</button>
                </div>
            </div>
        `;
        
        const setupScreen = document.getElementById('setup-screen');
        setupScreen.insertBefore(installBanner, setupScreen.firstChild);
        
        // Bind buttons
        document.getElementById('install-btn').onclick = () => {
            alert('To install:\n\n1. Chrome Menu (⋮) → "Add to Home screen"\n2. Or look for install icon in address bar\n3. Name it "BoardGame Timer"');
        };
        
        document.getElementById('dismiss-install').onclick = () => {
            localStorage.setItem('install-banner-dismissed', 'true');
            this.hideInstallButton();
        };
    }
    
    checkForSavedGame() {
        if (window.StorageManager && window.StorageManager.hasSavedGame()) {
            this.showResumeOption();
        }
    }
    
    showResumeOption() {
        const setupScreen = document.getElementById('setup-screen');
        
        // Remove existing resume banner if any
        const existingBanner = document.getElementById('resume-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        // Create resume banner
        const resumeBanner = document.createElement('div');
        resumeBanner.id = 'resume-banner';
        resumeBanner.className = 'resume-banner';
        resumeBanner.innerHTML = `
            <div class="resume-content">
                <span>📱 Game in progress found</span>
                <div class="resume-buttons">
                    <button id="resume-game-btn" class="btn btn-primary">Resume Game</button>
                    <button id="new-game-btn" class="btn btn-secondary">Start New</button>
                </div>
            </div>
        `;
        
        // Insert at top of setup screen
        setupScreen.insertBefore(resumeBanner, setupScreen.firstChild);
        
        // Bind events
        document.getElementById('resume-game-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('new-game-btn').addEventListener('click', () => {
            window.StorageManager.clearGameState();
            resumeBanner.remove();
        });
    }
    
    resumeGame() {
        const savedState = window.StorageManager.loadGameState();
        if (!savedState) {
            alert('No saved game found');
            return;
        }
        
        // Hide setup screen, show game screen
        document.getElementById('setup-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // Resume the game with saved state
        if (window.GameTimer) {
            window.GameTimer.resume(savedState);
        }
    }

    preventScreenSleep() {
        // Simple approach - will enhance with NoSleep.js later
        let wakeLock = null;
        
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').then(lock => {
                wakeLock = lock;
                console.log('Screen wake lock acquired');
            }).catch(err => {
                console.log('Wake lock failed:', err);
            });
        }
    }

    handleNavigation() {
        // Handle browser back button
        window.addEventListener('popstate', (e) => {
            const gameScreen = document.getElementById('game-screen');
            const setupScreen = document.getElementById('setup-screen');
            
            if (gameScreen.classList.contains('active')) {
                // Show confirmation before going back to setup
                if (confirm('End current game and return to setup?')) {
                    gameScreen.classList.remove('active');
                    setupScreen.classList.add('active');
                } else {
                    // Prevent navigation
                    history.pushState(null, null, location.href);
                }
            }
        });
        
        // Push initial state
        history.pushState(null, null, location.href);
    }
    
    handleViewportHeight() {
        // Handle dynamic viewport height changes on mobile
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        // Set initial value
        setVH();
        
        // Update on resize (when browser UI appears/disappears)
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
    }
}

// Initialize app
window.app = new App();
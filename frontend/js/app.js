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
        
        // Load saved theme
        this.loadSavedTheme();
        
        // Register service worker for PWA
        this.registerServiceWorker();
        
        // Initialize wake lock manager
        if (window.WakeLockManager) {
            window.WakeLockManager.init();
        }
        
        // Initialize sound controls
        this.initSoundControls();
        
        // Initialize What's New button
        this.initWhatsNewButton();
        
        // Initialize theme selector
        this.initThemeSelector();
        
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
        if (window.StorageManager && window.StorageManager.hasSavedGame() && !this.gameJustEnded) {
            this.showResumeOption();
        }
    }
    
    initWhatsNewButton() {
        const whatsNewBtn = document.getElementById('whats-new-btn');
        if (whatsNewBtn) {
            whatsNewBtn.addEventListener('click', () => {
                this.showWhatsNewModal();
            });
        }
    }
    
    showWhatsNewModal() {
        const modal = document.createElement('div');
        modal.className = 'whats-new-modal-overlay';
        modal.innerHTML = `
            <div class="whats-new-modal">
                <div class="whats-new-header">
                    <h2>📰 What's New - v1.2</h2>
                    <button class="whats-new-close">×</button>
                </div>
                <div class="whats-new-content">
                    <div class="changelog">
                        <div class="changelog-section">
                            <h3>🎯 New Features</h3>
                            <ul>
                                <li><strong>Game Themes System</strong> - 5 beautiful themes: Light, Dark, Wingspan, Azul, Sagrada, Gloomhaven</li>
                                <li><strong>Immersive Atmospheres</strong> - Each theme has unique backgrounds, colors, and decorative elements</li>
                                <li><strong>Theme-Specific Effects</strong> - Animated birds, flowing tiles, stained glass, flickering candles</li>
                                <li><strong>Manual Player Selection</strong> - Choose next player manually instead of sequential flow</li>
                                <li><strong>What's New Modal</strong> - Stay updated with latest features and improvements</li>
                                <li><strong>Modern UI Design</strong> - Beautiful card-style radio buttons and improved layout</li>
                            </ul>
                        </div>
                        <div class="changelog-section">
                            <h3>🔧 Improvements</h3>
                            <ul>
                                <li><strong>Enhanced Text Visibility</strong> - Perfect readability across all themes with smart shadows</li>
                                <li><strong>Theme Persistence</strong> - Your selected theme is remembered across sessions</li>
                                <li><strong>Mobile-Optimized Themes</strong> - All themes work beautifully on mobile devices</li>
                                <li><strong>Enhanced Resume</strong> - Properly saves and restores all game settings including turn flow</li>
                                <li><strong>Better Performance</strong> - Reduced excessive auto-saving with smart debouncing</li>
                                <li><strong>Accurate Game Timer</strong> - Fixed game duration tracking across player switches</li>
                            </ul>
                        </div>
                        <div class="changelog-section">
                            <h3>🎨 Theme Highlights</h3>
                            <ul>
                                <li><strong>Wingspan</strong> 🐦 - Nature theme with flowing birds and earth tones</li>
                                <li><strong>Azul</strong> 🗿 - Colorful tile theme with geometric patterns</li>
                                <li><strong>Sagrada</strong> 🏰 - Elegant stained glass cathedral with jewel tones</li>
                                <li><strong>Gloomhaven</strong> ⚔️ - Dark fantasy with flickering candle atmosphere</li>
                            </ul>
                        </div>
                        <div class="changelog-section">
                            <h3>🐛 Bug Fixes</h3>
                            <ul>
                                <li>Fixed negative game timer on resume</li>
                                <li>Fixed player time reset issues</li>
                                <li>Fixed turn history numbering (now shows global turn sequence)</li>
                                <li>Fixed service worker caching during development</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="whats-new-footer">
                    <button class="btn-primary whats-new-ok">Got it!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind events
        modal.querySelector('.whats-new-close').onclick = () => this.closeWhatsNewModal(modal);
        modal.querySelector('.whats-new-ok').onclick = () => this.closeWhatsNewModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) this.closeWhatsNewModal(modal);
        };
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('show');
        }, 50);
    }
    
    closeWhatsNewModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    initThemeSelector() {
        const themeBtn = document.getElementById('theme-selector');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.showThemeSelector();
            });
        }
    }
    
    showThemeSelector() {
        const modal = document.createElement('div');
        modal.className = 'theme-modal-overlay';
        modal.innerHTML = `
            <div class="theme-modal">
                <div class="theme-header">
                    <h2>🎨 Select Theme</h2>
                    <button class="theme-close">×</button>
                </div>
                <div class="theme-content">
                    <div class="theme-options">
                        <div class="theme-option" data-theme="light">
                            <div class="theme-preview light-preview"></div>
                            <span>Light</span>
                        </div>
                        <div class="theme-option" data-theme="dark">
                            <div class="theme-preview dark-preview"></div>
                            <span>Dark</span>
                        </div>
                        <div class="theme-option" data-theme="wingspan">
                            <div class="theme-preview wingspan-preview"></div>
                            <span>🐦 Wingspan</span>
                        </div>
                        <div class="theme-option" data-theme="azul">
                            <div class="theme-preview azul-preview"></div>
                            <span>🗿 Azul</span>
                        </div>
                        <div class="theme-option" data-theme="sagrada">
                            <div class="theme-preview sagrada-preview"></div>
                            <span>🏰 Sagrada</span>
                        </div>
                        <div class="theme-option" data-theme="gloomhaven">
                            <div class="theme-preview gloomhaven-preview"></div>
                            <span>⚔️ Gloomhaven</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind events
        modal.querySelector('.theme-close').onclick = () => this.closeThemeModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) this.closeThemeModal(modal);
        };
        
        // Theme selection
        modal.querySelectorAll('.theme-option').forEach(option => {
            option.onclick = () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                this.closeThemeModal(modal);
            };
        });
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('show');
        }, 50);
    }
    
    closeThemeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('boardgame-timer-theme', theme);
        
        // Handle Gloomhaven candles
        if (theme === 'gloomhaven') {
            setTimeout(() => this.addGloomhavenCandles(), 100);
        } else {
            this.removeGloomhavenCandles();
        }
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('boardgame-timer-theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    addGloomhavenCandles() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay && !timerDisplay.querySelector('.extra-candle1')) {
            const candles = ['extra-candle1', 'extra-candle2', 'extra-candle3'];
            candles.forEach(candleClass => {
                const candle = document.createElement('div');
                candle.className = candleClass;
                timerDisplay.appendChild(candle);
            });
        }
    }
    
    removeGloomhavenCandles() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const candles = timerDisplay.querySelectorAll('.extra-candle1, .extra-candle2, .extra-candle3');
            candles.forEach(candle => candle.remove());
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
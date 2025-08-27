class UIEffects {
    constructor() {
        this.isAnimating = false;
    }

    // Create touch ripple effect
    createTouchRipple(x, y, container) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        
        const size = 100;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';
        
        container.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Animate player transition
    animatePlayerChange(currentPlayerElement) {
        if (this.isAnimating || !currentPlayerElement) return;
        
        this.isAnimating = true;
        currentPlayerElement.classList.add('player-transition');
        
        setTimeout(() => {
            currentPlayerElement.classList.remove('player-transition');
            this.isAnimating = false;
        }, 500);
    }

    // Animate timer update
    animateTimerUpdate(timerElement) {
        if (!timerElement) return;
        
        timerElement.classList.remove('timer-update');
        // Force reflow
        timerElement.offsetHeight;
        timerElement.classList.add('timer-update');
        
        setTimeout(() => {
            timerElement.classList.remove('timer-update');
        }, 300);
    }

    // Add smooth transitions to elements
    addSmoothTransitions(elements) {
        elements.forEach(element => {
            if (element) {
                element.classList.add('smooth-transition');
            }
        });
    }

    // Enhanced overtime effect
    applyOvertimeEffect(element, isOvertime) {
        if (!element) return;
        
        if (isOvertime) {
            element.classList.add('overtime-enhanced');
            this.startOvertimeScreenEffect();
        } else {
            element.classList.remove('overtime-enhanced');
            this.stopOvertimeScreenEffect();
        }
    }
    
    startOvertimeScreenEffect() {
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && !gameScreen.classList.contains('overtime-screen')) {
            gameScreen.classList.add('overtime-screen');
            
            // Flash screen red when overtime starts
            this.flashScreen('rgba(244, 67, 54, 0.4)', 300);
        }
    }
    
    stopOvertimeScreenEffect() {
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.remove('overtime-screen');
        }
    }
    
    triggerUrgentAlert() {
        const timerValue = document.getElementById('timer-value');
        const gameScreen = document.getElementById('game-screen');
        
        if (timerValue) {
            timerValue.style.animation = 'urgentShake 0.5s ease-in-out';
            setTimeout(() => {
                timerValue.style.animation = '';
            }, 500);
        }
        
        if (gameScreen) {
            gameScreen.style.animation = 'screenFlash 0.3s ease-in-out';
            setTimeout(() => {
                gameScreen.style.animation = '';
            }, 300);
        }
    }
    
    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        
        document.body.appendChild(confettiContainer);
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4;
            const startX = Math.random() * window.innerWidth;
            const duration = Math.random() * 2 + 2;
            const delay = Math.random() * 0.5;
            
            confetti.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                left: ${startX}px;
                top: -10px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${duration}s linear ${delay}s forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 4000);
    }

    // Active player glow effect
    setActivePlayerGlow(playerElements, activeIndex) {
        playerElements.forEach((element, index) => {
            if (element) {
                if (index === activeIndex) {
                    element.classList.add('active-player');
                } else {
                    element.classList.remove('active-player');
                }
            }
        });
    }

    // Button press animation
    animateButtonPress(button) {
        if (!button) return;
        
        // Enhanced button press with haptic feedback
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Add haptic feedback for button presses
        if (window.HapticManager) {
            window.HapticManager.vibrateButton();
        }
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 100);
    }

    // Fade in animation for new elements
    fadeInElement(element) {
        if (!element) return;
        
        element.classList.add('fade-in');
        setTimeout(() => {
            element.classList.remove('fade-in');
        }, 500);
    }

    // Screen flash effect for important events
    flashScreen(color = 'rgba(255,255,255,0.1)', duration = 200) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            pointer-events: none;
            z-index: 9999;
            opacity: 1;
            transition: opacity ${duration}ms ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, duration);
        }, 50);
    }

    // Shake animation for errors
    shakeElement(element) {
        if (!element) return;
        
        const originalTransform = element.style.transform;
        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
            element.style.transform = originalTransform;
        }, 500);
    }
}

// Add shake keyframes to CSS
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
`;

// Inject shake CSS
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Make UIEffects globally available
window.UIEffects = new UIEffects();
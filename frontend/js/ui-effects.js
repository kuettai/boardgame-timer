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
        } else {
            element.classList.remove('overtime-enhanced');
        }
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
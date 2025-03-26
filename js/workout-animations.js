/**
 * LiftMate - Workout Animations Module
 * Enhances the active workout experience with dynamic animations and visual effects
 */

const WorkoutAnimations = (() => {
    // Confetti colors based on app theme
    const getThemeColors = () => {
        const computedStyle = getComputedStyle(document.documentElement);
        return [
            computedStyle.getPropertyValue('--md-primary'),
            computedStyle.getPropertyValue('--md-secondary'),
            computedStyle.getPropertyValue('--md-tertiary'),
            computedStyle.getPropertyValue('--md-error'),
            computedStyle.getPropertyValue('--md-on-primary'),
        ];
    };
    
    /**
     * Create confetti effect for workout completion
     */
    const createConfetti = () => {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        
        const colors = getThemeColors();
        const confettiCount = 150;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Randomize confetti appearance
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const rotation = Math.random() * 360;
            const shape = Math.random() > 0.5 ? 'circle' : 'rect';
            
            confetti.style.backgroundColor = color;
            confetti.style.width = `${size}px`;
            confetti.style.height = shape === 'circle' ? `${size}px` : `${size * 1.5}px`;
            confetti.style.left = `${left}%`;
            confetti.style.animationDelay = `${delay}s`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            confetti.style.borderRadius = shape === 'circle' ? '50%' : '0';
            
            container.appendChild(confetti);
        }
        
        // Remove after animation completes
        setTimeout(() => {
            document.body.removeChild(container);
        }, 8000);
    };
    
    /**
     * Create personal record effect
     */
    const createPREffect = (targetElement) => {
        // Create flash effect
        const flashEffect = document.createElement('div');
        flashEffect.className = 'personal-record-effect';
        document.body.appendChild(flashEffect);
        
        // Add stars around the target element
        if (targetElement) {
            const starCount = 5;
            const rect = targetElement.getBoundingClientRect();
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('i');
                star.className = 'fas fa-star';
                star.style.position = 'absolute';
                star.style.color = 'gold';
                star.style.fontSize = '24px';
                star.style.zIndex = '9999';
                star.style.pointerEvents = 'none';
                
                // Calculate position around the target element
                const angle = (i / starCount) * 2 * Math.PI;
                const radius = 60;
                const left = rect.left + rect.width / 2 + radius * Math.cos(angle);
                const top = rect.top + rect.height / 2 + radius * Math.sin(angle);
                
                star.style.left = `${left}px`;
                star.style.top = `${top}px`;
                star.style.opacity = '0';
                star.style.transform = 'scale(0)';
                star.style.animation = `starBurst 1.5s ease-out ${i * 0.1}s forwards`;
                
                document.body.appendChild(star);
                
                // Remove stars after animation
                setTimeout(() => {
                    document.body.removeChild(star);
                }, 3000);
            }
        }
        
        // Remove flash effect after animation
        setTimeout(() => {
            document.body.removeChild(flashEffect);
        }, 1500);
    };
    
    /**
     * Enhance workout completion UI
     */
    const enhanceWorkoutComplete = () => {
        const completeSection = document.getElementById('workout-complete');
        if (completeSection) {
            completeSection.classList.add('completed-animation');
            createConfetti();
            
            // Add particle effect to the background
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'confetti';
                particle.style.opacity = '0.3';
                particle.style.backgroundColor = 'var(--md-tertiary)';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.borderRadius = '50%';
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${Math.random() * 2}s`;
                
                completeSection.appendChild(particle);
            }
        }
    };
    
    

    /**
     * Initialize animation listeners
     */
    const initialize = () => {
        // Listen for personal record events
        document.addEventListener('personalRecord', (e) => {
            if (e.detail && e.detail.element) {
                createPREffect(e.detail.element);
            }
        });
        
        // Listen for workout completed events
        document.addEventListener('workoutCompleted', () => {
            enhanceWorkoutComplete();
        });
    };
    
    // API
    return {
        initialize,
        createConfetti,
        createPREffect,
        enhanceWorkoutComplete
    };
})();

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    WorkoutAnimations.initialize();
});
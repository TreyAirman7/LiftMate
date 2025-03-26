/**
 * LiftMate - Button Interactions and iOS Enhancements
 * Provides improved button interactions for iPhone-friendly experience
 * and implements iOS-specific fixes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix for iOS viewport height issues
    function setVHVariable() {
        // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set the VH variable on initial load
    setVHVariable();
    
    // Reset on resize and orientation change
    window.addEventListener('resize', setVHVariable);
    window.addEventListener('orientationchange', setVHVariable);
    
    // Add class to body for iOS detection
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        document.body.classList.add('ios-device');
    }
    
    // Identify all clickable elements
    const clickableElements = document.querySelectorAll('.button, .action-button, .add-button, ' +
        '.icon-button, .nav-button, .muscle-filter, .timeframe-button, .text-button');
    
    // 1. Enhanced Ripple Effect - Dynamically positioned
    clickableElements.forEach(btn => {
        btn.addEventListener('mousedown', createRipple);
        btn.addEventListener('touchstart', createRipple, {passive: true});
    });
    
    function createRipple(e) {
        // Remove any existing ripple elements from previous clicks
        const ripples = this.getElementsByClassName('ripple-effect');
        
        // Create a new ripple
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        // Determine click position for ripple center
        const rect = this.getBoundingClientRect();
        
        // Handle both touch and mouse events
        let x, y;
        
        if (e.type === 'touchstart') {
            const touch = e.touches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Position the ripple
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        // Add ripple to button
        this.appendChild(ripple);
        
        // Clean up after animation completes
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600); // Match the ripple animation duration
    }
    
    // 2. Scale Transform effect - Add .clicked class on interaction
    clickableElements.forEach(btn => {
        // For touch devices
        btn.addEventListener('touchstart', function() {
            this.classList.add('clicked');
        }, {passive: true});
        
        btn.addEventListener('touchend', function() {
            this.classList.remove('clicked');
        }, {passive: true});
        
        // For mouse devices
        btn.addEventListener('mousedown', function() {
            this.classList.add('clicked');
        });
        
        btn.addEventListener('mouseup', function() {
            this.classList.remove('clicked');
        });
        
        // Ensure clicked state is removed if cursor leaves button during click
        btn.addEventListener('mouseleave', function() {
            this.classList.remove('clicked');
        });
    });
    
    // 3. 3D Press Effect - Added through CSS, but we can enhance with haptic feedback simulation
    function addHapticFeedback(element) {
        element.addEventListener('click', function() {
            // Add haptic feedback class
            this.classList.add('haptic-feedback');
            
            // If device supports vibration API, use it for subtle feedback
            if (navigator.vibrate) {
                navigator.vibrate(5); // Very subtle 5ms vibration
            }
            
            // Remove the class after animation completes
            setTimeout(() => {
                this.classList.remove('haptic-feedback');
            }, 150);
        });
    }
    
    // Add haptic feedback to important buttons
    document.querySelectorAll('.action-button, .button.primary').forEach(addHapticFeedback);
    
    // Accessibility enhancement - ensure keyboard focus gets visual feedback
    clickableElements.forEach(btn => {
        btn.addEventListener('keydown', function(e) {
            // If Enter or Space key is pressed
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.add('clicked');
                
                // Trigger click event
                setTimeout(() => {
                    this.click();
                    this.classList.remove('clicked');
                }, 100);
            }
        });
    });
});
/**
 * Advanced Visual Effects Helper
 * Applies advanced visual effects to elements based on their type and context
 */

(function() {
    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a moment to ensure other scripts have initialized
        setTimeout(applyAdvancedEffects, 100);
    });

    // Apply different effects to different element types
    function applyAdvancedEffects() {
        // Apply shadow effects to cards
        document.querySelectorAll('.stat-card, .exercise-card, .workout-item, .goal-item').forEach(el => {
            el.classList.add('card-shadow');
            
            // Add event listeners for subtle hover effects if device supports hover
            if (matchMedia('(hover: hover)').matches) {
                el.addEventListener('mouseenter', () => {
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                });
                
                el.addEventListener('mouseleave', () => {
                    el.style.transform = '';
                    el.style.boxShadow = '';
                });
            }
        });
        
        // Add subtle gradient background to sections
        document.querySelectorAll('.section-header').forEach(el => {
            el.classList.add('gradient-bg');
        });
        
        // Add glow effect to primary buttons
        document.querySelectorAll('.button.primary').forEach(el => {
            el.classList.add('glow-effect');
        });
        
        // Add pattern background to certain containers
        document.querySelectorAll('.templates-container, .workouts-container').forEach(el => {
            el.classList.add('pattern-bg');
        });
        
        // Apply text shadow to headers
        document.querySelectorAll('h1, h2, h3').forEach(el => {
            el.classList.add('text-shadow-effect');
        });
        
        // Add edge highlights to input elements
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.classList.add('edge-highlight');
        });
        
        // Observer to add visible class when elements enter the viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Observe all elements we've added effects to
        document.querySelectorAll('.card-shadow, .gradient-bg, .glow-effect, .pattern-bg, .text-shadow-effect, .edge-highlight').forEach(el => {
            observer.observe(el);
        });
        
        // Update the filter frequencies to create dynamic variations
        randomizeFilterFrequencies();
    }
    
    // Create more dynamic and varied filter effects
    function randomizeFilterFrequencies() {
        const filters = {
            sculptedClayTurbulence: document.getElementById('sculptedClayTurbulence'),
            subtleClayTurbulence: document.getElementById('subtleClayTurbulence'),
            sharpDissolveTurbulence: document.getElementById('sharpDissolveTurbulence'),
            liquidMorphTurbulence: document.getElementById('liquidMorphTurbulence')
        };
        
        // Only proceed if filters are available
        if (!filters.sculptedClayTurbulence) return;
        
        // Slightly randomize base frequencies for more organic feel
        filters.sculptedClayTurbulence.setAttribute('baseFrequency', (0.025 + Math.random() * 0.01).toFixed(4));
        filters.subtleClayTurbulence.setAttribute('baseFrequency', (0.035 + Math.random() * 0.01).toFixed(4));
        filters.sharpDissolveTurbulence.setAttribute('baseFrequency', (0.05 + Math.random() * 0.01).toFixed(4));
        filters.liquidMorphTurbulence.setAttribute('baseFrequency', (0.015 + Math.random() * 0.005).toFixed(4));
        
        // Randomize seeds for different patterns each pageload
        filters.sculptedClayTurbulence.setAttribute('seed', Math.floor(Math.random() * 10));
        filters.subtleClayTurbulence.setAttribute('seed', Math.floor(Math.random() * 10));
        filters.sharpDissolveTurbulence.setAttribute('seed', Math.floor(Math.random() * 10));
        filters.liquidMorphTurbulence.setAttribute('seed', Math.floor(Math.random() * 10));
    }
    
    // Handle dark/light mode transitions to adapt effects
    document.addEventListener('themeChanged', () => {
        // Detect if we're in dark mode
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // Update filter parameters based on the theme
        if (isDarkMode) {
            // In dark mode, make effects more subtle
            document.querySelectorAll('.glow-effect').forEach(el => {
                el.style.setProperty('--glow-opacity', '0.3');
            });
        } else {
            // In light mode, effects can be more visible
            document.querySelectorAll('.glow-effect').forEach(el => {
                el.style.setProperty('--glow-opacity', '0.5');
            });
        }
    });
})();
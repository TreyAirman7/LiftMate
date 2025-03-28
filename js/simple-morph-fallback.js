/**
 * Simple Morph Effect Fallback
 * A reliable fallback for the sculpted clay effect
 */

(function() {
    // Store the observer instance
    let intersectionObserver;
    
    // Run on load
    window.addEventListener('load', function() {
        console.log("Simple morph fallback initializing");
        
        // Initialize the observer
        setupObserver();
        
        // Run the fallback after a delay to give the main effect a chance
        setTimeout(() => {
            // Only apply fallback if needed
            const workingEffects = document.querySelectorAll('.morph-on-scroll.is-visible');
            if (workingEffects.length === 0) {
                console.log("Main effect not working, applying fallback");
                applyMorphEffect();
            } else {
                console.log("Main effect working, fallback not needed");
                
                // Still setup tab change handling in case main effect fails during tab changes
                setupTabChangeHandling();
            }
        }, 1500);
    });
    
    // Setup the intersection observer
    function setupObserver() {
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Animate in
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'scale(1)';
                        element.classList.add('fallback-visible');
                    }, Math.random() * 300);
                    
                    // Stop observing
                    intersectionObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.2
        });
    }
    
    // Handle tab switching
    function setupTabChangeHandling() {
        const tabButtons = document.querySelectorAll('[data-tab]');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Get the target tab ID
                const tabId = button.getAttribute('data-tab');
                console.log("Fallback detected tab change to:", tabId);
                
                setTimeout(() => {
                    const tabContent = document.getElementById(tabId);
                    if (!tabContent) return;
                    
                    // Check if main effect is working in this tab
                    const anyAnimated = tabContent.querySelectorAll('.morph-on-scroll.is-visible').length > 0;
                    
                    if (!anyAnimated) {
                        console.log("Fallback activating for tab:", tabId);
                        
                        // Apply fallback to elements in this tab
                        const elementsToAnimate = tabContent.querySelectorAll(
                            '.stat-card:not(.fallback-visible), ' +
                            '.exercise-card:not(.fallback-visible), ' +
                            '.progress-pic-item:not(.fallback-visible), ' +
                            '.workout-item:not(.fallback-visible), ' +
                            '.goal-item:not(.fallback-visible), ' +
                            '.section-header:not(.fallback-visible)'
                        );
                        
                        // Apply styles
                        elementsToAnimate.forEach(el => {
                            // Reset any previous state
                            el.style.opacity = '0';
                            el.style.transform = 'scale(0.9)';
                            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                            el.style.visibility = 'visible';
                            
                            // Force reflow
                            void el.offsetWidth;
                            
                            // Start observing
                            intersectionObserver.observe(el);
                        });
                        
                        // Immediately animate visible elements
                        const visibleElements = Array.from(elementsToAnimate).filter(el => {
                            const rect = el.getBoundingClientRect();
                            return rect.top < window.innerHeight && rect.bottom >= 0;
                        });
                        
                        visibleElements.forEach((element, index) => {
                            setTimeout(() => {
                                element.style.opacity = '1';
                                element.style.transform = 'scale(1)';
                                element.classList.add('fallback-visible');
                            }, index * 50 + 150);
                        });
                    }
                }, 500); // Wait longer to ensure main effect had a chance
            });
        });
    }
    
    // Function to apply the effect
    function applyMorphEffect() {
        // Find all elements that need animation
        const elementsToAnimate = document.querySelectorAll(
            '.stat-card, .exercise-card, .progress-pic-item, ' +
            '.workout-item, .goal-item, .section-header'
        );
        
        console.log(`Found ${elementsToAnimate.length} elements to animate`);
        
        // Apply styles
        elementsToAnimate.forEach(el => {
            // Add our classes
            el.classList.add('morph-on-scroll');
            
            // Apply initial styles
            el.style.opacity = '0';
            el.style.transform = 'scale(0.9)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            el.style.visibility = 'visible';
        });
        
        // Start observing elements
        elementsToAnimate.forEach(el => {
            intersectionObserver.observe(el);
        });
        
        // Initial animation for visible elements
        setTimeout(() => {
            // Find elements in viewport
            const visibleElements = Array.from(elementsToAnimate).filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom >= 0;
            });
            
            // Animate them with staggered delay
            visibleElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                    element.classList.add('fallback-visible');
                }, index * 50 + 100);
            });
        }, 200);
        
        // Setup tab change handling
        setupTabChangeHandling();
    }
})();
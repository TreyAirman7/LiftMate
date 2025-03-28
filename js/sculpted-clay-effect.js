/* 
 * Sculpted Clay / Displacement Morph Effect
 * 
 * Advanced SVG filter animations using displacement maps
 * for visually stunning element transitions.
 * 
 * Enhanced version: Applied to ALL app elements for maximum visual impact
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Enhanced Sculpted Clay Effect initializing...");
    
    // Force apply morph-on-scroll class to ALL content elements for maximum impact
    console.log("Setting up ALL elements for optimized clay effect...");
    document.querySelectorAll(
        // Original elements
        '.stat-card:not(.morph-on-scroll), ' +
        '.exercise-card:not(.morph-on-scroll), ' +
        '.progress-pic-item:not(.morph-on-scroll), ' +
        '.workout-item:not(.morph-on-scroll), ' +
        '.goal-item:not(.morph-on-scroll), ' +
        '.section-header:not(.morph-on-scroll), ' +
        
        // Additional UI elements
        '.form-group:not(.morph-on-scroll), ' +
        '.button:not(.morph-on-scroll), ' +
        '.action-button:not(.morph-on-scroll), ' +
        '.add-button:not(.morph-on-scroll), ' +
        '.nav-button:not(.morph-on-scroll), ' +
        '.icon-button:not(.morph-on-scroll), ' +
        '.muscle-filter:not(.morph-on-scroll), ' +
        '.timeframe-button:not(.morph-on-scroll), ' +
        '.templates-grid:not(.morph-on-scroll), ' +
        '.templates-container:not(.morph-on-scroll), ' +
        '.exercises-container:not(.morph-on-scroll), ' +
        '.pics-grid:not(.morph-on-scroll), ' +
        '.history-list:not(.morph-on-scroll), ' +
        '.goals-list:not(.morph-on-scroll), ' +
        '.section-header:not(.morph-on-scroll), ' +
        '.chart-container:not(.morph-on-scroll), ' +
        '.progress-bar-container:not(.morph-on-scroll), ' +
        '.timeframe-selector:not(.morph-on-scroll), ' +
        '.date-filter:not(.morph-on-scroll), ' +
        '.title-wrapper:not(.morph-on-scroll), ' +
        '.exercise-filters:not(.morph-on-scroll), ' +
        '.muscle-filters:not(.morph-on-scroll), ' +
        '.history-filters:not(.morph-on-scroll), ' +
        '.progress-chart-container:not(.morph-on-scroll), ' +
        '.weight-chart-container:not(.morph-on-scroll), ' +
        '.goals-section:not(.morph-on-scroll), ' +
        '.progress-pics-container:not(.morph-on-scroll), ' +
        '.stats-summary:not(.morph-on-scroll), ' +
        '.stats-dashboard:not(.morph-on-scroll), ' +
        '.orm-container:not(.morph-on-scroll), ' +
        '.records-container:not(.morph-on-scroll), ' +
        '.exercise-detail-section:not(.morph-on-scroll), ' +
        '.muscle-tags:not(.morph-on-scroll), ' +
        '.muscle-checkboxes:not(.morph-on-scroll), ' +
        '.form-actions:not(.morph-on-scroll), ' +
        '.one-rep-max-calculator:not(.morph-on-scroll), ' +
        '.weight-tracker:not(.morph-on-scroll), ' +
        '.personal-records:not(.morph-on-scroll), ' +
        'canvas:not(.morph-on-scroll), ' +
        'h1:not(.morph-on-scroll), ' +
        'h2:not(.morph-on-scroll), ' +
        'h3:not(.morph-on-scroll), ' +
        'h4:not(.morph-on-scroll), ' +
        'p:not(.morph-on-scroll), ' +
        'label:not(.morph-on-scroll)'
    ).forEach(element => {
        element.classList.add('morph-on-scroll');
    });
    
    // Get all elements that should have the effect
    const morphElements = document.querySelectorAll('.morph-on-scroll');
    console.log(`Found ${morphElements.length} elements for morph effect`);
    
    // Get the feDisplacementMap node from the SVG definition
    const feDisplacementMap = document.getElementById('displacementMapNode');
    console.log("Filter node found:", !!feDisplacementMap);
    
    // Verify essential elements exist
    if (!feDisplacementMap) {
        console.error("SVG filter with ID 'displacementMapNode' not found!");
        return;
    }
    
    if (!morphElements.length) {
        console.warn("No elements found with the class 'morph-on-scroll'");
        return;
    }
    
    // --- Performance-Optimized Configuration ---
    const INITIAL_SCALE = 80; // Reduced scale for better performance
    const ANIMATION_DURATION_MS = 600; // Shorter animation for better performance
    
    // Easing function (ease-out quadratic: starts fast, slows down)
    const easeOutQuad = t => t * (2 - t);
    // ---------------------
    
    // Store animation state globally to prevent multiple animations on the same filter node
    let isAnimatingFilter = false;
    let animationRequestId = null;
    let mutationThrottleTimer = null;
    
    // Performance optimized animation function
    const animateDisplacement = (startTime) => {
        console.log("Starting optimized displacement animation");
        isAnimatingFilter = true;
        
        // Set a guaranteed completion timeout
        const forceCompleteTimeout = setTimeout(() => {
            completeAnimation();
        }, ANIMATION_DURATION_MS + 100);
        
        // Function to handle animation completion and cleanup
        function completeAnimation() {
            // Clear timeout if it's still active
            clearTimeout(forceCompleteTimeout);
            
            // Reset filter
            feDisplacementMap.setAttribute('scale', '0');
            
            // Reset animation state
            isAnimatingFilter = false;
            if (animationRequestId) {
                cancelAnimationFrame(animationRequestId);
                animationRequestId = null;
            }
            
            // Process visible elements in batches for better performance
            const visibleElements = document.querySelectorAll('.morph-on-scroll.is-visible');
            
            // Process in smaller batches to avoid layout thrashing
            const batchSize = 15;
            const totalElements = visibleElements.length;
            
            function processBatch(startIndex) {
                const endIndex = Math.min(startIndex + batchSize, totalElements);
                
                for (let i = startIndex; i < endIndex; i++) {
                    visibleElements[i].classList.add('animation-complete');
                    visibleElements[i].style.filter = 'none';
                }
                
                // Process next batch if needed
                if (endIndex < totalElements) {
                    setTimeout(() => {
                        processBatch(endIndex);
                    }, 16); // roughly one frame at 60fps
                }
            }
            
            // Start processing batches
            processBatch(0);
        }
        
        // Animation step function - optimized with fewer calculations
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            let progress = Math.min(1, elapsed / ANIMATION_DURATION_MS); // 0 to 1
            
            // Apply easing with simplified calculation
            const easedProgress = progress * (2 - progress);
            
            // Calculate current scale with fewer operations
            const currentScale = Math.round(INITIAL_SCALE * (1 - easedProgress));
            
            // Update the SVG filter attribute - only if value actually changed
            if (currentScale !== parseFloat(feDisplacementMap.getAttribute('scale'))) {
                feDisplacementMap.setAttribute('scale', currentScale);
            }
            
            if (progress < 1) {
                // Continue animation
                animationRequestId = requestAnimationFrame(step);
            } else {
                // Animation finished
                completeAnimation();
            }
        };
        
        // Start the animation loop
        if (animationRequestId) {
            cancelAnimationFrame(animationRequestId); // Cancel any previous loop
        }
        animationRequestId = requestAnimationFrame(step);
        
        // Return a function that can be used to force completion
        return completeAnimation;
    };
    
    // Function to setup all elements that need the morph effect
    function setupMorphElements() {
        // Apply the effect to all appropriate elements if not already applied
        document.querySelectorAll(
            // Original elements
            '.stat-card:not(.morph-on-scroll), ' +
            '.exercise-card:not(.morph-on-scroll), ' +
            '.progress-pic-item:not(.morph-on-scroll), ' +
            '.workout-item:not(.morph-on-scroll), ' +
            '.goal-item:not(.morph-on-scroll), ' +
            '.section-header:not(.morph-on-scroll), ' +
            
            // Additional UI elements
            '.form-group:not(.morph-on-scroll), ' +
            '.button:not(.morph-on-scroll), ' +
            '.action-button:not(.morph-on-scroll), ' +
            '.add-button:not(.morph-on-scroll), ' +
            '.nav-button:not(.morph-on-scroll), ' +
            '.icon-button:not(.morph-on-scroll), ' +
            '.muscle-filter:not(.morph-on-scroll), ' +
            '.timeframe-button:not(.morph-on-scroll), ' +
            '.templates-grid:not(.morph-on-scroll), ' +
            '.templates-container:not(.morph-on-scroll), ' +
            '.exercises-container:not(.morph-on-scroll), ' +
            '.pics-grid:not(.morph-on-scroll), ' +
            '.history-list:not(.morph-on-scroll), ' +
            '.goals-list:not(.morph-on-scroll), ' +
            '.section-header:not(.morph-on-scroll), ' +
            '.chart-container:not(.morph-on-scroll), ' +
            '.progress-bar-container:not(.morph-on-scroll), ' +
            '.timeframe-selector:not(.morph-on-scroll), ' +
            '.date-filter:not(.morph-on-scroll), ' +
            '.title-wrapper:not(.morph-on-scroll), ' +
            '.exercise-filters:not(.morph-on-scroll), ' +
            '.muscle-filters:not(.morph-on-scroll), ' +
            '.history-filters:not(.morph-on-scroll), ' +
            '.progress-chart-container:not(.morph-on-scroll), ' +
            '.weight-chart-container:not(.morph-on-scroll), ' +
            '.goals-section:not(.morph-on-scroll), ' +
            '.progress-pics-container:not(.morph-on-scroll), ' +
            '.stats-summary:not(.morph-on-scroll), ' +
            '.stats-dashboard:not(.morph-on-scroll), ' +
            '.orm-container:not(.morph-on-scroll), ' +
            '.records-container:not(.morph-on-scroll), ' +
            '.exercise-detail-section:not(.morph-on-scroll), ' +
            '.muscle-tags:not(.morph-on-scroll), ' +
            '.muscle-checkboxes:not(.morph-on-scroll), ' +
            '.form-actions:not(.morph-on-scroll), ' +
            '.one-rep-max-calculator:not(.morph-on-scroll), ' +
            '.weight-tracker:not(.morph-on-scroll), ' +
            '.personal-records:not(.morph-on-scroll), ' +
            'canvas:not(.morph-on-scroll), ' +
            'h1:not(.morph-on-scroll), ' +
            'h2:not(.morph-on-scroll), ' +
            'h3:not(.morph-on-scroll), ' +
            'h4:not(.morph-on-scroll), ' +
            'p:not(.morph-on-scroll), ' +
            'label:not(.morph-on-scroll)'
        ).forEach(element => {
            element.classList.add('morph-on-scroll');
        });
        
        // Get all morph elements (including newly added ones)
        const allMorphElements = document.querySelectorAll('.morph-on-scroll:not(.observed)');
        console.log(`Adding ${allMorphElements.length} new elements to observer`);
        
        allMorphElements.forEach(element => {
            // Mark as observed to avoid re-observing
            element.classList.add('observed');
            
            // Start observing
            intersectionObserver.observe(element);
        });
    }
    
    // Intersection Observer setup with higher threshold for better performance
    const observerOptions = {
        root: null,
        rootMargin: '10px',
        threshold: 0.3 // Higher threshold - trigger when 30% is visible reduces simultaneous animations
    };
    
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetElement = entry.target;
                
                // Add class to handle opacity and visibility via CSS
                targetElement.classList.add('is-visible');
                targetElement.classList.add('is-animating');
                
                // Start the filter scale animation *only if not already running*
                // Since all elements share the filter, we only run the scale animation once
                // until it finishes. Subsequent elements entering view while it's running
                // will just fade in as the distortion is already resolving.
                if (!isAnimatingFilter) {
                    const startTime = performance.now();
                    animateDisplacement(startTime);
                }
                
                // Stop observing this element
                observer.unobserve(targetElement);
            }
        });
    };
    
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    
    // Set up mutation observer to watch for dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
        let hasNewElements = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // For performance-optimized effect - apply to ANY new element with a meaningful class 
                        // or tag that could benefit from animation
                        if (node.classList && node.classList.length > 0) {
                            // Almost all elements should get animation effect
                            hasNewElements = true;
                        } else if (node.tagName) {
                            // Also apply to basic HTML elements
                            const animatableTags = ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'SPAN', 
                                                  'BUTTON', 'INPUT', 'SELECT', 'CANVAS', 'UL', 
                                                  'LI', 'TABLE', 'FORM', 'LABEL'];
                            if (animatableTags.includes(node.tagName)) {
                                hasNewElements = true;
                            }
                        }
                        
                        // Check for ANY new elements within the added node
                        if (node.querySelectorAll) {
                            const childElements = node.querySelectorAll('*');
                            if (childElements.length) {
                                hasNewElements = true;
                            }
                        }
                    }
                });
            }
        });
        
        // If we found new elements, set them up
        if (hasNewElements) {
            // Use throttling to avoid excessive processing on DOM changes
            if (!mutationThrottleTimer) {
                mutationThrottleTimer = setTimeout(() => {
                    setupMorphElements();
                    mutationThrottleTimer = null;
                }, 100); // Throttle to once per 100ms for performance
            }
        }
    });
    
    // Setup for tab changes - completely reset elements on tab switch
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("Tab change detected");
            
            // Get the target tab ID
            const tabId = button.getAttribute('data-tab');
            console.log("Switching to tab:", tabId);
            
            // Force reset all animations for a clean state
            if (animationRequestId) {
                cancelAnimationFrame(animationRequestId);
                animationRequestId = null;
            }
            
            // Reset the filter scale for fresh animations
            if (feDisplacementMap) {
                feDisplacementMap.setAttribute('scale', INITIAL_SCALE);
            }
            
            // Reset animation state
            isAnimatingFilter = false;
            
            // Wait for tab to become visible and DOM to update
            setTimeout(() => {
                console.log("Processing tab content after change");
                const tabContent = document.getElementById(tabId);
                
                if (tabContent) {
                    console.log("Found tab content:", tabId);
                    
                    // Reset all elements in this tab
                    const allTabElements = tabContent.querySelectorAll('.morph-on-scroll');
                    console.log(`Found ${allTabElements.length} elements in new tab`);
                    
                    allTabElements.forEach(element => {
                        // Remove all animation classes
                        element.classList.remove('is-visible');
                        element.classList.remove('is-animating');
                        element.classList.remove('animation-complete');
                        element.classList.remove('observed');
                        
                        // Reset styles
                        element.style.opacity = '';
                        element.style.filter = '';
                        element.style.visibility = '';
                        
                        // Force a reflow
                        void element.offsetWidth;
                        
                        // Re-observe the element
                        intersectionObserver.observe(element);
                    });
                    
                    // Find elements in the current viewport and animate them
                    const elementsInView = Array.from(allTabElements).filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.top < window.innerHeight && rect.bottom >= 0;
                    });
                    
                    if (elementsInView.length) {
                        console.log(`Animating ${elementsInView.length} visible elements in new tab`);
                        
                        // Process elements with a small delay to ensure tab switch is complete
                        setTimeout(() => {
                            // Add visible class to all elements in view
                            elementsInView.forEach(element => {
                                element.classList.add('is-visible');
                                element.classList.add('is-animating');
                                element.style.visibility = 'visible';
                            });
                            
                            // Start animation
                            const startTime = performance.now();
                            animateDisplacement(startTime);
                        }, 100);
                    }
                }
            }, 100); // Increased delay for more reliable tab switching
        });
    });
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationRequestId) {
            // Page is not visible, cancel animation to save resources
            cancelAnimationFrame(animationRequestId);
            animationRequestId = null;
            isAnimatingFilter = false;
            
            // When animation is interrupted, ensure elements still look good
            document.querySelectorAll('.morph-on-scroll.is-visible').forEach(el => {
                el.classList.add('animation-complete');
                el.style.filter = 'none';
            });
        }
    });
    
    // Initial setup
    setupMorphElements();
    
    // Initial cleanup: Ensure filter scale is set correctly on page load
    if (feDisplacementMap) {
        feDisplacementMap.setAttribute('scale', INITIAL_SCALE);
    }
    
    // Check for initial visible elements in current tab
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        console.log("Found active tab:", activeTab.id);
        
        // Find visible elements in the viewport of the active tab
        const elementsInView = Array.from(activeTab.querySelectorAll('.morph-on-scroll')).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom >= 0;
        });
        
        console.log(`Found ${elementsInView.length} elements in view on initial load`);
        
        // If we have visible elements, trigger their animation on page load
        if (elementsInView.length) {
            // Let's make 100% sure the filter is correctly set
            feDisplacementMap.setAttribute('scale', INITIAL_SCALE.toString());
            
            setTimeout(() => {
                console.log("Triggering initial animation");
                elementsInView.forEach(element => {
                    element.classList.add('is-visible');
                    element.classList.add('is-animating');
                    console.log("Added animation classes to:", element);
                });
                
                console.log("Starting animation");
                const startTime = performance.now();
                animateDisplacement(startTime);
            }, 300);
        }
    }
    
    // Force the initial animation if nothing else triggered it
    setTimeout(() => {
        if (!isAnimatingFilter) {
            console.log("Force starting animation after delay");
            // Force animation on anything visible
            const visibleElements = Array.from(document.querySelectorAll('.morph-on-scroll')).filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom >= 0;
            });
            
            if (visibleElements.length) {
                visibleElements.forEach(el => {
                    el.classList.add('is-visible');
                    el.classList.add('is-animating');
                });
                
                const startTime = performance.now();
                animateDisplacement(startTime);
            }
        }
    }, 800);

    // Start the mutation observer
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
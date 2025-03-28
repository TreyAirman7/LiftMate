/* Origami Unfold Effect - Scroll Animation
 * 
 * Uses IntersectionObserver to detect when elements enter the viewport
 * and applies an unfolding animation effect.
 * 
 * This implementation includes:
 * - Automatic detection of dynamically added elements
 * - Support for nested elements that should animate independently
 * - MutationObserver to watch for DOM changes
 * - Reset animation state when tab changes
 */

(function() {
    let intersectionObserver; // Store observer reference
    let currentTabId = null; // Track active tab
    
    // Initialize when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initOrigamiUnfold);
    
    // Additional initialization when the window is fully loaded (including all resources)
    window.addEventListener('load', function() {
        // If we already have found the active tab, force its animations again
        // This handles cases where the page might render slowly
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === currentTabId) {
            setTimeout(() => {
                forceActivateElementsInTab(activeTab);
                
                // Start observing scroll position for active tab
                setupScrollObserver(activeTab);
            }, 150);
        }
    });
    
    // Set up a scroll observer to evaluate visible elements during scrolling
    function setupScrollObserver(tabElement) {
        // Create a throttled scroll handler
        let lastScrollTime = 0;
        const scrollThrottleTime = 100; // ms
        
        const scrollHandler = () => {
            const now = Date.now();
            if (now - lastScrollTime < scrollThrottleTime) return;
            lastScrollTime = now;
            
            // Find all not-yet-visible elements with reveal-on-scroll class
            const hiddenElements = tabElement.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
            
            // Nothing to do if all elements are already visible
            if (!hiddenElements.length) {
                window.removeEventListener('scroll', scrollHandler);
                return;
            }
            
            // Check which elements are now in viewport and could be revealed
            hiddenElements.forEach(element => {
                if (isInViewport(element) && !element.classList.contains('is-visible')) {
                    // Mark element as visible
                    element.classList.add('is-visible');
                }
            });
        };
        
        // Add scroll listener
        window.addEventListener('scroll', scrollHandler);
    }
    
    // If DOM is already loaded (when script is loaded after DOMContentLoaded)
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initOrigamiUnfold();
    }
    
    function initOrigamiUnfold() {
        // For individual elements, use a higher threshold and negative rootMargin
        // to ensure they're more visible before animating
        const individualObserverOptions = {
            root: null,
            rootMargin: '-20px 0px', // Only trigger when element is 20px into the viewport
            threshold: 0.2 // Requires 20% visibility to trigger
        };
        
        // For container elements, use a lower threshold
        const containerObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        // Callback function for all observers
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Element is now visible
                    entry.target.classList.add('is-visible');
                    // Store the tab it was observed in
                    const tabContainer = findTabContainer(entry.target);
                    if (tabContainer) {
                        entry.target.dataset.observedInTab = tabContainer.id;
                    }
                    // Stop observing the element so the animation only runs once
                    observer.unobserve(entry.target);
                }
            });
        };

        // Create separate observers for individual elements and containers
        const containerObserver = new IntersectionObserver(observerCallback, containerObserverOptions);
        const individualObserver = new IntersectionObserver(observerCallback, individualObserverOptions);
        
        // Store in a global object for access in other functions
        intersectionObserver = {
            container: containerObserver,
            individual: individualObserver
        };

        // Find the initial active tab
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            currentTabId = activeTab.id;
            
            // Special handling for initial page load - force activate animations
            // for elements in the initially active tab after a short delay
            setTimeout(() => {
                forceActivateElementsInTab(activeTab);
            }, 100);
        }

        // Initial setup for all elements with the reveal class
        setupRevealElements();
        
        // Watch for dynamically added content
        setupMutationObserver();
        
        // Listen for tab changes to handle elements that might be hidden initially
        listenForTabChanges();
    }
    
    function forceActivateElementsInTab(tabElement) {
        // First, process elements explicitly marked as being in the initial active tab
        const initialActiveElements = document.querySelectorAll('.reveal-on-scroll[data-initial-active="true"]');
        if (initialActiveElements.length) {
            initialActiveElements.forEach(element => {
                // Clear the special marker
                delete element.dataset.initialActive;
            });
        }
        
        // Make sure the tab is visible
        tabElement.style.opacity = "1";
        
        // Force container/section elements to be visible first (these set the stage for the tab)
        const containerElements = tabElement.querySelectorAll(
            '.section-header.reveal-on-scroll:not(.is-visible), ' +
            '.start-options-container.reveal-on-scroll:not(.is-visible), ' +
            '.templates-section.reveal-on-scroll:not(.is-visible), ' +
            '.timeframe-selector.reveal-on-scroll:not(.is-visible), ' +
            '.progress-chart-container.reveal-on-scroll:not(.is-visible), ' + 
            '.weight-tracker.reveal-on-scroll:not(.is-visible), ' +
            '.goals-section.reveal-on-scroll:not(.is-visible), ' +
            '.container > div.reveal-on-scroll:not(.is-visible):not(.exercise-card):not(.progress-pic-item):not(.stat-card):not(.goal-item):not(.workout-item)'
        );
        
        if (containerElements.length) {
            containerElements.forEach((element, index) => {
                setTimeout(() => {
                    void element.offsetWidth; // Force reflow
                    element.classList.add('is-visible');
                }, index * 50 + 100);
            });
        }
        
        // Find all individual elements that should be observed/animated
        const individualElements = tabElement.querySelectorAll(
            '.reveal-on-scroll:not(.observed):not(.section-header):not(.start-options-container):not(.templates-section)' +
            ':not(.timeframe-selector):not(.progress-chart-container):not(.weight-tracker):not(.goals-section)'
        );
        
        if (individualElements.length) {
            individualElements.forEach(element => {
                // Mark as observed
                element.classList.add('observed');
                
                // Determine if this is a prioritized individual element type
                const isPrioritizedElement = 
                    element.classList.contains('exercise-card') || 
                    element.classList.contains('progress-pic-item') ||
                    element.classList.contains('stat-card') || 
                    element.classList.contains('goal-item') ||
                    element.classList.contains('workout-item');
                
                // Trigger only the elements that are fully visible in viewport
                const rect = element.getBoundingClientRect();
                const isFullyVisible = rect.top >= 0 && 
                                      rect.bottom <= window.innerHeight;
                
                const isInTopThird = rect.top < window.innerHeight * 0.33; // Only top third of screen
                
                if (isFullyVisible && (isInTopThird || !isPrioritizedElement)) {
                    // For visible elements, activate immediately with staggered delay
                    // Non-prioritized elements get activated even if they're not in the top third
                    setTimeout(() => {
                        void element.offsetWidth; // Force reflow
                        element.classList.add('is-visible');
                    }, isPrioritizedElement ? (Math.random() * 300 + 200) : (Math.random() * 200 + 300)); 
                } else {
                    // For elements not yet visible, let the observer handle them
                    const observer = isPrioritizedElement ? 
                        intersectionObserver.individual : 
                        intersectionObserver.container;
                    
                    observer.observe(element);
                }
            });
        }
    }
    
    function activateWithStaggeredDelay(elements) {
        elements.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('is-visible');
            }, i * 50);
        });
    }
    
    function setupRevealElements() {
        // First, apply reveal-on-scroll class to individual elements that should animate separately
        setupIndividualAnimations();
        
        // Now find all elements with the reveal-on-scroll class that haven't been observed yet
        const revealElements = document.querySelectorAll('.reveal-on-scroll:not(.observed)');

        if (!revealElements.length) {
            return;
        }

        // Observe each target element
        revealElements.forEach(element => {
            // Mark as observed to avoid re-observing
            element.classList.add('observed');
            
            // Check if element is in the currently active tab
            const tabContainer = findTabContainer(element);
            const isInActiveTab = tabContainer && tabContainer.id === currentTabId;
            
            // Determine if this is an individual element or a container
            const isIndividualElement = isIndividualAnimatedElement(element);
            
            // Choose the right observer based on element type
            const observer = isIndividualElement ? 
                intersectionObserver.individual : 
                intersectionObserver.container;
            
            // For elements in the initial active tab, we'll handle them differently
            // since the IntersectionObserver might not fire for elements already in view
            if (isInActiveTab && isInViewport(element) && !isIndividualElement) {
                // Only mark container elements for forced activation
                // Individual elements should animate as they come into view
                element.dataset.initialActive = 'true';
            }
            // Special handling for elements that might be in a hidden tab initially
            else if (isElementVisible(element)) {
                observer.observe(element);
            } else {
                // For hidden elements, we'll handle them when their tab becomes active
                element.dataset.pendingObservation = 'true';
                // Also store which observer should be used when this becomes visible
                element.dataset.observerType = isIndividualElement ? 'individual' : 'container';
            }
        });
    }
    
    function isIndividualAnimatedElement(element) {
        // Check if this is an element that should animate individually
        return element.classList.contains('exercise-card') || 
               element.classList.contains('progress-pic-item') ||
               element.classList.contains('stat-card') ||
               element.classList.contains('goal-item') ||
               element.classList.contains('workout-item') ||
               element.classList.contains('form-group') ||
               element.classList.contains('exercise-filter') ||
               element.classList.contains('muscle-filter') ||
               element.classList.contains('date-filter-button') ||
               element.classList.contains('filter-group') ||
               element.classList.contains('exercise-set') ||
               element.classList.contains('workout-summary-item');
    }
    
    function setupIndividualAnimations() {
        // Apply reveal-on-scroll class to exercise cards (if not already applied)
        document.querySelectorAll('.exercise-card:not(.reveal-on-scroll)').forEach(card => {
            card.classList.add('reveal-on-scroll');
        });
        
        // Apply reveal-on-scroll class to progress pic items
        document.querySelectorAll('.progress-pic-item:not(.reveal-on-scroll)').forEach(item => {
            item.classList.add('reveal-on-scroll');
        });
        
        // Apply reveal-on-scroll class to stat cards
        document.querySelectorAll('.stat-card:not(.reveal-on-scroll)').forEach(card => {
            card.classList.add('reveal-on-scroll');
        });
        
        // Apply reveal-on-scroll class to other individual elements that should animate separately
        // Goals list items
        document.querySelectorAll('.goals-list .goal-item:not(.reveal-on-scroll)').forEach(item => {
            item.classList.add('reveal-on-scroll');
        });
        
        // Workout history items
        document.querySelectorAll('.history-list .workout-item:not(.reveal-on-scroll)').forEach(item => {
            item.classList.add('reveal-on-scroll');
        });
        
        // Apply reveal-on-scroll to ALL elements inside each tab content
        // Exclude elements that already have the class or are part of the app header
        document.querySelectorAll('.tab-content').forEach(tabContent => {
            // First, add the perspective-container class to all tab containers if not already applied
            if (!tabContent.parentElement.classList.contains('perspective-container')) {
                tabContent.parentElement.classList.add('perspective-container');
            }
            
            // Get all direct child elements that need animation
            const elementsToAnimate = tabContent.querySelectorAll(
                '.section-header:not(.reveal-on-scroll), ' +
                '.container > div:not(.reveal-on-scroll):not(.section-header):not(.perspective-container), ' +
                '.container > button:not(.reveal-on-scroll), ' +
                '.container > form:not(.reveal-on-scroll), ' +
                '.container > input:not(.reveal-on-scroll), ' +
                '.container > select:not(.reveal-on-scroll), ' +
                '.container > ul:not(.reveal-on-scroll), ' +
                '.container > ol:not(.reveal-on-scroll), ' +
                '.container > canvas:not(.reveal-on-scroll)'
            );
            
            elementsToAnimate.forEach(element => {
                // Skip elements that are part of the header or already have animation
                if (!element.closest('.app-header') && 
                    !element.classList.contains('reveal-on-scroll') &&
                    !element.classList.contains('theme-panel') &&
                    !element.parentElement.classList.contains('theme-panel')) {
                    element.classList.add('reveal-on-scroll');
                }
            });
        });
    }
    
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom >= 0 &&
            rect.left < window.innerWidth &&
            rect.right >= 0
        );
    }
    
    function setupMutationObserver() {
        // Create an observer instance to watch for DOM changes
        const mutationObserver = new MutationObserver((mutations) => {
            let hasNewElements = false;
            let hasNewIndividualElements = false;
            
            // Check if any new nodes with our class have been added
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element
                        if (node.nodeType === 1) { // Node.ELEMENT_NODE
                            // Check if the node is a card or item that should animate individually
                            if (
                                (node.classList && 
                                 (node.classList.contains('exercise-card') || 
                                  node.classList.contains('progress-pic-item') ||
                                  node.classList.contains('stat-card') ||
                                  node.classList.contains('goal-item') ||
                                  node.classList.contains('workout-item')) &&
                                 !node.classList.contains('reveal-on-scroll'))
                            ) {
                                hasNewIndividualElements = true;
                            }
                            
                            // Check if node has our class
                            if (node.classList && node.classList.contains('reveal-on-scroll') && !node.classList.contains('observed')) {
                                hasNewElements = true;
                            }
                            
                            // Check for child elements that should animate individually
                            const individualElements = node.querySelectorAll('.exercise-card:not(.reveal-on-scroll), .progress-pic-item:not(.reveal-on-scroll), .stat-card:not(.reveal-on-scroll), .goal-item:not(.reveal-on-scroll), .workout-item:not(.reveal-on-scroll)');
                            if (individualElements.length) {
                                hasNewIndividualElements = true;
                            }
                            
                            // Check for child elements with our class already
                            const childElements = node.querySelectorAll('.reveal-on-scroll:not(.observed)');
                            if (childElements.length) {
                                hasNewElements = true;
                            }
                        }
                    });
                }
            });
            
            // If we found new elements that should animate individually, set them up first
            if (hasNewIndividualElements) {
                setupIndividualAnimations();
                hasNewElements = true; // Then we need to observe them
            }
            
            // If we found new elements with reveal-on-scroll class, set them up for observation
            if (hasNewElements) {
                setupRevealElements();
            }
        });
        
        // Start observing the entire document for child additions
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function listenForTabChanges() {
        // In this app, tabs are controlled via buttons with data-tab attribute
        const tabButtons = document.querySelectorAll('[data-tab]');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // If we're navigating to a different tab, reset animations in the old tab
                if (currentTabId && currentTabId !== tabId) {
                    resetTabAnimations(currentTabId);
                }
                
                // Update the current tab
                currentTabId = tabId;
                
                // Wait for the tab content to become visible
                setTimeout(() => {
                    const tabContent = document.getElementById(tabId);
                    
                    if (tabContent) {
                        // Handle any elements that were waiting for this tab to be visible
                        activateTabAnimations(tabContent);
                    }
                }, 50); // Small delay to ensure the tab switch has completed
            });
        });
    }
    
    function resetTabAnimations(tabId) {
        // Find all animated elements in the tab that's being hidden
        const tabContent = document.getElementById(tabId);
        if (!tabContent) return;
        
        // Reset all elements with reveal-on-scroll class
        const allAnimatedElements = tabContent.querySelectorAll('.reveal-on-scroll');
        
        allAnimatedElements.forEach(element => {
            // Force a reflow to ensure transitions are applied properly when returning
            void element.offsetWidth;
            
            // Remove the visible class
            element.classList.remove('is-visible');
            // Remove the observed class so it can be re-observed
            element.classList.remove('observed');
            
            // Set to initial state and prepare for next observation
            // Using a timeout ensures the transition is completed before resetting
            setTimeout(() => {
                // Re-observe the element for next time this tab is shown
                element.dataset.pendingObservation = 'true';
            }, 50);
        });
    }
    
    function activateTabAnimations(tabContent) {
        // Find elements waiting for observation in this tab
        const pendingElements = tabContent.querySelectorAll('.reveal-on-scroll[data-pending-observation="true"]');
        
        pendingElements.forEach(element => {
            // Start observing now that the element is potentially visible
            delete element.dataset.pendingObservation;
            
            // Use the correct observer based on element type
            const observerType = element.dataset.observerType || 'container';
            const observer = observerType === 'individual' ? 
                intersectionObserver.individual : 
                intersectionObserver.container;
            
            // Clean up the data attribute
            delete element.dataset.observerType;
            
            // Start observing
            observer.observe(element);
        });
    }
    
    function isElementVisible(element) {
        // Check if element or any parent is hidden
        let currentElement = element;
        
        while (currentElement) {
            const style = window.getComputedStyle(currentElement);
            
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }
            
            currentElement = currentElement.parentElement;
        }
        
        return true;
    }
    
    function isInCurrentViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    function findTabContainer(element) {
        // Find the parent tab container for an element
        let current = element;
        while (current && current !== document) {
            if (current.classList && current.classList.contains('tab-content')) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
})();
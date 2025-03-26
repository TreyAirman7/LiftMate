/**
 * LiftMate - Swipe Navigation for iPhone
 * Enables swipe left and right gestures for tab navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const tabContents = document.querySelectorAll('.tab-content');
    const navButtons = document.querySelectorAll('.nav-button');
    
    // Skip implementation if no tabs exist
    if (tabContents.length === 0 || navButtons.length === 0) {
        return;
    }
    
    // Track touch events
    let touchStartX = 0;
    let touchEndX = 0;
    let currentTab = document.querySelector('.tab-content.active');
    
    // Get tab order mapping
    const tabOrder = Array.from(tabContents).map(tab => tab.id);
    
    // Function to navigate to a specific tab
    function navigateToTab(tabId) {
        if (!tabId) return;
        
        // Find the corresponding nav button
        const navButton = document.querySelector(`.nav-button[data-tab="${tabId}"]`);
        if (navButton) {
            navButton.click();
            
            // Add haptic feedback if available
            if ('vibrate' in navigator) {
                navigator.vibrate(15);
            }
        }
    }
    
    // Function to get next tab in order
    function getNextTab(currentTabId) {
        const currentIndex = tabOrder.indexOf(currentTabId);
        if (currentIndex === -1 || currentIndex === tabOrder.length - 1) return null;
        return tabOrder[currentIndex + 1];
    }
    
    // Function to get previous tab in order
    function getPrevTab(currentTabId) {
        const currentIndex = tabOrder.indexOf(currentTabId);
        if (currentIndex <= 0) return null;
        return tabOrder[currentIndex - 1];
    }
    
    // Set up touch event listeners
    tabContents.forEach(tab => {
        tab.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        tab.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    });
    
    // Handle swipe gestures
    function handleSwipe() {
        const swipeThreshold = 100;
        const currentTabId = document.querySelector('.tab-content.active').id;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - go to next tab
            const nextTab = getNextTab(currentTabId);
            if (nextTab) {
                navigateToTab(nextTab);
                
                // Add visual swipe indicator
                addSwipeIndicator('right');
            }
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - go to previous tab
            const prevTab = getPrevTab(currentTabId);
            if (prevTab) {
                navigateToTab(prevTab);
                
                // Add visual swipe indicator
                addSwipeIndicator('left');
            }
        }
    }
    
    // Create visual swipe indicator
    function addSwipeIndicator(direction) {
        const indicator = document.createElement('div');
        indicator.className = `swipe-indicator swipe-${direction}`;
        document.body.appendChild(indicator);
        
        // Remove after animation completes
        setTimeout(() => {
            indicator.remove();
        }, 500);
    }
    
    // Observer for active tab changes
    const tabObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' && 
                mutation.target.classList.contains('active')) {
                currentTab = mutation.target;
            }
        });
    });
    
    // Observe all tabs for class changes
    tabContents.forEach(tab => {
        tabObserver.observe(tab, { attributes: true });
    });
});

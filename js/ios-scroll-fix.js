/**
 * LiftMate - iOS Scrolling Fixes
 * Fixes scrolling issues on iOS in fullscreen (PWA) mode
 */

(function() {
    // Only apply these fixes in standalone mode (Add to Homescreen)
    if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
        console.log("iOS PWA mode detected - applying scrolling fixes");
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyScrollFixes);
        } else {
            applyScrollFixes();
        }
    }
    
    function applyScrollFixes() {
        const appContainer = document.querySelector('.app-container');
        const allTabContents = document.querySelectorAll('.tab-content');
        
        if (!appContainer) return;
        
        // Configure app container for proper scrolling
        appContainer.style.webkitOverflowScrolling = 'touch';
        
        // Prevent scrolling on body/document
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overscrollBehavior = 'none';
        
        // Prevent pull-to-refresh on iOS Safari in standalone mode
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.app-container') || e.target.closest('.modal-content')) {
                // Allow scrolling within app-container
                return;
            }
            e.preventDefault();
        }, { passive: false });
        
        // Allow all tab contents to scroll properly
        allTabContents.forEach(tabContent => {
            // Remove any max-height constraints
            tabContent.style.maxHeight = 'none';
            tabContent.style.overflow = 'visible';
        });
        
        // Set correct viewport height variables
        function setAppHeight() {
            // Get accurate window height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Set app container height
            const headerHeight = document.querySelector('.app-header')?.offsetHeight || 0;
            const navHeight = document.querySelector('.mobile-nav')?.offsetHeight || 0;
            
            // Calculate available space
            const availableHeight = window.innerHeight;
            appContainer.style.height = `${availableHeight}px`;
            
            // Force reflow to apply changes
            appContainer.style.display = 'none';
            appContainer.offsetHeight; // Force reflow
            appContainer.style.display = '';
        }
        
        // Apply height calculation
        setAppHeight();
        
        // Recalculate on resize and orientation change
        window.addEventListener('resize', debounce(setAppHeight, 100));
        window.addEventListener('orientationchange', function() {
            // Wait for orientation change to complete
            setTimeout(setAppHeight, 300);
        });
        
        // Smoothing fix for momentum scrolling
        appContainer.addEventListener('scroll', function() {
            // This empty handler helps with momentum scrolling
        }, { passive: true });
    }
    
    // Utility: Debounce function to limit rapid firing
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
})();
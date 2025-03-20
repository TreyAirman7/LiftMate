/**
 * LiftMate - Main Application Module
 * Initializes and coordinates all application modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI first
    UI.initialize();
    
    // Initialize feature modules in the correct order to avoid dependency issues
    ExerciseManager.initialize();   // Should be initialized first as other modules may need exercises
    TemplateManager.initialize();
    WorkoutManager.initialize();    // Depends on templates
    StatsManager.initialize();      // Depends on workout data
    ProgressManager.initialize();   // Depends on workout data
    HistoryManager.initialize();    // Depends on workout data
    WeightManager.initialize();
    
    // Initialize fullscreen functionality
    initializeFullscreen();
    
    // Add auto-fullscreen attempt
    setupAutoFullscreen();
    
    // Add CSS for weight stats (wasn't included in the main CSS)
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .weight-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .weight-stat {
            text-align: center;
            flex: 1;
            min-width: 80px;
            background-color: var(--card-color);
            padding: 10px;
            border-radius: 8px;
        }
        
        .stat-label {
            font-size: 0.8rem;
            color: var(--muted-text-color);
            margin-bottom: 5px;
        }
        
        .stat-value {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .stat-value.positive {
            color: var(--success-color);
        }
        
        .stat-value.negative {
            color: var(--danger-color);
        }
        
        .empty-state {
            text-align: center;
            padding: 30px;
            color: var(--muted-text-color);
        }
        
        /* Toast notifications */
        .toast {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
            text-align: center;
            max-width: 90%;
        }
        
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px);
        }
        
        .toast.toast-success {
            background-color: var(--success-color);
        }
        
        .toast.toast-error {
            background-color: var(--danger-color);
        }
        
        .toast.toast-info {
            background-color: var(--info-color);
        }
        
        /* Exercise details */
        .exercise-detail-section {
            margin-bottom: 20px;
        }
        
        .exercise-records {
            display: grid;
            gap: 10px;
        }
        
        .record-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .record-label {
            color: var(--muted-text-color);
        }
        
        .record-value {
            font-weight: 500;
        }
    `;
    
    document.head.appendChild(styleEl);
    
    // Skip service worker registration when running from file:// protocol
    // Service workers are only supported on HTTPS or localhost
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
});

/**
 * Initialize fullscreen functionality
 */
function initializeFullscreen() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    const welcomeFullscreenButton = document.getElementById('welcome-fullscreen-button');
    const welcomeContinueButton = document.getElementById('welcome-continue-button');
    const welcomeOverlay = document.getElementById('fullscreen-welcome');
    
    // Only show welcome overlay if not using the auto-fullscreen approach
    // We'll hide the welcome overlay initially and let the auto-fullscreen approach take over
    if (welcomeOverlay) {
        welcomeOverlay.style.display = 'none';
    }
    
    // Setup welcome overlay buttons if they exist (as a fallback)
    if (welcomeFullscreenButton && welcomeContinueButton) {
        // Handle welcome overlay buttons
        welcomeFullscreenButton.addEventListener('click', () => {
            toggleFullscreen();
            welcomeOverlay.style.display = 'none';
            
            // Store preference in localStorage
            localStorage.setItem('hasEnteredFullscreen', 'true');
        });
        
        welcomeContinueButton.addEventListener('click', () => {
            welcomeOverlay.style.display = 'none';
            UI.showToast('You can enter fullscreen mode anytime using the button in the top-right corner', 'info', 5000);
        });
    }
    
    if (!fullscreenButton) {
        console.error('Fullscreen button not found');
        return;
    }
    
    // Toggle fullscreen when the button is clicked
    fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // Update button icon when fullscreen state changes
    document.addEventListener('fullscreenchange', updateFullscreenButtonIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonIcon);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonIcon);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtonIcon);
}


/**
 * Check if the device is iOS
 * @returns {boolean} True if iOS device
 */
function isiOSDevice() {
    return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    // Special handling for iOS devices
    if (isiOSDevice()) {
        // For iOS, show special instructions and hide fullscreen button
        const fullscreenButton = document.getElementById('fullscreen-button');
        if (fullscreenButton) {
            fullscreenButton.style.display = 'none';
        }
        
        // Show iOS-specific instructions
        UI.showToast('Add to Home Screen for the best experience on iOS', 'info', 5000);
        
        // Show a special modal with iOS instructions if this is the first visit
        if (!localStorage.getItem('iosInstructionsShown')) {
            showIOSInstructions();
            localStorage.setItem('iosInstructionsShown', 'true');
        }
        
        return;
    }
    
    // Normal fullscreen handling for non-iOS devices
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
        // Enter fullscreen
        const docEl = document.documentElement;
        
        try {
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen();
            } else if (docEl.webkitRequestFullscreen) { // Safari desktop
                docEl.webkitRequestFullscreen();
            } else if (docEl.msRequestFullscreen) { // IE11
                docEl.msRequestFullscreen();
            } else if (docEl.mozRequestFullScreen) { // Firefox
                docEl.mozRequestFullScreen();
            } else {
                // If no fullscreen API is available
                UI.showToast('Fullscreen is not supported in your browser', 'error');
                return;
            }
            
            // Show success message
            UI.showToast('Entered fullscreen mode', 'success');
        } catch (error) {
            console.error('Fullscreen error:', error);
            UI.showToast('Could not enter fullscreen mode', 'error');
        }
    } else {
        // Exit fullscreen
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari desktop
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE11
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            }
            
            // Show notification
            UI.showToast('Exited fullscreen mode', 'info');
        } catch (error) {
            console.error('Exit fullscreen error:', error);
            UI.showToast('Could not exit fullscreen mode', 'error');
        }
    }
}

/**
 * Show iOS-specific instructions modal
 */
function showIOSInstructions() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'ios-instructions-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '999999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // Create modal content
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.borderRadius = '15px';
    content.style.padding = '20px';
    content.style.maxWidth = '85%';
    content.style.textAlign = 'center';
    
    // Create header
    const header = document.createElement('h2');
    header.textContent = 'For the Best Experience on iOS';
    header.style.color = '#774C36';
    header.style.marginBottom = '20px';
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <p style="margin-bottom: 15px;">To use LiftMate in fullscreen mode on your iPhone:</p>
        <ol style="text-align: left; margin-bottom: 20px;">
            <li style="margin-bottom: 10px;">Tap the <strong>Share</strong> button <span style="display: inline-block; width: 20px; height: 20px; background-color: #0076FF; color: white; text-align: center; line-height: 20px; border-radius: 5px;">↑</span></li>
            <li style="margin-bottom: 10px;">Select <strong>"Add to Home Screen"</strong></li>
            <li style="margin-bottom: 10px;">Tap <strong>"Add"</strong></li>
            <li>Launch LiftMate from your home screen icon</li>
        </ol>
        <p>This will give you a fullscreen, app-like experience!</p>
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Got it!';
    closeButton.style.backgroundColor = '#D06A41';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.padding = '10px 20px';
    closeButton.style.borderRadius = '8px';
    closeButton.style.marginTop = '20px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Assemble modal
    content.appendChild(header);
    content.appendChild(instructions);
    content.appendChild(closeButton);
    modal.appendChild(content);
    
    // Add to DOM
    document.body.appendChild(modal);
}

/**
 * Update the fullscreen button icon based on current state
 */
function updateFullscreenButtonIcon() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    const iconElement = fullscreenButton.querySelector('i');
    
    if (!fullscreenButton || !iconElement) return;
    
    if (document.fullscreenElement || 
        document.mozFullScreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement) {
        // We are in fullscreen mode
        iconElement.classList.remove('fa-expand');
        iconElement.classList.add('fa-compress');
        fullscreenButton.title = 'Exit Fullscreen';
    } else {
        // We are not in fullscreen mode
        iconElement.classList.remove('fa-compress');
        iconElement.classList.add('fa-expand');
        fullscreenButton.title = 'Enter Fullscreen';
        
        // Check if user had previously chosen fullscreen mode
        const hasEnteredFullscreen = localStorage.getItem('hasEnteredFullscreen');
        
        if (hasEnteredFullscreen === 'true') {
            // Show a toast with a suggestion to re-enter fullscreen
            UI.showToast('Press the fullscreen button to return to fullscreen mode', 'info', 3000);
            
            // Highlight the fullscreen button
            fullscreenButton.classList.add('highlight-button');
            setTimeout(() => {
                fullscreenButton.classList.remove('highlight-button');
            }, 3000);
        }
    }
}

/**
 * Set up automated fullscreen attempt as soon as possible
 * Note: This tries to work around browser security by trying various
 * approaches, but ultimately still requires some form of user interaction
 */
function setupAutoFullscreen() {
    // Check for iOS - show different prompt for iOS devices
    if (isiOSDevice()) {
        // For iOS devices, immediately show the instructions on first visit
        setTimeout(() => {
            if (!localStorage.getItem('iosInstructionsShown')) {
                showIOSInstructions();
                localStorage.setItem('iosInstructionsShown', 'true');
            } else {
                // If they've seen instructions before, just show a toast
                UI.showToast('For best experience, add this app to your Home Screen', 'info', 5000);
            }
        }, 1000);
        
        // Add web app capable meta tags for iOS
        addIOSMetaTags();
        
        return;
    }
    
    // For non-iOS devices, proceed with fullscreen attempts
    // Create a hidden fullscreen button that we'll try to virtually click
    const autoFullscreenBtn = document.createElement('button');
    autoFullscreenBtn.id = 'auto-fullscreen-btn';
    autoFullscreenBtn.style.position = 'fixed';
    autoFullscreenBtn.style.opacity = '0.01';  // Nearly invisible but not completely
    autoFullscreenBtn.style.pointerEvents = 'all'; // Ensure it's clickable
    autoFullscreenBtn.style.zIndex = '999999';
    autoFullscreenBtn.style.top = '0';
    autoFullscreenBtn.style.left = '0';
    autoFullscreenBtn.style.width = '100%';
    autoFullscreenBtn.style.height = '100%';
    autoFullscreenBtn.style.border = 'none';
    autoFullscreenBtn.style.background = 'transparent';
    autoFullscreenBtn.style.cursor = 'default';
    autoFullscreenBtn.innerHTML = 'Click anywhere to start';
    
    // Add an event listener to enter fullscreen on click
    autoFullscreenBtn.addEventListener('click', () => {
        toggleFullscreen();
        
        // Remove the button after it's been clicked
        if (autoFullscreenBtn.parentNode) {
            autoFullscreenBtn.parentNode.removeChild(autoFullscreenBtn);
        }
    });
    
    // Add the button to the DOM
    document.body.appendChild(autoFullscreenBtn);
    
    // Try to trigger fullscreen on various events
    function tryFullscreen() {
        const isFullscreen = document.fullscreenElement || 
            document.mozFullScreenElement || 
            document.webkitFullscreenElement || 
            document.msFullscreenElement;
            
        if (!isFullscreen) {
            // Programmatically trigger a click on our fullscreen button
            autoFullscreenBtn.focus();
            autoFullscreenBtn.click();
        }
    }
    
    // Try on the first user interaction (mousedown, touchstart, keydown)
    document.addEventListener('mousedown', tryFullscreen, { once: true });
    document.addEventListener('touchstart', tryFullscreen, { once: true });
    document.addEventListener('keydown', tryFullscreen, { once: true });
    
    // Also try auto-focus + keyboard-based click
    setTimeout(() => {
        // Focus the button so a space/enter key will trigger it
        autoFullscreenBtn.focus();
        
        // Show a message encouraging interaction
        UI.showToast('Click anywhere to start in fullscreen mode', 'info', 8000);
        
        // If user hasn't clicked after 3 seconds, make the button more noticeable
        setTimeout(() => {
            const isFullscreen = document.fullscreenElement || 
                document.mozFullScreenElement || 
                document.webkitFullscreenElement || 
                document.msFullscreenElement;
                
            if (!isFullscreen && autoFullscreenBtn.parentNode) {
                // Make it more visible to encourage clicking
                autoFullscreenBtn.style.backgroundColor = 'rgba(208, 106, 65, 0.2)';
                autoFullscreenBtn.style.fontSize = '24px';
                autoFullscreenBtn.style.opacity = '0.8';
                autoFullscreenBtn.style.color = '#D06A41';
                autoFullscreenBtn.style.fontWeight = 'bold';
                autoFullscreenBtn.style.display = 'flex';
                autoFullscreenBtn.style.alignItems = 'center';
                autoFullscreenBtn.style.justifyContent = 'center';
                autoFullscreenBtn.innerHTML = '<div style="padding: 20px; background: white; border-radius: 10px;">Click anywhere to go fullscreen</div>';
            }
        }, 3000);
    }, 500);
}

/**
 * Add iOS-specific meta tags to enable web app mode
 */
function addIOSMetaTags() {
    // Add Apple-specific meta tags for web app mode
    const metaTags = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'LiftMate' }
    ];
    
    metaTags.forEach(tag => {
        const metaTag = document.createElement('meta');
        metaTag.name = tag.name;
        metaTag.content = tag.content;
        document.head.appendChild(metaTag);
    });
    
    // Add splash screen icons for different device sizes
    const appleTouchIcons = [
        { sizes: '180x180', href: 'icons/apple-touch-icon.png' }
    ];
    
    appleTouchIcons.forEach(icon => {
        const linkTag = document.createElement('link');
        linkTag.rel = 'apple-touch-icon';
        linkTag.sizes = icon.sizes;
        linkTag.href = icon.href;
        document.head.appendChild(linkTag);
    });
}

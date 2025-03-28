/**
 * LiftMate - iOS Dark Mode Header Direct Positioning Fix
 * This script directly applies inline styles to header elements
 * ensuring they move down properly on iPhone in dark mode.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply fixes only on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        console.log('Applying iOS-specific header fixes for dark mode');
        
        // Function to directly apply inline styles to elements
        const applyHeaderFixes = () => {
            // Check if in dark mode
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            
            if (isDarkMode) {
                console.log('Dark mode detected - applying position fixes');
                
                // Find all section headers in the stats tab
                const statsTab = document.getElementById('stats-tab');
                if (!statsTab) return;
                
                // Find all section headers in the stats tab
                const sectionHeaders = statsTab.querySelectorAll('.section-header');
                
                sectionHeaders.forEach(header => {
                    const title = header.querySelector('h2');
                    const titleIcon = header.querySelector('.title-icon');
                    
                    if (title) {
                        const titleText = title.textContent.trim();
                        
                        // Apply style directly to the title
                        title.style.position = 'relative';
                        title.style.top = '20px';
                        
                        // Apply style directly to the title icon
                        if (titleIcon) {
                            titleIcon.style.position = 'relative';
                            titleIcon.style.top = '40px';
                        }
                    }
                });
                
                // Handle special case for muscle group visualization title
                const graphicTitles = statsTab.querySelectorAll('.graphic-title, h3');
                graphicTitles.forEach(title => {
                    if (title.textContent.includes('Muscle Group') || 
                        title.textContent.includes('Volume by Muscle')) {
                        title.style.position = 'relative';
                        title.style.top = '20px';
                        
                        // Try to find associated icon in parent or siblings
                        const parent = title.parentElement;
                        if (parent) {
                            const icon = parent.querySelector('.title-icon');
                            if (icon) {
                                icon.style.position = 'relative';
                                icon.style.top = '40px';
                            }
                        }
                    }
                });
            } else {
                console.log('Light mode detected - removing position fixes');
                
                // If switched to light mode, remove the inline styles
                const statsTab = document.getElementById('stats-tab');
                if (!statsTab) return;
                
                // Clear all titles and icons we might have modified
                const allTitles = statsTab.querySelectorAll('.section-header h2, .graphic-title, h3');
                allTitles.forEach(title => {
                    title.style.position = '';
                    title.style.top = '';
                });
                
                const allIcons = statsTab.querySelectorAll('.title-icon');
                allIcons.forEach(icon => {
                    icon.style.position = '';
                    icon.style.top = '';
                });
            }
        };
        
        // Run when dark mode is toggled
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                // Wait for the dark mode class to be toggled
                setTimeout(applyHeaderFixes, 100);
            });
        }
        
        // Run when stats tab is shown
        const statsTabButton = document.querySelector('.nav-button[data-tab="stats"]');
        if (statsTabButton) {
            statsTabButton.addEventListener('click', () => {
                setTimeout(applyHeaderFixes, 300);
            });
        }
        
        // Run immediately and after a delay to ensure elements are loaded
        applyHeaderFixes();
        setTimeout(applyHeaderFixes, 500);
        setTimeout(applyHeaderFixes, 1000);
        
        // Also monitor for changes to the document class list (dark mode toggle)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    mutation.target === document.documentElement) {
                    applyHeaderFixes();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
    }
});
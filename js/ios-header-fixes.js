/**
 * LiftMate - iOS Dark Mode Header Fixes
 * This script adds data attributes to specific header elements 
 * to enable more precise CSS targeting for header positioning fixes on iPhone.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply fixes only on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        console.log('Applying iOS-specific header fixes');
        
        // Function to add data attributes to section headers
        const addDataAttributes = () => {
            // Find and tag Workout Analytics section
            const workoutAnalyticsHeaders = Array.from(document.querySelectorAll('.section-header h2'))
                .filter(h2 => h2.textContent.includes('Workout Analytics'));
                
            workoutAnalyticsHeaders.forEach(header => {
                const sectionHeader = header.closest('.section-header');
                if (sectionHeader) {
                    header.setAttribute('data-title', 'Workout Analytics');
                    const icon = sectionHeader.querySelector('.title-icon');
                    if (icon) {
                        icon.setAttribute('data-section', 'Workout Analytics');
                    }
                }
            });
            
            // Find and tag One Rep Max Calculator section
            const oneRepMaxHeaders = Array.from(document.querySelectorAll('.section-header h2'))
                .filter(h2 => h2.textContent.includes('One Rep Max'));
                
            oneRepMaxHeaders.forEach(header => {
                const sectionHeader = header.closest('.section-header');
                if (sectionHeader) {
                    header.setAttribute('data-title', 'One Rep Max Calculator');
                    const icon = sectionHeader.querySelector('.title-icon');
                    if (icon) {
                        icon.setAttribute('data-section', 'One Rep Max Calculator');
                    }
                }
            });
            
            // Find and tag Muscle Group Focus section (might be dynamically generated)
            const muscleGroupHeaders = Array.from(document.querySelectorAll('h3.graphic-title'))
                .filter(h3 => h3.textContent.includes('Muscle Group') || h3.textContent.includes('Volume by Muscle'));
                
            muscleGroupHeaders.forEach(header => {
                header.setAttribute('data-title', 'Muscle Group Focus');
                // Try to find associated icon
                const parent = header.parentElement;
                if (parent) {
                    const icon = parent.querySelector('.title-icon');
                    if (icon) {
                        icon.setAttribute('data-section', 'Muscle Group Focus');
                    }
                }
            });
            
            // Find and tag Personal Records section
            const recordsHeaders = Array.from(document.querySelectorAll('.section-header h2'))
                .filter(h2 => h2.textContent.includes('Personal Records'));
                
            recordsHeaders.forEach(header => {
                const sectionHeader = header.closest('.section-header');
                if (sectionHeader) {
                    header.setAttribute('data-title', 'Personal Records');
                    const icon = sectionHeader.querySelector('.title-icon');
                    if (icon) {
                        icon.setAttribute('data-section', 'Personal Records');
                    }
                }
            });
        };
        
        // Run immediately 
        addDataAttributes();
        
        // Also run when tabs change or after small delay for dynamic content
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(addDataAttributes, 500);
            });
        });
        
        // Run periodically to catch dynamically loaded content
        setTimeout(addDataAttributes, 1000);
        setTimeout(addDataAttributes, 2000);
    }
});
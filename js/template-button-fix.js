/**
 * Fix for template buttons on iPhone
 * This script applies direct inline styles to template buttons for iOS devices
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is an iPhone or small device
    if(window.innerWidth <= 428) {
        // Function to style template buttons
        function styleTemplateButtons() {
            // Get all template buttons
            const templateButtons = document.querySelectorAll('.start-template, button[data-template-id]');
            
            templateButtons.forEach(button => {
                // Apply direct inline styles
                button.style.backgroundColor = 'var(--primary-color)';
                button.style.color = 'white';
                button.style.borderRadius = '12px';
                button.style.padding = '15px 20px';
                button.style.height = '60px';
                button.style.minHeight = '60px';
                button.style.width = '100%';
                button.style.marginTop = '12px';
                button.style.fontSize = '1.2rem';
                button.style.fontWeight = '600';
                button.style.textTransform = 'uppercase';
                button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                
                // Style any icons inside the button
                const icons = button.querySelectorAll('i');
                icons.forEach(icon => {
                    icon.style.fontSize = '1.3rem';
                    icon.style.marginRight = '10px';
                });
            });
        }
        
        // Apply styles immediately
        styleTemplateButtons();
        
        // Also watch for dynamically added buttons
        const observer = new MutationObserver(function(mutations) {
            styleTemplateButtons();
        });
        
        // Start observing the document
        observer.observe(document.body, { 
            childList: true,
            subtree: true
        });
    }
});
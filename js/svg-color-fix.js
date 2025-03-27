/**
 * LiftMate - SVG Color Fix
 * This script ensures SVG icons display in white when in light mode
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to fix SVG colors
    function fixSvgColors() {
        // Get all SVGs in the app header
        const headerSvgs = document.querySelectorAll('.app-header svg, .app-logo svg');
        
        headerSvgs.forEach(svg => {
            // Fix fill attribute on the SVG element itself
            svg.setAttribute('fill', 'white');
            
            // Find all elements with fill attributes
            const elementsWithFill = svg.querySelectorAll('[fill]');
            elementsWithFill.forEach(el => {
                el.setAttribute('fill', 'white');
            });
            
            // Find all g elements
            const gElements = svg.querySelectorAll('g');
            gElements.forEach(g => {
                g.setAttribute('fill', 'white');
            });
            
            // Find all path elements
            const pathElements = svg.querySelectorAll('path');
            pathElements.forEach(path => {
                path.setAttribute('fill', 'white');
            });
        });
    }

    // Run on page load
    fixSvgColors();
    
    // Run when theme changes
    document.addEventListener('themeChanged', fixSvgColors);
    
    // Run again after a short delay to catch any SVGs loaded after DOMContentLoaded
    setTimeout(fixSvgColors, 500);
    setTimeout(fixSvgColors, 1000);
});
/**
 * Custom SVG Icons Replacement
 * Directly inlines the SVG content from files in the assets/illustrations directory
 */

// Function to replace a FontAwesome icon with SVG
function replaceFontAwesomeIcon(element) {
  // Get all the classes from the element
  const classes = Array.from(element.classList);
  
  // Check if this is an icon we want to replace
  if (classes.includes('fa-dumbbell')) {
    replaceWithInlineSVG(element, 'fa-dumbbell');
  } else if (classes.includes('fa-chart-bar')) {
    replaceWithInlineSVG(element, 'fa-chart-bar');
  } else if (classes.includes('fa-chart-line')) {
    replaceWithInlineSVG(element, 'fa-chart-line');
  } else if (classes.includes('fa-bullseye')) {
    replaceWithInlineSVG(element, 'fa-bullseye');
  } else if (classes.includes('fa-history')) {
    replaceWithInlineSVG(element, 'fa-history');
  } else if (classes.includes('fa-camera')) {
    replaceWithInlineSVG(element, 'fa-camera');
  } else if (classes.includes('fa-clipboard-list')) {
    replaceWithInlineSVG(element, 'fa-clipboard-list');
  } else if (classes.includes('fa-database')) {
    replaceWithInlineSVG(element, 'fa-database');
  } else if (classes.includes('fa-palette') || classes.includes('fa-pallete')) {
    replaceWithInlineSVG(element, 'fa-pallete');
  } else if (classes.includes('fa-pencil-alt')) {
    replaceWithInlineSVG(element, 'fa-pencil-alt');
  } else if (classes.includes('fa-trash')) {
    replaceWithInlineSVG(element, 'fa-trash');
  }
}

// Function to do the actual replacement
function replaceWithInlineSVG(element, iconName) {
  const isAppLogo = iconName === 'fa-dumbbell' && element.parentElement && element.parentElement.tagName === 'H1';
  
  // Create the SVG element holder
  const customIcon = document.createElement('span');
  customIcon.classList.add('custom-icon');
  
  // Transfer any sizing classes
  if (element.classList.contains('icon-small')) customIcon.classList.add('icon-small');
  if (element.classList.contains('icon-large')) customIcon.classList.add('icon-large');
  if (element.classList.contains('icon-xlarge')) customIcon.classList.add('icon-xlarge');
  
  // If this is a welcome icon, add that class
  if (element.classList.contains('welcome-icon')) customIcon.classList.add('welcome-icon');
  
  // If this is a nav icon, add that class
  if (element.classList.contains('nav-icon')) customIcon.classList.add('nav-icon');
  
  // Special case for the app logo in the header
  if (isAppLogo) {
    customIcon.classList.add('app-logo');
  }
  
  // Create image element that directly references the SVG file
  const img = document.createElement('img');
  img.src = isAppLogo ? 'assets/illustrations/app-logo.svg' : `assets/illustrations/${iconName}.svg`;
  img.alt = iconName.replace('fa-', '') + ' icon';
  
  // Preserve original icon class for context-specific styling
  customIcon.dataset.iconType = iconName;
  
  // Add the image to the custom icon container
  customIcon.appendChild(img);
  
  // Replace the FontAwesome icon with our custom icon
  element.parentNode.replaceChild(customIcon, element);
}

// Function to replace all icons that match our custom set
function replaceIcons() {
  // Get all FontAwesome icons
  const faIcons = document.querySelectorAll('i.fas');
  
  // Replace each icon if it's in our map
  Array.from(faIcons).forEach(icon => {
    replaceFontAwesomeIcon(icon);
  });
  
  // No need for JavaScript color adjustments anymore
  // CSS will handle the color changes based on the dark-mode class
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a brief moment to ensure the DOM is fully processed
  setTimeout(replaceIcons, 300);
});

// Observe DOM changes to replace icons in dynamically added content
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(function(node) {
        if (node.querySelectorAll) {
          const icons = node.querySelectorAll('i.fas');
          if (icons.length > 0) {
            Array.from(icons).forEach(icon => {
              replaceFontAwesomeIcon(icon);
            });
          }
        }
      });
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });
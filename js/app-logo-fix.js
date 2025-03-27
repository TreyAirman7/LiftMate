/**
 * Fix for app logo in header - ensure it's white in light mode
 * Also make top right icons 12.5% larger
 * Also ensure exercises.svg is used for running icon
 */
document.addEventListener('DOMContentLoaded', function() {
  // Function to make the app logo white
  function applyIconFixes() {
    // Find the app logo specifically in the header
    const appLogoInHeader = document.querySelector('h1 .svg-icon[data-icon-type="fa-dumbbell"] img');
    
    if (appLogoInHeader) {
      // Force it to be white
      appLogoInHeader.style.filter = 'brightness(0) invert(1)';
    }
    
    // Make the top right icons 12.5% larger
    const topRightIcons = [
      document.querySelector('#theme-toggle .svg-icon'),
      document.querySelector('#dark-mode-toggle .svg-icon'),
      document.querySelector('#storage-info-toggle .svg-icon')
    ];
    
    topRightIcons.forEach(icon => {
      if (icon) {
        icon.style.width = '2.8125em'; // 12.5% larger than 2.5em
        icon.style.height = '2.8125em'; // 12.5% larger than 2.5em
        icon.style.transform = 'scale(1.6875)'; // 12.5% larger than 1.5
      }
    });
    
    // Also make the buttons themselves a bit larger
    const buttons = [
      document.getElementById('theme-toggle'),
      document.getElementById('dark-mode-toggle'),
      document.getElementById('storage-info-toggle')
    ];
    
    buttons.forEach(button => {
      if (button) {
        // Increase button size by smaller amount
        button.style.padding = '6px';
        button.style.margin = '0 2px';
      }
    });
    
    // Force the exercises.svg to be used for the running icon
    const runningIcon = document.querySelector('i.fas.fa-running');
    if (runningIcon) {
      const navButton = runningIcon.closest('.nav-button');
      if (navButton) {
        // Create the SVG icon container
        const iconContainer = document.createElement('span');
        iconContainer.className = 'svg-icon nav-icon';
        iconContainer.dataset.iconType = 'fa-running';
        iconContainer.style.width = '44px';
        iconContainer.style.height = '44px';
        
        // Create the image
        const img = document.createElement('img');
        img.src = 'assets/illustrations/exercises.svg';
        img.alt = 'exercises icon';
        img.style.width = '44px';
        img.style.height = '44px';
        
        // Add image to container
        iconContainer.appendChild(img);
        
        // Replace the original icon
        runningIcon.parentNode.replaceChild(iconContainer, runningIcon);
      }
    }
    
    // Also ensure all navigation icons are exactly 44px
    document.querySelectorAll('.nav-icon, .nav-button .svg-icon, .mobile-nav .nav-icon').forEach(icon => {
      icon.style.width = '44px';
      icon.style.height = '44px';
      icon.style.fontSize = '44px';
    });
    
    // Ensure SVG and custom title icons are DOUBLED SIZE and centered
    document.querySelectorAll('.title-icon .svg-icon, .title-icon .custom-icon, .title-icon img').forEach(icon => {
      icon.style.width = '72px';
      icon.style.height = '72px';
      icon.style.fontSize = '72px';
      icon.style.position = 'absolute';
      icon.style.top = '50%';
      icon.style.left = '50%';
      
      // In light mode, position the icons a bit higher to prevent cutoff
      if (!document.body.classList.contains('dark-mode')) {
        icon.style.transform = 'translate(-50%, -40%)';
      } else {
        icon.style.transform = 'translate(-50%, -50%)';
      }
    });
    
    // Ensure Font Awesome title icons are REDUCED 50% and centered
    document.querySelectorAll('.title-icon i.fas, .title-icon i.fa, .title-icon i.far, .title-icon i.fab').forEach(icon => {
      icon.style.width = '36px';
      icon.style.height = '36px';
      icon.style.fontSize = '36px';
      icon.style.position = 'absolute';
      icon.style.top = '50%';
      icon.style.left = '50%';
      
      // In light mode, position the icons a bit higher to prevent cutoff
      if (!document.body.classList.contains('dark-mode')) {
        icon.style.transform = 'translate(-50%, -40%)';
        icon.style.color = 'black';
      } else {
        icon.style.transform = 'translate(-50%, -50%)';
        icon.style.color = 'white';
      }
    });
    
    // Set consistent container size - DOUBLED SIZE with proper positioning
    document.querySelectorAll('.title-icon').forEach(container => {
      container.style.width = '144px';
      container.style.height = '110px'; // Further increased height to fully prevent cutoff
      container.style.margin = '0 auto -25px auto'; // Keep negative bottom margin for overlap
      container.style.top = '20px'; // Move down more to prevent cutoff at top
      container.style.paddingTop = '25px'; // More top padding for Light Mode
    });
    
    // Force title text to dramatically overlap with icons
    document.querySelectorAll('.title-wrapper h2').forEach(heading => {
      heading.style.marginTop = '-40px';
      heading.style.position = 'relative';
      heading.style.zIndex = '5';
    });
  }

  // Run immediately
  applyIconFixes();
  
  // Also run after a delay to ensure icon replacement has completed, with longer delays to ensure it happens after other scripts
  setTimeout(applyIconFixes, 500);
  setTimeout(applyIconFixes, 1000);
  setTimeout(applyIconFixes, 1500);
  setTimeout(applyIconFixes, 2000);
});
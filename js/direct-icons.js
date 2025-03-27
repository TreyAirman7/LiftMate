/**
 * Direct icon replacement without CORS issues
 */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // First, let's create the CSS for the icons
    const iconStyle = document.createElement('style');
    iconStyle.textContent = `
      .svg-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5em;
        height: 1.5em;
        vertical-align: -0.25em;
        position: relative;
      }
      
      .svg-icon::before {
        display: none !important; /* Hide FontAwesome pseudo-element */
      }
      
      .svg-icon img {
        width: 100%;
        height: 100%;
        filter: brightness(0);  /* Black icons for light mode */
        display: block;
        position: absolute;
        top: 0;
        left: 0;
      }
      
      /* Dark mode has white icons */
      .dark-mode .svg-icon img {
        filter: brightness(0) invert(1);
      }
      
      /* App logo in header always white */
      h1 .svg-icon[data-icon-type="fa-dumbbell"] img {
        filter: brightness(0) invert(1) !important;
      }
      
      /* Special sizes - standardized title icons - DOUBLED SIZE */
      .title-icon .svg-icon {
        width: 72px !important;
        height: 72px !important;
        position: relative !important;
        top: -16px !important;
        left: 44px !important;
      }
      
      /* Make dumbbell icon larger everywhere */
      [data-icon-type="fa-dumbbell"] {
        width: 2.8em !important;
        height: 2.8em !important;
        transform: scale(1.4);
      }
      
      .stat-icon .svg-icon {
        width: 2em;
        height: 2em;
      }
      
      .option-icon .svg-icon {
        width: 3em;
        height: 3em;
        margin-bottom: 0.8em;
      }
      
      .nav-icon.svg-icon {
        width: 44px !important;
        height: 44px !important;
      }
      
      .welcome-icon.svg-icon {
        font-size: 48px;
        width: 1.5em;
        height: 1.5em;
      }
      
      h1 .svg-icon {
        width: 1.8em;
        height: 1.8em;
        margin-right: 0.3em;
      }
      
      /* Theme control buttons */
      .theme-toggle .svg-icon {
        width: 3.125em !important; /* 25% larger than 2.5em */
        height: 3.125em !important; /* 25% larger than 2.5em */
        transform: scale(1.875); /* 25% larger than 1.5 */
        margin: 0 auto;
      }
      
      /* Specific icons in header */
      #theme-toggle .svg-icon,
      #dark-mode-toggle .svg-icon,
      #storage-info-toggle .svg-icon {
        width: 3.125em !important; /* 25% larger than 2.5em */
        height: 3.125em !important; /* 25% larger than 2.5em */
        transform: scale(1.875); /* 25% larger than 1.5 */
      }
      
      /* Exercise icon specific styling */
      [data-icon-type="fa-running"] img {
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(iconStyle);
    
    // Replace icons
    const iconMap = {
      'fa-dumbbell': 'assets/illustrations/fa-dumbbell.svg',
      'fa-chart-bar': 'assets/illustrations/fa-chart-bar.svg',
      'fa-chart-line': 'assets/illustrations/fa-chart-line.svg',
      'fa-bullseye': 'assets/illustrations/fa-bullseye.svg',
      'fa-history': 'assets/illustrations/fa-history.svg',
      'fa-camera': 'assets/illustrations/fa-camera.svg',
      'fa-clipboard-list': 'assets/illustrations/fa-clipboard-list.svg',
      'fa-database': 'assets/illustrations/fa-database.svg',
      'fa-palette': 'assets/illustrations/fa-pallete.svg', // note: misspelled in files
      'fa-pencil-alt': 'assets/illustrations/fa-pencil-alt.svg',
      'fa-trash': 'assets/illustrations/fa-trash.svg',
      'fa-running': 'assets/illustrations/exercises.svg', // Use exercises.svg for running icon
      'svg-icon-exercises': 'assets/illustrations/exercises.svg' // Add explicit mapping for exercises.svg
    };
    
    function replaceIconWithSVG(element) {
      const classes = Array.from(element.classList);
      
      // Find which icon needs to be replaced
      let iconClass = null;
      for (const cls of classes) {
        if (iconMap[cls]) {
          iconClass = cls;
          break;
        }
      }
      
      if (!iconClass) return;
      
      // Create the replacement element
      const iconContainer = document.createElement('span');
      iconContainer.className = 'svg-icon ' + Array.from(element.classList)
        .filter(cls => cls !== 'fas' && cls !== iconClass)
        .join(' ');
      
      // Set data attribute for icon type for CSS targeting
      iconContainer.dataset.iconType = iconClass;
      
      // Special case for app logo in header
      const isAppLogo = iconClass === 'fa-dumbbell' && element.parentElement && element.parentElement.tagName === 'H1';
      
      // Create the image
      const img = document.createElement('img');
      img.src = isAppLogo ? 'assets/illustrations/app-logo.svg' : iconMap[iconClass];
      img.alt = iconClass.replace('fa-', '') + ' icon';
      
      // Add image to container
      iconContainer.appendChild(img);
      
      // Replace the original element
      element.parentNode.replaceChild(iconContainer, element);
    }
    
    // Replace all icons
    document.querySelectorAll('i.fas').forEach(replaceIconWithSVG);
    
    // Set up a mutation observer to handle dynamically added icons
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.querySelectorAll) {
              node.querySelectorAll('i.fas').forEach(replaceIconWithSVG);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }, 300);
});
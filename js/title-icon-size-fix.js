/**
 * Title icon size adjustment script
 * This applies doubled title icon sizes and ensures they stay doubled
 * No matter what other scripts might try to do
 */
document.addEventListener('DOMContentLoaded', function() {
  // Apply the title icon size fixes at various intervals to ensure they are properly applied
  function applyTitleIconSizes() {
    console.log('Applying doubled title icon sizes...');

    // Apply to all title icon containers
    document.querySelectorAll('.title-icon').forEach(container => {
      container.style.width = '144px';
      container.style.height = '110px'; // Further increased height to fully prevent cutoff
      container.style.margin = '0 auto -25px auto'; // Keep negative bottom margin for overlap
      container.style.top = '20px'; // Move down more to prevent cutoff at top
      container.style.paddingTop = '25px'; // More top padding for Light Mode
    });

    // Apply to SVG icons and custom icons within title icon containers (keep these doubled and centered)
    document.querySelectorAll('.title-icon .svg-icon, .title-icon .custom-icon, .title-icon img, .title-icon span:not(.fas):not(.fa):not(.far):not(.fab)').forEach(icon => {
      icon.style.width = '72px';
      icon.style.height = '72px';
      icon.style.fontSize = '72px';
      icon.style.position = 'absolute';
      icon.style.top = '50%';
      icon.style.left = '50%';
      
      // Center horizontally and move up 24px from center
      icon.style.transform = 'translate(-50%, calc(-50% - 24px))';
    });
    
    // Reduce Font Awesome icons by 50% and ensure proper coloring (centered)
    document.querySelectorAll('.title-icon i.fas, .title-icon i.fa, .title-icon i.far, .title-icon i.fab, .title-icon span.fas, .title-icon span.fa, .title-icon span.far, .title-icon span.fab').forEach(icon => {
      icon.style.width = '36px';
      icon.style.height = '36px';
      icon.style.fontSize = '36px';
      icon.style.position = 'absolute';
      icon.style.top = '50%';
      icon.style.left = '50%';
      
      // Center horizontally and move up 24px from center
      icon.style.transform = 'translate(-50%, calc(-50% - 24px))';
      
      // Set appropriate color based on mode
      if (!document.body.classList.contains('dark-mode')) {
        icon.style.color = 'black';
      } else {
        icon.style.color = 'white';
      }
    });

    // Apply centering class to all title wrappers except Progress Pics and Exercise Library
    document.querySelectorAll('.title-wrapper').forEach(wrapper => {
      // Skip Progress Pics and Exercise Library sections
      const isProgressPics = wrapper.closest('#progress-pics') || 
                            (wrapper.querySelector('h2') && wrapper.querySelector('h2').textContent.includes('Progress Pictures'));
      const isExerciseLibrary = wrapper.closest('#exercises') || 
                               (wrapper.querySelector('h2') && wrapper.querySelector('h2').textContent.includes('Exercise Library'));
      
      if (!isProgressPics && !isExerciseLibrary) {
        wrapper.classList.add('title-wrapper-centered');
      } else {
        // Ensure these have horizontal layout
        wrapper.classList.remove('title-wrapper-centered');
        wrapper.style.flexDirection = 'row';
        wrapper.style.width = 'auto';
        if (wrapper.querySelector('h2')) {
          wrapper.querySelector('h2').style.marginTop = '0';
        }
      }
    });
    
    // Pull headings dramatically into the icons for centered wrappers
    document.querySelectorAll('.title-wrapper-centered h2, .title-wrapper-centered h3').forEach(heading => {
      heading.style.marginTop = '-40px';
      heading.style.position = 'relative';
      heading.style.zIndex = '1';
    });
    
    // Specifically style Exercise Library and Progress Pics title sections
    const exerciseLibraryTitle = document.getElementById('exercise-library-title');
    const progressPicsTitle = document.getElementById('progress-pics-title');
    
    // Apply horizontal layout to these specific sections
    [exerciseLibraryTitle, progressPicsTitle].forEach(element => {
      if (element) {
        element.style.display = 'flex';
        element.style.flexDirection = 'row';
        element.style.width = 'auto';
        element.style.marginRight = 'auto';
        element.style.alignItems = 'center';
        
        // Find the title-icon and title text
        const titleIcon = element.querySelector('.title-icon');
        const heading = element.querySelector('h2');
        
        if (titleIcon) {
          titleIcon.style.margin = '0 15px 0 0';
          titleIcon.style.top = '0';
        }
        
        if (heading) {
          heading.style.marginTop = '0';
        }
      }
    });
    
    // Specifically handle Exercise Library icon to ensure it uses exercises.svg
    const exerciseLibrarySection = document.querySelector('#exercises .section-header .title-icon');
    if (exerciseLibrarySection) {
      // Check if we need to create/replace the icon
      if (!exerciseLibrarySection.querySelector('[data-icon-type="exercises"]')) {
        exerciseLibrarySection.innerHTML = `
          <span class="svg-icon" data-icon-type="exercises" style="width: 72px; height: 72px; position: relative; top: -16px; left: 44px;">
            <img src="assets/illustrations/exercises.svg" alt="exercises icon" style="width: 100%; height: 100%;">
          </span>
        `;
      }
    }
  }

  // Call immediately
  applyTitleIconSizes();
  
  // Apply after short delay to ensure DOM is fully loaded
  setTimeout(applyTitleIconSizes, 500);
  
  // Apply after all other scripts have likely completed
  setTimeout(applyTitleIconSizes, 1000);
  setTimeout(applyTitleIconSizes, 2000);
  
  // Apply after even longer delay just to be super certain
  setTimeout(applyTitleIconSizes, 3000);
  
  // Set up an interval to reapply every 2 seconds for the first 10 seconds
  let counter = 0;
  const interval = setInterval(() => {
    applyTitleIconSizes();
    counter++;
    if (counter >= 5) {
      clearInterval(interval);
    }
  }, 2000);
  
  // Also apply whenever window is resized
  window.addEventListener('resize', applyTitleIconSizes);
  
  // Add an observer for class changes on the body element to detect dark mode toggle
  const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        // Update colors for Font Awesome icons based on dark mode
        document.querySelectorAll('.title-icon i.fas, .title-icon i.fa, .title-icon i.far, .title-icon i.fab, .title-icon span.fas, .title-icon span.fa, .title-icon span.far, .title-icon span.fab').forEach(icon => {
          if (document.body.classList.contains('dark-mode')) {
            icon.style.color = 'white';
          } else {
            icon.style.color = 'black';
          }
        });
      }
    });
  });
  
  bodyObserver.observe(document.body, { attributes: true });
});
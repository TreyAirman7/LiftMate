/**
 * LiftMate - Animations and Micro-interactions Module
 * Enhances user experience with subtle animations and feedback
 */

const Animations = (() => {
    /**
     * Initialize animations and micro-interactions
     */
    const initialize = () => {
        try {
            // Add CSS class to body to enable animations
            document.body.classList.add('animations-enabled');
            
            // Ensure animations don't conflict with other components
            setTimeout(() => {
                // Setup ripple effect
                setupRippleEffect();
                
                // Setup micro-animations for forms
                setupFormAnimations();
                
                // Setup state change animations
                setupStateAnimations();
        
                // Setup progress animations
                setupProgressAnimations();
                
                // Add intersection observers for scroll-based animations
                setupScrollAnimations();
                
                // Setup reduced motion preferences
                setupReducedMotion();
                
                console.log('Animation system initialized successfully');
            }, 500); // Small delay to ensure DOM and other components are ready
        } catch (error) {
            console.error('Error initializing animations:', error);
        }
    };
    
    /**
     * Setup ripple effect for clickable elements
     */
    const setupRippleEffect = () => {
        try {
            // Create a style for the ripple effect
            const style = document.createElement('style');
            style.textContent = `
                .ripple-effect {
                    position: absolute;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.5);
                    width: 100px;
                    height: 100px;
                    margin-top: -50px;
                    margin-left: -50px;
                    animation: ripple 0.6s ease-out;
                    opacity: 0;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
            
            // Use event delegation for better performance
            document.body.addEventListener('click', (e) => {
                // Skip if reduced motion is preferred
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                // Check if the clicked element is a button
                const button = e.target.closest('.button, .action-button, .add-button, .nav-button, .icon-button, .timeframe-button, .muscle-filter');
                if (!button) return;
                
                // Ensure button has position relative for proper ripple positioning
                if (getComputedStyle(button).position !== 'relative') {
                    button.style.position = 'relative';
                    button.style.overflow = 'hidden';
                }
                
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
            
            console.log('Ripple effect initialized');
        } catch (error) {
            console.warn('Error setting up ripple effect:', error);
        }
    };
    
    /**
     * Setup animations for form elements
     */
    const setupFormAnimations = () => {
        try {
            // Real-time form validation feedback via event delegation
            document.body.addEventListener('input', (e) => {
                // Skip if reduced motion is preferred
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                // Check if the target is a form input
                if (e.target.matches('input, select, textarea')) {
                    const input = e.target;
                    
                    // Visual feedback on valid/invalid input
                    if (input.checkValidity()) {
                        input.classList.remove('invalid');
                        input.classList.add('valid');
                    } else {
                        input.classList.remove('valid');
                        if (input.value !== '') {
                            input.classList.add('invalid');
                        }
                    }
                }
            });
            
            // Clear validation classes on focus
            document.body.addEventListener('focus', (e) => {
                if (e.target.matches('input, select, textarea')) {
                    e.target.classList.remove('invalid', 'valid');
                }
            }, true);
            
            // Form submission feedback using event delegation
            document.body.addEventListener('submit', (e) => {
                if (e.target.matches('form')) {
                    const form = e.target;
                    const submitButton = form.querySelector('[type="submit"]');
                    
                    if (submitButton && !submitButton.classList.contains('loading')) {
                        submitButton.classList.add('loading');
                        
                        // Add loading indicator
                        const loadingIcon = document.createElement('i');
                        loadingIcon.className = 'fas fa-circle-notch fa-spin';
                        submitButton.appendChild(loadingIcon);
                        
                        // Remove loading state after form processing
                        setTimeout(() => {
                            submitButton.classList.remove('loading');
                            if (loadingIcon && loadingIcon.parentNode) {
                                loadingIcon.parentNode.removeChild(loadingIcon);
                            }
                        }, 500);
                    }
                }
            });
            
            console.log('Form animations initialized');
        } catch (error) {
            console.warn('Error setting up form animations:', error);
        }
    };
    
    /**
     * Setup animations for state changes
     */
    const setupStateAnimations = () => {
        try {
            // Use a single click event listener for all clickable elements
            document.body.addEventListener('click', (e) => {
                // Skip if reduced motion is preferred
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                // For button click state animations
                const clickable = e.target.closest('.button, .action-button, .add-button, .icon-button, .muscle-filter, .timeframe-button, .nav-button');
                if (clickable) {
                    clickable.classList.add('clicked');
                    setTimeout(() => {
                        clickable.classList.remove('clicked');
                    }, 300);
                }
                
                // For tab switching animations
                const navButton = e.target.closest('.nav-button');
                if (navButton) {
                    const tabId = navButton.getAttribute('data-tab');
                    if (tabId) {
                        const tabContent = document.getElementById(tabId);
                        
                        if (tabContent) {
                            // Ensure tab content is visible before animating
                            if (window.getComputedStyle(tabContent).display !== 'none') {
                                // Add entrance animation class
                                tabContent.classList.add('tab-entrance');
                                
                                setTimeout(() => {
                                    tabContent.classList.remove('tab-entrance');
                                }, 500);
                            }
                        }
                    }
                }
            });
            
            // Add the tab-entrance class if it doesn't exist in the CSS
            const style = document.createElement('style');
            style.textContent = `
                .tab-entrance {
                    animation: fadeIn 0.3s var(--md-sys-motion-easing-standard);
                }
            `;
            document.head.appendChild(style);
            
            console.log('State animations initialized');
        } catch (error) {
            console.warn('Error setting up state animations:', error);
        }
    };
    
    /**
     * Setup progress and achievement animations
     */
    const setupProgressAnimations = () => {
        try {
            // Add required styles for these animations
            const style = document.createElement('style');
            style.textContent = `
                .completed-animation .complete-icon {
                    animation: bounce 1s ease-in-out;
                }
                
                .celebration-icon {
                    position: absolute;
                    top: -15px;
                    right: -15px;
                    width: 30px;
                    height: 30px;
                    background-color: #2E7D32;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    animation: bounce 1s var(--md-sys-motion-easing-emphasized) infinite;
                    z-index: 10;
                }
                
                .personal-record-animation {
                    position: relative;
                    border-color: var(--md-tertiary) !important;
                    box-shadow: 0 0 10px rgba(125, 82, 96, 0.3) !important;
                    animation: pulse 0.5s var(--md-sys-motion-easing-emphasized) forwards;
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
            
            // Workout completion animation
            document.addEventListener('workoutCompleted', (e) => {
                // Skip if reduced motion is preferred
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                const completeSection = document.getElementById('workout-complete');
                if (completeSection) {
                    completeSection.classList.add('completed-animation');
                    
                    // Show toast notification instead of confetti for better compatibility
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast('Workout completed! 💪', 'success');
                    }
                }
            });
            
            // Goal achievement animation
            document.addEventListener('goalAchieved', (e) => {
                // Skip if reduced motion is preferred
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                if (e.detail && e.detail.goalElement) {
                    const goalElement = e.detail.goalElement;
                    
                    // Add visual feedback
                    goalElement.style.borderColor = '#2E7D32';
                    goalElement.style.boxShadow = '0 0 10px rgba(46, 125, 50, 0.3)';
                    
                    // Show toast notification
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(`Goal achieved: ${e.detail.goalName || 'Nice work!'}`, 'success');
                    }
                }
            });
            
            // Personal record animation
            document.addEventListener('personalRecord', (e) => {
                // Skip if reduced motion is preferred
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                // Show toast notification
                if (typeof UI !== 'undefined' && UI.showToast) {
                    const exerciseName = e.detail?.exerciseName || '';
                    const weight = e.detail?.weight || '';
                    const reps = e.detail?.reps || '';
                    
                    let message = 'New personal record!';
                    if (exerciseName && weight && reps) {
                        message = `New PR: ${exerciseName} - ${weight} lbs × ${reps} reps`;
                    }
                    
                    UI.showToast(message, 'success');
                }
            });
            
            console.log('Progress animations initialized');
        } catch (error) {
            console.warn('Error setting up progress animations:', error);
        }
    };
    
    /**
     * Create confetti effect for celebrations
     */
    const createConfetti = () => {
        // Skip if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        const colors = ['#6750A4', '#625B71', '#7D5260', '#2E7D32', '#29B6F6'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
            
            confettiContainer.appendChild(confetti);
        }
        
        setTimeout(() => {
            if (confettiContainer && confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 5000);
    };
    
    /**
     * Setup scroll-based animations using Intersection Observer
     */
    const setupScrollAnimations = () => {
        try {
            // Skip if reduced motion is preferred
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // If reduced motion is preferred, make all elements fully visible immediately
                document.querySelectorAll(
                    '.card, .template-card, .exercise-card, .history-item, .stat-card, ' +
                    '.pic-grid-item, .start-option, .goal-item, .exercise-item'
                ).forEach(element => {
                    element.classList.add('scroll-animate');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
                return;
            }
            
            // Force all elements visible first to avoid whiteout
            document.querySelectorAll(
                '.card, .template-card, .exercise-card, .history-item, .stat-card, ' +
                '.pic-grid-item, .start-option, .goal-item, .exercise-item'
            ).forEach(element => {
                element.style.opacity = '1';
            });
            
            // Animate elements as they scroll into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('scroll-animate');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0.1,
                rootMargin: '0px 0px 50px 0px' // Trigger a bit before elements come into view
            });
            
            // Select elements to observe - check if they exist first
            setTimeout(() => {
                // Wait for DOM to be fully ready
                const elementsToAnimate = document.querySelectorAll(
                    '.card, .template-card, .exercise-card, .history-item, .stat-card, ' +
                    '.pic-grid-item, .start-option, .goal-item, .exercise-item'
                );
                
                if (elementsToAnimate.length > 0) {
                    elementsToAnimate.forEach(element => {
                        // Make sure element is visible before animating
                        if (element.offsetParent !== null) {
                            observer.observe(element);
                        } else {
                            // If element is not visible in DOM, just make it fully visible
                            element.classList.add('scroll-animate');
                        }
                    });
                    console.log(`Set up scroll animations for ${elementsToAnimate.length} elements`);
                } else {
                    console.log('No elements found for scroll animations');
                }
            }, 500); // Short delay to ensure DOM is ready
        } catch (error) {
            console.warn('Error setting up scroll animations:', error);
        }
    };
    
    /**
     * Setup reduced motion preferences
     */
    const setupReducedMotion = () => {
        const reducedMotionCheck = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        // Function to apply reduced motion preferences
        const applyReducedMotion = (reduced) => {
            if (reduced) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        };
        
        // Apply initial setting
        applyReducedMotion(reducedMotionCheck.matches);
        
        // Listen for changes
        reducedMotionCheck.addEventListener('change', () => {
            applyReducedMotion(reducedMotionCheck.matches);
        });
    };
    
    /**
     * Animate number counting up
     * @param {HTMLElement} element - Element to animate 
     * @param {number} start - Starting number
     * @param {number} end - Ending number
     * @param {number} duration - Animation duration in ms
     * @param {string} prefix - Text before the number
     * @param {string} suffix - Text after the number
     */
    const animateNumber = (element, start, end, duration = 1000, prefix = '', suffix = '') => {
        // Skip if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            element.textContent = prefix + end + suffix;
            return;
        }
        
        let startTime = null;
        
        // Decimal places calculation
        const decimalPlaces = Math.max(
            (start.toString().split('.')[1] || '').length,
            (end.toString().split('.')[1] || '').length
        );
        
        // Animation function
        const animateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentValue = start + (end - start) * progress;
            
            // Format with proper decimal places
            element.textContent = prefix + currentValue.toFixed(decimalPlaces) + suffix;
            
            if (progress < 1) {
                window.requestAnimationFrame(animateCount);
            }
        };
        
        window.requestAnimationFrame(animateCount);
    };
    
    /**
     * Create a loading spinner
     * @param {HTMLElement} container - Container for the spinner
     * @param {string} size - Size class (small, medium, large)
     * @returns {HTMLElement} - The spinner element
     */
    const createSpinner = (container, size = 'medium') => {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${size}`;
        spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        
        if (container) {
            container.appendChild(spinner);
        }
        
        return spinner;
    };
    
    /**
     * Remove a spinner element
     * @param {HTMLElement} spinner - Spinner element to remove
     */
    const removeSpinner = (spinner) => {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    };
    
    /**
     * Trigger achievement animation
     * @param {HTMLElement} element - Element to animate
     * @param {string} message - Achievement message
     */
    const triggerAchievement = (element, message) => {
        // Skip if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            UI.showToast(message, 'success');
            return;
        }
        
        // Create achievement element
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <div class="achievement-icon"><i class="fas fa-trophy"></i></div>
            <div class="achievement-message">${message}</div>
        `;
        
        document.body.appendChild(achievement);
        
        // Animate in
        setTimeout(() => {
            achievement.classList.add('show');
        }, 10);
        
        // Animate out
        setTimeout(() => {
            achievement.classList.remove('show');
            setTimeout(() => {
                if (achievement.parentNode) {
                    achievement.parentNode.removeChild(achievement);
                }
            }, 500);
        }, 3000);
    };

    // Public API
    return {
        initialize,
        animateNumber,
        createSpinner,
        removeSpinner,
        triggerAchievement
    };
})();
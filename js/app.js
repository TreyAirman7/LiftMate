/**
 * LiftMate - Main Application Module
 * Initializes and coordinates all application modules
 */

/**
 * Initialize the application when the DOM is fully loaded
 */
const initializeApp = () => {
    // Check if required modules are available
    if (typeof UI === 'undefined') {
        console.error('UI module is not loaded! Application cannot be initialized.');
        return;
    }
    
    try {
        console.log('Starting application initialization...');
        
        // Initialize UI first
        UI.initialize();
        console.log('UI initialized');
        
        // Initialize user greeting
        updateUserGreeting();
        
        // Initialize core modules first, with small delay between critical modules
        setTimeout(() => {
            // Initialize feature modules in the correct order to avoid dependency issues
            console.log('Initializing core modules...');
            if (typeof ExerciseManager !== 'undefined') ExerciseManager.initialize();
            
            // Initialize additional modules with a slight delay to ensure DOM has settled
            setTimeout(() => {
                // After UI and core modules are ready, initialize onboarding as a priority
                if (typeof OnboardingManager !== 'undefined') {
                    console.log('Initializing OnboardingManager...');
                    OnboardingManager.initialize();
                }
                
                // Continue with other modules
                if (typeof D3ChartsManager !== 'undefined') {
                    console.log('Initializing D3 charts manager...');
                    D3ChartsManager.initialize();
                } else {
                    console.warn('D3ChartsManager not found. D3 charts will not be available.');
                }
                
                if (typeof WorkoutGraphics !== 'undefined') {
                    console.log('Initializing Workout Graphics manager...');
                    WorkoutGraphics.initialize();
                } else {
                    console.warn('WorkoutGraphics not found. Workout graphics will not be available.');
                }
                
                // Initialize remaining modules
                if (typeof TemplateManager !== 'undefined') TemplateManager.initialize();
                if (typeof WorkoutManager !== 'undefined') WorkoutManager.initialize();
                if (typeof InputModeManager !== 'undefined') InputModeManager.initialize();
                if (typeof StatsManager !== 'undefined') StatsManager.initialize();
                if (typeof ProgressManager !== 'undefined') ProgressManager.initialize();
                if (typeof HistoryManager !== 'undefined') HistoryManager.initialize();
                if (typeof WeightManager !== 'undefined') WeightManager.initialize();
                if (typeof ProgressPicsManager !== 'undefined') ProgressPicsManager.initialize();
                if (typeof GoalsManager !== 'undefined') GoalsManager.initialize();
                
                // Initialize enhanced visualizations before animations
                if (typeof VisualizationManager !== 'undefined') {
                    console.log('Initializing visualization manager...');
                    VisualizationManager.initialize();
                } else {
                    console.warn('VisualizationManager not found. Enhanced visualizations will not be available.');
                }
                
                // Initialize animations module last (after all other modules and visualizations)
                setTimeout(() => {
                    if (typeof Animations !== 'undefined') {
                        console.log('Initializing animations and micro-interactions...');
                        Animations.initialize();
                    } else {
                        console.warn('Animations module not found. Enhanced animations will not be available.');
                    }
                }, 500); // Delay to ensure all DOM is ready and rendered
                
                console.log('Application initialized successfully!');
            }, 300); // Delay to ensure DOM is fully ready for onboarding modals
            
        }, 100); // Small delay for core modules
        
        // Add CSS for weight stats and other elements (wasn't included in the main CSS)
        addDynamicStyles();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
};

/**
 * Add dynamic styles that were originally in the app.js file
 */
const addDynamicStyles = () => {
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
        
        .error-message {
            text-align: center;
            padding: 20px;
            background-color: rgba(179, 38, 30, 0.1);
            border: 1px solid var(--danger-color);
            border-radius: 8px;
            color: var(--danger-color);
            margin: 10px 0;
        }
        
        .error-details {
            font-size: 12px;
            margin-top: 10px;
            color: var(--muted-text-color);
        }
    `;
    
    document.head.appendChild(styleEl);
    
    // Skip service worker registration when running from file:// protocol
    // Service workers are only supported on HTTPS or localhost
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('../service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
};

/**
 * Updates user greeting elements with the user's name
 */
const updateUserGreeting = () => {
    // Get user profile
    const userProfile = DataManager.getUserProfile();
    const userName = userProfile && userProfile.name ? userProfile.name : 'Champion';
    
    // Update the header (without the Hi, Name text)
    const headerElement = document.querySelector('.header-content h1');
    if (headerElement) {
        // Set the original header contents - no greeting
        headerElement.innerHTML = '<i class="fas fa-dumbbell"></i> <span class="typing-text">LiftMate</span>';
    }
    
    // Add styles for workout greeting
    const style = document.createElement('style');
    style.textContent = `
        /* Current workout greeting */
        .workout-greeting {
            text-align: center;
            margin-bottom: 25px;
            padding: 15px;
            border-radius: 8px;
            background: linear-gradient(to right, var(--primary-light-color), var(--primary-color));
            color: white;
            animation: fadeIn 0.5s ease-out;
        }
        
        .workout-greeting h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
    
    // Add a greeting to the current workout tab
    const workoutContainer = document.querySelector('#current-workout .container');
    if (workoutContainer) {
        // Create the greeting element
        const greetingDiv = document.createElement('div');
        greetingDiv.className = 'workout-greeting';
        
        // Get time of day to personalize greeting
        const hour = new Date().getHours();
        let timeGreeting = 'Good day';
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 17) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';
        
        greetingDiv.innerHTML = `<h3>${timeGreeting}, ${userName}! Ready for your workout?</h3>`;
        
        // Insert at the beginning of the container, after the header
        const sectionHeader = workoutContainer.querySelector('.section-header');
        if (sectionHeader && sectionHeader.nextSibling) {
            workoutContainer.insertBefore(greetingDiv, sectionHeader.nextSibling);
        } else {
            workoutContainer.appendChild(greetingDiv);
        }
    }
};

// Add event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
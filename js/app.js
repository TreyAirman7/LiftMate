/**
 * LiftMate - Main Application Module
 * Initializes and coordinates all application modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI first
    UI.initialize();
    
    // Initialize feature modules in the correct order to avoid dependency issues
    ExerciseManager.initialize();   // Should be initialized first as other modules may need exercises
    TemplateManager.initialize();
    WorkoutManager.initialize();    // Depends on templates
    StatsManager.initialize();      // Depends on workout data
    ProgressManager.initialize();   // Depends on workout data
    HistoryManager.initialize();    // Depends on workout data
    WeightManager.initialize();
    ProgressPicsManager.initialize();
    
    // Add CSS for weight stats (wasn't included in the main CSS)
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
    `;
    
    document.head.appendChild(styleEl);
    
    // Skip service worker registration when running from file:// protocol
    // Service workers are only supported on HTTPS or localhost
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
});



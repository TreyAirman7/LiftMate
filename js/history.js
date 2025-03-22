/**
 * LiftMate - History Module
 * Handles workout history display and management
 */

const HistoryManager = (() => {
    // Module state
    let currentFilter = 'all';
    
    /**
     * Initialize history manager functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering
        renderHistory();
    };
    
    /**
     * Setup all event listeners for history functionality
     */
    const setupEventListeners = () => {
        // Setup date filters
        UI.setupTimeframeSelector('date-filter', 'date-filter-button', (filter) => {
            currentFilter = filter;
            renderHistory();
        });
    };
    
    /**
     * Render the workout history list
     */
    const renderHistory = () => {
        const workouts = DataManager.getWorkouts();
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, currentFilter);
        const historyList = document.getElementById('workout-history');
        
        // Sort workouts by date (most recent first)
        filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Clear existing history items
        historyList.innerHTML = '';
        
        // Show message if no workouts
        if (filteredWorkouts.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <p>No workout history available for this timeframe.</p>
                </div>
            `;
            return;
        }
        
        // Create history items for each workout
        filteredWorkouts.forEach(workout => {
            const historyItem = createHistoryItem(workout);
            historyList.appendChild(historyItem);
        });
    };
    
    /**
     * Create a history item for a workout
     * @param {Object} workout - Workout object
     * @returns {HTMLElement} - History item element
     */
    const createHistoryItem = (workout) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.setAttribute('data-workout-id', workout.id);
        
        // Calculate workout statistics
        const totalExercises = workout.exercises.length;
        const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.filter(set => set.completed).length, 0);
        const totalVolume = workout.exercises.reduce((total, ex) => {
            return total + ex.sets.reduce((setTotal, set) => {
                return setTotal + (set.weight * set.reps || 0);
            }, 0);
        }, 0);
        
        // Determine intensity based on volume per minute
        const intensity = workout.duration ? Math.round(totalVolume / workout.duration) : 0;
        let intensityLabel = 'Low';
        let intensityColor = 'var(--secondary-color)';
        
        if (intensity > 150) {
            intensityLabel = 'High';
            intensityColor = 'var(--danger-color)';
        } else if (intensity > 80) {
            intensityLabel = 'Medium';
            intensityColor = 'var(--warning-color)';
        }
        
        // Create history item HTML
        historyItem.innerHTML = `
            <div class="history-item-header">
                <h3 class="history-item-title">${workout.templateName || 'Custom Workout'}</h3>
                <div class="history-item-date">${UI.formatDate(workout.date)}</div>
            </div>
            <div class="history-item-stats">
                <div class="history-stat">
                    <i class="fas fa-dumbbell"></i> ${totalExercises} exercises, ${totalSets} sets
                </div>
                <div class="history-stat">
                    <i class="fas fa-clock"></i> ${UI.formatDuration(workout.duration)}
                </div>
                <div class="history-stat">
                    <i class="fas fa-fire" style="color: ${intensityColor};"></i> ${intensityLabel} intensity
                </div>
            </div>
            <div class="history-item-actions">
                <button class="button secondary view-workout" data-workout-id="${workout.id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="button secondary delete-workout" data-workout-id="${workout.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewButton = historyItem.querySelector('.view-workout');
        viewButton.addEventListener('click', () => {
            viewWorkoutDetails(workout.id);
        });
        
        const deleteButton = historyItem.querySelector('.delete-workout');
        deleteButton.addEventListener('click', () => {
            deleteWorkout(workout.id);
        });
        
        return historyItem;
    };
    
    /**
     * View workout details
     * @param {string} workoutId - ID of workout to view
     */
    const viewWorkoutDetails = (workoutId) => {
        const workouts = DataManager.getWorkouts();
        const workout = workouts.find(w => w.id === workoutId);
        
        if (!workout) {
            UI.showToast('Workout not found', 'error');
            return;
        }
        
        // Implementation of workout details view
        UI.showToast('Workout details coming soon!', 'info');
    };
    
    /**
     * Delete a workout after confirmation
     * @param {string} workoutId - ID of workout to delete
     */
    const deleteWorkout = (workoutId) => {
        UI.showConfirmation(
            'Delete Workout',
            'Are you sure you want to delete this workout? This action cannot be undone.',
            () => {
                const success = DataManager.deleteWorkout(workoutId);
                
                if (success) {
                    UI.showToast('Workout deleted successfully', 'success');
                    renderHistory();
                    
                    // Update stats and progress if available
                    if (typeof StatsManager !== 'undefined' && StatsManager.renderStats) {
                        StatsManager.renderStats();
                    }
                    
                    if (typeof ProgressManager !== 'undefined' && ProgressManager.renderExerciseSelect) {
                        ProgressManager.renderExerciseSelect();
                    }
                } else {
                    UI.showToast('Failed to delete workout', 'error');
                }
            }
        );
    };
    
    // Public API
    return {
        initialize,
        renderHistory
    };
})();
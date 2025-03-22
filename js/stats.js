/**
 * LiftMate - Statistics Module
 * Handles statistics display and calculations
 */

const StatsManager = (() => {
    // Module state
    let currentTimeframe = 'week';
    
    /**
     * Initialize statistics functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering
        renderStats();
    };
    
    /**
     * Setup event listeners for statistics functionality
     */
    const setupEventListeners = () => {
        // Setup timeframe selectors
        UI.setupTimeframeSelector('timeframe-selector', 'timeframe-button', (timeframe) => {
            currentTimeframe = timeframe;
            renderStats();
        });
    };
    
    /**
     * Render all statistics
     */
    const renderStats = () => {
        renderDashboardStats();
        renderPersonalRecords();
    };
    
    /**
     * Render the main dashboard statistics
     */
    const renderDashboardStats = () => {
        const workouts = DataManager.getWorkouts();
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, currentTimeframe);
        
        // Calculate total workouts
        const totalWorkouts = filteredWorkouts.length;
        document.getElementById('total-workouts').textContent = totalWorkouts;
        
        // Calculate total duration
        const totalMinutes = filteredWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        document.getElementById('total-duration').textContent = `${totalHours} hrs`;
        
        // Calculate average workouts per week
        let avgPerWeek = 0;
        
        if (filteredWorkouts.length > 0) {
            const oldestWorkout = new Date(Math.min(...filteredWorkouts.map(w => new Date(w.date))));
            const now = new Date();
            const diffTime = Math.abs(now - oldestWorkout);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
            
            avgPerWeek = (filteredWorkouts.length / diffWeeks).toFixed(1);
        }
        
        document.getElementById('avg-per-week').textContent = avgPerWeek;
        
        // Calculate total weight lifted
        let totalWeightLifted = 0;
        
        filteredWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        totalWeightLifted += (set.weight * set.reps);
                    }
                });
            });
        });
        
        // Format with commas for thousands
        const formattedTotalWeight = totalWeightLifted.toLocaleString();
        document.getElementById('total-weight-lifted').textContent = `${formattedTotalWeight} lbs`;
    };
    
    
    /**
     * Render personal records
     */
    const renderPersonalRecords = () => {
        const records = DataManager.getPersonalRecords();
        const exercises = DataManager.getExercises();
        const recordsList = document.getElementById('personal-records-list');
        
        // Clear existing records
        recordsList.innerHTML = '';
        
        // Show message if no records
        if (Object.keys(records).length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <p>No personal records yet. Complete some workouts to see your records!</p>
                </div>
            `;
            return;
        }
        
        // Create record items for each exercise with records
        Object.keys(records).forEach(exerciseId => {
            const exercise = exercises.find(ex => ex.id === exerciseId);
            
            if (!exercise) {
                return;
            }
            
            const record = records[exerciseId];
            
            const recordCard = document.createElement('div');
            recordCard.className = 'card record-card';
            recordCard.innerHTML = `
                <h3>${exercise.name}</h3>
                <div class="record-details">
                    <div class="record-detail">
                        <span class="record-label">Max Weight:</span>
                        <span class="record-value">${record.maxWeight} lbs</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Max Reps:</span>
                        <span class="record-value">${record.maxReps}</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Max Volume (Single Set):</span>
                        <span class="record-value">${record.maxVolume} lbs</span>
                    </div>
                </div>
            `;
            
            recordsList.appendChild(recordCard);
        });
    };
    
    // Public API
    return {
        initialize,
        renderStats
    };
})();
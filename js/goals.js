/**
 * LiftMate - Goals Module
 * Handles setting and tracking goals for exercises, gym visits, and body weight
 */

const GoalsManager = (() => {
    // DOM Elements
    let exerciseGoalSelector;
    let exerciseGoalWeightInput;
    let gymVisitsTimeframeSelect;
    let gymVisitsCountInput;
    let bodyweightTargetInput;
    
    /**
     * Initialize the module
     */
    const initialize = () => {
        // Cache DOM Elements
        exerciseGoalSelector = document.getElementById('goal-exercise-select');
        exerciseGoalWeightInput = document.getElementById('goal-exercise-weight');
        gymVisitsTimeframeSelect = document.getElementById('goal-visits-timeframe');
        gymVisitsCountInput = document.getElementById('goal-visits-count');
        bodyweightTargetInput = document.getElementById('goal-bodyweight-target');
        
        // Initialize event listeners
        setupEventListeners();
        
        // Load and display existing goals
        loadGoals();
    };
    
    /**
     * Setup event listeners for goals functionality
     */
    const setupEventListeners = () => {
        // Exercise goal form
        const exerciseGoalForm = document.getElementById('exercise-goal-form');
        exerciseGoalForm.addEventListener('submit', handleExerciseGoalSubmit);
        
        // Gym visits goal form
        const gymVisitsGoalForm = document.getElementById('gym-visits-goal-form');
        gymVisitsGoalForm.addEventListener('submit', handleGymVisitsGoalSubmit);
        
        // Bodyweight goal form
        const bodyweightGoalForm = document.getElementById('bodyweight-goal-form');
        bodyweightGoalForm.addEventListener('submit', handleBodyweightGoalSubmit);
        
        // Delete goal buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-goal')) {
                const goalId = e.target.getAttribute('data-goal-id');
                deleteGoal(goalId);
            }
        });
        
        // Populate exercise dropdown
        populateExerciseDropdown();
    };
    
    /**
     * Populate the exercise dropdown with available exercises
     */
    const populateExerciseDropdown = () => {
        const exercises = DataManager.getExercises();
        
        // Clear current options (except the default)
        while (exerciseGoalSelector.options.length > 1) {
            exerciseGoalSelector.remove(1);
        }
        
        // Add exercises to dropdown
        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.id;
            option.textContent = exercise.name;
            exerciseGoalSelector.appendChild(option);
        });
    };
    
    /**
     * Handle form submission for exercise goals
     * @param {Event} e - Form submit event
     */
    const handleExerciseGoalSubmit = (e) => {
        e.preventDefault();
        
        const exerciseId = exerciseGoalSelector.value;
        const targetWeight = parseFloat(exerciseGoalWeightInput.value);
        
        if (!exerciseId) {
            UI.showToast('Please select an exercise', 'error');
            return;
        }
        
        if (isNaN(targetWeight) || targetWeight < 0) {
            UI.showToast('Please enter a valid target weight', 'error');
            return;
        }
        
        // Find exercise name
        const exercises = DataManager.getExercises();
        const exercise = exercises.find(ex => ex.id === exerciseId);
        
        if (!exercise) {
            UI.showToast('Exercise not found', 'error');
            return;
        }
        
        // Create the goal
        const goal = {
            id: DataManager.generateId(),
            type: 'exercise',
            exerciseId,
            exerciseName: exercise.name,
            targetWeight,
            createdAt: new Date().toISOString()
        };
        
        // Save the goal
        saveGoal(goal);
        
        // Reset the form
        exerciseGoalSelector.value = '';
        exerciseGoalWeightInput.value = '';
        
        // Show success message
        UI.showToast(`Goal set for ${exercise.name}`, 'success');
        
        // Refresh goals display
        loadGoals();
    };
    
    /**
     * Handle form submission for gym visits goals
     * @param {Event} e - Form submit event
     */
    const handleGymVisitsGoalSubmit = (e) => {
        e.preventDefault();
        
        const timeframe = gymVisitsTimeframeSelect.value;
        const targetCount = parseInt(gymVisitsCountInput.value);
        
        if (!timeframe) {
            UI.showToast('Please select a timeframe', 'error');
            return;
        }
        
        if (isNaN(targetCount) || targetCount <= 0) {
            UI.showToast('Please enter a valid target count', 'error');
            return;
        }
        
        // Create the goal
        const goal = {
            id: DataManager.generateId(),
            type: 'gym_visits',
            timeframe,
            targetCount,
            createdAt: new Date().toISOString()
        };
        
        // Save the goal
        saveGoal(goal);
        
        // Reset the form
        gymVisitsCountInput.value = '';
        
        // Show success message
        UI.showToast(`Gym visits goal set for ${timeframe}`, 'success');
        
        // Refresh goals display
        loadGoals();
    };
    
    /**
     * Handle form submission for bodyweight goals
     * @param {Event} e - Form submit event
     */
    const handleBodyweightGoalSubmit = (e) => {
        e.preventDefault();
        
        const targetWeight = parseFloat(bodyweightTargetInput.value);
        
        if (isNaN(targetWeight) || targetWeight < 0) {
            UI.showToast('Please enter a valid target weight', 'error');
            return;
        }
        
        // Create the goal
        const goal = {
            id: DataManager.generateId(),
            type: 'bodyweight',
            targetWeight,
            createdAt: new Date().toISOString()
        };
        
        // Save the goal
        saveGoal(goal);
        
        // Reset the form
        bodyweightTargetInput.value = '';
        
        // Show success message
        UI.showToast('Bodyweight goal set', 'success');
        
        // Refresh goals display
        loadGoals();
    };
    
    /**
     * Save a goal to the data store
     * @param {Object} goal - Goal to save
     */
    const saveGoal = (goal) => {
        // Get existing goals
        const goals = DataManager.getGoals();
        
        // Check if a goal of this type already exists
        let replaced = false;
        
        if (goal.type === 'exercise') {
            // For exercise goals, replace if same exercise exists
            const index = goals.findIndex(g => g.type === 'exercise' && g.exerciseId === goal.exerciseId);
            if (index !== -1) {
                goals[index] = goal;
                replaced = true;
            }
        } else if (goal.type === 'gym_visits') {
            // For gym visits goals, replace if same timeframe exists
            const index = goals.findIndex(g => g.type === 'gym_visits' && g.timeframe === goal.timeframe);
            if (index !== -1) {
                goals[index] = goal;
                replaced = true;
            }
        } else if (goal.type === 'bodyweight') {
            // For bodyweight goals, replace if any bodyweight goal exists
            const index = goals.findIndex(g => g.type === 'bodyweight');
            if (index !== -1) {
                goals[index] = goal;
                replaced = true;
            }
        }
        
        // If not replaced, add as new goal
        if (!replaced) {
            goals.push(goal);
        }
        
        // Save updated goals
        DataManager.saveGoals(goals);
    };
    
    /**
     * Delete a goal by ID
     * @param {string} goalId - ID of the goal to delete
     */
    const deleteGoal = (goalId) => {
        const goals = DataManager.getGoals();
        const filteredGoals = goals.filter(goal => goal.id !== goalId);
        
        if (filteredGoals.length !== goals.length) {
            DataManager.saveGoals(filteredGoals);
            UI.showToast('Goal deleted', 'success');
            loadGoals();
        }
    };
    
    /**
     * Load and display all goals
     */
    const loadGoals = () => {
        const goals = DataManager.getGoals();
        
        // Render each goal type
        renderExerciseGoals(goals.filter(goal => goal.type === 'exercise'));
        renderGymVisitsGoals(goals.filter(goal => goal.type === 'gym_visits'));
        renderBodyweightGoals(goals.filter(goal => goal.type === 'bodyweight'));
    };
    
    /**
     * Render exercise-specific goals
     * @param {Array} goals - Array of exercise goals
     */
    const renderExerciseGoals = (goals) => {
        const container = document.getElementById('exercise-goals-list');
        container.innerHTML = '';
        
        if (goals.length === 0) {
            container.innerHTML = '<div class="empty-state">No exercise goals set yet</div>';
            return;
        }
        
        // Get personal records for comparison
        const records = DataManager.getPersonalRecords();
        
        goals.forEach(goal => {
            const record = records[goal.exerciseId] || { maxWeight: 0 };
            const currentMax = record.maxWeight;
            const progress = Math.min(100, Math.round((currentMax / goal.targetWeight) * 100));
            
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            
            // Check if goal is achieved (100% or more)
            const isAchieved = progress >= 100;
            if (isAchieved) {
                goalElement.classList.add('goal-completed');
                
                // Dispatch goal achieved event for animation
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('goalAchieved', {
                        detail: { 
                            goalType: 'exercise',
                            goalName: goal.exerciseName,
                            goalElement: goalElement
                        }
                    }));
                }, 100);
            }
            
            goalElement.innerHTML = `
                <div class="goal-header">
                    <h4>${goal.exerciseName}</h4>
                    <button class="delete-goal" data-goal-id="${goal.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="goal-details">
                    <div class="goal-values">
                        <span>Current: ${currentMax} lbs</span>
                        <span>Target: ${goal.targetWeight} lbs</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="progress-fill ${isAchieved ? 'goal-reached animated' : ''}" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-percentage">${progress}% Complete</div>
                </div>
            `;
            
            container.appendChild(goalElement);
        });
    };
    
    /**
     * Render gym visits goals
     * @param {Array} goals - Array of gym visit goals
     */
    const renderGymVisitsGoals = (goals) => {
        const container = document.getElementById('gym-visits-goals-list');
        container.innerHTML = '';
        
        if (goals.length === 0) {
            container.innerHTML = '<div class="empty-state">No gym visits goals set yet</div>';
            return;
        }
        
        // Get workouts for counting
        const workouts = DataManager.getWorkouts();
        
        goals.forEach(goal => {
            let timeframeLabel;
            let actualCount;
            
            // Calculate actual visits based on timeframe
            if (goal.timeframe === 'weekly') {
                timeframeLabel = 'Weekly';
                actualCount = countWorkoutsInTimeframe(workouts, 'week');
            } else if (goal.timeframe === 'monthly') {
                timeframeLabel = 'Monthly';
                actualCount = countWorkoutsInTimeframe(workouts, 'month');
            }
            
            const progress = Math.min(100, Math.round((actualCount / goal.targetCount) * 100));
            
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            
            // Check if goal is achieved (100% or more)
            const isAchieved = progress >= 100;
            if (isAchieved) {
                goalElement.classList.add('goal-completed');
                
                // Dispatch goal achieved event for animation
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('goalAchieved', {
                        detail: { 
                            goalType: 'gym_visits',
                            goalName: `${timeframeLabel} Gym Visits`,
                            goalElement: goalElement
                        }
                    }));
                }, 100);
            }
            
            goalElement.innerHTML = `
                <div class="goal-header">
                    <h4>${timeframeLabel} Gym Visits</h4>
                    <button class="delete-goal" data-goal-id="${goal.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="goal-details">
                    <div class="goal-values">
                        <span>Current: ${actualCount} visits</span>
                        <span>Target: ${goal.targetCount} visits</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="progress-fill ${isAchieved ? 'goal-reached animated' : ''}" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-percentage">${progress}% Complete</div>
                </div>
            `;
            
            container.appendChild(goalElement);
        });
    };
    
    /**
     * Render bodyweight goals
     * @param {Array} goals - Array of bodyweight goals
     */
    const renderBodyweightGoals = (goals) => {
        const container = document.getElementById('bodyweight-goals-list');
        container.innerHTML = '';
        
        if (goals.length === 0) {
            container.innerHTML = '<div class="empty-state">No bodyweight goal set yet</div>';
            return;
        }
        
        // Get weight entries for comparison
        const weightEntries = DataManager.getWeightEntries();
        const currentWeight = weightEntries.length > 0 
            ? weightEntries[weightEntries.length - 1].weight 
            : 0;
            
        goals.forEach(goal => {
            const distanceFromGoal = Math.abs(currentWeight - goal.targetWeight);
            let progressDirection = 'neutral';
            let progressValue = 0;
            
            if (currentWeight === 0) {
                // Can't calculate progress without current weight
                progressValue = 0;
            } else if (currentWeight < goal.targetWeight) {
                // Need to gain weight
                progressDirection = 'gain';
                // Assume starting point is 10% below target for progress calculation
                const assumedStartWeight = goal.targetWeight * 0.9;
                progressValue = Math.min(100, Math.max(0, 
                    Math.round(((currentWeight - assumedStartWeight) / (goal.targetWeight - assumedStartWeight)) * 100)
                ));
            } else if (currentWeight > goal.targetWeight) {
                // Need to lose weight
                progressDirection = 'lose';
                // Assume starting point is 10% above target for progress calculation
                const assumedStartWeight = goal.targetWeight * 1.1;
                progressValue = Math.min(100, Math.max(0, 
                    Math.round(((assumedStartWeight - currentWeight) / (assumedStartWeight - goal.targetWeight)) * 100)
                ));
            } else {
                // Already at target weight
                progressValue = 100;
            }
            
            const directionText = progressDirection === 'gain' 
                ? 'Weight to gain' 
                : progressDirection === 'lose' 
                    ? 'Weight to lose' 
                    : 'Weight difference';
            
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            
            // Check if goal is achieved (100% or more)
            const isAchieved = progressValue >= 100;
            if (isAchieved) {
                goalElement.classList.add('goal-completed');
                
                // Dispatch goal achieved event for animation
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('goalAchieved', {
                        detail: { 
                            goalType: 'bodyweight',
                            goalName: 'Bodyweight Goal',
                            goalElement: goalElement
                        }
                    }));
                }, 100);
            }
            
            goalElement.innerHTML = `
                <div class="goal-header">
                    <h4>Bodyweight Goal</h4>
                    <button class="delete-goal" data-goal-id="${goal.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="goal-details">
                    <div class="goal-values">
                        <span>Current: ${currentWeight || 'No data'} lbs</span>
                        <span>Target: ${goal.targetWeight} lbs</span>
                    </div>
                    <div class="goal-stats">
                        <span>${directionText}: ${distanceFromGoal.toFixed(1)} lbs</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="progress-fill ${isAchieved ? 'goal-reached animated' : ''}" style="width: ${progressValue}%"></div>
                    </div>
                    <div class="goal-percentage">${progressValue}% Complete</div>
                </div>
            `;
            
            container.appendChild(goalElement);
        });
    };
    
    /**
     * Count workouts within a timeframe
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Timeframe to count within ('week', 'month')
     * @returns {number} - Count of workouts in timeframe
     */
    const countWorkoutsInTimeframe = (workouts, timeframe) => {
        const { start, end } = UI.getDateRange(timeframe);
        
        return workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= start && workoutDate <= end;
        }).length;
    };
    
    // Public API
    return {
        initialize
    };
})();
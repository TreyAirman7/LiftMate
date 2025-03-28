/**
 * LiftMate - Workout Module
 * Handles active workout management, timers, and workout completion
 */

const WorkoutManager = (() => {
    // Module state
    let activeWorkout = null;
    let activeTemplate = null;
    let currentExerciseIndex = 0;
    let currentSetIndex = 0;
    let completedExercises = 0;
    let workoutStartTime = null;
    let restTimer = null;
    let timerInterval = null;
    
    /**
     * Initialize workout manager functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Check for any active workout that needs to be restored
        checkForActiveWorkout();
    };
    
    /**
     * Setup all event listeners for workout functionality
     */
    const setupEventListeners = () => {
        // Active workout form - use direct button click instead of form submit
        try {
            // First try to attach to the form submit event
            const setForm = document.getElementById('set-form');
            if (setForm) {
                setForm.addEventListener('submit', completeSet);
                console.log('Set form submit listener added');
            } else {
                console.error('Set form element not found during initialization');
            }
            
            // Also attach directly to the Complete Set button as a backup
            // This ensures the button works even if form submission is blocked
            document.addEventListener('click', (e) => {
                // Find the submit button within the set form
                if (e.target && (
                    e.target.matches('#set-form button[type="submit"]') || 
                    e.target.closest('#set-form button[type="submit"]')
                )) {
                    // Prevent default to avoid double submission
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Complete Set button clicked directly');
                    completeSet(e);
                }
            });
            
            console.log('Backup button click listener added');
        } catch (error) {
            console.error('Error setting up set form listener:', error);
        }
        
        // Rest timer skip button
        document.getElementById('skip-rest').addEventListener('click', skipRest);
        
        // Cancel workout button
        document.getElementById('cancel-active-workout').addEventListener('click', promptCancelWorkout);
        
        // Finish workout button
        document.getElementById('finish-workout').addEventListener('click', finishWorkout);
        
        // Add beforeunload event to save state when app is closed
        window.addEventListener('beforeunload', () => {
            if (activeWorkout) {
                // Save workout state when the user leaves the app
                saveWorkoutState();
            }
        });
        
        // Add visibility change event to save state when app goes to background
        // and update timer when coming back to foreground
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && activeWorkout) {
                // Save workout state when the app is hidden (e.g., switching tabs or minimizing)
                saveWorkoutState();
            } else if (document.visibilityState === 'visible' && activeWorkout) {
                // App has returned to the foreground, check if we need to update timer
                const savedWorkoutState = DataManager.getActiveWorkout();
                
                if (savedWorkoutState && savedWorkoutState.state && 
                    savedWorkoutState.state.inRestPeriod && 
                    savedWorkoutState.state.restTimer > 0 &&
                    savedWorkoutState.state.timerTimestamp) {
                    
                    // Calculate elapsed time
                    const savedTime = new Date(savedWorkoutState.state.timerTimestamp);
                    const currentTime = new Date();
                    const elapsedSeconds = Math.floor((currentTime - savedTime) / 1000);
                    
                    // Adjust timer based on elapsed time
                    const adjustedRestTime = Math.max(0, savedWorkoutState.state.restTimer - elapsedSeconds);
                    
                    // If timer should have ended while in background
                    if (adjustedRestTime <= 0) {
                        // Play the completion sound
                        try {
                            if (typeof TimerSound !== 'undefined' && TimerSound.play) {
                                TimerSound.play();
                            }
                        } catch (e) {
                            console.error('Error playing timer sound:', e);
                        }
                        
                        // Stop current timer and move to next exercise
                        clearInterval(timerInterval);
                        restTimer = 0;
                        renderActiveExercise();
                        
                        // Save new state
                        saveWorkoutState();
                    } else if (Math.abs(adjustedRestTime - restTimer) > 2) {
                        // If timer has drifted more than 2 seconds, restart timer with correct time
                        // (we avoid restarting for small differences to prevent flicker)
                        clearInterval(timerInterval);
                        startRestTimer(adjustedRestTime);
                    }
                }
            }
        });
    };
    
    /**
     * Start a workout from a template
     * @param {Object} template - Template object to use for the workout
     */
    const startTemplateWorkout = (template) => {
        console.log('WorkoutManager.startTemplateWorkout called with template:', template);
        
        // Validate template
        if (!template) {
            UI.showToast('Invalid template', 'error');
            return;
        }
        
        // Validate template has exercises
        if (!template.exercises || template.exercises.length === 0) {
            UI.showToast('This template has no exercises. Please add exercises to the template first.', 'error');
            return;
        }
        
        // Validate that each exercise has sets
        for (const exercise of template.exercises) {
            if (!exercise.sets || exercise.sets.length === 0) {
                UI.showToast(`Exercise "${exercise.exerciseName}" has no sets defined. Please edit the template.`, 'error');
                return;
            }
        }
        
        // Set up new workout
        activeTemplate = template;
        
        try {
            // Create the workout object
            activeWorkout = {
                templateId: template.id,
                templateName: template.name,
                date: new Date().toISOString(),
                duration: 0,
                exercises: template.exercises.map(exercise => ({
                    exerciseId: exercise.exerciseId,
                    exerciseName: exercise.exerciseName,
                    sets: exercise.sets.map(set => ({
                        targetReps: set.targetReps,
                        restTime: set.restTime,
                        weight: null,
                        reps: null,
                        completed: false
                    }))
                }))
            };
            
            // Reset state
            currentExerciseIndex = 0;
            currentSetIndex = 0;
            completedExercises = 0;
            workoutStartTime = new Date();
            
            // Save initial workout state
            saveWorkoutState();
            
            console.log('Workout object created:', activeWorkout);
            console.log('Opening active-template-modal');
            
            // Make sure template modal element exists
            const templateName = document.getElementById('active-template-name');
            if (!templateName) {
                console.error('Template name element not found');
                UI.showToast('Error starting workout: UI elements not found', 'error');
                return;
            }
            
            // Set the template name in the modal
            templateName.textContent = template.name;
            
            // Open active template modal
            const modalOpened = UI.openModal('active-template-modal');
            
            if (!modalOpened) {
                console.error('Failed to open active template modal');
                UI.showToast('Error starting workout: Could not open workout interface', 'error');
                return;
            }
            
            console.log('Modal opened successfully');
            
            // Debug DOM structure of the modal
            console.log('Modal structure after opening:');
            const modal = document.getElementById('active-template-modal');
            if (modal) {
                console.log('Modal found:', modal);
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    console.log('Modal content found:', modalContent);
                    const modalBody = modalContent.querySelector('.modal-body');
                    if (modalBody) {
                        console.log('Modal body found:', modalBody);
                        console.log('Modal body HTML:', modalBody.innerHTML);
                    } else {
                        console.error('Modal body not found');
                    }
                } else {
                    console.error('Modal content not found');
                }
            } else {
                console.error('Modal not found after opening');
            }
            
            // We'll use a longer delay with multiple attempts to ensure UI is ready
            let attempts = 0;
            const maxAttempts = 3;
            const checkAndInitialize = () => {
                attempts++;
                console.log(`Attempt ${attempts} to initialize workout UI`);
                
                // Check all critical elements that must exist
                const criticalElements = [
                    'workout-progress-bar', 'completed-exercises', 'total-exercises',
                    'active-exercise-name', 'set-progress', 'current-set-number',
                    'target-reps', 'target-reps-container', 'current-set', 
                    'rest-timer', 'workout-complete', 'weight-input', 'reps-input'
                ];
                
                const missingElements = [];
                criticalElements.forEach(id => {
                    const element = document.getElementById(id);
                    if (!element) {
                        missingElements.push(id);
                        console.error(`Critical element missing: ${id}`);
                    } else {
                        console.log(`Found critical element: ${id}`, element);
                    }
                });
                
                if (missingElements.length > 0) {
                    console.error('Missing critical elements:', missingElements);
                    if (attempts < maxAttempts) {
                        // Try again after a delay
                        setTimeout(checkAndInitialize, 500);
                    } else {
                        console.error('Max attempts reached. These elements are required but not found in the DOM');
                        UI.showToast(`Error: Missing UI elements: ${missingElements.join(', ')}. Please try again.`, 'error');
                    }
                    return;
                }
                
                // If all elements exist, update the UI
                console.log('All critical elements found, updating UI...');
                updateWorkoutProgress();
                renderActiveExercise();
            };
            
            // Start the initialization process
            setTimeout(checkAndInitialize, 300);
            
        } catch (e) {
            console.error('Error starting workout:', e);
            UI.showToast('Error starting workout', 'error');
        }
    };
    
    /**
     * Update the workout progress UI
     */
    const updateWorkoutProgress = () => {
        // Check if activeWorkout is valid
        if (!activeWorkout || !activeWorkout.exercises) {
            console.error('Active workout is not properly initialized in updateWorkoutProgress');
            return;
        }
        
        // Get required DOM elements
        const progressBar = document.getElementById('workout-progress-bar');
        const completedEl = document.getElementById('completed-exercises');
        const totalEl = document.getElementById('total-exercises');
        
        // Check if elements exist
        if (!progressBar || !completedEl || !totalEl) {
            console.error('Required progress elements not found');
            return;
        }
        
        // Update progress bar
        const totalExercises = activeWorkout.exercises.length;
        const progressPercent = (completedExercises / totalExercises) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Update exercise count text
        completedEl.textContent = completedExercises;
        totalEl.textContent = totalExercises;
    };
    
    /**
     * Render the current active exercise
     */
    const renderActiveExercise = () => {
        // Make sure the active workout and current exercise index are valid
        if (!activeWorkout || !activeWorkout.exercises || activeWorkout.exercises.length === 0) {
            console.error('Active workout is not properly initialized');
            return;
        }
        
        const exercise = activeWorkout.exercises[currentExerciseIndex];
        
        if (!exercise) {
            console.error('Current exercise not found at index:', currentExerciseIndex);
            return;
        }
        
        // Get all required DOM elements and check if they exist
        const elements = {
            exerciseName: document.getElementById('active-exercise-name'),
            setProgress: document.getElementById('set-progress'),
            currentSetNumber: document.getElementById('current-set-number'),
            currentSet: document.getElementById('current-set'),
            restTimer: document.getElementById('rest-timer'),
            workoutComplete: document.getElementById('workout-complete')
        };
        
        // Direct access to target-reps element since we've restructured the HTML
        elements.targetReps = document.getElementById('target-reps');
        
        // Verify all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element not found: ${key}`);
                return;
            }
        }
        
        // Set exercise name
        elements.exerciseName.textContent = exercise.exerciseName;
        
        // Generate set numbers
        elements.setProgress.innerHTML = '';
        
        exercise.sets.forEach((set, index) => {
            const setNumber = document.createElement('div');
            setNumber.className = 'set-number';
            setNumber.textContent = index + 1;
            
            if (index === currentSetIndex) {
                setNumber.classList.add('current-set');
            } else if (set.completed) {
                setNumber.classList.add('completed-set');
            }
            
            elements.setProgress.appendChild(setNumber);
        });
        
        // Set current set info
        const currentSet = exercise.sets[currentSetIndex];
        if (!currentSet) {
            console.error('Current set not found at index:', currentSetIndex);
            return;
        }
        
        // Safely set text content with error handling
        try {
            // Set the set number
            elements.currentSetNumber.textContent = `Set ${currentSetIndex + 1}`;
            
            // Set target reps - support for both number and string (range) formats
            if (elements.targetReps) {
                elements.targetReps.textContent = currentSet.targetReps;
            } else {
                console.error('targetReps element not found or not accessible');
                
                // Try to find it again directly
                const targetRepsElement = document.getElementById('target-reps');
                if (targetRepsElement) {
                    targetRepsElement.textContent = currentSet.targetReps;
                }
            }
        } catch (e) {
            console.error('Error setting set information:', e);
        }
        
        // Show set form, hide rest timer and completion
        elements.currentSet.classList.remove('hidden');
        elements.restTimer.classList.add('hidden');
        elements.workoutComplete.classList.add('hidden');
        
        // Clear and focus weight input
        const weightInput = document.getElementById('weight-input');
        const repsInput = document.getElementById('reps-input');
        
        if (!weightInput || !repsInput) {
            console.error('Weight or reps input element not found');
            return;
        }
        
        // Get previous workout info
        const prevWorkoutInfo = document.getElementById('previous-workout-info');
        const prevWorkoutDate = document.getElementById('prev-workout-date');
        const prevWorkoutWeight = document.getElementById('prev-workout-weight');
        const prevWorkoutReps = document.getElementById('prev-workout-reps');
        
        // Setup for showing previous workout info
        try {
            // Find the last workout with the same template
            const previousWorkouts = findPreviousWorkouts(activeWorkout.templateId);
            
            // If we have a previous workout with this template
            if (previousWorkouts.length > 0) {
                const lastWorkout = previousWorkouts[0]; // Most recent first
                
                // Find the matching exercise in the previous workout
                const prevExercise = lastWorkout.exercises.find(ex => 
                    ex.exerciseId === exercise.exerciseId
                );
                
                if (prevExercise && prevExercise.sets && prevExercise.sets[currentSetIndex]) {
                    // We found matching exercise and set
                    const prevSet = prevExercise.sets[currentSetIndex];
                    
                    // Check if the previous set has weight and reps data
                    if (prevSet.weight !== null && prevSet.reps !== null) {
                        // Format the date (e.g., "Jan 15")
                        const workoutDate = new Date(lastWorkout.date);
                        const formattedDate = workoutDate.toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        
                        // Update previous workout info
                        prevWorkoutDate.textContent = formattedDate;
                        prevWorkoutWeight.textContent = prevSet.weight + (DataManager.getSettings().weightUnit || 'lbs');
                        prevWorkoutReps.textContent = prevSet.reps;
                        
                        // Make the previous workout info visible
                        prevWorkoutInfo.style.display = 'block';
                    } else {
                        // No weight/reps data for this set in the previous workout
                        prevWorkoutInfo.style.display = 'none';
                    }
                } else {
                    // No matching exercise or set in the previous workout
                    prevWorkoutInfo.style.display = 'none';
                }
            } else {
                // No previous workouts with this template
                prevWorkoutInfo.style.display = 'none';
            }
        } catch (e) {
            console.error('Error showing previous workout info:', e);
            prevWorkoutInfo.style.display = 'none';
        }
        
        // If there's a previous set in the current workout, use its weight as default
        let defaultWeight = '';
        if (currentSetIndex > 0 && exercise.sets[currentSetIndex - 1].weight) {
            defaultWeight = exercise.sets[currentSetIndex - 1].weight;
        } else if (currentExerciseIndex > 0) {
            // Look in previous exercises for the same exercise
            for (let i = currentExerciseIndex - 1; i >= 0; i--) {
                const prevExercise = activeWorkout.exercises[i];
                if (prevExercise && prevExercise.exerciseId === exercise.exerciseId) {
                    const lastSet = prevExercise.sets.find(set => set && set.weight);
                    if (lastSet) {
                        defaultWeight = lastSet.weight;
                        break;
                    }
                }
            }
        }
        
        weightInput.value = defaultWeight;
        repsInput.value = '';
        
        // Focus the weight input if empty, otherwise the reps input
        try {
            if (!weightInput.value) {
                weightInput.focus();
            } else {
                repsInput.focus();
            }
        } catch (e) {
            console.error('Error focusing input fields:', e);
        }
        
        // Dispatch event for input mode initialization
        document.dispatchEvent(new CustomEvent('setFormDisplayed'));
    };
    
    /**
     * Handle set completion
     * @param {Event} e - Form submit event
     */
    const completeSet = (e) => {
        e.preventDefault();
        
        // Get form values
        const weight = parseFloat(document.getElementById('weight-input').value);
        const reps = parseInt(document.getElementById('reps-input').value);
        
        // Validate inputs
        if (isNaN(weight) || weight < 0) {
            UI.showToast('Please enter a valid weight', 'error');
            return;
        }
        
        if (isNaN(reps) || reps < 0) {
            UI.showToast('Please enter valid reps', 'error');
            return;
        }
        
        // Update set data
        const exercise = activeWorkout.exercises[currentExerciseIndex];
        exercise.sets[currentSetIndex].weight = weight;
        exercise.sets[currentSetIndex].reps = reps;
        exercise.sets[currentSetIndex].completed = true;
        
        // Save workout state after completing a set
        saveWorkoutState();
        
        // Check for personal record and trigger animation if needed
        const exerciseData = DataManager.getExercises(); // Fixed: use getExercises instead of getExerciseData
        const exerciseItem = exerciseData.find(ex => ex.id === exercise.exerciseId);
        if (exerciseItem) {
            // Check if this is a PR for this rep range
            const isPersonalRecord = checkForPersonalRecord(exerciseItem, weight, reps);
            if (isPersonalRecord) {
                // Dispatch personal record event for animations
                document.dispatchEvent(new CustomEvent('personalRecord', {
                    detail: { 
                        exerciseName: exercise.exerciseName,
                        weight: weight,
                        reps: reps,
                        element: document.querySelector('.set-number.current-set')
                    }
                }));
            }
        }
        
        // Check if we need to move to next set or exercise
        if (currentSetIndex < exercise.sets.length - 1) {
            // Move to next set
            currentSetIndex++;
            
            // Start rest timer
            const restTime = exercise.sets[currentSetIndex - 1].restTime;
            startRestTimer(restTime);
        } else {
            // Complete this exercise
            completedExercises++;
            updateWorkoutProgress();
            
            // Check if we need to move to next exercise
            if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
                // Move to next exercise
                currentExerciseIndex++;
                currentSetIndex = 0;
                renderActiveExercise();
            } else {
                // Workout is complete
                showWorkoutComplete();
            }
        }
    };
    
    /**
     * Start the rest timer
     * @param {number} seconds - Rest time in seconds
     */
    const startRestTimer = (seconds) => {
        // Only start timer if there's a rest time
        if (!seconds || seconds <= 0) {
            renderActiveExercise();
            return;
        }
        
        // Set up timer
        restTimer = seconds;
        clearInterval(timerInterval);
        
        // Update UI
        document.getElementById('current-set').classList.add('hidden');
        
        // Make sure the rest timer is visible and properly initialized
        const restTimerElement = document.getElementById('rest-timer');
        const timerDisplayElement = document.getElementById('timer-display');
        const skipRestButton = document.getElementById('skip-rest');
        
        if (!restTimerElement || !timerDisplayElement || !skipRestButton) {
            console.error('One or more timer elements not found', {
                restTimerElement, timerDisplayElement, skipRestButton
            });
            // Fallback - just continue to next exercise
            renderActiveExercise();
            return;
        }
        
        // Ensure the timer elements are visible
        restTimerElement.classList.remove('hidden');
        skipRestButton.style.display = 'inline-block';
        
        // Set initial time display
        timerDisplayElement.textContent = UI.formatTime(restTimer);
        
        // For debugging
        console.log('Rest timer started with', seconds, 'seconds');
        console.log('Timer elements:', {
            restTimerElement, timerDisplayElement, skipRestButton
        });
        
        // Save the state to ensure we record the timer start
        saveWorkoutState();
        
        // Start timer interval
        timerInterval = setInterval(() => {
            restTimer--;
            
            // Update timer display
            timerDisplayElement.textContent = UI.formatTime(restTimer);
            
            if (restTimer <= 0) {
                // Timer complete
                clearInterval(timerInterval);
                
                // Play completion sound
                try {
                    if (typeof TimerSound !== 'undefined' && TimerSound.play) {
                        TimerSound.play();
                    }
                } catch (e) {
                    console.error('Error playing timer sound:', e);
                }
                
                renderActiveExercise();
                
                // Save workout state after rest timer completes
                saveWorkoutState();
            }
        }, 1000);
    };
    
    /**
     * Skip the rest period
     */
    const skipRest = () => {
        console.log('Skip rest button clicked');
        clearInterval(timerInterval);
        
        // Ensure we reset the timer state
        timerInterval = null;
        restTimer = 0;
        
        // Make sure the rest timer is hidden
        const restTimerElement = document.getElementById('rest-timer');
        if (restTimerElement) {
            restTimerElement.classList.add('hidden');
        }
        
        // Continue to next exercise
        renderActiveExercise();
        
        // Save workout state after skipping rest
        saveWorkoutState();
    };
    
    /**
     * Show workout complete screen
     */
    const showWorkoutComplete = () => {
        // Hide exercise UI, show completion
        document.getElementById('active-exercise-container').classList.add('hidden');
        const workoutCompleteEl = document.getElementById('workout-complete');
        workoutCompleteEl.classList.remove('hidden');
        
        // Personalize the completion message with user's name
        const userProfile = DataManager.getUserProfile();
        const userName = userProfile && userProfile.name ? userProfile.name : 'Champion';
        
        // Update heading and message with user's name
        const heading = workoutCompleteEl.querySelector('h3');
        if (heading) {
            heading.textContent = `Workout Completed, ${userName}! 💪`;
        }
        
        const message = workoutCompleteEl.querySelector('.completion-message');
        if (message) {
            message.textContent = `Outstanding work, ${userName}! You've crushed today's workout.`;
        }
        
        // Dispatch workout completed event for animations
        document.dispatchEvent(new CustomEvent('workoutCompleted', {
            detail: { workoutName: activeWorkout.templateName }
        }));
    };
    
    /**
     * Prompt to cancel the current workout
     */
    const promptCancelWorkout = () => {
        // Get user profile for personalized message
        const userProfile = DataManager.getUserProfile();
        const userName = userProfile && userProfile.name ? userProfile.name : '';
        
        UI.showConfirmation(
            'Cancel Workout',
            `${userName ? userName + ', are' : 'Are'} you sure you want to cancel this workout? Your progress will be lost.`,
            () => {
                cancelWorkout();
            }
        );
    };
    
    /**
     * Cancel the current workout
     */
    const cancelWorkout = () => {
        // Clear timer if running
        clearInterval(timerInterval);
        
        // Reset state
        activeWorkout = null;
        activeTemplate = null;
        
        // Clear the saved workout state
        DataManager.clearActiveWorkout();
        
        // Close modal
        UI.closeModal(document.getElementById('active-template-modal'));
        
        // Reset UI
        document.getElementById('active-exercise-container').classList.remove('hidden');
        document.getElementById('workout-complete').classList.add('hidden');
    };
    
    /**
     * Finish and save the current workout
     */
    const finishWorkout = () => {
        if (!activeWorkout) {
            return;
        }
        
        // Calculate workout duration
        const endTime = new Date();
        const durationMs = endTime - workoutStartTime;
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        
        // Update workout data
        activeWorkout.duration = durationMinutes;
        
        // Save workout
        const savedWorkout = DataManager.saveWorkout(activeWorkout);
        
        if (savedWorkout) {
            // Personalized success message
            const userProfile = DataManager.getUserProfile();
            const userName = userProfile && userProfile.name ? userProfile.name : 'Champion';
            UI.showToast(`Great job, ${userName}! Workout saved successfully!`, 'success');
            
            // Close modal
            UI.closeModal(document.getElementById('active-template-modal'));
            
            // Reset state
            activeWorkout = null;
            activeTemplate = null;
            
            // Clear the saved workout state
            DataManager.clearActiveWorkout();
            
            // Reset UI
            document.getElementById('active-exercise-container').classList.remove('hidden');
            document.getElementById('workout-complete').classList.add('hidden');
            
            // Refresh stats and history
            if (typeof StatsManager !== 'undefined' && StatsManager.renderStats) {
                StatsManager.renderStats();
            }
            
            if (typeof HistoryManager !== 'undefined' && HistoryManager.renderHistory) {
                HistoryManager.renderHistory();
            }
            
            if (typeof ProgressManager !== 'undefined' && ProgressManager.renderExerciseSelect) {
                ProgressManager.renderExerciseSelect();
            }
        } else {
            UI.showToast('Failed to save workout', 'error');
        }
    };
    
    /**
     * Check if a set is a personal record for the exercise
     * @param {Object} exercise - Exercise data object
     * @param {number} weight - Weight lifted
     * @param {number} reps - Reps completed
     * @returns {boolean} - Whether it's a personal record
     */
    const checkForPersonalRecord = (exercise, weight, reps) => {
        // No records to compare against
        if (!exercise.records) {
            return true; // First record is always a PR
        }
        
        // Check 1RM first
        const estimatedOneRM = calculateOneRepMax(weight, reps);
        
        // If we have a 1RM record, compare against it
        if (exercise.records.oneRM) {
            if (estimatedOneRM > exercise.records.oneRM) {
                return true;
            }
        } else if (estimatedOneRM > 0) {
            return true; // First 1RM
        }
        
        // Check rep range PRs
        const repRangeKey = getRepRangeKey(reps);
        if (repRangeKey && exercise.records[repRangeKey]) {
            if (weight > exercise.records[repRangeKey]) {
                return true;
            }
        } else if (repRangeKey && weight > 0) {
            return true; // First record for this rep range
        }
        
        return false;
    };
    
    /**
     * Calculate estimated one-rep max
     * @param {number} weight - Weight lifted
     * @param {number} reps - Reps completed
     * @returns {number} - Estimated 1RM
     */
    const calculateOneRepMax = (weight, reps) => {
        if (reps === 1) return weight;
        if (reps < 1 || reps > 15) return 0; // Outside reliable estimation range
        
        // Brzycki formula
        return weight * (36 / (37 - reps));
    };
    
    /**
     * Get the rep range key for recording PRs
     * @param {number} reps - Number of reps
     * @returns {string|null} - Rep range key
     */
    const getRepRangeKey = (reps) => {
        if (reps <= 0) return null;
        
        if (reps <= 5) {
            return 'strength';
        } else if (reps <= 12) {
            return 'hypertrophy';
        } else {
            return 'endurance';
        }
    };
    
    /**
     * Find previous workouts that used the same template
     * @param {string} templateId - ID of the template to search for
     * @returns {Array} - Array of workout objects sorted by date (newest first)
     */
    const findPreviousWorkouts = (templateId) => {
        // Get all completed workouts
        const allWorkouts = DataManager.getWorkouts();
        
        // Filter for workouts with the same template ID
        const matchingWorkouts = allWorkouts.filter(workout => 
            workout.templateId === templateId
        );
        
        // Sort by date, most recent first
        matchingWorkouts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Descending order
        });
        
        return matchingWorkouts;
    };
    
    /**
     * Check for and restore an active workout if one exists
     */
    const checkForActiveWorkout = () => {
        // Retrieve any saved active workout
        const savedWorkoutState = DataManager.getActiveWorkout();
        
        if (!savedWorkoutState) {
            return; // No active workout to restore
        }
        
        // Check if the saved workout is still valid (not too old)
        const savedTime = new Date(savedWorkoutState.timestamp);
        const currentTime = new Date();
        const timeDifference = currentTime - savedTime;
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        
        // If the workout is older than 24 hours, consider it abandoned
        if (hoursDifference > 24) {
            console.log('Found abandoned workout from', savedTime, '- clearing it');
            DataManager.clearActiveWorkout();
            return;
        }
        
        // Ask the user if they want to resume the workout
        const userProfile = DataManager.getUserProfile();
        const userName = userProfile && userProfile.name ? userProfile.name : 'Champion';
        
        UI.showConfirmation(
            'Resume Workout',
            `${userName}, you have an unfinished workout from ${formatTimeAgo(savedTime)}. Would you like to resume it?`,
            () => {
                // User chose to resume
                restoreWorkoutState(savedWorkoutState);
            },
            () => {
                // User chose not to resume
                DataManager.clearActiveWorkout();
            }
        );
    };
    
    /**
     * Format a time in a human-readable "time ago" format
     * @param {Date} date - The date to format
     * @returns {string} - Formatted time ago string
     */
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffMinutes < 1) {
            return 'just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            // Format as date and time for older workouts
            return date.toLocaleString();
        }
    };
    
    /**
     * Restore a saved workout state
     * @param {Object} savedWorkoutState - The saved workout state to restore
     */
    const restoreWorkoutState = (savedWorkoutState) => {
        console.log('Restoring workout state:', savedWorkoutState);
        
        try {
            // Restore the workout object
            activeWorkout = savedWorkoutState.workout;
            
            // Get template data if available
            const templateId = activeWorkout.templateId;
            const templates = DataManager.getTemplates();
            activeTemplate = templates.find(t => t.id === templateId) || null;
            
            // Restore workout state
            const state = savedWorkoutState.state;
            currentExerciseIndex = state.currentExerciseIndex || 0;
            currentSetIndex = state.currentSetIndex || 0;
            completedExercises = state.completedExercises || 0;
            
            // Restore timer if needed
            if (state.restTimer > 0) {
                restTimer = state.restTimer;
            }
            
            // Restore start time (calculate actual duration)
            workoutStartTime = new Date(savedWorkoutState.timestamp);
            
            // Open active template modal
            const modalOpened = UI.openModal('active-template-modal');
            
            if (!modalOpened) {
                console.error('Failed to open active template modal when restoring workout');
                UI.showToast('Error restoring workout', 'error');
                return;
            }
            
            // Set the template name in the modal if available
            if (activeTemplate) {
                const templateName = document.getElementById('active-template-name');
                if (templateName) {
                    templateName.textContent = activeTemplate.name;
                }
            }
            
            // Check if rest timer is active
            if (state.restTimer > 0 && state.inRestPeriod) {
                // Calculate elapsed time if timestamp exists
                let adjustedRestTime = state.restTimer;
                
                if (state.timerTimestamp) {
                    const savedTime = new Date(state.timerTimestamp);
                    const currentTime = new Date();
                    const elapsedSeconds = Math.floor((currentTime - savedTime) / 1000);
                    console.log(`Time passed since timer was saved: ${elapsedSeconds} seconds`);
                    
                    // Adjust timer based on elapsed time
                    adjustedRestTime = Math.max(0, state.restTimer - elapsedSeconds);
                    console.log(`Adjusted rest timer: ${adjustedRestTime} seconds`);
                    
                    // If the timer would have ended while away, play the sound
                    if (adjustedRestTime <= 0 && state.restTimer > 0) {
                        try {
                            if (typeof TimerSound !== 'undefined' && TimerSound.play) {
                                TimerSound.play();
                            }
                        } catch (e) {
                            console.error('Error playing timer sound:', e);
                        }
                    }
                }
                
                if (adjustedRestTime > 0) {
                    // Resume rest timer with adjusted time
                    startRestTimer(adjustedRestTime);
                } else {
                    // Timer would have completed while away, move to next exercise
                    updateWorkoutProgress();
                    renderActiveExercise();
                }
            } else {
                // Update UI
                updateWorkoutProgress();
                renderActiveExercise();
            }
            
            UI.showToast('Workout restored successfully!', 'success');
        } catch (error) {
            console.error('Error restoring workout:', error);
            UI.showToast('Error restoring workout', 'error');
            
            // Clear the active workout if restoration failed
            DataManager.clearActiveWorkout();
        }
    };
    
    /**
     * Save the current workout state
     */
    const saveWorkoutState = () => {
        if (!activeWorkout) return;
        
        // Get the current timestamp for timer calculations
        const currentTime = new Date().toISOString();
        
        const workoutState = {
            currentExerciseIndex,
            currentSetIndex,
            completedExercises,
            restTimer,
            inRestPeriod: document.getElementById('rest-timer').classList.contains('hidden') === false,
            timerTimestamp: currentTime // Save the current time for continuing the timer in background
        };
        
        DataManager.saveActiveWorkout(activeWorkout, workoutState);
        console.log('Workout state saved');
    };
    
    // Public API
    return {
        initialize,
        startTemplateWorkout
    };
})();
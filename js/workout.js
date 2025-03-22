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
    };
    
    /**
     * Setup all event listeners for workout functionality
     */
    const setupEventListeners = () => {
        // Active workout form
        try {
            const setForm = document.getElementById('set-form');
            if (setForm) {
                setForm.addEventListener('submit', completeSet);
                console.log('Set form submit listener added');
            } else {
                console.error('Set form element not found during initialization');
            }
        } catch (error) {
            console.error('Error setting up set form listener:', error);
        }
        
        // Rest timer skip button
        document.getElementById('skip-rest').addEventListener('click', skipRest);
        
        // Cancel workout button
        document.getElementById('cancel-active-workout').addEventListener('click', promptCancelWorkout);
        
        // Finish workout button
        document.getElementById('finish-workout').addEventListener('click', finishWorkout);
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
            // Set the set number separately from the target reps
            elements.currentSetNumber.textContent = `Set ${currentSetIndex + 1} - `;
            
            // Double-check that targetReps element exists and is accessible
            if (elements.targetReps) {
                elements.targetReps.textContent = currentSet.targetReps;
            } else {
                console.error('targetReps element not found or not accessible');
                
                // Try to find it again directly
                const targetRepsElement = document.getElementById('target-reps');
                if (targetRepsElement) {
                    targetRepsElement.textContent = currentSet.targetReps;
                } else {
                    // Last resort - update the container text directly
                    const container = document.getElementById('target-reps-container');
                    if (container) {
                        container.textContent = `${currentSet.targetReps} reps`;
                    }
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
        
        // If there's a previous set, use its weight as default
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
        document.getElementById('rest-timer').classList.remove('hidden');
        document.getElementById('timer-display').textContent = UI.formatTime(restTimer);
        
        // Start timer interval
        timerInterval = setInterval(() => {
            restTimer--;
            
            if (restTimer <= 0) {
                // Timer complete
                clearInterval(timerInterval);
                renderActiveExercise();
            } else {
                // Update timer display
                document.getElementById('timer-display').textContent = UI.formatTime(restTimer);
            }
        }, 1000);
    };
    
    /**
     * Skip the rest period
     */
    const skipRest = () => {
        clearInterval(timerInterval);
        renderActiveExercise();
    };
    
    /**
     * Show workout complete screen
     */
    const showWorkoutComplete = () => {
        // Hide exercise UI, show completion
        document.getElementById('active-exercise-container').classList.add('hidden');
        document.getElementById('workout-complete').classList.remove('hidden');
    };
    
    /**
     * Prompt to cancel the current workout
     */
    const promptCancelWorkout = () => {
        UI.showConfirmation(
            'Cancel Workout',
            'Are you sure you want to cancel this workout? Your progress will be lost.',
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
            UI.showToast('Workout saved successfully!', 'success');
            
            // Close modal
            UI.closeModal(document.getElementById('active-template-modal'));
            
            // Reset state
            activeWorkout = null;
            activeTemplate = null;
            
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
    
    // Public API
    return {
        initialize,
        startTemplateWorkout
    };
})();
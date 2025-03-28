/**
 * LiftMate - Exercises Module
 * Handles exercise creation, editing, and management
 */

const ExerciseManager = (() => {
    // Module state
    let currentExercise = null;
    let isEditMode = false;
    let currentFilter = 'all';
    
    /**
     * Initialize exercise manager functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering of exercises
        renderExercisesList();
    };
    
    /**
     * Setup all event listeners for exercise functionality
     */
    const setupEventListeners = () => {
        // Add exercise button
        document.getElementById('add-exercise').addEventListener('click', openExerciseForm);
        
        // Exercise form handling
        document.getElementById('exercise-form').addEventListener('submit', saveExerciseForm);
        document.getElementById('cancel-exercise').addEventListener('click', cancelExerciseForm);
        
        // Exercise detail actions
        document.getElementById('edit-exercise').addEventListener('click', editCurrentExercise);
        document.getElementById('delete-exercise').addEventListener('click', deleteCurrentExercise);
        document.getElementById('back-to-exercise-list').addEventListener('click', hideExerciseDetails);
        
        // Exercise search and filtering
        document.getElementById('exercise-search').addEventListener('input', filterExercisesBySearch);
        setupMuscleFilters();
    };
    
    /**
     * Setup muscle filter buttons
     */
    const setupMuscleFilters = () => {
        const filterButtons = document.querySelectorAll('.muscle-filter');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const muscle = button.getAttribute('data-muscle');
                
                // Update active filter
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Set current filter and apply it
                currentFilter = muscle;
                applyExerciseFilters();
            });
        });
    };
    
    /**
     * Render the list of exercises
     */
    const renderExercisesList = () => {
        const exercises = DataManager.getExercises();
        const exercisesList = document.getElementById('exercises-list');
        
        // Sort exercises alphabetically
        exercises.sort((a, b) => a.name.localeCompare(b.name));
        
        // Clear existing exercises
        exercisesList.innerHTML = '';
        
        // Show message if no exercises
        if (exercises.length === 0) {
            exercisesList.innerHTML = `
                <div class="empty-state">
                    <p>No exercises yet. Add your first exercise!</p>
                </div>
            `;
            return;
        }
        
        exercises.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'exercise-card';
            exerciseCard.setAttribute('data-exercise-id', exercise.id);
            exerciseCard.setAttribute('data-muscles', exercise.muscles.join(',').toLowerCase());
            
            exerciseCard.innerHTML = `
                <h3>${exercise.name}</h3>
                <div class="muscle-tags">
                    ${exercise.muscles.map(muscle => `<span class="muscle-tag">${muscle}</span>`).join('')}
                </div>
            `;
            
            exercisesList.appendChild(exerciseCard);
            
            // Add click event to show exercise details
            exerciseCard.addEventListener('click', () => {
                showExerciseDetails(exercise);
            });
        });
    };
    
    /**
     * Open the exercise form for adding a new exercise
     */
    const openExerciseForm = () => {
        // Reset state
        currentExercise = null;
        isEditMode = false;
        
        // Set modal title
        document.querySelector('#exercise-modal .modal-header h2').textContent = 'Add New Exercise';
        
        // Clear form inputs
        document.getElementById('exercise-name').value = '';
        document.querySelectorAll('.muscle-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Open modal
        UI.openModal('exercise-modal');
    };
    
    /**
     * Save exercise from form data
     * @param {Event} e - Form submit event
     */
    const saveExerciseForm = (e) => {
        e.preventDefault();
        
        const exerciseName = document.getElementById('exercise-name').value.trim();
        
        // Validate exercise name
        if (!exerciseName) {
            UI.showToast('Please enter an exercise name', 'error');
            return;
        }
        
        // Get selected muscles
        const selectedMuscles = [];
        document.querySelectorAll('.muscle-checkbox input:checked').forEach(checkbox => {
            selectedMuscles.push(checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1));
        });
        
        // Validate muscles
        if (selectedMuscles.length === 0) {
            UI.showToast('Please select at least one muscle group', 'error');
            return;
        }
        
        // Build exercise object
        const exercise = {
            id: isEditMode ? currentExercise.id : null,
            name: exerciseName,
            muscles: selectedMuscles
        };
        
        // Save exercise
        const savedExercise = DataManager.saveExercise(exercise);
        
        if (savedExercise) {
            UI.showToast(isEditMode ? 'Exercise updated successfully' : 'Exercise added successfully', 'success');
            UI.closeModal(document.getElementById('exercise-modal'));
            renderExercisesList();
            
            // If in edit mode, update the detail view
            if (isEditMode) {
                showExerciseDetails(savedExercise);
            }
        } else {
            UI.showToast('Failed to save exercise', 'error');
        }
    };
    
    /**
     * Cancel exercise form and close modal
     */
    const cancelExerciseForm = () => {
        UI.closeModal(document.getElementById('exercise-modal'));
    };
    
    /**
     * Show exercise details in the detail modal
     * @param {Object} exercise - Exercise object to display
     */
    const showExerciseDetails = (exercise) => {
        currentExercise = exercise;
        
        // Set exercise name
        document.getElementById('detail-exercise-name').textContent = exercise.name;
        
        // Render muscle tags
        const musclesContainer = document.getElementById('detail-muscles');
        musclesContainer.innerHTML = '';
        
        exercise.muscles.forEach(muscle => {
            const muscleTag = document.createElement('span');
            muscleTag.className = 'muscle-tag';
            muscleTag.textContent = muscle;
            musclesContainer.appendChild(muscleTag);
        });
        
        // Render personal records
        const records = DataManager.getPersonalRecords();
        const exerciseRecords = records[exercise.id] || { maxWeight: 0, maxReps: 0, maxVolume: 0 };
        const recordsContainer = document.getElementById('exercise-records');
        
        recordsContainer.innerHTML = `
            <div class="record-item">
                <div class="record-label">Max Weight:</div>
                <div class="record-value">${exerciseRecords.maxWeight} lbs</div>
            </div>
            <div class="record-item">
                <div class="record-label">Max Reps:</div>
                <div class="record-value">${exerciseRecords.maxReps}</div>
            </div>
            <div class="record-item">
                <div class="record-label">Max Volume (Single Set):</div>
                <div class="record-value">${exerciseRecords.maxVolume} lbs</div>
            </div>
        `;
        
        // Open detail modal
        UI.openModal('exercise-detail-modal');
    };
    
    /**
     * Hide exercise details and close modal
     */
    const hideExerciseDetails = () => {
        UI.closeModal(document.getElementById('exercise-detail-modal'));
    };
    
    /**
     * Open the edit form for the current exercise
     */
    const editCurrentExercise = () => {
        if (!currentExercise) {
            return;
        }
        
        isEditMode = true;
        
        // Set modal title
        document.querySelector('#exercise-modal .modal-header h2').textContent = 'Edit Exercise';
        
        // Fill form with exercise data
        document.getElementById('exercise-name').value = currentExercise.name;
        
        // Check the appropriate muscle checkboxes
        document.querySelectorAll('.muscle-checkbox input').forEach(checkbox => {
            checkbox.checked = currentExercise.muscles.includes(
                checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1)
            );
        });
        
        // Close detail modal and open edit modal
        UI.closeModal(document.getElementById('exercise-detail-modal'));
        UI.openModal('exercise-modal');
    };
    
    /**
     * Delete the current exercise after confirmation
     */
    const deleteCurrentExercise = () => {
        if (!currentExercise) {
            return;
        }
        
        UI.showConfirmation(
            'Delete Exercise',
            'Are you sure you want to delete this exercise? This action cannot be undone.',
            () => {
                const success = DataManager.deleteExercise(currentExercise.id);
                
                if (success) {
                    UI.showToast('Exercise deleted successfully', 'success');
                    UI.closeModal(document.getElementById('exercise-detail-modal'));
                    renderExercisesList();
                } else {
                    UI.showToast('Failed to delete exercise', 'error');
                }
            }
        );
    };
    
    /**
     * Filter exercises by search term
     */
    const filterExercisesBySearch = () => {
        applyExerciseFilters();
    };
    
    /**
     * Apply all filters to the exercise list
     */
    const applyExerciseFilters = () => {
        const searchTerm = document.getElementById('exercise-search').value.toLowerCase();
        const exercises = document.querySelectorAll('#exercises-list .exercise-card');
        
        exercises.forEach(exercise => {
            const name = exercise.querySelector('h3').textContent.toLowerCase();
            const muscles = exercise.getAttribute('data-muscles').toLowerCase();
            
            let matchesMuscle = currentFilter === 'all' || muscles.includes(currentFilter);
            let matchesSearch = name.includes(searchTerm);
            
            if (matchesMuscle && matchesSearch) {
                exercise.style.display = '';
            } else {
                exercise.style.display = 'none';
            }
        });
    };
    
    /**
     * Get an exercise by ID
     * @param {string} exerciseId - ID of the exercise to get
     * @returns {Object|null} - Exercise object or null if not found
     */
    const getExerciseById = (exerciseId) => {
        const exercises = DataManager.getExercises();
        return exercises.find(exercise => exercise.id === exerciseId) || null;
    };
    
    // Public API
    return {
        initialize,
        renderExercisesList,
        getExerciseById
    };
})();
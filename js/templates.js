/**
 * LiftMate - Templates Module
 * Handles workout template creation, editing, and management
 */

const TemplateManager = (() => {
    // Module state
    let currentTemplate = null;
    let isEditMode = false;
    let selectedExercise = null;
    let exerciseSets = [];
    
    /**
     * Initialize template manager functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering of templates
        renderTemplatesList();
    };
    
    /**
     * Setup all event listeners for template functionality
     */
    const setupEventListeners = () => {
        // Template creation and selection
        document.getElementById('create-template').addEventListener('click', openTemplateCreator);
        document.getElementById('use-template').addEventListener('click', openTemplateSelector);
        
        // Template form handling
        document.getElementById('template-form').addEventListener('submit', saveTemplateForm);
        document.getElementById('cancel-template').addEventListener('click', cancelTemplateForm);
        
        // Add exercise to template
        document.getElementById('add-template-exercise').addEventListener('click', openAddExerciseModal);
        
        // Exercise selection and management
        document.getElementById('template-exercise-search').addEventListener('input', filterExerciseList);
        document.getElementById('back-to-exercises').addEventListener('click', hideExerciseDetails);
        document.getElementById('add-exercise-to-template').addEventListener('click', addExerciseToTemplate);
        
        // Set management
        document.getElementById('add-template-set').addEventListener('click', addSet);
    };
    
    /**
     * Render the list of templates on the main page
     */
    const renderTemplatesList = () => {
        const templates = DataManager.getTemplates();
        const templatesList = document.getElementById('templates-list');
        
        // Sort templates by last used date (most recent first)
        templates.sort((a, b) => {
            if (!a.lastUsed) return 1;
            if (!b.lastUsed) return -1;
            return new Date(b.lastUsed) - new Date(a.lastUsed);
        });
        
        // Clear existing templates
        templatesList.innerHTML = '';
        
        // Show message if no templates
        if (templates.length === 0) {
            templatesList.innerHTML = `
                <div class="empty-state">
                    <p>No templates yet. Create your first workout template!</p>
                </div>
            `;
            return;
        }
        
        // Show up to 3 most recently used templates
        const displayTemplates = templates.slice(0, 3);
        
        displayTemplates.forEach(template => {
            const lastUsedFormatted = template.lastUsed ? UI.formatDate(template.lastUsed) : 'Never used';
            const totalSets = template.exercises.reduce((total, ex) => total + ex.sets.length, 0);
            
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.innerHTML = `
                <div class="template-card-header">
                    <h3>${template.name}</h3>
                    <div class="template-actions">
                        <button class="icon-button edit-template" data-template-id="${template.id}">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="icon-button delete-template" data-template-id="${template.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="template-card-body">
                    <div class="template-info">
                        <p><i class="fas fa-clock"></i> Last used: ${lastUsedFormatted}</p>
                        <p><i class="fas fa-dumbbell"></i> ${template.exercises.length} exercises, ${totalSets} sets</p>
                    </div>
                    <button class="button primary full-width start-template" data-template-id="${template.id}">
                        <i class="fas fa-play"></i> Start Workout
                    </button>
                </div>
            `;
            
            templatesList.appendChild(templateCard);
        });
        
        // Add event listeners to template card buttons
        setupTemplateCardListeners();
    };
    
    /**
     * Render templates in the selector modal
     */
    const renderTemplateSelectorList = () => {
        const templates = DataManager.getTemplates();
        const selectorList = document.getElementById('template-selector-list');
        
        // Sort templates by last used date (most recent first)
        templates.sort((a, b) => {
            if (!a.lastUsed) return 1;
            if (!b.lastUsed) return -1;
            return new Date(b.lastUsed) - new Date(a.lastUsed);
        });
        
        // Clear existing templates
        selectorList.innerHTML = '';
        
        // Show message if no templates
        if (templates.length === 0) {
            selectorList.innerHTML = `
                <div class="empty-state">
                    <p>No templates yet. Create your first workout template!</p>
                </div>
            `;
            return;
        }
        
        templates.forEach(template => {
            const lastUsedFormatted = template.lastUsed ? UI.formatDate(template.lastUsed) : 'Never used';
            const totalSets = template.exercises.reduce((total, ex) => total + ex.sets.length, 0);
            
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.innerHTML = `
                <div class="template-card-header">
                    <h3>${template.name}</h3>
                    <div class="template-actions">
                        <button class="icon-button edit-template" data-template-id="${template.id}">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="icon-button delete-template" data-template-id="${template.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="template-card-body">
                    <div class="template-info">
                        <p><i class="fas fa-clock"></i> Last used: ${lastUsedFormatted}</p>
                        <p><i class="fas fa-dumbbell"></i> ${template.exercises.length} exercises, ${totalSets} sets</p>
                    </div>
                    <button class="button primary full-width start-template" data-template-id="${template.id}">
                        <i class="fas fa-play"></i> Start Workout
                    </button>
                </div>
            `;
            
            selectorList.appendChild(templateCard);
        });
        
        // Add event listeners to template card buttons
        setupTemplateCardListeners();
    };
    
    /**
     * Setup event listeners for template card buttons
     */
    const setupTemplateCardListeners = () => {
        // Edit template buttons
        document.querySelectorAll('.edit-template').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = button.getAttribute('data-template-id');
                editTemplate(templateId);
            });
        });
        
        // Delete template buttons
        document.querySelectorAll('.delete-template').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = button.getAttribute('data-template-id');
                deleteTemplate(templateId);
            });
        });
        
        // Start template buttons
        document.querySelectorAll('.start-template').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const templateId = button.getAttribute('data-template-id');
                console.log('Start template button clicked with ID:', templateId);
                startWorkoutFromTemplate(templateId);
            });
        });
    };
    
    /**
     * Open the template creator modal
     */
    const openTemplateCreator = () => {
        // Reset state
        currentTemplate = null;
        isEditMode = false;
        
        // Set modal title
        document.getElementById('template-creator-title').textContent = 'Create New Template';
        
        // Clear form inputs
        document.getElementById('template-name').value = '';
        document.getElementById('template-exercises-list').innerHTML = '';
        
        // Open modal
        UI.openModal('template-creator-modal');
    };
    
    /**
     * Open template selector modal
     */
    const openTemplateSelector = () => {
        renderTemplateSelectorList();
        UI.openModal('template-selector-modal');
    };
    
    /**
     * Edit an existing template
     * @param {string} templateId - ID of template to edit
     */
    const editTemplate = (templateId) => {
        const templates = DataManager.getTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
            UI.showToast('Template not found', 'error');
            return;
        }
        
        // Set edit mode
        currentTemplate = template;
        isEditMode = true;
        
        // Set modal title
        document.getElementById('template-creator-title').textContent = 'Edit Template';
        
        // Fill form with template data
        document.getElementById('template-name').value = template.name;
        
        // Render exercises
        const exercisesList = document.getElementById('template-exercises-list');
        exercisesList.innerHTML = '';
        
        template.exercises.forEach(exercise => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.setAttribute('data-exercise-id', exercise.exerciseId);
            
            // Build sets HTML
            const setsHTML = exercise.sets.map((set, index) => `
                <div class="exercise-item-set">
                    Set ${index + 1}: ${set.targetReps} reps, ${set.restTime} sec rest
                </div>
            `).join('');
            
            exerciseItem.innerHTML = `
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="exercise-item-header">
                    <h4>${exercise.exerciseName}</h4>
                    <button type="button" class="remove-exercise-button" data-exercise-id="${exercise.exerciseId}">×</button>
                </div>
                <div class="exercise-item-sets">
                    ${setsHTML}
                </div>
            `;
            
            exercisesList.appendChild(exerciseItem);
        });
        
        // Add event listeners to remove buttons
        setupRemoveExerciseListeners();
        
        // Setup drag and drop for exercise reordering
        setupDragAndDrop();
        
        // Close selector modal if open
        const selectorModal = document.getElementById('template-selector-modal');
        if (selectorModal.classList.contains('active')) {
            UI.closeModal(selectorModal);
        }
        
        // Open template creator modal
        UI.openModal('template-creator-modal');
    };
    
    /**
     * Delete a template after confirmation
     * @param {string} templateId - ID of template to delete
     */
    const deleteTemplate = (templateId) => {
        UI.showConfirmation(
            'Delete Template',
            'Are you sure you want to delete this template? This action cannot be undone.',
            () => {
                const success = DataManager.deleteTemplate(templateId);
                
                if (success) {
                    UI.showToast('Template deleted successfully', 'success');
                    renderTemplatesList();
                    renderTemplateSelectorList();
                } else {
                    UI.showToast('Failed to delete template', 'error');
                }
            }
        );
    };
    
    /**
     * Save template from form data
     * @param {Event} e - Form submit event
     */
    const saveTemplateForm = (e) => {
        e.preventDefault();
        
        const templateName = document.getElementById('template-name').value.trim();
        
        // Validate template name
        if (!templateName) {
            UI.showToast('Please enter a template name', 'error');
            return;
        }
        
        // Get exercises from the template
        const exerciseItems = document.querySelectorAll('#template-exercises-list .exercise-item');
        
        // Validate exercises
        if (exerciseItems.length === 0) {
            UI.showToast('Please add at least one exercise', 'error');
            return;
        }
        
        // Build template object
        const template = {
            id: isEditMode ? currentTemplate.id : null,
            name: templateName,
            lastUsed: isEditMode ? currentTemplate.lastUsed : null,
            exercises: []
        };
        
        // Add exercises to template
        exerciseItems.forEach(item => {
            const exerciseId = item.getAttribute('data-exercise-id');
            const exerciseName = item.querySelector('h4').textContent;
            
            // Check if we have sets data stored in the element
            const setsData = item.getAttribute('data-sets');
            let sets;
            
            if (setsData) {
                // Use the sets from data attribute
                try {
                    sets = JSON.parse(setsData);
                } catch (e) {
                    // Fallback to default if parsing fails
                    sets = [{ targetReps: 10, restTime: 60 }];
                }
            } else {
                // Get sets from the existing template (when editing) or create default set
                const existingExercise = isEditMode ? 
                    currentTemplate.exercises.find(ex => ex.exerciseId === exerciseId) : null;
                
                sets = existingExercise ? existingExercise.sets : [{ targetReps: 10, restTime: 60 }];
            }
            
            template.exercises.push({
                exerciseId,
                exerciseName,
                sets: sets
            });
        });
        
        // Save template
        const savedTemplate = DataManager.saveTemplate(template);
        
        if (savedTemplate) {
            UI.showToast(isEditMode ? 'Template updated successfully' : 'Template created successfully', 'success');
            UI.closeModal(document.getElementById('template-creator-modal'));
            renderTemplatesList();
        } else {
            UI.showToast('Failed to save template', 'error');
        }
    };
    
    /**
     * Cancel template form and close modal
     */
    const cancelTemplateForm = () => {
        UI.closeModal(document.getElementById('template-creator-modal'));
    };
    
    /**
     * Setup remove exercise button listeners
     */
    const setupRemoveExerciseListeners = () => {
        document.querySelectorAll('.remove-exercise-button').forEach(button => {
            button.addEventListener('click', () => {
                const exerciseItem = button.closest('.exercise-item');
                exerciseItem.remove();
            });
        });
    };
    
    /**
     * Open the add exercise to template modal
     */
    const openAddExerciseModal = () => {
        // Reset state
        selectedExercise = null;
        exerciseSets = [{ targetReps: "10", restTime: 60 }];
        
        // Load exercises
        const exercises = DataManager.getExercises();
        const exerciseList = document.getElementById('template-exercise-list');
        
        exerciseList.innerHTML = '';
        
        exercises.forEach(exercise => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.setAttribute('data-exercise-id', exercise.id);
            exerciseItem.setAttribute('data-exercise-name', exercise.name);
            
            exerciseItem.innerHTML = `
                <div class="exercise-item-header">
                    <h4>${exercise.name}</h4>
                </div>
                <div class="muscle-tags">
                    ${exercise.muscles.map(muscle => `<span class="muscle-tag">${muscle}</span>`).join('')}
                </div>
            `;
            
            exerciseList.appendChild(exerciseItem);
            
            // Add click event
            exerciseItem.addEventListener('click', () => {
                selectExercise(exercise);
            });
        });
        
        // Show exercise list, hide details
        document.getElementById('template-exercise-list').classList.remove('hidden');
        document.getElementById('template-exercise-details').classList.add('hidden');
        
        // Open modal
        UI.openModal('add-template-exercise-modal');
    };
    
    /**
     * Filter exercise list based on search input
     */
    const filterExerciseList = () => {
        const searchTerm = document.getElementById('template-exercise-search').value.toLowerCase();
        const exercises = document.querySelectorAll('#template-exercise-list .exercise-item');
        
        exercises.forEach(exercise => {
            const name = exercise.getAttribute('data-exercise-name').toLowerCase();
            if (name.includes(searchTerm)) {
                exercise.style.display = '';
            } else {
                exercise.style.display = 'none';
            }
        });
    };
    
    /**
     * Select an exercise and show details
     * @param {Object} exercise - Exercise object
     */
    const selectExercise = (exercise) => {
        selectedExercise = exercise;
        
        // Hide exercise list and search bar, show details
        document.getElementById('template-exercise-list').classList.add('hidden');
        document.getElementById('template-exercise-search').parentElement.classList.add('hidden');
        document.getElementById('template-exercise-details').classList.remove('hidden');
        
        // Set exercise name
        document.getElementById('template-exercise-name').textContent = exercise.name;
        
        // Reset sets to default
        exerciseSets = [{ targetReps: "10", restTime: 60 }];
        renderSets();
    };
    
    /**
     * Hide exercise details and show exercise list with search bar
     */
    const hideExerciseDetails = () => {
        document.getElementById('template-exercise-list').classList.remove('hidden');
        document.getElementById('template-exercise-search').parentElement.classList.remove('hidden');
        document.getElementById('template-exercise-details').classList.add('hidden');
    };
    
    /**
     * Add exercise to template
     */
    const addExerciseToTemplate = () => {
        if (!selectedExercise) {
            return;
        }
        
        // Collect set data
        const setInputs = document.querySelectorAll('#template-sets-list .set-item');
        exerciseSets = Array.from(setInputs).map((setItem, index) => {
            const repsInput = setItem.querySelector(`.set-reps`);
            const restInput = setItem.querySelector(`.set-rest`);
            
            return {
                targetReps: repsInput.value || "10",
                restTime: parseInt(restInput.value) || 60
            };
        });
        
        // Create exercise item
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.setAttribute('data-exercise-id', selectedExercise.id);
        
        // Store the sets data as a data attribute for retrieving later when saving the template
        exerciseItem.setAttribute('data-sets', JSON.stringify(exerciseSets));
        
        // Build sets HTML
        const setsHTML = exerciseSets.map((set, index) => `
            <div class="exercise-item-set">
                Set ${index + 1}: ${set.targetReps} reps, ${set.restTime} sec rest
            </div>
        `).join('');
        
        exerciseItem.innerHTML = `
            <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="exercise-item-header">
                <h4>${selectedExercise.name}</h4>
                <button type="button" class="remove-exercise-button" data-exercise-id="${selectedExercise.id}">×</button>
            </div>
            <div class="exercise-item-sets">
                ${setsHTML}
            </div>
        `;
        
        // Add to template exercises list
        document.getElementById('template-exercises-list').appendChild(exerciseItem);
        
        // Setup remove exercise listener
        exerciseItem.querySelector('.remove-exercise-button').addEventListener('click', () => {
            exerciseItem.remove();
        });
        
        // Setup drag and drop for exercise reordering
        setupDragAndDrop();
        
        // Close modal
        UI.closeModal(document.getElementById('add-template-exercise-modal'));
    };
    
    /**
     * Render sets for the selected exercise
     */
    const renderSets = () => {
        const setsList = document.getElementById('template-sets-list');
        setsList.innerHTML = '';
        
        exerciseSets.forEach((set, index) => {
            const setItem = document.createElement('div');
            setItem.className = 'set-item';
            
            const removeButtonClass = exerciseSets.length > 1 ? '' : 'hidden';
            
            setItem.innerHTML = `
                <div class="set-header">
                    <span>Set ${index + 1}</span>
                    <button type="button" class="remove-set-button ${removeButtonClass}">×</button>
                </div>
                <div class="set-inputs">
                    <div class="form-group">
                        <label for="set-${index + 1}-reps">Target Reps</label>
                        <input type="text" id="set-${index + 1}-reps" class="set-reps" value="${set.targetReps}">
                    </div>
                    <div class="form-group">
                        <label for="set-${index + 1}-rest">Rest Time (seconds)</label>
                        <input type="number" id="set-${index + 1}-rest" class="set-rest" min="0" value="${set.restTime}">
                    </div>
                </div>
            `;
            
            setsList.appendChild(setItem);
            
            // Setup remove set button
            const removeButton = setItem.querySelector('.remove-set-button');
            removeButton.addEventListener('click', () => {
                exerciseSets.splice(index, 1);
                renderSets();
            });
        });
    };
    
    /**
     * Add a new set to the exercise
     */
    const addSet = () => {
        // Collect current set values before adding a new set
        const setInputs = document.querySelectorAll('#template-sets-list .set-item');
        const currentSets = Array.from(setInputs).map((setItem, index) => {
            const repsInput = setItem.querySelector(`.set-reps`);
            const restInput = setItem.querySelector(`.set-rest`);
            
            return {
                targetReps: repsInput.value || "10",
                restTime: parseInt(restInput.value) || 60
            };
        });
        
        // Update exerciseSets with current values
        exerciseSets = currentSets;
        
        // Add new set
        exerciseSets.push({ targetReps: "10", restTime: 60 });
        renderSets();
    };
    
    /**
     * Setup drag and drop functionality for exercises in template creator
     */
    const setupDragAndDrop = () => {
        const exerciseList = document.getElementById('template-exercises-list');
        const exercises = exerciseList.querySelectorAll('.exercise-item');
        
        // If no exercises or only one exercise, nothing to reorder
        if (exercises.length <= 1) {
            return;
        }
        
        let draggedItem = null;
        let placeholder = null;
        let startY = 0;
        let currentY = 0;
        let initialIndex = 0;
        let isDragging = false;
        
        // Helper function to get item index
        const getItemIndex = (item) => {
            const items = Array.from(exerciseList.querySelectorAll('.exercise-item'));
            return items.indexOf(item);
        };
        
        // Add event listeners to each exercise item
        exercises.forEach(exercise => {
            // Set draggable on the item for desktop
            exercise.setAttribute('draggable', 'true');
            
            // Handle drag start for desktop
            exercise.addEventListener('dragstart', (e) => {
                draggedItem = exercise;
                exercise.classList.add('dragging');
                
                // Create placeholder for drag feedback
                placeholder = document.createElement('div');
                placeholder.className = 'drag-feedback';
                
                // Set drag data for desktop
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', exercise.innerHTML);
                }
                
                // Store initial index
                initialIndex = getItemIndex(exercise);
            });
            
            // Handle touch events for mobile
            const dragHandle = exercise.querySelector('.drag-handle');
            if (dragHandle) {
                // Touch start - initialize touch dragging
                dragHandle.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent scroll
                    isDragging = true;
                    draggedItem = exercise;
                    exercise.classList.add('dragging');
                    
                    // Store initial touch position
                    startY = e.touches[0].clientY;
                    currentY = startY;
                    
                    // Create placeholder
                    placeholder = document.createElement('div');
                    placeholder.className = 'drag-feedback';
                    
                    // Store original position
                    initialIndex = getItemIndex(exercise);
                    
                    // Create a clone that follows the finger
                    const clone = exercise.cloneNode(true);
                    clone.id = 'dragging-clone';
                    clone.style.position = 'absolute';
                    clone.style.width = `${exercise.offsetWidth}px`;
                    clone.style.height = `${exercise.offsetHeight}px`;
                    clone.style.opacity = '0.7';
                    clone.style.zIndex = '1000';
                    clone.style.pointerEvents = 'none';
                    clone.style.top = `${e.touches[0].pageY - exercise.offsetHeight / 2}px`;
                    clone.style.left = `${exercise.offsetLeft}px`;
                    
                    document.body.appendChild(clone);
                    
                    // Make original semi-transparent
                    exercise.style.opacity = '0.3';
                }, { passive: false });
                
                // Global touch move event - handle drag movement
                document.addEventListener('touchmove', (e) => {
                    if (!isDragging || !draggedItem) return;
                    
                    e.preventDefault(); // Prevent scroll while dragging
                    
                    // Update clone position to follow finger
                    const clone = document.getElementById('dragging-clone');
                    if (clone) {
                        clone.style.top = `${e.touches[0].pageY - draggedItem.offsetHeight / 2}px`;
                    }
                    
                    // Determine which item we're hovering over
                    const touch = e.touches[0];
                    const touchY = touch.clientY;
                    currentY = touchY;
                    
                    // Find the element under the touch point
                    const elementsAtPoint = document.elementsFromPoint(touch.clientX, touchY);
                    let targetItem = null;
                    
                    // Find first exercise item in elements at point
                    for (const el of elementsAtPoint) {
                        if (el.classList.contains('exercise-item') && el !== draggedItem) {
                            targetItem = el;
                            break;
                        }
                    }
                    
                    // Position placeholder to show where item will be dropped
                    if (targetItem) {
                        const targetRect = targetItem.getBoundingClientRect();
                        
                        // Determine if placeholder should go before or after the target
                        if (touchY < targetRect.top + targetRect.height / 2) {
                            // Place before target
                            exerciseList.insertBefore(placeholder, targetItem);
                        } else {
                            // Place after target
                            if (targetItem.nextElementSibling) {
                                exerciseList.insertBefore(placeholder, targetItem.nextElementSibling);
                            } else {
                                exerciseList.appendChild(placeholder);
                            }
                        }
                        placeholder.classList.add('active');
                    } else {
                        // If not over any item, place at end
                        exerciseList.appendChild(placeholder);
                        placeholder.classList.add('active');
                    }
                }, { passive: false });
                
                // Touch end - finalize the drop
                document.addEventListener('touchend', (e) => {
                    if (!isDragging || !draggedItem) return;
                    
                    isDragging = false;
                    
                    // Remove the clone
                    const clone = document.getElementById('dragging-clone');
                    if (clone) {
                        clone.remove();
                    }
                    
                    // Reset original opacity
                    draggedItem.style.opacity = '';
                    draggedItem.classList.remove('dragging');
                    
                    // Move the dragged item to the placeholder position
                    if (placeholder && placeholder.parentNode) {
                        exerciseList.insertBefore(draggedItem, placeholder);
                        placeholder.remove();
                    }
                    
                    // Clean up
                    draggedItem = null;
                    document.querySelectorAll('.drag-feedback').forEach(el => el.remove());
                });
            }
            
            // Handle standard (desktop) drag and drop events
            exercise.addEventListener('dragend', () => {
                exercise.classList.remove('dragging');
                draggedItem = null;
                
                // Remove any placeholders
                document.querySelectorAll('.drag-feedback').forEach(el => el.remove());
            });
            
            exercise.addEventListener('dragover', (e) => {
                e.preventDefault();
                
                // Don't do anything if this is the dragged item
                if (exercise === draggedItem) {
                    return;
                }
                
                // Get position of mouse relative to the exercise item
                const rect = exercise.getBoundingClientRect();
                const mouseY = e.clientY - rect.top;
                
                // Determine if placeholder should be before or after the current item
                if (mouseY < rect.height / 2) {
                    // Insert placeholder before this item
                    exerciseList.insertBefore(placeholder, exercise);
                } else {
                    // Insert placeholder after this item
                    if (exercise.nextElementSibling) {
                        exerciseList.insertBefore(placeholder, exercise.nextElementSibling);
                    } else {
                        exerciseList.appendChild(placeholder);
                    }
                }
                
                // Make placeholder visible
                placeholder.classList.add('active');
            });
            
            exercise.addEventListener('drop', (e) => {
                e.preventDefault();
                
                // Don't do anything if this is the dragged item
                if (exercise === draggedItem || !draggedItem) {
                    return;
                }
                
                // Get position of mouse relative to the exercise item
                const rect = exercise.getBoundingClientRect();
                const mouseY = e.clientY - rect.top;
                
                // Determine if dragged item should be before or after the current item
                if (mouseY < rect.height / 2) {
                    // Insert before this item
                    exerciseList.insertBefore(draggedItem, exercise);
                } else {
                    // Insert after this item
                    if (exercise.nextElementSibling) {
                        exerciseList.insertBefore(draggedItem, exercise.nextElementSibling);
                    } else {
                        exerciseList.appendChild(draggedItem);
                    }
                }
                
                // Clean up
                if (placeholder && placeholder.parentNode) {
                    placeholder.parentNode.removeChild(placeholder);
                }
            });
        });
        
        // Handle drop in the empty area of the list
        exerciseList.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            if (!draggedItem) {
                return;
            }
            
            // Check if the mouse is over an exercise item
            const overItem = e.target.closest('.exercise-item');
            if (!overItem) {
                // If not over an item, append the placeholder to the end of the list
                exerciseList.appendChild(placeholder);
                placeholder.classList.add('active');
            }
        });
        
        exerciseList.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (!draggedItem) {
                return;
            }
            
            // Check if the mouse is over an exercise item
            const overItem = e.target.closest('.exercise-item');
            if (!overItem) {
                // If not over an item, append the dragged item to the end of the list
                exerciseList.appendChild(draggedItem);
            }
            
            // Clean up
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }
        });
    };
    
    /**
     * Start a workout based on a template
     * @param {string} templateId - ID of template to start
     */
    const startWorkoutFromTemplate = (templateId) => {
        try {
            console.log('Starting workout with template ID:', templateId);
            const templates = DataManager.getTemplates();
            const template = templates.find(t => t.id === templateId);
            
            if (!template) {
                UI.showToast('Template not found', 'error');
                return;
            }
            
            console.log('Template found:', template);
            
            // Update the template's last used date
            DataManager.updateTemplateLastUsed(templateId);
            
            // Close all modals first to ensure clean state
            UI.closeAllModals();
            
            // Small delay to ensure modals are closed before opening a new one
            setTimeout(() => {
                // Start the workout using the selected template
                WorkoutManager.startTemplateWorkout(template);
            }, 100);
        } catch (error) {
            console.error('Error starting workout:', error);
            UI.showToast('Failed to start workout', 'error');
        }
    };
    
    // Public API
    return {
        initialize,
        renderTemplatesList
    };
})();
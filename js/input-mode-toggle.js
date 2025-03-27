/**
 * LiftMate - Input Mode Toggle
 * Handles switching between text input and slider input modes for workouts
 */

const InputModeManager = (() => {
    // Module state
    let currentMode = 'text'; // 'text' or 'slider'
    
    // User preferences
    const getUserPreference = () => {
        return localStorage.getItem('input-mode-preference') || 'text';
    };
    
    const saveUserPreference = (mode) => {
        localStorage.setItem('input-mode-preference', mode);
    };
    
    // Initialize the module
    const initialize = () => {
        // Load user's preferred input mode
        currentMode = getUserPreference();
        
        // Add toggle button to the set form
        addToggleButton();
        
        // Initialize input mode based on saved preference
        setInputMode(currentMode);
        
        // Listen for events that require reinitializing inputs
        // (such as when a new set is displayed)
        document.addEventListener('setFormDisplayed', reinitializeInputs);
    };
    
    // Add toggle button to the set form
    const addToggleButton = () => {
        const currentSet = document.getElementById('current-set');
        if (!currentSet) return;
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'input-mode-toggle';
        toggleButton.id = 'input-mode-toggle';
        toggleButton.innerHTML = currentMode === 'text' ? 
            '<i class="fas fa-sliders-h"></i>' : 
            '<i class="fas fa-keyboard"></i>';
        toggleButton.setAttribute('title', currentMode === 'text' ? 
            'Switch to slider input' : 
            'Switch to text input');
            
        // Add click handler
        toggleButton.addEventListener('click', toggleInputMode);
        
        // Add to DOM
        currentSet.appendChild(toggleButton);
    };
    
    // Toggle between text and slider input modes
    const toggleInputMode = () => {
        const newMode = currentMode === 'text' ? 'slider' : 'text';
        setInputMode(newMode);
        saveUserPreference(newMode);
        
        // Update button icon
        const toggleButton = document.getElementById('input-mode-toggle');
        if (toggleButton) {
            toggleButton.innerHTML = newMode === 'text' ? 
                '<i class="fas fa-sliders-h"></i>' : 
                '<i class="fas fa-keyboard"></i>';
            toggleButton.setAttribute('title', newMode === 'text' ? 
                'Switch to slider input' : 
                'Switch to text input');
        }
    };
    
    // Set the input mode
    const setInputMode = (mode) => {
        currentMode = mode;
        
        // Get the form elements
        const weightInput = document.getElementById('weight-input');
        const repsInput = document.getElementById('reps-input');
        const weightContainer = weightInput ? weightInput.closest('.form-group') : null;
        const repsContainer = repsInput ? repsInput.closest('.form-group') : null;
        
        if (!weightContainer || !repsContainer) return;
        
        if (mode === 'text') {
            // Switch to text input mode
            convertToTextInput(weightContainer, repsContainer);
        } else {
            // Switch to slider input mode
            convertToSliderInput(weightContainer, repsContainer);
        }
    };
    
    // Convert inputs to text fields
    const convertToTextInput = (weightContainer, repsContainer) => {
        // Get current values if they exist
        const weightSlider = document.querySelector('.weight-slider');
        const repsSlider = document.querySelector('.reps-slider');
        
        const weightValue = weightSlider ? 
            parseFloat(weightSlider.value) : 
            document.getElementById('weight-input').value;
            
        const repsValue = repsSlider ? 
            parseInt(repsSlider.value) : 
            document.getElementById('reps-input').value;
        
        // Clear containers
        weightContainer.innerHTML = '';
        repsContainer.innerHTML = '';
        
        // Recreate weight input
        const weightLabel = document.createElement('label');
        weightLabel.setAttribute('for', 'weight-input');
        weightLabel.textContent = 'Weight (lbs)';
        
        const weightField = document.createElement('input');
        weightField.type = 'number';
        weightField.id = 'weight-input';
        weightField.min = '0';
        weightField.step = '2.5';
        weightField.required = true;
        weightField.value = weightValue;
        
        weightContainer.appendChild(weightLabel);
        weightContainer.appendChild(weightField);
        
        // Recreate reps input
        const repsLabel = document.createElement('label');
        repsLabel.setAttribute('for', 'reps-input');
        repsLabel.textContent = 'Reps Completed';
        
        const repsField = document.createElement('input');
        repsField.type = 'number';
        repsField.id = 'reps-input';
        repsField.min = '0';
        repsField.required = true;
        repsField.value = repsValue;
        
        repsContainer.appendChild(repsLabel);
        repsContainer.appendChild(repsField);
        
        // Set focus
        if (!weightField.value) {
            weightField.focus();
        } else {
            repsField.focus();
        }
    };
    
    // Convert inputs to sliders
    const convertToSliderInput = (weightContainer, repsContainer) => {
        // Get current values
        const weightInput = document.getElementById('weight-input');
        const repsInput = document.getElementById('reps-input');
        
        const weightValue = weightInput ? parseFloat(weightInput.value) || 0 : 0;
        const repsValue = repsInput ? parseInt(repsInput.value) || 0 : 0;
        
        // Previous values to determine max slider values
        let maxWeight = Math.max(weightValue + 50, 225); // Default max weight
        let maxReps = Math.max(repsValue + 10, 20); // Default max reps
        
        // Try to get previous workout data to set slider ranges
        try {
            const prevWorkoutWeight = parseFloat(document.getElementById('prev-workout-weight').textContent);
            const prevWorkoutReps = parseInt(document.getElementById('prev-workout-reps').textContent);
            
            if (!isNaN(prevWorkoutWeight) && prevWorkoutWeight > 0) {
                maxWeight = Math.max(maxWeight, prevWorkoutWeight * 1.5);
            }
            
            if (!isNaN(prevWorkoutReps) && prevWorkoutReps > 0) {
                maxReps = Math.max(maxReps, prevWorkoutReps * 1.5);
            }
        } catch (e) {
            console.log('No previous workout data to base slider ranges on');
        }
        
        // Round maxWeight to nearest 50
        maxWeight = Math.ceil(maxWeight / 50) * 50;
        
        // Clear containers
        weightContainer.innerHTML = '';
        repsContainer.innerHTML = '';
        
        // Create weight slider
        const weightSliderContainer = document.createElement('div');
        weightSliderContainer.className = 'slider-input-container';
        
        const weightLabel = document.createElement('label');
        weightLabel.setAttribute('for', 'weight-slider');
        weightLabel.textContent = 'Weight (lbs)';
        
        const weightSlider = document.createElement('input');
        weightSlider.type = 'range';
        weightSlider.className = 'slider-input weight-slider';
        weightSlider.id = 'weight-slider';
        weightSlider.min = '0';
        weightSlider.max = maxWeight.toString();
        weightSlider.step = '2.5';
        weightSlider.value = weightValue.toString();
        
        const weightValueDisplay = document.createElement('div');
        weightValueDisplay.className = 'slider-value';
        weightValueDisplay.textContent = weightValue.toString();
        
        // Hidden input for form submission
        const weightHiddenInput = document.createElement('input');
        weightHiddenInput.type = 'hidden';
        weightHiddenInput.id = 'weight-input';
        weightHiddenInput.value = weightValue.toString();
        
        weightSliderContainer.appendChild(weightLabel);
        weightSliderContainer.appendChild(weightSlider);
        weightSliderContainer.appendChild(weightValueDisplay);
        weightSliderContainer.appendChild(weightHiddenInput);
        
        // Update weight value display on slider change
        weightSlider.addEventListener('input', function() {
            const value = parseFloat(this.value);
            weightValueDisplay.textContent = value.toString();
            weightHiddenInput.value = value.toString();
        });
        
        // Create reps slider
        const repsSliderContainer = document.createElement('div');
        repsSliderContainer.className = 'slider-input-container';
        
        const repsLabel = document.createElement('label');
        repsLabel.setAttribute('for', 'reps-slider');
        repsLabel.textContent = 'Reps Completed';
        
        const repsSlider = document.createElement('input');
        repsSlider.type = 'range';
        repsSlider.className = 'slider-input reps-slider';
        repsSlider.id = 'reps-slider';
        repsSlider.min = '0';
        repsSlider.max = maxReps.toString();
        repsSlider.step = '1';
        repsSlider.value = repsValue.toString();
        
        const repsValueDisplay = document.createElement('div');
        repsValueDisplay.className = 'slider-value';
        repsValueDisplay.textContent = repsValue.toString();
        
        // Hidden input for form submission
        const repsHiddenInput = document.createElement('input');
        repsHiddenInput.type = 'hidden';
        repsHiddenInput.id = 'reps-input';
        repsHiddenInput.value = repsValue.toString();
        
        repsSliderContainer.appendChild(repsLabel);
        repsSliderContainer.appendChild(repsSlider);
        repsSliderContainer.appendChild(repsValueDisplay);
        repsSliderContainer.appendChild(repsHiddenInput);
        
        // Update reps value display on slider change
        repsSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            repsValueDisplay.textContent = value.toString();
            repsHiddenInput.value = value.toString();
        });
        
        // Add to DOM
        weightContainer.appendChild(weightSliderContainer);
        repsContainer.appendChild(repsSliderContainer);
    };
    
    // Reinitialize inputs whenever a new set is displayed
    const reinitializeInputs = () => {
        setInputMode(currentMode);
    };
    
    // Public API
    return {
        initialize
    };
})();
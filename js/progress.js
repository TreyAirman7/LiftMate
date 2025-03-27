/**
 * LiftMate - Progress Module
 * Handles progress tracking and visualization
 */

const ProgressManager = (() => {
    // Module state
    let progressChart = null;
    let selectedExerciseId = null;
    let selectedRepRange = 'all';
    
    /**
     * Initialize progress manager functionality
     */
    const initialize = () => {
        console.log('Initializing ProgressManager');
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering
        renderExerciseSelect();
        
        // Try to load a default exercise if one is available
        setTimeout(() => {
            tryLoadDefaultExercise();
        }, 300);
        
        // Make sure Weight Chart is rendered when this tab is activated
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                if (tabId === 'progress') {
                    console.log('Progress tab activated');
                    // Check if WeightManager exists before using it
                    if (typeof window.WeightManager !== 'undefined' && 
                        typeof window.WeightManager.renderWeightChart === 'function') {
                        console.log('Ensuring weight chart is rendered');
                        setTimeout(() => {
                            window.WeightManager.renderWeightChart();
                        }, 100);
                    }
                    
                    // Also try to load progress chart if not already displayed
                    setTimeout(() => {
                        tryLoadDefaultExercise();
                    }, 300);
                }
            });
        });
    };
    
    /**
     * Try to load a default exercise if one is available
     */
    const tryLoadDefaultExercise = () => {
        // Only proceed if no exercise is currently selected
        if (!selectedExerciseId) {
            const exerciseSelect = document.getElementById('exercise-select');
            // If there are options and none is selected, select the first one
            if (exerciseSelect && exerciseSelect.options.length > 1 && !exerciseSelect.value) {
                exerciseSelect.selectedIndex = 1; // Select first exercise (index 0 is the placeholder)
                handleExerciseChange(); // Trigger chart display
            }
        }
    };
    
    /**
     * Setup all event listeners for progress functionality
     */
    const setupEventListeners = () => {
        // Exercise and rep range selectors
        document.getElementById('exercise-select').addEventListener('change', handleExerciseChange);
        document.getElementById('rep-range-select').addEventListener('change', handleRepRangeChange);
    };
    
    /**
     * Populate exercise select dropdown
     */
    const renderExerciseSelect = () => {
        const exercises = DataManager.getExercises();
        const workouts = DataManager.getWorkouts();
        const select = document.getElementById('exercise-select');
        
        // Clear options except the default
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Only show exercises that have workout data
        const exercisesWithData = new Set();
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.sets.some(set => set.weight && set.reps)) {
                    exercisesWithData.add(exercise.exerciseId);
                }
            });
        });
        
        // Add options for exercises with data
        exercises
            .filter(ex => exercisesWithData.has(ex.id))
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.id;
                option.textContent = exercise.name;
                select.appendChild(option);
            });
        
        // Show message if no exercises have data
        if (exercisesWithData.size === 0) {
            const progressChartContainer = document.querySelector('.progress-chart-container');
            const canvas = document.getElementById('progress-chart');
            
            canvas.style.display = 'none';
            
            // Add message if not already present
            if (!progressChartContainer.querySelector('.empty-state')) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <p>No exercise data available yet. Complete some workouts to track your progress!</p>
                `;
                progressChartContainer.appendChild(emptyState);
            }
        } else {
            document.getElementById('progress-chart').style.display = '';
            const emptyState = document.querySelector('.progress-chart-container .empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    };
    
    /**
     * Handle exercise selection change
     */
    const handleExerciseChange = () => {
        const select = document.getElementById('exercise-select');
        selectedExerciseId = select.value;
        
        if (selectedExerciseId) {
            renderProgressChart();
        } else {
            clearProgressChart();
        }
        
        // Re-enable the select element to allow new selection after graph loads
        setTimeout(() => {
            select.disabled = false;
        }, 50);
    };
    
    /**
     * Handle rep range selection change
     */
    const handleRepRangeChange = () => {
        const select = document.getElementById('rep-range-select');
        selectedRepRange = select.value;
        
        if (selectedExerciseId) {
            renderProgressChart();
        }
    };
    
    /**
     * Render the progress chart for the selected exercise
     */
    const renderProgressChart = () => {
        if (!selectedExerciseId) {
            return;
        }
        
        // Temporarily disable the select element during chart loading
        const select = document.getElementById('exercise-select');
        if (select) {
            select.disabled = true;
        }
        
        // Get exercise progress data
        const progressData = DataManager.getExerciseProgress(selectedExerciseId, selectedRepRange);
        
        // If no data available, show message
        if (progressData.length === 0) {
            clearProgressChart();
            
            const progressChartContainer = document.querySelector('.progress-chart-container');
            const canvas = document.getElementById('progress-chart');
            
            if (canvas) {
                canvas.style.display = 'none';
            }
            
            // Add message if not already present
            let chartArea = progressChartContainer.querySelector('.chart-display-area');
            if (!chartArea) {
                chartArea = document.createElement('div');
                chartArea.className = 'chart-display-area';
                progressChartContainer.appendChild(chartArea);
            }
            
            if (!chartArea.querySelector('.empty-state')) {
                // Clear any existing content in chart area
                chartArea.innerHTML = '';
                
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <p>No data available for this exercise and rep range.</p>
                `;
                chartArea.appendChild(emptyState);
            }
            
            // Re-enable the select element
            if (select) {
                select.disabled = false;
            }
            
            return;
        }
        
        // Get the chart area container or create it
        const progressChartContainer = document.querySelector('.progress-chart-container');
        let chartArea = progressChartContainer.querySelector('.chart-display-area');
        if (!chartArea) {
            chartArea = document.createElement('div');
            chartArea.className = 'chart-display-area';
            progressChartContainer.appendChild(chartArea);
        }
        
        // Remove any empty state message and prepare for new chart
        chartArea.innerHTML = '';  // Clear the chart area for new content
        
        // Make sure progress-chart element exists and is visible
        const canvas = document.getElementById('progress-chart');
        if (canvas) {
            canvas.style.display = 'none'; // Hide the canvas element since we'll use D3
        }
        
        // Get the selected exercise name
        const exercises = DataManager.getExercises();
        const exercise = exercises.find(ex => ex.id === selectedExerciseId);
        const exerciseName = exercise ? exercise.name : 'Exercise';
        
        // Prepare the container
        const container = document.querySelector('.progress-chart-container');
        if (container) {
            // Make sure the container is visible
            container.style.display = 'block';
            
            // Check if we have a specific chart area div
            let chartArea = container.querySelector('.chart-display-area');
            
            // If not, create one to keep filters separate from chart
            if (!chartArea) {
                chartArea = document.createElement('div');
                chartArea.className = 'chart-display-area';
                container.appendChild(chartArea);
            }
        }
        
        // Use D3 for new chart, targeting the specific chart area instead of the whole container
        D3ChartsManager.createProgressChart(progressData, exerciseName, '.chart-display-area');
        
        // Set progressChart to non-null to indicate a chart exists
        // This helps with compatibility with other code that checks if the chart exists
        progressChart = {};
    };
    
    /**
     * Clear the progress chart
     */
    const clearProgressChart = () => {
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
    };
    
    // Public API
    return {
        initialize,
        renderExerciseSelect
    };
})();
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
        
        // Make sure Weight Chart is rendered when this tab is activated
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                if (tabId === 'progress' && WeightManager && typeof WeightManager.renderWeightChart === 'function') {
                    console.log('Progress tab activated, ensuring weight chart is rendered');
                    setTimeout(() => {
                        WeightManager.renderWeightChart();
                    }, 100);
                }
            });
        });
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
        
        // Get exercise progress data
        const progressData = DataManager.getExerciseProgress(selectedExerciseId, selectedRepRange);
        
        // If no data available, show message
        if (progressData.length === 0) {
            clearProgressChart();
            
            const progressChartContainer = document.querySelector('.progress-chart-container');
            const canvas = document.getElementById('progress-chart');
            
            canvas.style.display = 'none';
            
            // Add message if not already present
            if (!progressChartContainer.querySelector('.empty-state')) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <p>No data available for this exercise and rep range.</p>
                `;
                progressChartContainer.appendChild(emptyState);
            }
            
            return;
        }
        
        // Prepare chart data
        const labels = progressData.map(d => UI.formatDate(d.date));
        const weights = progressData.map(d => d.weight);
        
        // Get canvas context
        const canvas = document.getElementById('progress-chart');
        canvas.style.display = '';
        
        // Remove any empty state message
        const emptyState = document.querySelector('.progress-chart-container .empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if any
        if (progressChart) {
            progressChart.destroy();
        }
        
        // Get theme colors
        const themeColors = UI.getThemeColorForChart(1);
        
        // Create new chart
        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (lbs)',
                    data: weights,
                    backgroundColor: themeColors.backgroundColor,
                    borderColor: themeColors.borderColor,
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: themeColors.borderColor,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Weight (lbs)',
                            color: themeColors.textColor
                        },
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Workout Date',
                            color: themeColors.textColor
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const dataIndex = context.dataIndex;
                                return `Reps: ${progressData[dataIndex].reps}`;
                            }
                        },
                        backgroundColor: themeColors.tooltipColor,
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: false
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10,
                            padding: 20,
                            color: themeColors.textColor
                        }
                    }
                },
                animation: {
                    duration: 700,
                    easing: 'easeOutQuart',
                    delay: function(context) {
                        return context.dataIndex * 100;
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
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
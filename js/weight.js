/**
 * LiftMate - Weight Tracker Module
 * Handles body weight tracking and visualization
 */

const WeightManager = (() => {
    // Module state
    let weightChart = null;
    
    /**
     * Initialize weight manager functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering
        renderWeightChart();
    };
    
    /**
     * Setup all event listeners for weight functionality
     */
    const setupEventListeners = () => {
        // Add weight entry button
        document.getElementById('add-weight').addEventListener('click', openAddWeightModal);
        
        // Weight form handling
        document.getElementById('weight-form').addEventListener('submit', saveWeightEntry);
        document.getElementById('cancel-weight').addEventListener('click', cancelWeightForm);
    };
    
    /**
     * Open the add weight entry modal
     */
    const openAddWeightModal = () => {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('weight-date').value = today;
        
        // Clear weight input
        document.getElementById('weight-value').value = '';
        
        // Open modal
        UI.openModal('add-weight-modal');
    };
    
    /**
     * Save weight entry from form data
     * @param {Event} e - Form submit event
     */
    const saveWeightEntry = (e) => {
        e.preventDefault();
        
        const weightValue = parseFloat(document.getElementById('weight-value').value);
        const dateValue = document.getElementById('weight-date').value;
        
        // Validate inputs
        if (isNaN(weightValue) || weightValue <= 0) {
            UI.showToast('Please enter a valid weight', 'error');
            return;
        }
        
        if (!dateValue) {
            UI.showToast('Please select a date', 'error');
            return;
        }
        
        // Create weight entry object
        const entry = {
            weight: weightValue,
            date: new Date(dateValue).toISOString()
        };
        
        console.log('Saving weight entry:', entry);
        
        // Save entry
        const savedEntry = DataManager.saveWeightEntry(entry);
        
        if (savedEntry) {
            console.log('Entry saved successfully:', savedEntry);
            UI.showToast('Weight entry saved successfully', 'success');
            UI.closeModal(document.getElementById('add-weight-modal'));
            renderWeightChart();
        } else {
            console.error('Failed to save weight entry');
            UI.showToast('Failed to save weight entry', 'error');
        }
    };
    
    /**
     * Cancel weight form and close modal
     */
    const cancelWeightForm = () => {
        UI.closeModal(document.getElementById('add-weight-modal'));
    };
    
    /**
     * Delete a weight entry after confirmation
     * @param {string} entryId - ID of weight entry to delete
     */
    const deleteWeightEntry = (entryId) => {
        console.log('Attempting to delete weight entry with ID:', entryId);
        
        // Check if the entry exists first
        const entries = DataManager.getWeightEntries();
        const entryToDelete = entries.find(e => e.id === entryId);
        
        if (!entryToDelete) {
            console.error('Entry not found with ID:', entryId);
            UI.showToast('Weight entry not found', 'error');
            return;
        }
        
        console.log('Found entry to delete:', entryToDelete);
        
        UI.showConfirmation(
            'Delete Weight Entry',
            'Are you sure you want to delete this weight entry? This action cannot be undone.',
            () => {
                console.log('Confirmed deletion of entry with ID:', entryId);
                const success = DataManager.deleteWeightEntry(entryId);
                
                if (success) {
                    console.log('Successfully deleted weight entry');
                    UI.showToast('Weight entry deleted successfully', 'success');
                    renderWeightChart();
                } else {
                    console.error('Failed to delete weight entry');
                    UI.showToast('Failed to delete weight entry', 'error');
                }
            }
        );
    };

    /**
     * Render the weight entries list below the chart
     * @param {Array} entries - Array of weight entries
     */
    const renderWeightEntriesList = (entries) => {
        console.log('Rendering weight entries list with', entries.length, 'entries');
        
        // Create or get weight entries list container
        let entriesListContainer = document.querySelector('.weight-entries-list');
        
        if (!entriesListContainer) {
            console.log('Creating new weight entries list container');
            entriesListContainer = document.createElement('div');
            entriesListContainer.className = 'weight-entries-list';
            document.querySelector('.weight-tracker').appendChild(entriesListContainer);
        }
        
        // Sort entries by date (most recent first)
        const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Sorted entries:', sortedEntries);
        
        // Clear existing entries
        entriesListContainer.innerHTML = `
            <h3>Weight History</h3>
            <div class="entries-container"></div>
        `;
        
        const entriesContainer = entriesListContainer.querySelector('.entries-container');
        
        // Add each entry
        sortedEntries.forEach(entry => {
            // Ensure entry has an ID (this should not be necessary, but just in case)
            if (!entry.id) {
                console.warn('Entry missing ID:', entry);
                return; // Skip entries without IDs
            }
            
            console.log('Adding entry to UI with ID:', entry.id);
            
            const entryItem = document.createElement('div');
            entryItem.className = 'weight-entry-item';
            entryItem.dataset.entryId = entry.id; // Using dataset property for data attributes
            
            entryItem.innerHTML = `
                <div class="entry-date">${UI.formatDate(entry.date)}</div>
                <div class="entry-weight">${entry.weight.toFixed(1)} lbs</div>
                <button class="delete-entry-button">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            entriesContainer.appendChild(entryItem);
            
            // Add delete button event listener
            const deleteButton = entryItem.querySelector('.delete-entry-button');
            deleteButton.addEventListener('click', (e) => {
                console.log('Delete button clicked for entry ID:', entry.id);
                e.preventDefault();
                e.stopPropagation();
                deleteWeightEntry(entry.id);
            });
        });
    };

    /**
     * Render the weight chart
     */
    const renderWeightChart = () => {
        const entries = DataManager.getWeightEntries();
        
        // Get canvas context
        const canvas = document.getElementById('weight-chart');
        const ctx = canvas.getContext('2d');
        
        // Show message if no entries
        if (entries.length === 0) {
            if (weightChart) {
                weightChart.destroy();
                weightChart = null;
            }
            
            const weightChartContainer = document.querySelector('.weight-chart-container');
            
            // Add message if not already present
            if (!weightChartContainer.querySelector('.empty-state')) {
                canvas.style.display = 'none';
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <p>No weight entries yet. Add your first entry to start tracking!</p>
                `;
                weightChartContainer.appendChild(emptyState);
            }
            
            // Remove entries list if it exists
            const entriesList = document.querySelector('.weight-entries-list');
            if (entriesList) {
                entriesList.remove();
            }
            
            return;
        }
        
        // Remove any empty state message
        canvas.style.display = '';
        const emptyState = document.querySelector('.weight-chart-container .empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        // Prepare chart data
        const labels = entries.map(entry => UI.formatDate(entry.date));
        const weights = entries.map(entry => entry.weight);
        
        // Calculate statistics for annotations
        const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const latest = weights[weights.length - 1];
        const first = weights[0];
        const change = latest - first;
        
        // Destroy existing chart if any
        if (weightChart) {
            weightChart.destroy();
        }
        
        // Create new chart
        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (lbs)',
                    data: weights,
                    backgroundColor: 'rgba(174, 155, 109, 0.2)',
                    borderColor: 'rgba(174, 155, 109, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointBackgroundColor: 'rgba(174, 155, 109, 1)',
                    pointRadius: 4,
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
                            text: 'Weight (lbs)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                return `Average: ${average.toFixed(1)} lbs`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: average,
                                yMax: average,
                                borderColor: 'rgba(174, 155, 109, 0.5)',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: `Avg: ${average.toFixed(1)} lbs`,
                                    position: 'start'
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Create stats summary below chart
        const statsContainer = document.createElement('div');
        statsContainer.className = 'weight-stats';
        statsContainer.innerHTML = `
            <div class="weight-stat">
                <div class="stat-label">Current</div>
                <div class="stat-value">${latest.toFixed(1)} lbs</div>
            </div>
            <div class="weight-stat">
                <div class="stat-label">Change</div>
                <div class="stat-value ${change >= 0 ? 'positive' : 'negative'}">
                    ${change >= 0 ? '+' : ''}${change.toFixed(1)} lbs
                </div>
            </div>
            <div class="weight-stat">
                <div class="stat-label">Average</div>
                <div class="stat-value">${average.toFixed(1)} lbs</div>
            </div>
            <div class="weight-stat">
                <div class="stat-label">Min</div>
                <div class="stat-value">${min.toFixed(1)} lbs</div>
            </div>
            <div class="weight-stat">
                <div class="stat-label">Max</div>
                <div class="stat-value">${max.toFixed(1)} lbs</div>
            </div>
        `;
        
        // Add or update stats container
        const existingStats = document.querySelector('.weight-stats');
        if (existingStats) {
            existingStats.replaceWith(statsContainer);
        } else {
            document.querySelector('.weight-chart-container').appendChild(statsContainer);
        }
        
        // Render the weight entries list
        renderWeightEntriesList(entries);
    };
    
    // Public API
    return {
        initialize,
        renderWeightChart
    };
})();
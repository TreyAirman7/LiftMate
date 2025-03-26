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
        console.log('Initializing WeightManager');
        
        // Setup event listeners
        setupEventListeners();
        
        // Delay initial rendering to ensure Chart.js is fully loaded
        setTimeout(() => {
            console.log('Rendering weight chart after initialization');
            renderWeightChart();
        }, 300);
        
        // Also render on Progress tab activation, in case initial render was missed
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                if (tabId === 'progress') {
                    console.log('Progress tab activated, ensuring weight chart is rendered');
                    renderWeightChart();
                }
            });
        });
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
     * Render the weight entries list below the chart as a dropdown
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
        
        // Create dropdown with toggle functionality
        entriesListContainer.innerHTML = `
            <div class="weight-history-header">
                <h3>Weight History</h3>
                <button class="dropdown-toggle" id="weight-history-toggle">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="entries-container hidden" id="weight-entries-dropdown">
                <!-- Entries will be added here -->
            </div>
        `;
        
        // Add toggle functionality
        const toggleButton = entriesListContainer.querySelector('#weight-history-toggle');
        const entriesDropdown = entriesListContainer.querySelector('#weight-entries-dropdown');
        
        toggleButton.addEventListener('click', () => {
            const isHidden = entriesDropdown.classList.contains('hidden');
            
            if (isHidden) {
                entriesDropdown.classList.remove('hidden');
                toggleButton.querySelector('i').classList.remove('fa-chevron-down');
                toggleButton.querySelector('i').classList.add('fa-chevron-up');
            } else {
                entriesDropdown.classList.add('hidden');
                toggleButton.querySelector('i').classList.remove('fa-chevron-up');
                toggleButton.querySelector('i').classList.add('fa-chevron-down');
            }
        });
        
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
        try {
            console.log('Rendering weight chart');
            
            const entries = DataManager.getWeightEntries();
            console.log(`Found ${entries.length} weight entries`);
            
            // Get the weight chart container
            const weightChartContainer = document.querySelector('.weight-chart-container');
            if (!weightChartContainer) {
                console.error('Weight chart container not found');
                return;
            }
            
            // Show message if no entries
            if (entries.length === 0) {
                console.log('No weight entries found, showing empty state');
                if (weightChart) {
                    weightChart = null;
                }
                
                // Add message if not already present
                if (!weightChartContainer.querySelector('.empty-state')) {
                    // Clear any existing chart
                    weightChartContainer.innerHTML = '<canvas id="weight-chart" style="display:none;"></canvas>';
                    
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
            
            console.log('Preparing to render weight chart with data');
            
            // Remove any empty state message
            const emptyState = document.querySelector('.weight-chart-container .empty-state');
            if (emptyState) {
                emptyState.remove();
            }
            
            // Make sure weight-chart element exists and is hidden
            const canvas = document.getElementById('weight-chart');
            if (canvas) {
                canvas.style.display = 'none'; // Hide the canvas element since we'll use D3
            }
            
            // Configure the container
            weightChartContainer.style.display = 'block';
            weightChartContainer.style.height = '350px';
            
            // Sort entries by date for calculations
            const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Create new D3 chart
            D3ChartsManager.createWeightChart(sortedEntries);
            
            // Calculate statistics for the info display
            const weights = sortedEntries.map(entry => entry.weight);
            const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
            const min = Math.min(...weights);
            const max = Math.max(...weights);
            const latest = weights[weights.length - 1];
            const first = weights[0];
            const change = latest - first;
            
            // Create stats summary below chart but only if not already created by D3 chart
            if (!weightChartContainer.querySelector('.stats-box')) {
                console.log('Creating stats summary');
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
                    weightChartContainer.appendChild(statsContainer);
                }
            }
            
            // Render the weight entries list
            renderWeightEntriesList(entries);
            
        } catch (error) {
            console.error('Error in renderWeightChart:', error);
            // Show error message in the chart container
            const weightChartContainer = document.querySelector('.weight-chart-container');
            if (weightChartContainer) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.innerHTML = `
                    <p>Error rendering weight chart. Please try refreshing the page.</p>
                    <p class="error-details">${error.message}</p>
                `;
                
                // Remove existing error if any
                const existingError = weightChartContainer.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                weightChartContainer.appendChild(errorMsg);
            }
        }
    };
    
    // Public API
    return {
        initialize,
        renderWeightChart
    };
})();
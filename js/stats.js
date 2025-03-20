/**
 * LiftMate - Statistics Module
 * Handles statistics display and calculations
 */

const StatsManager = (() => {
    // Module state
    let currentTimeframe = 'week';
    let consistencyChart = null;
    
    /**
     * Initialize statistics functionality
     */
    const initialize = () => {
        // Setup event listeners
        setupEventListeners();
        
        // Initial rendering
        renderStats();
    };
    
    /**
     * Setup event listeners for statistics functionality
     */
    const setupEventListeners = () => {
        // Setup timeframe selectors
        UI.setupTimeframeSelector('timeframe-selector', 'timeframe-button', (timeframe) => {
            currentTimeframe = timeframe;
            renderStats();
        });
        
        UI.setupTimeframeSelector('chart-timeframe-selector', 'chart-timeframe-button', (timeframe) => {
            renderConsistencyChart(timeframe);
        });
    };
    
    /**
     * Render all statistics
     */
    const renderStats = () => {
        renderDashboardStats();
        renderConsistencyChart('week');
        renderPersonalRecords();
    };
    
    /**
     * Render the main dashboard statistics
     */
    const renderDashboardStats = () => {
        const workouts = DataManager.getWorkouts();
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, currentTimeframe);
        
        // Calculate total workouts
        const totalWorkouts = filteredWorkouts.length;
        document.getElementById('total-workouts').textContent = totalWorkouts;
        
        // Calculate total duration
        const totalMinutes = filteredWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        document.getElementById('total-duration').textContent = `${totalHours} hrs`;
        
        // Calculate average workouts per week
        let avgPerWeek = 0;
        
        if (filteredWorkouts.length > 0) {
            const oldestWorkout = new Date(Math.min(...filteredWorkouts.map(w => new Date(w.date))));
            const now = new Date();
            const diffTime = Math.abs(now - oldestWorkout);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
            
            avgPerWeek = (filteredWorkouts.length / diffWeeks).toFixed(1);
        }
        
        document.getElementById('avg-per-week').textContent = avgPerWeek;
    };
    
    /**
     * Render the workout consistency chart
     * @param {string} timeframe - Timeframe to display (week, month, year, all)
     */
    const renderConsistencyChart = (timeframe) => {
        const workouts = DataManager.getWorkouts();
        let chartData;
        let labels;
        
        // Prepare data based on timeframe
        switch (timeframe) {
            case 'week':
                // Daily for current week
                ({ chartData, labels } = getWeeklyConsistencyData(workouts));
                break;
            case 'month':
                // Weekly for current month
                ({ chartData, labels } = getMonthlyConsistencyData(workouts));
                break;
            case 'year':
                // Monthly for current year
                ({ chartData, labels } = getYearlyConsistencyData(workouts));
                break;
            case 'all':
                // Monthly for all time
                ({ chartData, labels } = getAllTimeConsistencyData(workouts));
                break;
            default:
                // Default to weekly
                ({ chartData, labels } = getWeeklyConsistencyData(workouts));
        }
        
        // Get canvas context
        const canvas = document.getElementById('consistency-chart');
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if any
        if (consistencyChart) {
            consistencyChart.destroy();
        }
        
        // Create new chart
        consistencyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Workouts',
                    data: chartData,
                    backgroundColor: 'rgba(208, 106, 65, 0.7)',
                    borderColor: 'rgba(208, 106, 65, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    };
    
    /**
     * Get consistency data for weekly view
     * @param {Array} workouts - All workouts
     * @returns {Object} - Chart data and labels
     */
    const getWeeklyConsistencyData = (workouts) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Initialize data array (one item per day)
        const chartData = Array(7).fill(0);
        
        // Count workouts for each day of the week
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            // Only count workouts from current week
            if (workoutDate >= startOfWeek) {
                const dayIndex = workoutDate.getDay();
                chartData[dayIndex]++;
            }
        });
        
        return { chartData, labels: days };
    };
    
    /**
     * Get consistency data for monthly view
     * @param {Array} workouts - All workouts
     * @returns {Object} - Chart data and labels
     */
    const getMonthlyConsistencyData = (workouts) => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const totalWeeks = Math.ceil((endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7);
        
        // Generate week labels
        const labels = Array.from({ length: totalWeeks }, (_, i) => `Week ${i + 1}`);
        
        // Initialize data array (one item per week)
        const chartData = Array(totalWeeks).fill(0);
        
        // Count workouts for each week of the month
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            // Only count workouts from current month
            if (workoutDate >= startOfMonth && workoutDate <= endOfMonth) {
                const dayOfMonth = workoutDate.getDate();
                const weekIndex = Math.floor((dayOfMonth - 1) / 7);
                chartData[weekIndex]++;
            }
        });
        
        return { chartData, labels };
    };
    
    /**
     * Get consistency data for yearly view
     * @param {Array} workouts - All workouts
     * @returns {Object} - Chart data and labels
     */
    const getYearlyConsistencyData = (workouts) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        
        // Initialize data array (one item per month)
        const chartData = Array(12).fill(0);
        
        // Count workouts for each month of the year
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            // Only count workouts from current year
            if (workoutDate.getFullYear() === currentYear) {
                const monthIndex = workoutDate.getMonth();
                chartData[monthIndex]++;
            }
        });
        
        return { chartData, labels: months };
    };
    
    /**
     * Get consistency data for all time view
     * @param {Array} workouts - All workouts
     * @returns {Object} - Chart data and labels
     */
    const getAllTimeConsistencyData = (workouts) => {
        if (workouts.length === 0) {
            return { chartData: [], labels: [] };
        }
        
        // Find earliest and latest workout dates
        const dates = workouts.map(w => new Date(w.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        
        // Calculate total months between min and max
        const monthDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + maxDate.getMonth() - minDate.getMonth();
        
        // Generate month labels
        const labels = [];
        const chartData = [];
        
        // If less than 12 months of data, show all months
        if (monthDiff < 12) {
            for (let i = 0; i <= monthDiff; i++) {
                const d = new Date(minDate.getFullYear(), minDate.getMonth() + i, 1);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
                chartData.push(0);
            }
            
            // Count workouts for each month
            workouts.forEach(workout => {
                const d = new Date(workout.date);
                const monthIndex = (d.getFullYear() - minDate.getFullYear()) * 12 + d.getMonth() - minDate.getMonth();
                
                if (monthIndex >= 0 && monthIndex < chartData.length) {
                    chartData[monthIndex]++;
                }
            });
        } else {
            // If more than 12 months, show by quarters or years depending on range
            if (monthDiff <= 36) {
                // Show by quarters (3 month periods)
                const quarterCount = Math.ceil((monthDiff + 1) / 3);
                
                for (let i = 0; i < quarterCount; i++) {
                    const d = new Date(minDate.getFullYear(), minDate.getMonth() + i * 3, 1);
                    labels.push(`Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`);
                    chartData.push(0);
                }
                
                // Count workouts for each quarter
                workouts.forEach(workout => {
                    const d = new Date(workout.date);
                    const monthDiff = (d.getFullYear() - minDate.getFullYear()) * 12 + d.getMonth() - minDate.getMonth();
                    const quarterIndex = Math.floor(monthDiff / 3);
                    
                    if (quarterIndex >= 0 && quarterIndex < chartData.length) {
                        chartData[quarterIndex]++;
                    }
                });
            } else {
                // Show by years
                const startYear = minDate.getFullYear();
                const endYear = maxDate.getFullYear();
                
                for (let year = startYear; year <= endYear; year++) {
                    labels.push(year.toString());
                    chartData.push(0);
                }
                
                // Count workouts for each year
                workouts.forEach(workout => {
                    const year = new Date(workout.date).getFullYear();
                    const index = year - startYear;
                    
                    if (index >= 0 && index < chartData.length) {
                        chartData[index]++;
                    }
                });
            }
        }
        
        return { chartData, labels };
    };
    
    /**
     * Render personal records
     */
    const renderPersonalRecords = () => {
        const records = DataManager.getPersonalRecords();
        const exercises = DataManager.getExercises();
        const recordsList = document.getElementById('personal-records-list');
        
        // Clear existing records
        recordsList.innerHTML = '';
        
        // Show message if no records
        if (Object.keys(records).length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <p>No personal records yet. Complete some workouts to see your records!</p>
                </div>
            `;
            return;
        }
        
        // Create record items for each exercise with records
        Object.keys(records).forEach(exerciseId => {
            const exercise = exercises.find(ex => ex.id === exerciseId);
            
            if (!exercise) {
                return;
            }
            
            const record = records[exerciseId];
            
            const recordCard = document.createElement('div');
            recordCard.className = 'card record-card';
            recordCard.innerHTML = `
                <h3>${exercise.name}</h3>
                <div class="record-details">
                    <div class="record-detail">
                        <span class="record-label">Max Weight:</span>
                        <span class="record-value">${record.maxWeight} lbs</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Max Reps:</span>
                        <span class="record-value">${record.maxReps}</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Max Volume (Single Set):</span>
                        <span class="record-value">${record.maxVolume} lbs</span>
                    </div>
                </div>
            `;
            
            recordsList.appendChild(recordCard);
        });
    };
    
    // Public API
    return {
        initialize,
        renderStats
    };
})();
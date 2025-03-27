/**
 * LiftMate - Workout Graphics Module
 * Provides visual representations of workout data without relying on complex charts
 */

const WorkoutGraphics = (() => {
    // List of muscle groups and their associated exercises
    const muscleGroups = {
        'chest': ['bench press', 'incline press', 'decline press', 'push-up', 'chest fly', 'pec deck', 'chest'],
        'back': ['row', 'pull-up', 'lat pulldown', 'deadlift', 'back fly', 'back extension', 'pull', 'chin-up', 'back'],
        'shoulders': ['shoulder press', 'lateral raise', 'front raise', 'overhead press', 'upright row', 'shrug', 'delt', 'shoulder'],
        'biceps': ['curl', 'hammer curl', 'preacher curl', 'concentration curl', 'bicep'],
        'triceps': ['tricep extension', 'pushdown', 'skull crusher', 'dip', 'close grip', 'tricep'],
        'legs': ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl', 'calf raise', 'leg', 'quad', 'hamstring', 'glute'],
        'core': ['crunch', 'sit-up', 'plank', 'russian twist', 'leg raise', 'ab', 'core', 'oblique']
    };
    
    // Emoji icons for muscle groups
    const muscleIcons = {
        'chest': '💪',
        'back': '🔙',
        'shoulders': '🏋️',
        'biceps': '💪',
        'triceps': '🦾',
        'legs': '🦵',
        'core': '🧠'
    };
    
    // Rep range categories
    const repRanges = {
        'strength': { min: 1, max: 5, color: '#FF5252', name: 'Strength', icon: 'fa-dumbbell' },
        'hypertrophy': { min: 6, max: 12, color: '#5C6BC0', name: 'Hypertrophy', icon: 'fa-person-running' },
        'endurance': { min: 13, max: 1000, color: '#26A69A', name: 'Endurance', icon: 'fa-stopwatch' }
    };
    
    /**
     * Initialize the module
     */
    const initialize = () => {
        console.log('WorkoutGraphics module initialized');
    };

    /**
     * Create a visual representation of workout distribution by day
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Selected timeframe ('week', 'month', 'year', 'all')
     */
    const createWorkoutDistributionGraphic = (workouts, timeframe) => {
        if (!workouts || workouts.length === 0) {
            console.log('No workout data available for distribution graphic');
            showEmptyState('.stats-dashboard', 'workout-distribution', 'No workout data available');
            return;
        }

        // Filter workouts by timeframe
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, timeframe);
        if (filteredWorkouts.length === 0) {
            console.log('No workout data available for selected timeframe');
            showEmptyState('.stats-dashboard', 'workout-distribution', 'No workout data available for the selected timeframe');
            return;
        }

        // Find or create container for the graphic
        let container = document.querySelector('.stats-dashboard .workout-distribution-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'workout-distribution-container card';
            document.querySelector('.stats-dashboard').appendChild(container);
        }
        
        // Clear previous content
        container.innerHTML = '';

        // Add title
        const title = document.createElement('h3');
        title.className = 'graphic-title';
        title.textContent = 'Workout Schedule';
        container.appendChild(title);

        // Aggregate workout data by day of week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCount = Array(7).fill(0);
        
        filteredWorkouts.forEach(workout => {
            const date = new Date(workout.date);
            const dayIndex = date.getDay();
            dayCount[dayIndex]++;
        });

        // Create days of week grid
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        container.appendChild(daysGrid);

        // Calculate max count for scaling
        const maxCount = Math.max(...dayCount);

        // Create day cards
        daysOfWeek.forEach((day, i) => {
            const count = dayCount[i];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.classList.add(count > 0 ? 'has-workouts' : 'no-workouts');
            
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = day.substring(0, 3);
            
            const activityBar = document.createElement('div');
            activityBar.className = 'activity-bar';
            
            const fillBar = document.createElement('div');
            fillBar.className = 'fill-bar';
            fillBar.style.height = `${percentage}%`;
            activityBar.appendChild(fillBar);
            
            const countValue = document.createElement('div');
            countValue.className = 'count-value';
            countValue.textContent = count;
            
            dayCard.appendChild(dayName);
            dayCard.appendChild(activityBar);
            dayCard.appendChild(countValue);
            
            daysGrid.appendChild(dayCard);
        });

        // Calculate insights
        const totalWorkouts = dayCount.reduce((sum, count) => sum + count, 0);
        const mostActiveDay = daysOfWeek[dayCount.indexOf(Math.max(...dayCount))];
        
        // Add insights section
        const insights = document.createElement('div');
        insights.className = 'insights';
        
        insights.innerHTML = `
            <div class="insight-item">
                <i class="fas fa-calendar-check"></i>
                <div class="insight-text">
                    <span class="insight-value">${totalWorkouts}</span>
                    <span class="insight-label">Total Workouts</span>
                </div>
            </div>
            <div class="insight-item">
                <i class="fas fa-medal"></i>
                <div class="insight-text">
                    <span class="insight-value">${mostActiveDay}</span>
                    <span class="insight-label">Most Active Day</span>
                </div>
            </div>
        `;
        
        container.appendChild(insights);
    };

    /**
     * Create a visual representation of most frequent exercises
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Selected timeframe ('week', 'month', 'year', 'all')
     */
    const createExerciseDistributionGraphic = (workouts, timeframe) => {
        if (!workouts || workouts.length === 0) {
            console.log('No workout data available for exercise distribution graphic');
            showEmptyState('.stats-dashboard', 'exercise-distribution', 'No workout data available');
            return;
        }

        // Filter workouts by timeframe
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, timeframe);
        if (filteredWorkouts.length === 0) {
            console.log('No workout data available for selected timeframe');
            showEmptyState('.stats-dashboard', 'exercise-distribution', 'No workout data available for the selected timeframe');
            return;
        }

        // Find or create container for the graphic
        let container = document.querySelector('.stats-dashboard .exercise-distribution-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'exercise-distribution-container card';
            document.querySelector('.stats-dashboard').appendChild(container);
        }
        
        // Clear previous content
        container.innerHTML = '';

        // Add title
        const title = document.createElement('h3');
        title.className = 'graphic-title';
        title.textContent = 'Most Frequent Exercises';
        container.appendChild(title);

        // Count exercises
        const exerciseCounts = {};
        const exerciseVolumes = {};
        
        filteredWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const exerciseName = exercise.exerciseName;
                
                // Count occurrences
                if (!exerciseCounts[exerciseName]) {
                    exerciseCounts[exerciseName] = 0;
                    exerciseVolumes[exerciseName] = 0;
                }
                
                exerciseCounts[exerciseName]++;
                
                // Calculate volume (weight * reps)
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        exerciseVolumes[exerciseName] += (set.weight * set.reps);
                    }
                });
            });
        });

        // Sort exercises by count
        const sortedExercises = Object.keys(exerciseCounts).map(name => ({
            name,
            count: exerciseCounts[name],
            volume: exerciseVolumes[name]
        })).sort((a, b) => b.count - a.count);

        // Take top 5 exercises
        const topExercises = sortedExercises.slice(0, 5);

        // Create exercises grid
        const exercisesGrid = document.createElement('div');
        exercisesGrid.className = 'exercises-grid';
        container.appendChild(exercisesGrid);

        // If no exercises found
        if (topExercises.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No exercise data available for the selected timeframe';
            exercisesGrid.appendChild(emptyMessage);
            return;
        }

        // Calculate max count for scaling
        const maxCount = Math.max(...topExercises.map(ex => ex.count));

        // Generate muscle icons based on exercise name
        const getMuscleIcon = (exerciseName) => {
            const name = exerciseName.toLowerCase();
            
            if (name.includes('bench') || name.includes('chest') || name.includes('pec')) {
                return 'fa-dumbbell';
            } else if (name.includes('squat') || name.includes('leg') || name.includes('quad')) {
                return 'fa-person-walking';
            } else if (name.includes('dead') || name.includes('back')) {
                return 'fa-child-reaching';
            } else if (name.includes('shoulder') || name.includes('press')) {
                return 'fa-arms-up';
            } else if (name.includes('bicep') || name.includes('curl')) {
                return 'fa-hands';
            } else if (name.includes('tricep')) {
                return 'fa-hand-fist';
            } else if (name.includes('ab') || name.includes('crunch')) {
                return 'fa-person-circle-check';
            } else {
                return 'fa-dumbbell';
            }
        };

        // Create exercise cards
        topExercises.forEach((exercise, i) => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'exercise-card';
            
            const percentage = maxCount > 0 ? (exercise.count / maxCount) * 100 : 0;
            const formattedVolume = exercise.volume.toLocaleString();
            
            exerciseCard.innerHTML = `
                <div class="exercise-icon">
                    <i class="fas ${getMuscleIcon(exercise.name)}"></i>
                </div>
                <div class="exercise-details">
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-stats">
                        <div class="stat-item">
                            <span class="stat-value">${exercise.count}×</span>
                            <span class="stat-label">performed</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${formattedVolume}</span>
                            <span class="stat-label">lbs lifted</span>
                        </div>
                    </div>
                </div>
                <div class="progress-indicator" style="width: ${percentage}%"></div>
            `;
            
            exercisesGrid.appendChild(exerciseCard);
        });

        // Add a "View All" button if there are more exercises
        if (sortedExercises.length > 5) {
            const viewAllButton = document.createElement('button');
            viewAllButton.className = 'view-all-button';
            viewAllButton.innerHTML = `<i class="fas fa-list"></i> View All Exercises`;
            
            // When clicked, show modal with all exercises
            viewAllButton.addEventListener('click', () => {
                showAllExercises(sortedExercises);
            });
            
            container.appendChild(viewAllButton);
        }
    };

    /**
     * Show a modal with all exercises
     * @param {Array} exercises - Array of exercise data
     */
    const showAllExercises = (exercises) => {
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>All Exercises</h2>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <table class="exercises-table">
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Times Performed</th>
                            <th>Total Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exercises.map(ex => `
                            <tr>
                                <td>${ex.name}</td>
                                <td>${ex.count}</td>
                                <td>${ex.volume.toLocaleString()} lbs</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Show the modal using UI helper
        UI.showCustomModal(modalContent, 'all-exercises-modal');
    };

    /**
     * Show empty state when no data is available
     * @param {string} containerSelector - Selector for the parent container
     * @param {string} id - ID for the empty state element
     * @param {string} message - Message to display
     */
    const showEmptyState = (containerSelector, id, message) => {
        // Find or create container
        let container = document.querySelector(`${containerSelector} .${id}-container`);
        if (!container) {
            container = document.createElement('div');
            container.className = `${id}-container card`;
            document.querySelector(containerSelector).appendChild(container);
        }
        
        // Clear and add empty state
        container.innerHTML = `
            <div class="empty-chart-message">
                <i class="fas fa-chart-bar"></i>
                <p>${message}</p>
                <p>Complete more workouts to see data here!</p>
            </div>
        `;
    };

    /**
     * Create a visual representation of volume by muscle group
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Selected timeframe ('week', 'month', 'year', 'all')
     */
    const createMuscleGroupVolumeGraphic = (workouts, timeframe) => {
        if (!workouts || workouts.length === 0) {
            console.log('No workout data available for muscle group volume graphic');
            showEmptyState('.stats-dashboard', 'muscle-volume', 'No workout data available');
            return;
        }

        // Filter workouts by timeframe
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, timeframe);
        if (filteredWorkouts.length === 0) {
            console.log('No workout data available for selected timeframe');
            showEmptyState('.stats-dashboard', 'muscle-volume', 'No workout data available for the selected timeframe');
            return;
        }

        // Find or create container for the graphic
        let container = document.querySelector('.stats-dashboard .muscle-volume-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'muscle-volume-container card';
            document.querySelector('.stats-dashboard').appendChild(container);
        }
        
        // Clear previous content
        container.innerHTML = '';

        // Add title
        const title = document.createElement('h3');
        title.className = 'graphic-title';
        title.textContent = 'Volume by Muscle Group';
        container.appendChild(title);

        // Calculate volume by muscle group
        const muscleVolumes = {};
        
        // Initialize all muscle groups with zero volume
        Object.keys(muscleGroups).forEach(group => {
            muscleVolumes[group] = 0;
        });
        
        // Process workouts to calculate volumes
        filteredWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                // Find which muscle group this exercise belongs to
                const exerciseName = exercise.exerciseName.toLowerCase();
                let matchedGroup = null;
                
                // Check each muscle group's keywords
                for (const [group, keywords] of Object.entries(muscleGroups)) {
                    for (const keyword of keywords) {
                        if (exerciseName.includes(keyword)) {
                            matchedGroup = group;
                            break;
                        }
                    }
                    if (matchedGroup) break;
                }
                
                // If no match found, use "other" category
                if (!matchedGroup) {
                    if (!muscleVolumes['other']) {
                        muscleVolumes['other'] = 0;
                    }
                    matchedGroup = 'other';
                }
                
                // Sum up volume (weight × reps) for this exercise
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        muscleVolumes[matchedGroup] += (set.weight * set.reps);
                    }
                });
            });
        });
        
        // Remove muscle groups with zero volume
        Object.keys(muscleVolumes).forEach(group => {
            if (muscleVolumes[group] === 0) {
                delete muscleVolumes[group];
            }
        });
        
        // Sort muscle groups by volume (highest first)
        const sortedMuscleGroups = Object.keys(muscleVolumes).sort((a, b) => 
            muscleVolumes[b] - muscleVolumes[a]
        );
        
        // If no data found
        if (sortedMuscleGroups.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No muscle group data available for the selected timeframe';
            container.appendChild(emptyMessage);
            return;
        }
        
        // Calculate total volume for percentages
        const totalVolume = Object.values(muscleVolumes).reduce((total, volume) => total + volume, 0);
        
        // Create muscle body visualization container
        const muscleBody = document.createElement('div');
        muscleBody.className = 'muscle-body-container';
        container.appendChild(muscleBody);
        
        // Add muscle body SVG outline - simplified human body outline
        muscleBody.innerHTML = `
            <div class="muscle-body-svg">
                <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                    <!-- Head -->
                    <circle cx="50" cy="25" r="15" class="body-outline" />
                    <!-- Torso -->
                    <path d="M35,40 Q35,65 30,90 L70,90 Q65,65 65,40 Z" class="body-outline" />
                    <!-- Arms -->
                    <path d="M35,45 Q25,55 20,75 L15,90" class="body-outline" />
                    <path d="M65,45 Q75,55 80,75 L85,90" class="body-outline" />
                    <!-- Legs -->
                    <path d="M30,90 L25,150" class="body-outline" />
                    <path d="M70,90 L75,150" class="body-outline" />
                    
                    <!-- Muscle group overlays -->
                    <circle cx="50" cy="25" r="15" class="muscle-area core-area" data-muscle="core" />
                    <path d="M35,40 Q35,50 35,60 L65,60 Q65,50 65,40 Z" class="muscle-area chest-area" data-muscle="chest" />
                    <path d="M35,60 Q35,70 30,90 L70,90 Q65,70 65,60 Z" class="muscle-area back-area" data-muscle="back" />
                    <path d="M28,45 Q22,50 20,60" class="muscle-area shoulders-area" data-muscle="shoulders" />
                    <path d="M72,45 Q78,50 80,60" class="muscle-area shoulders-area" data-muscle="shoulders" />
                    <path d="M25,50 Q20,60 18,70" class="muscle-area biceps-area" data-muscle="biceps" />
                    <path d="M75,50 Q80,60 82,70" class="muscle-area biceps-area" data-muscle="biceps" />
                    <path d="M28,55 Q22,65 20,75" class="muscle-area triceps-area" data-muscle="triceps" />
                    <path d="M72,55 Q78,65 80,75" class="muscle-area triceps-area" data-muscle="triceps" />
                    <path d="M30,90 Q30,120 25,150" class="muscle-area legs-area" data-muscle="legs" />
                    <path d="M70,90 Q70,120 75,150" class="muscle-area legs-area" data-muscle="legs" />
                </svg>
            </div>
        `;
        
        // Remove the canvas chart element if it exists
        const canvasChart = document.getElementById('volume-distribution-chart');
        if (canvasChart) {
            canvasChart.remove();
        }
        
        // Create volume stats container
        const volumeStats = document.createElement('div');
        volumeStats.className = 'muscle-volume-stats';
        container.appendChild(volumeStats);
        
        // Create cards for each muscle group
        sortedMuscleGroups.forEach(group => {
            const volume = muscleVolumes[group];
            const percentage = Math.round((volume / totalVolume) * 100);
            const formattedVolume = volume.toLocaleString();
            
            // Create card
            const card = document.createElement('div');
            card.className = 'muscle-volume-card';
            card.dataset.muscle = group;
            
            // Get icon and pretty name
            const icon = muscleIcons[group] || '🏋️';
            const prettyName = group.charAt(0).toUpperCase() + group.slice(1);
            
            card.innerHTML = `
                <div class="muscle-icon">${icon}</div>
                <div class="muscle-details">
                    <div class="muscle-name">${prettyName}</div>
                    <div class="volume-bar-container">
                        <div class="volume-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="volume-stats">
                        <span class="volume-value">${formattedVolume} lbs</span>
                        <span class="volume-percentage">${percentage}%</span>
                    </div>
                </div>
            `;
            
            volumeStats.appendChild(card);
            
            // Highlight corresponding area on the body when hovering over card
            card.addEventListener('mouseenter', () => {
                const muscleArea = document.querySelector(`.muscle-area.${group}-area`);
                if (muscleArea) {
                    muscleArea.classList.add('active');
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const muscleArea = document.querySelector(`.muscle-area.${group}-area`);
                if (muscleArea) {
                    muscleArea.classList.remove('active');
                }
            });
        });
        
        // Add insight text
        const topMuscle = sortedMuscleGroups[0];
        const topVolume = muscleVolumes[topMuscle].toLocaleString();
        const topPercentage = Math.round((muscleVolumes[topMuscle] / totalVolume) * 100);
        
        const insights = document.createElement('div');
        insights.className = 'insights';
        insights.innerHTML = `
            <div class="insight-item">
                <i class="fas fa-award"></i>
                <div class="insight-text">
                    <span class="insight-value">${topMuscle.charAt(0).toUpperCase() + topMuscle.slice(1)}</span>
                    <span class="insight-label">Most Trained Muscle</span>
                </div>
            </div>
            <div class="insight-item">
                <i class="fas fa-fire"></i>
                <div class="insight-text">
                    <span class="insight-value">${topVolume} lbs (${topPercentage}%)</span>
                    <span class="insight-label">Highest Volume</span>
                </div>
            </div>
        `;
        
        container.appendChild(insights);
    };
    
    /**
     * Create a visual representation of set rep ranges
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Selected timeframe ('week', 'month', 'year', 'all')
     */
    const createRepRangesGraphic = (workouts, timeframe) => {
        if (!workouts || workouts.length === 0) {
            console.log('No workout data available for rep ranges graphic');
            showEmptyState('.stats-dashboard', 'rep-ranges', 'No workout data available');
            return;
        }

        // Filter workouts by timeframe
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, timeframe);
        if (filteredWorkouts.length === 0) {
            console.log('No workout data available for selected timeframe');
            showEmptyState('.stats-dashboard', 'rep-ranges', 'No workout data available for the selected timeframe');
            return;
        }

        // Find or create container for the graphic
        let container = document.querySelector('.stats-dashboard .rep-ranges-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'rep-ranges-container card';
            document.querySelector('.stats-dashboard').appendChild(container);
        }
        
        // Clear previous content
        container.innerHTML = '';

        // Add title
        const title = document.createElement('h3');
        title.className = 'graphic-title';
        title.textContent = 'Training Focus (Rep Ranges)';
        container.appendChild(title);

        // Count sets by rep range
        const rangeCounts = {
            strength: 0,
            hypertrophy: 0,
            endurance: 0
        };
        
        // Count volume by rep range
        const rangeVolumes = {
            strength: 0,
            hypertrophy: 0,
            endurance: 0
        };
        
        // Exercise categorization
        const exerciseCategories = {
            strength: new Set(),
            hypertrophy: new Set(),
            endurance: new Set()
        };
        
        // Process all workouts
        filteredWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.completed && set.reps) {
                        // Determine rep range category
                        let category;
                        if (set.reps <= repRanges.strength.max) {
                            category = 'strength';
                        } else if (set.reps <= repRanges.hypertrophy.max) {
                            category = 'hypertrophy';
                        } else {
                            category = 'endurance';
                        }
                        
                        // Increment count for this category
                        rangeCounts[category]++;
                        
                        // Add exercise to category
                        exerciseCategories[category].add(exercise.exerciseName);
                        
                        // Add volume if weight exists
                        if (set.weight) {
                            rangeVolumes[category] += (set.weight * set.reps);
                        }
                    }
                });
            });
        });
        
        // Calculate total sets and percentages
        const totalSets = Object.values(rangeCounts).reduce((sum, count) => sum + count, 0);
        const percentages = {};
        
        for (const range in rangeCounts) {
            percentages[range] = totalSets > 0 ? Math.round((rangeCounts[range] / totalSets) * 100) : 0;
        }
        
        // If no data
        if (totalSets === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No rep range data available for the selected timeframe';
            container.appendChild(emptyMessage);
            return;
        }
        
        // Create circular gauge visualization
        const gaugeContainer = document.createElement('div');
        gaugeContainer.className = 'rep-ranges-gauge';
        container.appendChild(gaugeContainer);
        
        // Create gauge visualization
        gaugeContainer.innerHTML = `
            <div class="gauge-chart">
                <div class="gauge-center">
                    <div class="gauge-percentage">${Math.max(...Object.values(percentages))}%</div>
                    <div class="gauge-label">of Total Sets</div>
                </div>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#E0E0E0" stroke-width="20" />
                    
                    <!-- Strength segment -->
                    <circle cx="100" cy="100" r="80" fill="none" stroke="${repRanges.strength.color}" 
                            stroke-width="20" stroke-dasharray="${percentages.strength * 5.024}, 502.4" 
                            transform="rotate(-90 100 100)" />
                            
                    <!-- Hypertrophy segment -->
                    <circle cx="100" cy="100" r="80" fill="none" stroke="${repRanges.hypertrophy.color}" 
                            stroke-width="20" stroke-dasharray="${percentages.hypertrophy * 5.024}, 502.4" 
                            transform="rotate(${percentages.strength * 3.6 - 90} 100 100)" />
                            
                    <!-- Endurance segment -->
                    <circle cx="100" cy="100" r="80" fill="none" stroke="${repRanges.endurance.color}" 
                            stroke-width="20" stroke-dasharray="${percentages.endurance * 5.024}, 502.4" 
                            transform="rotate(${(percentages.strength + percentages.hypertrophy) * 3.6 - 90} 100 100)" />
                </svg>
            </div>
        `;
        
        // Create rep range category cards
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'rep-range-categories';
        container.appendChild(categoriesContainer);
        
        // Get the primary training focus (highest percentage)
        const primaryFocus = Object.keys(percentages).reduce((a, b) => 
            percentages[a] > percentages[b] ? a : b
        );
        
        // Create cards for each rep range category
        Object.keys(repRanges).forEach(range => {
            const count = rangeCounts[range];
            const percentage = percentages[range];
            const volume = rangeVolumes[range].toLocaleString();
            const exerciseCount = exerciseCategories[range].size;
            
            const card = document.createElement('div');
            card.className = 'rep-range-card';
            card.dataset.range = range;
            
            if (range === primaryFocus) {
                card.classList.add('primary-focus');
            }
            
            card.innerHTML = `
                <div class="range-header" style="background-color: ${repRanges[range].color}">
                    <i class="fas ${repRanges[range].icon}"></i>
                    <div class="range-title">${repRanges[range].name}</div>
                    <div class="range-reps">${repRanges[range].min}-${repRanges[range].max === 1000 ? '∞' : repRanges[range].max} reps</div>
                </div>
                <div class="range-stats">
                    <div class="range-stat">
                        <div class="stat-value">${count}</div>
                        <div class="stat-label">Sets</div>
                    </div>
                    <div class="range-stat">
                        <div class="stat-value">${percentage}%</div>
                        <div class="stat-label">of Total</div>
                    </div>
                    <div class="range-stat">
                        <div class="stat-value">${exerciseCount}</div>
                        <div class="stat-label">Exercises</div>
                    </div>
                </div>
                <div class="range-volume">
                    <div class="volume-label">Total Volume:</div>
                    <div class="volume-value">${volume} lbs</div>
                </div>
            `;
            
            categoriesContainer.appendChild(card);
        });
        
        // Add training focus insight
        const trainingInsight = document.createElement('div');
        trainingInsight.className = 'training-insight';
        
        // Determine training focus text
        let focusText = '';
        if (primaryFocus === 'strength') {
            focusText = 'You\'re focused on building strength with low rep, high weight training.';
        } else if (primaryFocus === 'hypertrophy') {
            focusText = 'You\'re focused on muscle growth with moderate rep ranges.';
        } else {
            focusText = 'You\'re focused on muscular endurance with high rep training.';
        }
        
        trainingInsight.innerHTML = `
            <div class="insight-header">
                <i class="fas fa-bullseye"></i>
                <h4>Training Focus</h4>
            </div>
            <p class="insight-text">${focusText}</p>
        `;
        
        container.appendChild(trainingInsight);
    };

    // Public API
    return {
        initialize,
        createWorkoutDistributionGraphic,
        createExerciseDistributionGraphic,
        createMuscleGroupVolumeGraphic,
        createRepRangesGraphic
    };
})();
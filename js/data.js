/**
 * LiftMate - Data Management Module
 * Handles all data storage and retrieval operations using localStorage
 */

const DataManager = (() => {
    // Storage keys
    const STORAGE_KEYS = {
        EXERCISES: 'liftmate-exercises',
        TEMPLATES: 'liftmate-templates',
        WORKOUTS: 'liftmate-workouts',
        WEIGHT_ENTRIES: 'liftmate-weight-entries',
        SETTINGS: 'liftmate-settings'
    };
    
    // Default muscle groups
    const DEFAULT_MUSCLE_GROUPS = [
        'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
        'Forearms', 'Abs', 'Legs', 'Quads', 'Hamstrings', 
        'Glutes', 'Calves', 'Traps', 'Obliques', 'Neck'
    ];
    
    // Sample exercises data for first-time users
    const SAMPLE_EXERCISES = [
        {
            id: 'ex1',
            name: 'Bench Press',
            muscles: ['Chest', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex2',
            name: 'Squat',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Legs']
        },
        {
            id: 'ex3',
            name: 'Deadlift',
            muscles: ['Back', 'Hamstrings', 'Glutes', 'Traps', 'Forearms']
        },
        {
            id: 'ex4',
            name: 'Pull-up',
            muscles: ['Back', 'Biceps', 'Forearms']
        },
        {
            id: 'ex5',
            name: 'Shoulder Press',
            muscles: ['Shoulders', 'Triceps']
        }
    ];
    
    // Sample workout templates for first-time users
    const SAMPLE_TEMPLATES = [
        {
            id: 'tmpl1',
            name: 'Upper Body Strength',
            lastUsed: null,
            exercises: [
                {
                    exerciseId: 'ex1',
                    exerciseName: 'Bench Press',
                    sets: [
                        { targetReps: 5, restTime: 90 },
                        { targetReps: 5, restTime: 90 },
                        { targetReps: 5, restTime: 90 },
                        { targetReps: 5, restTime: 90 },
                        { targetReps: 5, restTime: 0 }
                    ]
                },
                {
                    exerciseId: 'ex4',
                    exerciseName: 'Pull-up',
                    sets: [
                        { targetReps: 8, restTime: 90 },
                        { targetReps: 8, restTime: 90 },
                        { targetReps: 8, restTime: 0 }
                    ]
                },
                {
                    exerciseId: 'ex5',
                    exerciseName: 'Shoulder Press',
                    sets: [
                        { targetReps: 8, restTime: 60 },
                        { targetReps: 8, restTime: 60 },
                        { targetReps: 8, restTime: 0 }
                    ]
                }
            ]
        },
        {
            id: 'tmpl2',
            name: 'Lower Body Power',
            lastUsed: null,
            exercises: [
                {
                    exerciseId: 'ex2',
                    exerciseName: 'Squat',
                    sets: [
                        { targetReps: 5, restTime: 120 },
                        { targetReps: 5, restTime: 120 },
                        { targetReps: 5, restTime: 120 },
                        { targetReps: 5, restTime: 0 }
                    ]
                },
                {
                    exerciseId: 'ex3',
                    exerciseName: 'Deadlift',
                    sets: [
                        { targetReps: 5, restTime: 120 },
                        { targetReps: 5, restTime: 120 },
                        { targetReps: 5, restTime: 0 }
                    ]
                }
            ]
        }
    ];
    
    /**
     * Initialize data storage with default values if empty
     */
    const initializeStorage = () => {
        // Check if exercises exist, if not add sample data
        if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
            localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(SAMPLE_EXERCISES));
        }
        
        // Check if templates exist, if not add sample data
        if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(SAMPLE_TEMPLATES));
        }
        
        // Initialize empty arrays for other data types if they don't exist
        if (!localStorage.getItem(STORAGE_KEYS.WORKOUTS)) {
            localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES)) {
            localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify([]));
        }
        
        // Initialize settings if they don't exist
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            const defaultSettings = {
                weightUnit: 'lbs'
            };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }
    };
    
    /**
     * Generate a unique ID
     * @returns {string} - Unique ID string
     */
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    /**
     * Get all exercises from storage
     * @returns {Array} - Array of exercise objects
     */
    const getExercises = () => {
        const exercises = localStorage.getItem(STORAGE_KEYS.EXERCISES);
        return exercises ? JSON.parse(exercises) : [];
    };
    
    /**
     * Save a new exercise or update an existing one
     * @param {Object} exercise - Exercise object to save
     * @returns {Object} - Saved exercise object with ID
     */
    const saveExercise = (exercise) => {
        const exercises = getExercises();
        
        if (exercise.id) {
            // Update existing exercise
            const index = exercises.findIndex(ex => ex.id === exercise.id);
            if (index !== -1) {
                exercises[index] = exercise;
            }
        } else {
            // Add new exercise with generated ID
            exercise.id = generateId();
            exercises.push(exercise);
        }
        
        localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
        return exercise;
    };
    
    /**
     * Delete an exercise by ID
     * @param {string} exerciseId - ID of exercise to delete
     * @returns {boolean} - Success status
     */
    const deleteExercise = (exerciseId) => {
        const exercises = getExercises();
        const filteredExercises = exercises.filter(ex => ex.id !== exerciseId);
        
        if (filteredExercises.length !== exercises.length) {
            localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(filteredExercises));
            return true;
        }
        
        return false;
    };
    
    /**
     * Get all workout templates from storage
     * @returns {Array} - Array of template objects
     */
    const getTemplates = () => {
        const templates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
        return templates ? JSON.parse(templates) : [];
    };
    
    /**
     * Save a new template or update an existing one
     * @param {Object} template - Template object to save
     * @returns {Object} - Saved template object with ID
     */
    const saveTemplate = (template) => {
        const templates = getTemplates();
        
        if (template.id) {
            // Update existing template
            const index = templates.findIndex(t => t.id === template.id);
            if (index !== -1) {
                templates[index] = template;
            }
        } else {
            // Add new template with generated ID
            template.id = generateId();
            template.lastUsed = null;
            templates.push(template);
        }
        
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        return template;
    };
    
    /**
     * Delete a template by ID
     * @param {string} templateId - ID of template to delete
     * @returns {boolean} - Success status
     */
    const deleteTemplate = (templateId) => {
        const templates = getTemplates();
        const filteredTemplates = templates.filter(t => t.id !== templateId);
        
        if (filteredTemplates.length !== templates.length) {
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filteredTemplates));
            return true;
        }
        
        return false;
    };
    
    /**
     * Update the last used date for a template
     * @param {string} templateId - ID of template to update
     * @returns {boolean} - Success status
     */
    const updateTemplateLastUsed = (templateId) => {
        const templates = getTemplates();
        const index = templates.findIndex(t => t.id === templateId);
        
        if (index !== -1) {
            templates[index].lastUsed = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
            return true;
        }
        
        return false;
    };
    
    /**
     * Get all completed workouts from storage
     * @returns {Array} - Array of workout objects
     */
    const getWorkouts = () => {
        const workouts = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
        return workouts ? JSON.parse(workouts) : [];
    };
    
    /**
     * Save a completed workout
     * @param {Object} workout - Workout object to save
     * @returns {Object} - Saved workout object with ID
     */
    const saveWorkout = (workout) => {
        const workouts = getWorkouts();
        
        if (workout.id) {
            // Update existing workout
            const index = workouts.findIndex(w => w.id === workout.id);
            if (index !== -1) {
                workouts[index] = workout;
            }
        } else {
            // Add new workout with generated ID
            workout.id = generateId();
            workout.date = workout.date || new Date().toISOString();
            workouts.push(workout);
        }
        
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
        return workout;
    };
    
    /**
     * Delete a workout by ID
     * @param {string} workoutId - ID of workout to delete
     * @returns {boolean} - Success status
     */
    const deleteWorkout = (workoutId) => {
        const workouts = getWorkouts();
        const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
        
        if (filteredWorkouts.length !== workouts.length) {
            localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filteredWorkouts));
            return true;
        }
        
        return false;
    };
    
    /**
     * Get all weight entries from storage
     * @returns {Array} - Array of weight entry objects
     */
    const getWeightEntries = () => {
        const entries = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
        return entries ? JSON.parse(entries) : [];
    };
    
    /**
     * Save a new weight entry
     * @param {Object} entry - Weight entry object to save
     * @returns {Object} - Saved weight entry object with ID
     */
    const saveWeightEntry = (entry) => {
        const entries = getWeightEntries();
        
        if (entry.id) {
            // Update existing entry
            const index = entries.findIndex(e => e.id === entry.id);
            if (index !== -1) {
                entries[index] = entry;
            }
        } else {
            // Add new entry with generated ID
            entry.id = generateId();
            entries.push(entry);
        }
        
        // Sort entries by date
        entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
        return entry;
    };
    
    /**
     * Delete a weight entry by ID
     * @param {string} entryId - ID of weight entry to delete
     * @returns {boolean} - Success status
     */
    const deleteWeightEntry = (entryId) => {
        const entries = getWeightEntries();
        const filteredEntries = entries.filter(e => e.id !== entryId);
        
        if (filteredEntries.length !== entries.length) {
            localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(filteredEntries));
            return true;
        }
        
        return false;
    };
    
    /**
     * Get application settings
     * @returns {Object} - Settings object
     */
    const getSettings = () => {
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : { weightUnit: 'lbs' };
    };
    
    /**
     * Save application settings
     * @param {Object} settings - Settings object to save
     * @returns {Object} - Saved settings object
     */
    const saveSettings = (settings) => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return settings;
    };
    
    /**
     * Get muscle groups
     * @returns {Array} - Array of muscle group names
     */
    const getMuscleGroups = () => {
        return DEFAULT_MUSCLE_GROUPS;
    };
    
    /**
     * Calculate personal records for exercises
     * @returns {Object} - Object mapping exercise IDs to their records
     */
    const getPersonalRecords = () => {
        const workouts = getWorkouts();
        const records = {};
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!records[exercise.exerciseId]) {
                    records[exercise.exerciseId] = {
                        maxWeight: 0,
                        maxReps: 0,
                        maxVolume: 0 // weight × reps
                    };
                }
                
                exercise.sets.forEach(set => {
                    // Update max weight if higher
                    if (set.weight > records[exercise.exerciseId].maxWeight) {
                        records[exercise.exerciseId].maxWeight = set.weight;
                    }
                    
                    // Update max reps if higher
                    if (set.reps > records[exercise.exerciseId].maxReps) {
                        records[exercise.exerciseId].maxReps = set.reps;
                    }
                    
                    // Calculate and update max volume if higher
                    const volume = set.weight * set.reps;
                    if (volume > records[exercise.exerciseId].maxVolume) {
                        records[exercise.exerciseId].maxVolume = volume;
                    }
                });
            });
        });
        
        return records;
    };
    
    /**
     * Get exercise progress data for charts
     * @param {string} exerciseId - ID of exercise to get progress for
     * @param {string} repRange - Optional rep range filter ('all', '1-5', '6-12', '13+')
     * @returns {Array} - Array of progress data points
     */
    const getExerciseProgress = (exerciseId, repRange = 'all') => {
        const workouts = getWorkouts();
        const progressData = [];
        
        workouts.forEach(workout => {
            const exerciseData = workout.exercises.find(ex => ex.exerciseId === exerciseId);
            
            if (exerciseData) {
                exerciseData.sets.forEach(set => {
                    // Apply rep range filter if specified
                    if (repRange === 'all' || 
                        (repRange === '1-5' && set.reps >= 1 && set.reps <= 5) ||
                        (repRange === '6-12' && set.reps >= 6 && set.reps <= 12) ||
                        (repRange === '13+' && set.reps >= 13)) {
                        
                        progressData.push({
                            date: workout.date,
                            weight: set.weight,
                            reps: set.reps
                        });
                    }
                });
            }
        });
        
        // Sort by date
        progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return progressData;
    };
    
    // Public API
    return {
        initializeStorage,
        getExercises,
        saveExercise,
        deleteExercise,
        getTemplates,
        saveTemplate,
        deleteTemplate,
        updateTemplateLastUsed,
        getWorkouts,
        saveWorkout,
        deleteWorkout,
        getWeightEntries,
        saveWeightEntry,
        deleteWeightEntry,
        getSettings,
        saveSettings,
        getMuscleGroups,
        getPersonalRecords,
        getExerciseProgress,
        generateId
    };
})();

// Initialize storage when the script loads
DataManager.initializeStorage();
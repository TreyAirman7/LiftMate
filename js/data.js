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
        PROGRESS_PICS: 'liftmate-progress-pics',
        PROGRESS_PICS_META: 'liftmate-progress-pics-meta',
        SETTINGS: 'liftmate-settings',
        GOALS: 'liftmate-goals',
        USER_PROFILE: 'liftmate-user-profile',
        ACTIVE_WORKOUT: 'liftmate-active-workout'
    };
    
    // Default muscle groups
    const DEFAULT_MUSCLE_GROUPS = [
        'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
        'Forearms', 'Abs', 'Legs', 'Quads', 'Hamstrings', 
        'Glutes', 'Calves', 'Traps', 'Obliques', 'Neck', 'Lats'
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
        },
        {
            id: 'ex6',
            name: 'Back Squat',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Legs']
        },
        {
            id: 'ex7',
            name: 'Front Squat',
            muscles: ['Quads', 'Abs', 'Legs']
        },
        {
            id: 'ex8',
            name: 'Conventional Deadlift',
            muscles: ['Back', 'Hamstrings', 'Glutes', 'Traps', 'Forearms']
        },
        {
            id: 'ex9',
            name: 'Sumo Deadlift',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Back', 'Forearms']
        },
        {
            id: 'ex10',
            name: 'Incline Bench Press',
            muscles: ['Chest', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex11',
            name: 'Decline Bench Press',
            muscles: ['Chest', 'Triceps']
        },
        {
            id: 'ex12',
            name: 'Overhead Press',
            muscles: ['Shoulders', 'Triceps']
        },
        {
            id: 'ex13',
            name: 'Push Press',
            muscles: ['Shoulders', 'Triceps', 'Legs']
        },
        {
            id: 'ex14',
            name: 'Barbell Row',
            muscles: ['Back', 'Biceps', 'Forearms', 'Traps']
        },
        {
            id: 'ex15',
            name: 'Pendlay Row',
            muscles: ['Back', 'Biceps', 'Forearms']
        },
        {
            id: 'ex16',
            name: 'Clean and Jerk',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Back', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex17',
            name: 'Snatch',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Back', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex18',
            name: 'Romanian Deadlift',
            muscles: ['Hamstrings', 'Glutes', 'Back', 'Forearms']
        },
        {
            id: 'ex19',
            name: 'Stiff-Legged Deadlift',
            muscles: ['Hamstrings', 'Glutes', 'Back']
        },
        {
            id: 'ex20',
            name: 'Good Morning',
            muscles: ['Hamstrings', 'Glutes', 'Back']
        },
        {
            id: 'ex21',
            name: 'Rack Pull',
            muscles: ['Back', 'Traps', 'Glutes', 'Forearms']
        },
        {
            id: 'ex22',
            name: 'Dumbbell Bench Press',
            muscles: ['Chest', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex23',
            name: 'Incline Dumbbell Press',
            muscles: ['Chest', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex24',
            name: 'Decline Dumbbell Press',
            muscles: ['Chest', 'Triceps']
        },
        {
            id: 'ex25',
            name: 'Dumbbell Shoulder Press',
            muscles: ['Shoulders', 'Triceps']
        },
        {
            id: 'ex26',
            name: 'Arnold Press',
            muscles: ['Shoulders', 'Triceps']
        },
        {
            id: 'ex27',
            name: 'Dumbbell Row',
            muscles: ['Back', 'Biceps', 'Forearms']
        },
        {
            id: 'ex28',
            name: 'Chin-up',
            muscles: ['Back', 'Biceps', 'Forearms']
        },
        {
            id: 'ex29',
            name: 'Lat Pulldown',
            muscles: ['Back', 'Biceps', 'Forearms']
        },
        {
            id: 'ex30',
            name: 'Seated Cable Row',
            muscles: ['Back', 'Biceps', 'Forearms']
        },
        {
            id: 'ex31',
            name: 'Leg Press',
            muscles: ['Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex32',
            name: 'Leg Extension',
            muscles: ['Quads']
        },
        {
            id: 'ex33',
            name: 'Lying Hamstring Curl',
            muscles: ['Hamstrings']
        },
        {
            id: 'ex34',
            name: 'Seated Hamstring Curl',
            muscles: ['Hamstrings']
        },
        {
            id: 'ex35',
            name: 'Standing Calf Raise',
            muscles: ['Calves']
        },
        {
            id: 'ex36',
            name: 'Seated Calf Raise',
            muscles: ['Calves']
        },
        {
            id: 'ex37',
            name: 'Glute Bridge',
            muscles: ['Glutes', 'Hamstrings']
        },
        {
            id: 'ex38',
            name: 'Barbell Hip Thrust',
            muscles: ['Glutes', 'Hamstrings']
        },
        {
            id: 'ex39',
            name: 'Walking Lunge',
            muscles: ['Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex40',
            name: 'Reverse Lunge',
            muscles: ['Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex41',
            name: 'Bulgarian Split Squat',
            muscles: ['Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex42',
            name: 'Goblet Squat',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Legs']
        },
        {
            id: 'ex43',
            name: 'Dumbbell Fly',
            muscles: ['Chest', 'Shoulders']
        },
        {
            id: 'ex44',
            name: 'Incline Dumbbell Fly',
            muscles: ['Chest', 'Shoulders']
        },
        {
            id: 'ex45',
            name: 'Cable Crossover',
            muscles: ['Chest']
        },
        {
            id: 'ex46',
            name: 'Pec Deck Machine',
            muscles: ['Chest']
        },
        {
            id: 'ex47',
            name: 'Chest Dips',
            muscles: ['Chest', 'Triceps', 'Shoulders']
        },
        {
            id: 'ex48',
            name: 'Weighted Push-up',
            muscles: ['Chest', 'Triceps', 'Shoulders']
        },
        {
            id: 'ex49',
            name: 'Lateral Raise',
            muscles: ['Shoulders']
        },
        {
            id: 'ex50',
            name: 'Front Raise',
            muscles: ['Shoulders']
        },
        {
            id: 'ex51',
            name: 'Rear Delt Fly',
            muscles: ['Shoulders']
        },
        {
            id: 'ex52',
            name: 'Barbell Shrug',
            muscles: ['Traps']
        },
        {
            id: 'ex53',
            name: 'Dumbbell Shrug',
            muscles: ['Traps']
        },
        {
            id: 'ex54',
            name: 'Face Pull',
            muscles: ['Shoulders', 'Traps']
        },
        {
            id: 'ex55',
            name: 'Back Extension',
            muscles: ['Back', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex56',
            name: 'Dumbbell Pullover',
            muscles: ['Chest', 'Back', 'Lats']
        },
        {
            id: 'ex57',
            name: 'Barbell Curl',
            muscles: ['Biceps', 'Forearms']
        },
        {
            id: 'ex58',
            name: 'Dumbbell Curl',
            muscles: ['Biceps', 'Forearms']
        },
        {
            id: 'ex59',
            name: 'Hammer Curl',
            muscles: ['Biceps', 'Forearms']
        },
        {
            id: 'ex60',
            name: 'Concentration Curl',
            muscles: ['Biceps']
        },
        {
            id: 'ex61',
            name: 'Preacher Curl',
            muscles: ['Biceps']
        },
        {
            id: 'ex62',
            name: 'Cable Curl',
            muscles: ['Biceps']
        },
        {
            id: 'ex63',
            name: 'Rope Triceps Pushdown',
            muscles: ['Triceps']
        },
        {
            id: 'ex64',
            name: 'Bar Triceps Pushdown',
            muscles: ['Triceps']
        },
        {
            id: 'ex65',
            name: 'Overhead Dumbbell Triceps Extension',
            muscles: ['Triceps']
        },
        {
            id: 'ex66',
            name: 'Skullcrusher',
            muscles: ['Triceps']
        },
        {
            id: 'ex67',
            name: 'Close-Grip Bench Press',
            muscles: ['Triceps', 'Chest', 'Shoulders']
        },
        {
            id: 'ex68',
            name: 'Triceps Dips',
            muscles: ['Triceps', 'Chest', 'Shoulders']
        },
        {
            id: 'ex69',
            name: 'Bench Dips',
            muscles: ['Triceps']
        },
        {
            id: 'ex70',
            name: 'Wrist Curl',
            muscles: ['Forearms']
        },
        {
            id: 'ex71',
            name: 'Reverse Wrist Curl',
            muscles: ['Forearms']
        },
        {
            id: 'ex72',
            name: 'Farmer\'s Walk',
            muscles: ['Forearms', 'Traps', 'Shoulders', 'Legs']
        },
        {
            id: 'ex73',
            name: 'Weighted Plank',
            muscles: ['Abs', 'Shoulders']
        },
        {
            id: 'ex74',
            name: 'Weighted Side Plank',
            muscles: ['Abs', 'Obliques']
        },
        {
            id: 'ex75',
            name: 'Hanging Leg Raise',
            muscles: ['Abs']
        },
        {
            id: 'ex76',
            name: 'Weighted Russian Twist',
            muscles: ['Abs', 'Obliques']
        },
        {
            id: 'ex77',
            name: 'Cable Crunch',
            muscles: ['Abs']
        },
        {
            id: 'ex78',
            name: 'Ab Rollout',
            muscles: ['Abs', 'Shoulders']
        },
        {
            id: 'ex79',
            name: 'Kettlebell Swing',
            muscles: ['Glutes', 'Hamstrings', 'Back', 'Shoulders']
        },
        {
            id: 'ex80',
            name: 'Kettlebell Snatch',
            muscles: ['Shoulders', 'Traps', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex81',
            name: 'Kettlebell Clean',
            muscles: ['Shoulders', 'Legs', 'Back']
        },
        {
            id: 'ex82',
            name: 'Power Clean',
            muscles: ['Back', 'Shoulders', 'Traps', 'Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex83',
            name: 'Power Snatch',
            muscles: ['Back', 'Shoulders', 'Traps', 'Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex84',
            name: 'Hang Clean',
            muscles: ['Back', 'Shoulders', 'Traps', 'Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex85',
            name: 'Hang Snatch',
            muscles: ['Back', 'Shoulders', 'Traps', 'Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex86',
            name: 'Split Jerk',
            muscles: ['Shoulders', 'Triceps', 'Quads', 'Hamstrings']
        },
        {
            id: 'ex87',
            name: 'T-Bar Row',
            muscles: ['Back', 'Lats', 'Biceps']
        },
        {
            id: 'ex88',
            name: 'Hack Squat Machine',
            muscles: ['Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex89',
            name: 'Box Squat',
            muscles: ['Quads', 'Hamstrings', 'Glutes', 'Back']
        },
        {
            id: 'ex90',
            name: 'Barbell Floor Press',
            muscles: ['Chest', 'Triceps']
        },
        {
            id: 'ex91',
            name: 'Dumbbell Floor Press',
            muscles: ['Chest', 'Triceps']
        },
        {
            id: 'ex92',
            name: 'Inverted Row',
            muscles: ['Back', 'Biceps']
        },
        {
            id: 'ex93',
            name: 'Close-Grip Lat Pulldown',
            muscles: ['Back', 'Biceps']
        },
        {
            id: 'ex94',
            name: 'Neutral-Grip Lat Pulldown',
            muscles: ['Back', 'Biceps']
        },
        {
            id: 'ex95',
            name: 'Weighted Step-Up',
            muscles: ['Quads', 'Hamstrings', 'Glutes']
        },
        {
            id: 'ex96',
            name: 'Chest Supported Dumbbell Row',
            muscles: ['Back', 'Biceps']
        },
        {
            id: 'ex97',
            name: 'Machine Chest Press',
            muscles: ['Chest', 'Shoulders', 'Triceps']
        },
        {
            id: 'ex98',
            name: 'Machine Shoulder Press',
            muscles: ['Shoulders', 'Triceps']
        },
        {
            id: 'ex99',
            name: 'Machine Row',
            muscles: ['Back', 'Biceps']
        },
        {
            id: 'ex100',
            name: 'Hip Abduction Machine',
            muscles: ['Glutes']
        },
        {
            id: 'ex101',
            name: 'Hip Adduction Machine',
            muscles: ['Legs']
        },
        {
            id: 'ex102',
            name: 'Single Leg RDL',
            muscles: ['Hamstrings', 'Glutes', 'Back']
        },
        {
            id: 'ex103',
            name: 'Incline Dumbbell Curl',
            muscles: ['Biceps']
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
        } else {
            // For existing users, add new exercises if they don't have them
            const currentExercises = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES));
            const newExercisesToAdd = [];
            
            // Check for each sample exercise if the user already has it
            SAMPLE_EXERCISES.forEach(sampleExercise => {
                // Check if this exercise name already exists
                const exists = currentExercises.some(ex => 
                    ex.name.toLowerCase() === sampleExercise.name.toLowerCase());
                
                if (!exists) {
                    // Generate a new ID for the exercise to avoid conflicts
                    const newExercise = {
                        ...sampleExercise,
                        id: generateId()
                    };
                    newExercisesToAdd.push(newExercise);
                }
            });
            
            // If new exercises were found, add them
            if (newExercisesToAdd.length > 0) {
                const updatedExercises = [...currentExercises, ...newExercisesToAdd];
                localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updatedExercises));
            }
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
        
        // Initialize empty arrays for progress pictures metadata
        if (!localStorage.getItem(STORAGE_KEYS.PROGRESS_PICS_META)) {
            localStorage.setItem(STORAGE_KEYS.PROGRESS_PICS_META, JSON.stringify([]));
        }
        
        // Initialize empty array for goals
        if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
        }
        
        // Initialize progress pics IndexedDB if needed
        initializeProgressPicsDB();
        
        // Initialize settings if they don't exist
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            const defaultSettings = {
                weightUnit: 'lbs',
                theme: 'default',
                darkMode: false
            };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        } else {
            // Ensure theme setting exists in existing settings and handle migration from old format
            const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
            
            // Handle migration from old altTheme boolean format
            if (settings.altTheme !== undefined && settings.theme === undefined) {
                settings.theme = settings.altTheme ? 'blue' : 'default';
                delete settings.altTheme; // Remove old property
            } else if (settings.theme === undefined) {
                settings.theme = 'default';
            }
            
            // Add darkMode property if it doesn't exist
            if (settings.darkMode === undefined) {
                settings.darkMode = false;
            }
            
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        }
    };
    
    /**
     * Initialize IndexedDB for storing progress pictures
     */
    const initializeProgressPicsDB = () => {
        const dbName = 'ProgressPicsDB';
        const storeName = 'pictures';
        const dbVersion = 1;
        
        // Check if IndexedDB is supported
        if (!window.indexedDB) {
            console.error('Your browser does not support IndexedDB. Progress pictures will not work.');
            return;
        }
        
        // Open or create the database
        const request = indexedDB.open(dbName, dbVersion);
        
        // Handle database events
        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event.target.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
                console.log('Created IndexedDB store for progress pictures');
            }
        };
        
        request.onsuccess = () => {
            console.log('IndexedDB initialized for progress pictures');
        };
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
        const defaultSettings = { 
            weightUnit: 'lbs',
            theme: 'default',
            darkMode: false
        };
        
        return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
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
    
    /**
     * Get progress picture metadata from storage
     * @returns {Array} - Array of progress picture metadata objects
     */
    const getProgressPicsMeta = () => {
        const meta = localStorage.getItem(STORAGE_KEYS.PROGRESS_PICS_META);
        return meta ? JSON.parse(meta) : [];
    };
    
    /**
     * Save a progress picture to IndexedDB and its metadata to localStorage
     * @param {Object} picData - Picture metadata object
     * @param {Blob} imageBlob - The image blob to save
     * @returns {Promise<Object>} - Promise resolving to saved picture metadata object with ID
     */
    const saveProgressPic = (picData, imageBlob) => {
        return new Promise((resolve, reject) => {
            // Generate ID if not present
            if (!picData.id) {
                picData.id = generateId();
            }
            
            // Get all picture metadata
            const picsMeta = getProgressPicsMeta();
            
            // Add or update metadata
            const existingIndex = picsMeta.findIndex(pic => pic.id === picData.id);
            if (existingIndex !== -1) {
                picsMeta[existingIndex] = picData;
            } else {
                picsMeta.push(picData);
            }
            
            // Sort by date (newest first)
            picsMeta.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Save metadata to localStorage
            localStorage.setItem(STORAGE_KEYS.PROGRESS_PICS_META, JSON.stringify(picsMeta));
            
            // Save image to IndexedDB
            const dbName = 'ProgressPicsDB';
            const storeName = 'pictures';
            const dbRequest = indexedDB.open(dbName);
            
            dbRequest.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
            
            dbRequest.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Store image blob with same ID as metadata
                const item = {
                    id: picData.id,
                    image: imageBlob
                };
                
                const putRequest = store.put(item);
                
                putRequest.onsuccess = () => {
                    resolve(picData);
                };
                
                putRequest.onerror = (event) => {
                    console.error('Error saving image to IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            };
        });
    };
    
    /**
     * Get a progress picture image from IndexedDB by ID
     * @param {string} picId - ID of picture to retrieve
     * @returns {Promise<Blob>} - Promise resolving to image blob
     */
    const getProgressPicImage = (picId) => {
        return new Promise((resolve, reject) => {
            const dbName = 'ProgressPicsDB';
            const storeName = 'pictures';
            const dbRequest = indexedDB.open(dbName);
            
            dbRequest.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
            
            dbRequest.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                const getRequest = store.get(picId);
                
                getRequest.onsuccess = () => {
                    if (getRequest.result) {
                        resolve(getRequest.result.image);
                    } else {
                        reject(new Error('Image not found'));
                    }
                };
                
                getRequest.onerror = (event) => {
                    console.error('Error retrieving image from IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            };
        });
    };
    
    /**
     * Delete a progress picture by ID
     * @param {string} picId - ID of picture to delete
     * @returns {Promise<boolean>} - Promise resolving to success status
     */
    const deleteProgressPic = (picId) => {
        return new Promise((resolve, reject) => {
            // Remove from metadata
            const picsMeta = getProgressPicsMeta();
            const filteredPics = picsMeta.filter(pic => pic.id !== picId);
            
            if (filteredPics.length === picsMeta.length) {
                // Picture not found in metadata
                resolve(false);
                return;
            }
            
            // Update metadata in localStorage
            localStorage.setItem(STORAGE_KEYS.PROGRESS_PICS_META, JSON.stringify(filteredPics));
            
            // Remove from IndexedDB
            const dbName = 'ProgressPicsDB';
            const storeName = 'pictures';
            const dbRequest = indexedDB.open(dbName);
            
            dbRequest.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
            
            dbRequest.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                const deleteRequest = store.delete(picId);
                
                deleteRequest.onsuccess = () => {
                    resolve(true);
                };
                
                deleteRequest.onerror = (event) => {
                    console.error('Error deleting image from IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            };
        });
    };
    
    /**
     * Get all goals from storage
     * @returns {Array} - Array of goal objects
     */
    const getGoals = () => {
        const goals = localStorage.getItem(STORAGE_KEYS.GOALS);
        return goals ? JSON.parse(goals) : [];
    };
    
    /**
     * Save goals to storage
     * @param {Array} goals - Array of goal objects to save
     * @returns {Array} - Saved array of goals
     */
    const saveGoals = (goals) => {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return goals;
    };
    
    /**
     * Get user profile information
     * @returns {Object} - User profile object
     */
    const getUserProfile = () => {
        const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return profile ? JSON.parse(profile) : null;
    };
    
    /**
     * Save user profile information
     * @param {Object} profile - User profile object to save
     * @returns {Object} - Saved profile object
     */
    const saveUserProfile = (profile) => {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        return profile;
    };
    
        /**
     * Get storage usage and capacity information
     * @returns {Promise<Object>} - Object containing storage usage info
     */
    const getStorageInfo = async () => {
        // Calculate localStorage usage
        let localStorageSize = 0;
        let localStorageInfo = {};
        
        // Calculate each key's size
        for (let key in STORAGE_KEYS) {
            const data = localStorage.getItem(STORAGE_KEYS[key]);
            if (data) {
                const size = new Blob([data]).size;
                localStorageSize += size;
                localStorageInfo[STORAGE_KEYS[key]] = size;
            }
        }
        
        // Calculate IndexedDB usage for progress pics
        let indexedDBSize = 0;
        
        try {
            const dbName = 'ProgressPicsDB';
            const storeName = 'pictures';
            
            return new Promise((resolve) => {
                const request = indexedDB.open(dbName);
                
                request.onerror = () => {
                    // If error, just return local storage info
                    resolve({
                        localStorage: {
                            usage: localStorageSize,
                            capacity: 5 * 1024 * 1024, // Approximate 5MB limit
                            usagePercent: (localStorageSize / (5 * 1024 * 1024) * 100).toFixed(2),
                            details: localStorageInfo
                        },
                        indexedDB: {
                            usage: 0,
                            capacity: 'Unknown',
                            usagePercent: 0,
                            details: {}
                        }
                    });
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const cursorRequest = store.openCursor();
                    
                    cursorRequest.onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (cursor) {
                            // Add the size of the current record to the total
                            if (cursor.value && cursor.value.image) {
                                const size = cursor.value.image.size || 0;
                                indexedDBSize += size;
                            }
                            cursor.continue();
                        } else {
                            // When no more records, resolve with the final sizes
                            resolve({
                                localStorage: {
                                    usage: localStorageSize,
                                    capacity: 5 * 1024 * 1024, // Approximate 5MB limit
                                    usagePercent: (localStorageSize / (5 * 1024 * 1024) * 100).toFixed(2),
                                    details: localStorageInfo
                                },
                                indexedDB: {
                                    usage: indexedDBSize,
                                    capacity: 50 * 1024 * 1024, // Approximate 50MB limit for most browsers
                                    usagePercent: (indexedDBSize / (50 * 1024 * 1024) * 100).toFixed(2),
                                    details: { 'pictures': indexedDBSize }
                                }
                            });
                        }
                    };
                    
                    cursorRequest.onerror = () => {
                        // If error, just return local storage info
                        resolve({
                            localStorage: {
                                usage: localStorageSize,
                                capacity: 5 * 1024 * 1024, // Approximate 5MB limit
                                usagePercent: (localStorageSize / (5 * 1024 * 1024) * 100).toFixed(2),
                                details: localStorageInfo
                            },
                            indexedDB: {
                                usage: 0,
                                capacity: 'Unknown',
                                usagePercent: 0,
                                details: {}
                            }
                        });
                    };
                };
            });
        } catch (error) {
            return {
                localStorage: {
                    usage: localStorageSize,
                    capacity: 5 * 1024 * 1024, // Approximate 5MB limit
                    usagePercent: (localStorageSize / (5 * 1024 * 1024) * 100).toFixed(2),
                    details: localStorageInfo
                },
                indexedDB: {
                    usage: 0,
                    capacity: 'Unknown',
                    usagePercent: 0,
                    details: {}
                }
            };
        }
    };

    /**
     * Save the active workout state
     * @param {Object} workout - Active workout object
     * @param {Object} state - Additional workout state (indexes, time, etc)
     * @returns {Object} - Saved workout state
     */
    const saveActiveWorkout = (workout, state) => {
        if (!workout) return null;
        
        const activeWorkoutState = {
            workout: workout,
            state: state,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkoutState));
        return activeWorkoutState;
    };
    
    /**
     * Get the active workout state if exists
     * @returns {Object|null} - Active workout state or null if none exists
     */
    const getActiveWorkout = () => {
        const activeWorkout = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        return activeWorkout ? JSON.parse(activeWorkout) : null;
    };
    
    /**
     * Clear the active workout state
     * @returns {boolean} - Success status
     */
    const clearActiveWorkout = () => {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        return true;
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
        getProgressPicsMeta,
        saveProgressPic,
        getProgressPicImage,
        deleteProgressPic,
        getSettings,
        saveSettings,
        getMuscleGroups,
        getPersonalRecords,
        getExerciseProgress,
        getGoals,
        saveGoals,
        getUserProfile,
        saveUserProfile,
        generateId,
        getStorageInfo,
        saveActiveWorkout,
        getActiveWorkout,
        clearActiveWorkout
    };
})();

// Initialize storage when the script loads
DataManager.initializeStorage();
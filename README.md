# LiftMate Workout Tracker

LiftMate is a web-based workout tracking application with a custom Material Design 3 UI, enhanced data visualizations, and micro-interactions.

## Features

- **Workout Templates**: Create and manage custom workout templates
- **Exercise Library**: Track exercises with target muscle groups
- **Workout History**: View past workouts and analyze progress
- **Stats Dashboard**: Visualize workout trends and personal records
- **Progress Tracking**: Track weights, reps, and progress over time
- **Body Weight Tracker**: Monitor body weight changes
- **Progress Photos**: Store and compare progress pictures
- **Goal Setting**: Set and track fitness goals

## Custom Icon System

LiftMate includes a comprehensive custom icon system designed to create a unique brand identity while improving user understanding of different workout types and functions.

### Using Custom Icons

1. **Include the CSS file**
   Make sure `icons.css` is linked in your HTML:

   ```html
   <link rel="stylesheet" href="css/icons.css">
   ```

2. **Basic Icon Usage**
   To use an icon, use the following structure:

   ```html
   <span class="icon">
     <!-- SVG icon code here -->
   </span>
   ```

3. **Icon Sizes**
   Control icon size with these classes:
   - `icon-sm`: 18px × 18px
   - `icon-md`: 24px × 24px (default)
   - `icon-lg`: 32px × 32px
   - `icon-xl`: 48px × 48px

4. **Icon Colors**
   Icon colors inherit from the parent by default. Use these classes for specific colors:
   - `icon-primary`
   - `icon-secondary`
   - `icon-tertiary`
   - `icon-surface`
   - `icon-error`

5. **Icon Buttons**
   Create clickable icons with:

   ```html
   <button class="icon-button">
     <span class="icon">
       <!-- SVG icon code here -->
     </span>
   </button>
   ```

### Viewing the Icon Demo

Open `icon-demo.html` in your browser to see all available icons and examples of their usage.

## Directory Structure

```
/
├── assets/                # Assets directory
│   ├── icons/             # SVG icons organized by category
│   │   ├── actions/       # Action icons (add, edit, delete, etc.)
│   │   ├── achievements/  # Achievement icons (PR badge, streak, etc.)
│   │   ├── equipment/     # Equipment icons (dumbbells, barbells, etc.)
│   │   ├── muscle-groups/ # Muscle group icons (chest, back, etc.)
│   │   ├── navigation/    # Navigation tab icons
│   │   └── workout-types/ # Workout type icons (strength, cardio, etc.)
│   └── illustrations/     # Larger illustrations for UI states
│
├── css/                   # CSS stylesheets
│   ├── animations.css     # Animation definitions
│   ├── icons.css          # Custom icon system styles
│   ├── micro-interactions.css  # Micro-interaction styles
│   └── styles.css         # Main stylesheet
│
├── js/                    # JavaScript modules
│   ├── animations.js      # Animation handlers
│   ├── app.js             # Main application module
│   ├── data.js            # Data management module
│   ├── exercises.js       # Exercise management
│   ├── goals.js           # Goal tracking
│   ├── history.js         # Workout history
│   ├── progress-pics.js   # Progress pictures
│   ├── progress.js        # Progress tracking
│   ├── stats.js           # Statistics and analytics
│   ├── templates.js       # Workout templates
│   ├── ui.js              # UI utilities
│   ├── visualizations.js  # Enhanced data visualizations
│   ├── weight.js          # Weight tracking
│   └── workout.js         # Active workout handler
│
├── index.html             # Main application HTML
├── icon-demo.html         # Icon system demonstration
└── manifest.json          # Web app manifest
```

## Development

1. Clone the repository
2. Open `index.html` in your browser
3. To view the custom icon system, open `icon-demo.html`

## Accessibility

All icons that convey meaning include appropriate ARIA attributes:
- `aria-hidden="true"` when used with text
- Appropriate `aria-label` when used standalone
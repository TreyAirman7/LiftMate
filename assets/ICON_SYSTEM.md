# LiftMate Custom Icon System

This document outlines the comprehensive custom icon system for the LiftMate workout tracking app.

## Icon Design Principles

All icons in the LiftMate system adhere to the following design principles:

- **Consistency**: Uniform weight, style, and corner radius
- **Clarity**: Clear meaning at different sizes (24px, 32px, 48px)
- **Simplicity**: Minimal design with essential details only
- **Material Design 3 compatibility**: Works with the app's design system

## Icon Categories

### Navigation Icons
Icons used in the bottom navigation and main app navigation.

- workout.svg - Dumbbell icon for current workout
- stats.svg - Chart line icon for statistics
- progress.svg - Chart bar icon for progress
- exercises.svg - Running/exercise icon for exercises
- history.svg - Clock/history icon for workout history
- goals.svg - Target/bullseye icon for goals
- pics.svg - Camera icon for progress pictures

### Workout Type Icons
Icons representing different workout types.

- strength.svg - Heavy weight icon
- hypertrophy.svg - Muscle growth icon
- endurance.svg - Stamina/repetition icon
- cardio.svg - Heart/pulse icon
- flexibility.svg - Stretching figure icon
- mobility.svg - Joint movement icon
- hiit.svg - Interval training icon
- circuit.svg - Circuit training icon

### Equipment Icons
Icons for different workout equipment.

- dumbbell.svg - Dumbbell
- barbell.svg - Barbell
- kettlebell.svg - Kettlebell
- machine.svg - Weight machine
- bodyweight.svg - Person figure (bodyweight)
- resistance-band.svg - Resistance band
- cable.svg - Cable machine
- bench.svg - Workout bench
- pullup-bar.svg - Pull-up bar
- medicine-ball.svg - Medicine ball

### Muscle Group Icons
Icons representing different muscle groups.

- chest.svg - Chest muscles
- back.svg - Back muscles
- shoulders.svg - Shoulder muscles
- biceps.svg - Biceps muscles
- triceps.svg - Triceps muscles
- forearms.svg - Forearm muscles
- abs.svg - Abdominal muscles
- legs.svg - Legs (full)
- quads.svg - Quadriceps
- hamstrings.svg - Hamstring muscles
- glutes.svg - Glute muscles
- calves.svg - Calf muscles
- traps.svg - Trapezius muscles
- obliques.svg - Oblique muscles
- neck.svg - Neck muscles
- lats.svg - Latissimus dorsi muscles

### Action Icons
Icons for common actions in the app.

- add.svg - Plus icon for adding items
- edit.svg - Pencil icon for editing
- delete.svg - Trash icon for deleting
- start.svg - Play icon for starting workouts
- complete.svg - Checkmark for completing items
- cancel.svg - X icon for canceling
- timer.svg - Timer icon for rest periods
- weight.svg - Weight tracking icon
- calendar.svg - Calendar for date selection
- search.svg - Magnifying glass for search
- filter.svg - Filter icon for filtering content
- more.svg - Three dots for more options
- settings.svg - Gear icon for settings

### Achievement Icons
Icons for achievements and milestones.

- pr-badge.svg - Personal record badge
- streak.svg - Streak/consistency icon
- milestone.svg - Trophy/milestone completion
- level-up.svg - Level-up indicator

## Illustrations

### Exercise Illustrations
Simple human figure illustrations for exercise demonstrations.

- squat.svg - Squat position figure
- bench-press.svg - Bench press position
- deadlift.svg - Deadlift position
- overhead-press.svg - Overhead press position
- pullup.svg - Pull-up position

### Status Illustrations
Illustrations for app states and achievements.

- empty-state.svg - Empty state illustration
- workout-complete.svg - Workout completion celebration
- progress.svg - Progress/improvement visual

## Technical Specifications

- **Format**: SVG for all icons and illustrations
- **Size**: Base size 24x24px with proper scaling
- **Color**: Use currentColor for easy theming
- **Stroke width**: Consistent 2px stroke for all icons
- **Corner radius**: 2px for square corners, 4px for rounded elements
- **File naming**: lowercase-with-hyphens.svg
- **Optimization**: All SVGs optimized for file size and clean code

## Implementation

Icons are implemented using inline SVG for best performance and styling control. All icons use the currentColor value for stroke/fill to automatically inherit text color from parent elements.

### Usage Example

```html
<span class="icon icon-dumbbell">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- SVG path data -->
  </svg>
</span>
```

## Accessibility

All icons that convey meaning include:
- `aria-hidden="true"` when used with text
- Appropriate aria-label when used standalone
- Sufficient contrast ratios against backgrounds
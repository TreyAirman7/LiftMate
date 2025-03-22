# LiftMate Custom Icon System

This directory contains the custom iconography and illustration system for the LiftMate workout tracking app. 

## Directory Structure

```
assets/
├── icons/
│   ├── actions/           # Icons for common app actions (add, edit, delete, etc.)
│   ├── achievements/      # Icons for user achievements (PR badges, streaks, etc.)
│   ├── equipment/         # Icons for workout equipment (dumbbells, barbells, etc.)
│   ├── muscle-groups/     # Icons for different muscle groups (chest, back, etc.)
│   ├── navigation/        # Icons for app navigation tabs
│   └── workout-types/     # Icons for different workout types (strength, cardio, etc.)
└── illustrations/         # Larger illustrations for empty states, celebrations, etc.
```

## Implementation Guide

### 1. Adding the CSS file

Ensure the icons.css file is linked in your HTML:

```html
<link rel="stylesheet" href="css/icons.css">
```

### 2. Using icons in HTML

Icons can be used in two main ways:

#### As standalone icons:

```html
<span class="icon">
  <svg class="icon-md">
    <!-- Include the SVG content here -->
  </svg>
</span>
```

#### As background in icon buttons:

```html
<button class="icon-button">
  <span class="icon">
    <!-- Include the SVG content here -->
  </span>
</button>
```

### 3. Icon Sizing

Use these classes to control icon size:

- `icon-sm`: 18px × 18px
- `icon-md`: 24px × 24px (default)
- `icon-lg`: 32px × 32px
- `icon-xl`: 48px × 48px

### 4. Icon Colors

Icon colors inherit from the parent text color by default. You can use these utility classes to apply specific colors:

- `icon-primary`: Primary color
- `icon-secondary`: Secondary color
- `icon-tertiary`: Tertiary color
- `icon-surface`: Surface text color
- `icon-error`: Error color

### 5. Themed Containers

For icons with circular backgrounds:

```html
<span class="icon-circle">
  <svg class="icon-md">
    <!-- Include the SVG content here -->
  </svg>
</span>
```

### 6. Accessibility

When using icons without accompanying text, include appropriate aria attributes:

```html
<button class="icon-button" aria-label="Delete item">
  <span class="icon">
    <!-- SVG icon -->
  </span>
</button>
```

For decorative icons that appear alongside text, use `aria-hidden="true"`:

```html
<button class="button primary">
  <span class="icon" aria-hidden="true">
    <!-- SVG icon -->
  </span>
  Delete
</button>
```

## Custom Illustrations

Illustrations can be included directly as img elements:

```html
<img src="assets/illustrations/empty-state.svg" alt="No items found" class="illustration">
```

Or as background images in CSS:

```css
.empty-state {
  background-image: url('../assets/illustrations/empty-state.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
```
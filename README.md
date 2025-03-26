# LiftMate

![LiftMate Logo](LiftMate.png)

A comprehensive mobile-first workout tracking Progressive Web App (PWA) designed to help fitness enthusiasts track their gym progress.

## Overview

LiftMate is a feature-rich gym companion that allows users to create custom workouts, track progress, set goals, and visualize fitness journeys. Built as a PWA, it works offline and can be installed on mobile devices for a native app-like experience.

## Features

- **Workout Management**
  - Create and save custom workout templates
  - Track active workouts with sets, reps, and weights
  - Rest timer functionality
  - One-rep max calculations

- **Exercise Library**
  - Custom exercise creation with muscle group targeting
  - Personal records tracking
  - Filter exercises by muscle groups

- **Progress Tracking**
  - Visual strength progression charts
  - Body weight tracking
  - Progress photo storage and comparisons

- **Statistics & Analytics**
  - Comprehensive workout statistics
  - Total volume, duration, and frequency metrics
  - Performance trends over time

- **Goal Setting**
  - Exercise weight targets
  - Gym frequency goals
  - Body weight goals
  - Visual progress indicators

## Technology

- Pure JavaScript (no frameworks)
- LocalStorage for data persistence
- IndexedDB for image storage
- Service Worker for offline capability
- Responsive design with custom CSS

## Installation

### Mobile (iOS)

1. Open Safari and navigate to the LiftMate GitHub Pages URL
2. Tap the Share icon (box with arrow)
3. Select "Add to Home Screen"
4. Name the app and tap "Add"
5. The app will appear on your home screen with full offline capability

### Mobile (Android)

1. Open Chrome and navigate to the LiftMate GitHub Pages URL
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. The app will appear on your home screen with full offline capability

### Desktop

- Use Chrome or Edge and look for the install icon in the address bar
- Alternatively, use the browser's menu to install

## Data Privacy

All user data is stored locally on your device. No information is transmitted to external servers.

## GitHub Pages Deployment

This project is designed to be deployed on GitHub Pages for easy access across devices. The deployed version can be accessed directly from any browser and installed as a PWA.

## Development & Running Locally

Due to browser security restrictions, this application should be served through a local web server rather than opened directly as files. This prevents CORS (Cross-Origin Resource Sharing) errors when accessing local resources like the manifest.json file.

### Option 1: Using Python's built-in server

If you have Python installed:

```bash
# Navigate to the application directory
cd /path/to/LiftMate

# Start a simple HTTP server on port 8000
python -m http.server
```

Then open your browser and navigate to: http://localhost:8000

### Option 2: Using Node.js

If you have Node.js installed:

```bash
# Navigate to the application directory  
cd /path/to/LiftMate

# Install serve if you don't have it
npm install -g serve

# OR use npx to run it without installing
npx serve
```

Then open your browser and navigate to the URL shown in the terminal (typically http://localhost:3000 or http://localhost:5000).

## License

MIT License
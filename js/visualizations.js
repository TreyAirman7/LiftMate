/**
 * LiftMate - Enhanced Visualizations Module
 * Handles advanced data visualization with responsive and interactive charts
 */

// Register a custom plugin for chart backgrounds
Chart.register({
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart) => {
        // Get background color from CSS variable or option
        let backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-background').trim();
        
        // If no CSS variable is set, use the option from the chart
        if (!backgroundColor && chart.options.plugins.customCanvasBackgroundColor?.color) {
            backgroundColor = chart.options.plugins.customCanvasBackgroundColor.color;
        }
        
        // If we have a background color, apply it
        if (backgroundColor) {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    }
});

const VisualizationManager = (() => {
    // Module state
    let charts = {};
    // Function to get current theme colors from CSS variables with enhanced robustness
    const getThemeColors = () => {
        try {
            // First try to use the UI's theme color system if available
            if (typeof UI !== 'undefined' && typeof UI.getThemeColors === 'function') {
                const uiThemeColors = UI.getThemeColors(DataManager.getSettings().theme);
                
                // Parse CSS color to RGBA (shared utility function)
                const cssColorToRGBA = (color, opacity = 1) => {
                    if (!color) return null;
                    
                    // Handle hex colors
                    if (color.startsWith('#')) {
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    }
                    // Handle rgb colors
                    else if (color.startsWith('rgb(')) {
                        const vals = color.match(/\d+/g);
                        if (vals && vals.length >= 3) {
                            return `rgba(${vals[0]}, ${vals[1]}, ${vals[2]}, ${opacity})`;
                        }
                    }
                    // Handle rgba colors
                    else if (color.startsWith('rgba(')) {
                        if (opacity === 1) return color;
                        const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                        if (parts && parts.length >= 5) {
                            return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
                        }
                    }
                    return color;
                };
                
                // Build color palette using the UI theme colors
                return {
                    primary: cssColorToRGBA(uiThemeColors.primary, 1),
                    primaryLight: cssColorToRGBA(uiThemeColors.primary, 0.7),
                    primaryContainer: cssColorToRGBA(uiThemeColors.primaryContainer, 1),
                    secondary: cssColorToRGBA(uiThemeColors.secondary, 1),
                    secondaryLight: cssColorToRGBA(uiThemeColors.secondary, 0.7),
                    tertiary: cssColorToRGBA(uiThemeColors.tertiary, 1) || 'rgba(125, 82, 96, 1)',
                    tertiaryLight: cssColorToRGBA(uiThemeColors.tertiary, 0.7) || 'rgba(125, 82, 96, 0.7)',
                    success: 'rgba(46, 125, 50, 1)', // --success-color
                    successLight: 'rgba(46, 125, 50, 0.7)',
                    error: 'rgba(179, 38, 30, 1)', // --danger-color
                    surface: document.documentElement.classList.contains('dark-mode') 
                        ? '#121212' 
                        : '#FFFBFE',
                    outline: document.documentElement.classList.contains('dark-mode')
                        ? 'rgba(200, 200, 200, 0.2)'
                        : 'rgba(80, 80, 80, 0.2)',
                    
                    // Generate muscle group heat map colors dynamically based on theme
                    getMuscleHeatColors: () => {
                        // Use the primary color from UI theme system
                        const primaryColor = uiThemeColors.primary;
                        let r, g, b;
                        
                        if (primaryColor.startsWith('#')) {
                            r = parseInt(primaryColor.slice(1, 3), 16);
                            g = parseInt(primaryColor.slice(3, 5), 16);
                            b = parseInt(primaryColor.slice(5, 7), 16);
                        } else {
                            // Try to parse RGB format
                            const rgbMatch = primaryColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) || 
                                            primaryColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
                            
                            if (rgbMatch) {
                                r = parseInt(rgbMatch[1]);
                                g = parseInt(rgbMatch[2]);
                                b = parseInt(rgbMatch[3]);
                            } else {
                                // Fallback if color format isn't recognized
                                return [
                                    'rgba(233, 236, 239, 1)', // Lowest intensity
                                    'rgba(223, 215, 242, 1)', 
                                    'rgba(190, 174, 226, 1)',
                                    'rgba(157, 133, 210, 1)',
                                    'rgba(126, 103, 183, 1)',
                                    'rgba(103, 80, 164, 1)'    // Highest intensity (purple)
                                ];
                            }
                        }
                        
                        // Calculate 6 gradient steps from light gray to theme color
                        return [
                            'rgba(233, 236, 239, 1)', // Lowest intensity (light gray)
                            `rgba(${Math.round(0.8*233 + 0.2*r)}, ${Math.round(0.8*236 + 0.2*g)}, ${Math.round(0.8*239 + 0.2*b)}, 1)`,
                            `rgba(${Math.round(0.6*233 + 0.4*r)}, ${Math.round(0.6*236 + 0.4*g)}, ${Math.round(0.6*239 + 0.4*b)}, 1)`,
                            `rgba(${Math.round(0.4*233 + 0.6*r)}, ${Math.round(0.4*236 + 0.6*g)}, ${Math.round(0.4*239 + 0.6*b)}, 1)`,
                            `rgba(${Math.round(0.2*233 + 0.8*r)}, ${Math.round(0.2*236 + 0.8*g)}, ${Math.round(0.2*239 + 0.8*b)}, 1)`,
                            `rgba(${r}, ${g}, ${b}, 1)`  // Highest intensity (theme color)
                        ];
                    }
                };
            }
            
            // Fallback to CSS variables if UI theme system isn't available
            const root = document.documentElement;
            const getColor = (varName) => getComputedStyle(root).getPropertyValue(varName).trim();
            
            // Parse CSS color to RGBA
            const cssColorToRGBA = (color, opacity = 1) => {
                // Handle hex colors
                if (color.startsWith('#')) {
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                }
                // Handle rgb colors
                else if (color.startsWith('rgb(')) {
                    const vals = color.match(/\d+/g);
                    if (vals && vals.length >= 3) {
                        return `rgba(${vals[0]}, ${vals[1]}, ${vals[2]}, ${opacity})`;
                    }
                }
                // Handle rgba colors
                else if (color.startsWith('rgba(')) {
                    if (opacity === 1) return color;
                    const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    if (parts && parts.length >= 5) {
                        return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
                    }
                }
                return color;
            };
            
            // Get primary color from CSS variables
            const primaryColor = getColor('--md-primary');
            const primaryRGBA = cssColorToRGBA(primaryColor, 1);
            const primaryLightRGBA = cssColorToRGBA(primaryColor, 0.7);
            
            // Get other colors
            const primaryContainerColor = getColor('--md-primary-container');
            const secondaryColor = getColor('--md-secondary');
            const secondaryLightRGBA = cssColorToRGBA(secondaryColor, 0.7);
            
            return {
                primary: primaryRGBA,
                primaryLight: primaryLightRGBA,
                primaryContainer: primaryContainerColor,
                secondary: secondaryColor,
                secondaryLight: secondaryLightRGBA,
                tertiary: 'rgba(125, 82, 96, 1)', // --md-tertiary
                tertiaryLight: 'rgba(125, 82, 96, 0.7)',
                success: 'rgba(46, 125, 50, 1)', // --success-color
                successLight: 'rgba(46, 125, 50, 0.7)',
                error: 'rgba(179, 38, 30, 1)', // --danger-color
                surface: getColor('--md-surface'),
                outline: getColor('--md-outline'),
                
                // Generate muscle group heat map colors dynamically based on theme
                getMuscleHeatColors: () => {
                    const primaryColor = getColor('--md-primary');
                    const rgbMatch = primaryColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) || 
                                    primaryColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
                    
                    let r, g, b;
                    if (rgbMatch) {
                        r = parseInt(rgbMatch[1]);
                        g = parseInt(rgbMatch[2]);
                        b = parseInt(rgbMatch[3]);
                    } else if (primaryColor.startsWith('#')) {
                        r = parseInt(primaryColor.slice(1, 3), 16);
                        g = parseInt(primaryColor.slice(3, 5), 16);
                        b = parseInt(primaryColor.slice(5, 7), 16);
                    } else {
                        // Fallback if color format isn't recognized
                        return [
                            'rgba(233, 236, 239, 1)', // Lowest intensity
                            'rgba(223, 215, 242, 1)', 
                            'rgba(190, 174, 226, 1)',
                            'rgba(157, 133, 210, 1)',
                            'rgba(126, 103, 183, 1)',
                            'rgba(103, 80, 164, 1)'  // Highest intensity
                        ];
                    }
                    
                    // Calculate 6 gradient steps from light gray to theme color
                    return [
                        'rgba(233, 236, 239, 1)', // Lowest intensity (light gray)
                        `rgba(${Math.round(0.8*233 + 0.2*r)}, ${Math.round(0.8*236 + 0.2*g)}, ${Math.round(0.8*239 + 0.2*b)}, 1)`,
                        `rgba(${Math.round(0.6*233 + 0.4*r)}, ${Math.round(0.6*236 + 0.4*g)}, ${Math.round(0.6*239 + 0.4*b)}, 1)`,
                        `rgba(${Math.round(0.4*233 + 0.6*r)}, ${Math.round(0.4*236 + 0.6*g)}, ${Math.round(0.4*239 + 0.6*b)}, 1)`,
                        `rgba(${Math.round(0.2*233 + 0.8*r)}, ${Math.round(0.2*236 + 0.8*g)}, ${Math.round(0.2*239 + 0.8*b)}, 1)`,
                        `rgba(${r}, ${g}, ${b}, 1)`  // Highest intensity (theme color)
                    ];
                }
            };
        } catch (error) {
            console.error('Error getting theme colors, using fallback:', error);
            
            // Extreme fallback in case everything fails
            return {
                primary: 'rgba(103, 80, 164, 1)', // Default purple
                primaryLight: 'rgba(103, 80, 164, 0.7)',
                primaryContainer: 'rgba(234, 221, 255, 1)',
                secondary: 'rgba(98, 91, 113, 1)',
                secondaryLight: 'rgba(98, 91, 113, 0.7)',
                tertiary: 'rgba(125, 82, 96, 1)',
                tertiaryLight: 'rgba(125, 82, 96, 0.7)',
                success: 'rgba(46, 125, 50, 1)',
                successLight: 'rgba(46, 125, 50, 0.7)',
                error: 'rgba(179, 38, 30, 1)',
                surface: document.documentElement.classList.contains('dark-mode') 
                    ? '#121212' 
                    : '#FFFBFE',
                outline: 'rgba(121, 116, 126, 1)',
                
                // Generate muscle group heat map colors with fixed values
                getMuscleHeatColors: () => [
                    'rgba(233, 236, 239, 1)',
                    'rgba(223, 215, 242, 1)', 
                    'rgba(190, 174, 226, 1)',
                    'rgba(157, 133, 210, 1)',
                    'rgba(126, 103, 183, 1)',
                    'rgba(103, 80, 164, 1)'
                ]
            };
        }
    };
    
    // Initialize colorPalette with current theme colors
    let colorPalette = getThemeColors();

    /**
     * Configure global Chart.js defaults
     */
    const configureChartDefaults = () => {
        // Add custom CSS for legends
        const customCSS = document.createElement('style');
        customCSS.type = 'text/css';
        customCSS.innerHTML = `
            .chartjs-legend li span, 
            ul.doughnut-legend li span,
            ul.chart-legend li span {
                display: inline-block !important;
                padding: 3px 6px !important;
                background-color: rgba(255, 255, 255, 0.2) !important;
                border-radius: 3px !important;
                margin: 2px !important;
                box-shadow: 0 0 3px rgba(0, 0, 0, 0.3) !important;
            }
        `;
        document.head.appendChild(customCSS);
        
        // Make sure Chart is defined
        if (!window.Chart) {
            console.error('Chart.js is not loaded!');
            return;
        }
        
        // Make sure plugins are properly registered
        try {
            // Register the annotation plugin
            if (window.ChartAnnotation) {
                Chart.register(window.ChartAnnotation);
            }
            
            // Register the datalabels plugin
            if (window.ChartDataLabels) {
                Chart.register(window.ChartDataLabels);
            }
            
            // Configure global defaults for Chart.js
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            Chart.defaults.color = isDarkMode ? '#FFFFFF' : '#000000';
            Chart.defaults.font.size = 16;
            
            // Listen for theme or dark mode changes to update chart colors
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        // Update Chart.js defaults when theme or dark mode is toggled
                        const isDarkMode = document.documentElement.classList.contains('dark-mode');
                        Chart.defaults.color = isDarkMode ? '#FFFFFF' : '#000000';
                        
                        // Update colorPalette with new theme colors
                        colorPalette = getThemeColors();
                        
                        // Update all active charts
                        Object.values(charts).forEach(chart => {
                            if (chart && typeof chart.update === 'function') {
                                // Update legend text color for all charts
                                if (chart.options && chart.options.plugins && chart.options.plugins.legend) {
                                    // Set legend text color based on mode
                                    const isDarkMode = document.body.classList.contains('dark-mode');
                                    chart.options.plugins.legend.labels.color = isDarkMode ? '#FFFFFF' : '#000000';
                                    chart.options.plugins.legend.labels.textStrokeColor = isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.4)';
                                    chart.options.plugins.legend.labels.textStrokeWidth = isDarkMode ? 5 : 3;
                                    
                                    // Add semi-transparent white background to legend items
                                    chart.options.plugins.legend.labels.borderRadius = 3;
                                    chart.options.plugins.legend.labels.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    chart.options.plugins.legend.labels.padding = 15;
                                    chart.options.plugins.legend.labels.usePointStyle = true;
                                    
                                    // Create background for better visibility
                                    chart.options.plugins.legend.labels.boxWidth = 40;
                                    chart.options.plugins.legend.labels.boxHeight = 20;
                                    
                                    // Set uppercase text for better readability
                                    if (!chart.options.plugins.legend.labels.generateLabels) {
                                        chart.options.plugins.legend.labels.generateLabels = function(chart) {
                                            // Get default implementation
                                            let originalGenerateLabels;
                                            if (chart.config.type === 'pie' || chart.config.type === 'doughnut') {
                                                originalGenerateLabels = Chart.overrides.pie.plugins.legend.labels.generateLabels;
                                            } else {
                                                originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                                            }
                                            
                                            const originalLabels = originalGenerateLabels(chart);
                                            
                                            // Customize each label for better visibility
                                            return originalLabels.map(label => {
                                                label.text = label.text.toUpperCase();
                                                return label;
                                            });
                                        };
                                    }
                                }
                                
                                // Update datalabels color for all charts
                                if (chart.options && chart.options.plugins && chart.options.plugins.datalabels) {
                                    if (chart.canvas && chart.canvas.id === 'volume-distribution-chart') {
                                        // Force consistent styling for Volume by Muscle Group chart
                                        // Always white text with black background regardless of mode
                                        chart.options.plugins.datalabels.color = '#FFFFFF';
                                        chart.options.plugins.datalabels.textStrokeColor = 'rgba(0, 0, 0, 1)';
                                        chart.options.plugins.datalabels.textStrokeWidth = 4;
                                        chart.options.plugins.datalabels.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                                        chart.options.plugins.datalabels.borderRadius = 10;
                                        chart.options.plugins.datalabels.padding = 4;
                                    }
                                }
                                chart.update();
                            }
                        });
                    }
                });
            });
            
            // Start observing theme and dark mode changes
            observer.observe(document.body, { attributes: true });
            observer.observe(document.documentElement, { attributes: true });
        } catch (e) {
            console.warn('Could not register Chart.js plugins:', e);
        }
        
        // Set global Chart.js options
        Chart.defaults.font.family = "var(--visualization-font-family)";
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--md-on-surface').trim();
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Enhanced animations - with safety checks for older Chart.js versions
        try {
            Chart.defaults.animation.duration = 800;
            Chart.defaults.animation.easing = 'easeOutQuart';
            
            // Check if the version supports complex animations
            if (Chart.version && parseInt(Chart.version.split('.')[0]) >= 3) {
                // Simpler animation config that's more compatible
                Chart.defaults.plugins.legend.animation = {
                    duration: 500,
                    easing: 'easeOutQuart'
                };
                
                Chart.defaults.plugins.tooltip.animation = {
                    duration: 200,
                    easing: 'easeOutQuad'
                };
            }
        } catch (e) {
            console.warn('Could not set advanced Chart.js animations:', e);
        }
        
        // Custom tooltip styling
        // Get the primary color from CSS for chart tooltips
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--md-primary').trim();
        // Convert to RGBA with 0.9 opacity
        const tooltipColor = primaryColor.startsWith('#') ? 
            `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.9)` :
            primaryColor.startsWith('rgb(') ? 
                primaryColor.replace('rgb(', 'rgba(').replace(')', ', 0.9)') : 
                'rgba(103, 80, 164, 0.9)'; // Fallback

        Chart.defaults.plugins.tooltip.backgroundColor = tooltipColor;
        Chart.defaults.plugins.tooltip.titleColor = '#fff';
        Chart.defaults.plugins.tooltip.bodyColor = '#fff';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.2)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.displayColors = false;
        
        // Register custom elements if needed
        registerCustomChartElements();
    };
    
    /**
     * Register custom chart elements and plugins
     */
    const registerCustomChartElements = () => {
        // Custom animations and transitions
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        
        // Register chart type for muscle group heat map
        Chart.register({
            id: 'muscleGroupHighlight',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--md-surface').trim();
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        });
    };
    
    /**
     * Create containers for new visualizations
     */
    const createVisualizationContainers = () => {
        // Create container for visualizations
        const statsContainer = document.querySelector('#statistics .container');
        if (statsContainer) {
            // Add new visualization sections
            // Removed Workout Progress Timeline feature
            
            const muscleGroupSection = document.createElement('div');
            muscleGroupSection.innerHTML = `
                <div class="section-header">
                    <div class="title-wrapper">
                        <div class="title-icon"><i class="fas fa-universal-access"></i></div>
                        <h2>Muscle Group Focus</h2>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="muscle-heatmap-container">
                        <div class="muscle-map-svg-container">
                            <div id="muscle-map-front" class="muscle-map active"></div>
                            <div id="muscle-map-back" class="muscle-map"></div>
                        </div>
                        <div class="muscle-map-controls">
                            <button class="muscle-view-button active" data-view="front">Front View</button>
                            <button class="muscle-view-button" data-view="back">Back View</button>
                        </div>
                        <div class="muscle-group-legend" id="muscle-group-legend">
                            <div class="legend-title">Intensity Level</div>
                            <div class="legend-scale" id="intensity-legend-scale">
                                <!-- Legend colors will be dynamically generated -->
                            </div>
                            <div class="legend-labels">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Workout volume section completely removed
            const workoutVolumeSection = document.createElement('div');
            
            // Workout Frequency Calendar removed
            const workoutFrequencySection = document.createElement('div');
            // Empty section - Workout Frequency removed
            
            // Insert the new sections
            const personalRecordsSection = statsContainer.querySelector('.personal-records');
            if (personalRecordsSection) {
                statsContainer.insertBefore(muscleGroupSection, personalRecordsSection);
                // workoutVolumeSection has been removed
                // progressTimelineSection has been removed
                // workoutFrequencySection has been removed
            } else {
                statsContainer.appendChild(muscleGroupSection);
                // workoutVolumeSection has been removed
                // progressTimelineSection has been removed
                // workoutFrequencySection has been removed
            }
            
            // Create CSS for muscle map
            createMuscleMapSvg();
        }
        
        // PR Achievements section removed
    };
    
    /**
     * Create SVG elements for muscle map
     */
    /**
 * Creates anatomically accurate SVG elements for the muscle map
 * This function replaces the original createMuscleMapSvg() while maintaining all functionality
 */
/**
 * Create SVG elements for muscle map
 */
const createMuscleMapSvg = () => {
    // Update the colorPalette with current theme colors
    colorPalette = getThemeColors();
    
    // Get muscle heat colors based on current theme
    const muscleHeatColors = colorPalette.getMuscleHeatColors();
    
    // Front view muscle map
    const frontMuscleMap = document.getElementById('muscle-map-front');
    if (frontMuscleMap) {
        frontMuscleMap.innerHTML = `
            <svg viewBox="0 0 206.326 206.326" xmlns="http://www.w3.org/2000/svg">
                <!-- Body outline -->
                <path class="body-outline" d="M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3
                c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522
                c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201
                c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109
                c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24
                c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217
                c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245
                c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631
                c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522
                c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448
                c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577
                c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257
                c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674
                c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635
                c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514
                c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733
                C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733
                c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988
                c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198
                c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953
                c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577
                c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448
                c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522
                c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269
                c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727
                c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848
                c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033
                c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116
                c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522
                c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3
                c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z"
                fill="none" stroke="#333" stroke-width="1"/>
                
                <!-- Chest -->
                <path id="chest" class="muscle-group" d="M92,40 C92,45 92,50 94,55 C96,60 100,65 103,65 C106,65 110,60 112,55 C114,50 114,45 114,40 Z" 
                    data-muscle="chest" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Shoulders -->
                <path id="shoulders-left" class="muscle-group" d="M87,35 C82,35 77,40 75,45 C73,50 72,55 77,58 C82,55 87,50 87,45 Z" 
                    data-muscle="shoulders" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="shoulders-right" class="muscle-group" d="M119,35 C124,35 129,40 131,45 C133,50 134,55 129,58 C124,55 119,50 119,45 Z" 
                    data-muscle="shoulders" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Biceps -->
                <path id="biceps-left" class="muscle-group" d="M80,60 C77,62 75,66 74,74 C73,77 75,81 77,82 C80,81 83,79 84,74 C85,68 83,60 80,60 Z" 
                    data-muscle="biceps" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="biceps-right" class="muscle-group" d="M126,60 C129,62 131,66 132,74 C133,77 131,81 129,82 C126,81 123,79 122,74 C121,68 123,60 126,60 Z" 
                    data-muscle="biceps" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Forearms -->
                <path id="forearms-left" class="muscle-group" d="M77,84 C72,87 69,91 67,95 C67,97 67,99 69,101 C71,98 74,95 76,92 C78,87 79,85 77,84 Z" 
                    data-muscle="forearms" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="forearms-right" class="muscle-group" d="M129,84 C134,87 137,91 139,95 C139,97 139,99 137,101 C135,98 132,95 130,92 C128,87 127,85 129,84 Z" 
                    data-muscle="forearms" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Abs -->
                <path id="abs-upper" class="muscle-group" d="M97,65 C100,65 106,65 109,65 C109,70 109,75 103,75 C97,75 97,70 97,65 Z" 
                    data-muscle="abs" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="abs-middle" class="muscle-group" d="M97,77 C100,77 106,77 109,77 C109,82 109,87 103,87 C97,87 97,82 97,77 Z" 
                    data-muscle="abs" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="abs-lower" class="muscle-group" d="M97,89 C100,89 106,89 109,89 C109,94 109,99 103,99 C97,99 97,94 97,89 Z" 
                    data-muscle="abs" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Obliques -->
                <path id="obliques-left" class="muscle-group" d="M95,65 C95,70 95,80 95,95 C93,97 90,99 88,99 C86,97 87,90 88,80 C89,70 90,67 95,65 Z" 
                    data-muscle="obliques" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="obliques-right" class="muscle-group" d="M111,65 C111,70 111,80 111,95 C113,97 116,99 118,99 C120,97 119,90 118,80 C117,70 116,67 111,65 Z" 
                    data-muscle="obliques" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Quads -->
                <path id="quads-left" class="muscle-group" d="M90,115 C90,120 89,127 89,135 C86,142 86,147 90,147 C94,145 96,140 97,135 C98,127 98,120 96,115 C94,112 92,112 90,115 Z" 
                    data-muscle="quads" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="quads-right" class="muscle-group" d="M116,115 C116,120 117,127 117,135 C120,142 120,147 116,147 C112,145 110,140 109,135 C108,127 108,120 110,115 C112,112 114,112 116,115 Z" 
                    data-muscle="quads" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Calves -->
                <path id="calves-left" class="muscle-group" d="M93,146 C90,151 89,161 91,181 C93,194 95,204 95,146 Z" 
                    data-muscle="calves" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="calves-right" class="muscle-group" d="M113,146 C116,151 117,161 115,181 C113,194 111,204 111,146 Z" 
                    data-muscle="calves" fill="${muscleHeatColors[0]}" data-intensity="0"/>
            </svg>
        `;
    }
    
    // Back view muscle map
    const backMuscleMap = document.getElementById('muscle-map-back');
    if (backMuscleMap) {
        backMuscleMap.innerHTML = `
            <svg viewBox="0 0 206.326 206.326" xmlns="http://www.w3.org/2000/svg">
                <!-- Body outline -->
                <path class="body-outline" d="M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3
                c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522
                c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201
                c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109
                c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24
                c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217
                c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245
                c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631
                c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522
                c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448
                c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577
                c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257
                c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674
                c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635
                c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514
                c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733
                C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733
                c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988
                c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198
                c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953
                c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577
                c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448
                c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522
                c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269
                c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727
                c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848
                c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033
                c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116
                c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522
                c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3
                c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z"
                fill="none" stroke="#333" stroke-width="1"/>
                
                <!-- Traps -->
                <path id="traps-left" class="muscle-group" d="M84,32 C89,30 97,28 100,28 C101,29 101,30 101,32 C101,34 100,36 97,38 C94,39 89,40 85,40 C83,39 82,36 82,35 C82,34 83,33 84,32 Z" 
                    data-muscle="traps" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="traps-right" class="muscle-group" d="M122,32 C117,30 109,28 106,28 C105,29 105,30 105,32 C105,34 106,36 109,38 C112,39 117,40 121,40 C123,39 124,36 124,35 C124,34 123,33 122,32 Z" 
                    data-muscle="traps" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Upper Back -->
                <path id="upper-back" class="muscle-group" d="M88,47 C93,49 97,52 103,52 C109,52 113,49 118,47 C117,52 116,57 113,62 C108,65 105,67 103,67 C101,67 96,65 93,62 C90,57 89,52 88,47 Z" 
                    data-muscle="back" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Lats -->
                <path id="lats-left" class="muscle-group" d="M90,50 C92,52 93,54 95,56 C94,58 92,60 89,62 C87,63 86,64 88,65 C89,66 90,65 91,63 C93,60 92,58 92,56 C93,54 92,52 90,50 Z" 
                    data-muscle="lats" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="lats-right" class="muscle-group" d="M116,50 C114,52 113,54 111,56 C112,58 114,60 117,62 C119,63 120,64 118,65 C117,66 116,65 115,63 C113,60 114,58 114,56 C113,54 114,52 116,50 Z" 
                    data-muscle="lats" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Mid back -->
                <path id="mid-back" class="muscle-group" d="M93,62 C98,65 101,67 103,67 C105,67 108,65 113,62 C113,67 113,72 113,77 C108,79 106,81 103,81 C100,81 98,79 93,77 C93,72 93,67 93,62 Z" 
                    data-muscle="back" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Lower Back -->
                <path id="lower-back" class="muscle-group" d="M93,77 C98,79 100,81 103,81 C106,81 108,79 113,77 C113,82 113,87 113,92 C108,94 106,96 103,96 C100,96 98,94 93,92 C93,87 93,82 93,77 Z" 
                    data-muscle="back" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Triceps -->
                <path id="triceps-left" class="muscle-group" d="M79,43 C76,46 75,50 74,54 C73,58 73,62 73,68 C72,72 74,75 76,76 C79,75 81,72 82,68 C83,62 84,58 84,54 C84,50 82,46 79,43 Z" 
                    data-muscle="triceps" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="triceps-right" class="muscle-group" d="M127,43 C130,46 131,50 132,54 C133,58 133,62 133,68 C134,72 132,75 130,76 C127,75 125,72 124,68 C123,62 122,58 122,54 C122,50 124,46 127,43 Z" 
                    data-muscle="triceps" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Forearms back -->
                <path id="forearms-left-back" class="muscle-group" d="M77,84 C72,87 69,91 67,95 C67,97 67,99 69,101 C71,98 74,95 76,92 C78,87 79,85 77,84 Z" 
                    data-muscle="forearms" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="forearms-right-back" class="muscle-group" d="M129,84 C134,87 137,91 139,95 C139,97 139,99 137,101 C135,98 132,95 130,92 C128,87 127,85 129,84 Z" 
                    data-muscle="forearms" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Glutes -->
                <path id="glutes" class="muscle-group" d="M87,100 C82,106 82,114 87,119 C92,123 102,123 103,119 C104,123 114,123 119,119 C124,114 124,106 119,100 C114,96 104,96 103,100 C102,96 92,96 87,100 Z" 
                    data-muscle="glutes" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Hamstrings -->
                <path id="hamstrings-left" class="muscle-group" d="M90,123 C95,125 100,127 102,127 C102,130 102,135 102,141 C100,144 96,146 90,146 C88,144 87,141 87,137 C87,133 88,128 90,123 Z" 
                    data-muscle="hamstrings" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="hamstrings-right" class="muscle-group" d="M116,123 C111,125 106,127 104,127 C104,130 104,135 104,141 C106,144 110,146 116,146 C118,144 119,141 119,137 C119,133 118,128 116,123 Z" 
                    data-muscle="hamstrings" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                
                <!-- Calves back -->
                <path id="calves-left-back" class="muscle-group" d="M92,146 C89,151 88,161 90,181 C92,194 94,204 94,146 Z" 
                    data-muscle="calves" fill="${muscleHeatColors[0]}" data-intensity="0"/>
                <path id="calves-right-back" class="muscle-group" d="M114,146 C117,151 118,161 116,181 C114,194 112,204 112,146 Z" 
                    data-muscle="calves" fill="${muscleHeatColors[0]}" data-intensity="0"/>
            </svg>
        `;
    }
    
    // Calendar heatmap has been removed
    // createCalendarHeatmap();
};
    
    /**
     * Create calendar heatmap cells
     */
    const createCalendarHeatmap = () => {
        const calendarContainer = document.getElementById('workout-calendar-heatmap');
        if (!calendarContainer) return;
        
        // Get current date and calculate year bounds
        const now = new Date();
        const currentYear = now.getFullYear();
        const startDate = new Date(currentYear, 0, 1);  // Jan 1st of current year
        
        // Create month labels
        const monthsRow = document.createElement('div');
        monthsRow.className = 'calendar-months';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        months.forEach(month => {
            const monthLabel = document.createElement('div');
            monthLabel.className = 'calendar-month-label';
            monthLabel.textContent = month;
            monthsRow.appendChild(monthLabel);
        });
        
        calendarContainer.appendChild(monthsRow);
        
        // Create day labels (Sun-Sat)
        const daysCol = document.createElement('div');
        daysCol.className = 'calendar-days';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        days.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'calendar-day-label';
            dayLabel.textContent = day;
            daysCol.appendChild(dayLabel);
        });
        
        // Create calendar grid container
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        calendarGrid.appendChild(daysCol);
        
        // Create cells for each day of the year
        for (let month = 0; month < 12; month++) {
            const monthCol = document.createElement('div');
            monthCol.className = 'calendar-month';
            
            // Get number of days in this month
            const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
            
            // Fill in days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, month, day);
                const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
                
                // Create cell
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';
                dayCell.dataset.date = date.toISOString().split('T')[0];
                dayCell.style.gridRow = dayOfWeek + 1; // +1 because grid starts at 1
                
                // Add to month column
                monthCol.appendChild(dayCell);
            }
            
            // Add month column to grid
            calendarGrid.appendChild(monthCol);
        }
        
        calendarContainer.appendChild(calendarGrid);
        
        // Add legend for calendar heatmap
        const legendContainer = document.createElement('div');
        legendContainer.className = 'calendar-legend';
        legendContainer.innerHTML = `
            <div class="legend-title">Activity Level</div>
            <div class="legend-scale">
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colorPalette.muscleHeat[0]};"></div>
                    <span>None</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colorPalette.muscleHeat[1]};"></div>
                    <span>Light</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colorPalette.muscleHeat[3]};"></div>
                    <span>Moderate</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colorPalette.muscleHeat[5]};"></div>
                    <span>Intense</span>
                </div>
            </div>
        `;
        
        calendarContainer.appendChild(legendContainer);
    };
    
    /**
     * Setup event listeners for charts and visualizations
     */
    const setupEventListeners = () => {
        // Listen for tab changes to render Progress-Tracker chart when tab is opened
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                if (tabId === 'statistics') {
                    // Ensure the Progress-Tracker chart is rendered when Statistics tab is opened
                    setTimeout(() => {
                        renderProgressTimeline('month');
                    }, 100);
                }
            });
        });
        
        // Progress timeline chart timeframe selectors
        const timeframeButtons = document.querySelectorAll('[data-chart-timeframe]');
        timeframeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const timeframe = e.target.dataset.chartTimeframe;
                
                // Update active button
                const parent = e.target.parentElement;
                parent.querySelectorAll('.chart-timeframe-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Determine which chart to update
                const chartContainer = parent.closest('.chart-container');
                const canvas = chartContainer.querySelector('canvas');
                
                if (canvas && canvas.id) {
                    switch (canvas.id) {
                        case 'progress-timeline-chart':
                            renderProgressTimeline(timeframe);
                            break;
                        // Consistency chart has been removed
                        case 'consistency-chart':
                            // Consistency chart has been removed
                            console.log('Consistency chart has been removed');
                            break;
                    }
                }
            });
        });
        
        // Muscle view toggle buttons (front/back)
        const muscleViewButtons = document.querySelectorAll('.muscle-view-button');
        muscleViewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                
                // Update active button
                const parent = e.target.parentElement;
                parent.querySelectorAll('.muscle-view-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Show appropriate muscle map
                const container = e.target.closest('.muscle-heatmap-container');
                container.querySelectorAll('.muscle-map').forEach(map => {
                    map.classList.remove('active');
                });
                document.getElementById(`muscle-map-${view}`).classList.add('active');
            });
        });
    };
    
    /**
     * Render all visualizations
     */
    const renderAllVisualizations = () => {
        renderProgressTimeline('month'); // Render progress timeline with month view
        renderMuscleHeatmap();
        renderVolumeDistribution();
        renderRepRangesChart();
        // renderCalendarHeatmap(); // Calendar heatmap disabled
        // renderPrAchievements(); // PR achievements feature removed
    };
    
    /**
     * Render the progress timeline visualization
     * @param {string} timeframe - Time period to display (month, quarter, year)
     */
    const renderProgressTimeline = (timeframe) => {
        const canvas = document.getElementById('progress-timeline-chart');
        if (!canvas) return;
        
        // Get workout data
        const workouts = DataManager.getWorkouts();
        if (workouts.length === 0) {
            renderEmptyChart(canvas, 'No workout data available yet');
            return;
        }
        
        // Destroy existing chart
        if (charts.progressTimeline) {
            charts.progressTimeline.destroy();
        }
        
        // Prepare data based on timeframe
        const { labels, datasets } = prepareProgressTimelineData(workouts, timeframe);
        
        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // Set theme-specific styles
        const chartStyles = {
            backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
            textColor: isDarkMode ? '#FFFFFF' : '#000000',
            gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            axisLabelColor: isDarkMode ? '#EEEEEE' : '#555555',
            tooltipBackgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            tooltipTextColor: isDarkMode ? '#FFFFFF' : '#000000',
            lineWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 7,
            shadowColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        };
        
        // Update datasets to use line style with fill and gradient
        const newDatasets = datasets.map((dataset, index) => {
            // Create gradient for fill
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            
            // Extract base color without alpha
            let baseColor = dataset.borderColor;
            if (baseColor.startsWith('rgba')) {
                baseColor = baseColor.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, 'rgba($1,$2,$3,');
            }
            
            // Create gradient stop points
            gradient.addColorStop(0, baseColor + '0.7)');
            gradient.addColorStop(1, baseColor + '0.1)');
            
            return {
                label: dataset.label,
                data: dataset.data,
                backgroundColor: gradient,
                borderColor: dataset.borderColor,
                borderWidth: chartStyles.lineWidth,
                pointBackgroundColor: dataset.borderColor,
                pointBorderColor: isDarkMode ? '#333333' : '#FFFFFF',
                pointRadius: chartStyles.pointRadius,
                pointHoverRadius: chartStyles.pointHoverRadius,
                pointHoverBackgroundColor: dataset.borderColor,
                pointHoverBorderColor: isDarkMode ? '#FFFFFF' : '#333333',
                pointHoverBorderWidth: 2,
                tension: 0.4, // Smoother curves
                fill: true,
                workoutData: dataset.workoutData
            };
        });
        
        // Create chart
        const ctx = canvas.getContext('2d');
        charts.progressTimeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: newDatasets
            },
            options: {
                plugins: {
                    customCanvasBackgroundColor: {
                        color: chartStyles.backgroundColor
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: chartStyles.axisLabelColor,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: chartStyles.textColor,
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total Volume (sets × reps × weight)',
                            color: chartStyles.axisLabelColor,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: chartStyles.gridColor
                        },
                        ticks: {
                            color: chartStyles.textColor,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US').format(context.parsed.y) + ' total volume';
                                }
                                return label;
                            },
                            afterLabel: function(context) {
                                const dataIndex = context.dataIndex;
                                const workoutData = context.dataset.workoutData[dataIndex];
                                if (workoutData && workoutData.exerciseCount > 0) {
                                    return `${workoutData.exerciseCount} exercises, ${workoutData.setCount} sets`;
                                }
                                return '';
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    };
    
    /**
     * Prepare data for progress timeline chart
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Time period to display (month, quarter, year)
     * @returns {Object} - Prepared data object with labels and datasets
     */
    const prepareProgressTimelineData = (workouts, timeframe) => {
        // Sort workouts by date
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Filter based on timeframe
        const now = new Date();
        let startDate;
        
        switch (timeframe) {
            case 'month':
                // Start date is 4 weeks ago
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 28);
                break;
            case 'quarter':
                // Start date is 3 months ago
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                // Start date is 1 year ago
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                // Default to last month
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 28);
        }
        
        // Filter workouts within the timeframe
        const filteredWorkouts = sortedWorkouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= startDate && workoutDate <= now;
        });
        
        // Group workouts by date format depending on timeframe
        const groupedWorkouts = {};
        const dateLabels = [];
        
        // Create all date labels based on timeframe
        let currentDate = new Date(startDate);
        
        if (timeframe === 'month') {
            // Daily labels for month view
            while (currentDate <= now) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const formattedDate = UI.formatDate(dateStr, 'short');
                dateLabels.push(formattedDate);
                groupedWorkouts[formattedDate] = {
                    totalVolume: 0,
                    strengthVolume: 0,
                    hypVolume: 0,
                    enduranceVolume: 0,
                    setCount: 0,
                    exerciseCount: 0
                };
                
                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (timeframe === 'quarter') {
            // Weekly labels for quarter view
            while (currentDate <= now) {
                const weekStart = new Date(currentDate);
                const weekEnd = new Date(currentDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const dateStr = `${UI.formatDate(weekStart.toISOString(), 'short')} - ${UI.formatDate(weekEnd.toISOString(), 'short')}`;
                dateLabels.push(dateStr);
                groupedWorkouts[dateStr] = {
                    totalVolume: 0,
                    strengthVolume: 0,
                    hypVolume: 0,
                    enduranceVolume: 0,
                    setCount: 0,
                    exerciseCount: 0
                };
                
                // Move to next week
                currentDate.setDate(currentDate.getDate() + 7);
            }
        } else if (timeframe === 'year') {
            // Monthly labels for year view
            while (currentDate <= now) {
                const monthStr = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
                dateLabels.push(monthStr);
                groupedWorkouts[monthStr] = {
                    totalVolume: 0,
                    strengthVolume: 0,
                    hypVolume: 0,
                    enduranceVolume: 0,
                    setCount: 0,
                    exerciseCount: 0
                };
                
                // Move to next month
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        
        // Aggregate workout data based on timeframe
        filteredWorkouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            let dateKey;
            
            if (timeframe === 'month') {
                dateKey = UI.formatDate(workout.date, 'short');
            } else if (timeframe === 'quarter') {
                // Find the matching week
                for (const weekLabel of dateLabels) {
                    const [startStr, endStr] = weekLabel.split(' - ');
                    const weekStart = new Date(UI.parseShortDate(startStr));
                    const weekEnd = new Date(UI.parseShortDate(endStr));
                    
                    if (workoutDate >= weekStart && workoutDate <= weekEnd) {
                        dateKey = weekLabel;
                        break;
                    }
                }
            } else if (timeframe === 'year') {
                dateKey = workoutDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            }
            
            if (dateKey && groupedWorkouts[dateKey]) {
                // Count exercises
                groupedWorkouts[dateKey].exerciseCount += workout.exercises.length;
                
                // Calculate volumes and count sets
                workout.exercises.forEach(exercise => {
                    exercise.sets.forEach(set => {
                        if (set.weight && set.reps) {
                            const setVolume = set.weight * set.reps;
                            groupedWorkouts[dateKey].totalVolume += setVolume;
                            groupedWorkouts[dateKey].setCount++;
                            
                            // Categorize by rep range
                            if (set.reps <= 5) {
                                groupedWorkouts[dateKey].strengthVolume += setVolume;
                            } else if (set.reps <= 12) {
                                groupedWorkouts[dateKey].hypVolume += setVolume;
                            } else {
                                groupedWorkouts[dateKey].enduranceVolume += setVolume;
                            }
                        }
                    });
                });
            }
        });
        
        // Prepare datasets
        const totalVolumeData = [];
        const strengthVolumeData = [];
        const hypVolumeData = [];
        const enduranceVolumeData = [];
        const workoutData = [];
        
        dateLabels.forEach(dateLabel => {
            const data = groupedWorkouts[dateLabel] || {
                totalVolume: 0,
                strengthVolume: 0,
                hypVolume: 0,
                enduranceVolume: 0,
                setCount: 0,
                exerciseCount: 0
            };
            
            totalVolumeData.push(data.totalVolume);
            strengthVolumeData.push(data.strengthVolume);
            hypVolumeData.push(data.hypVolume);
            enduranceVolumeData.push(data.enduranceVolume);
            workoutData.push({
                setCount: data.setCount,
                exerciseCount: data.exerciseCount
            });
        });
        
        return {
            labels: dateLabels,
            datasets: [
                {
                    label: 'Strength (1-5 reps)',
                    data: strengthVolumeData,
                    backgroundColor: colorPalette.primaryLight,
                    borderColor: colorPalette.primary,
                    borderWidth: 1,
                    workoutData: workoutData,
                    stack: 'stack1'
                },
                {
                    label: 'Hypertrophy (6-12 reps)',
                    data: hypVolumeData,
                    backgroundColor: colorPalette.secondaryLight,
                    borderColor: colorPalette.secondary,
                    borderWidth: 1,
                    workoutData: workoutData,
                    stack: 'stack1'
                },
                {
                    label: 'Endurance (13+ reps)',
                    data: enduranceVolumeData,
                    backgroundColor: colorPalette.tertiaryLight,
                    borderColor: colorPalette.tertiary,
                    borderWidth: 1,
                    workoutData: workoutData,
                    stack: 'stack1'
                }
            ]
        };
    };
    
    /**
     * Render muscle group heatmap visualization
     */
    const renderMuscleHeatmap = () => {
        // Get all workout data
        const workouts = DataManager.getWorkouts();
        if (workouts.length === 0) return;
        
        // Get exercise data
        const exercises = DataManager.getExercises();
        
        // Calculate muscle group usage
        const muscleUsage = calculateMuscleGroupUsage(workouts, exercises);
        
        // Apply heatmap to SVG elements
        applyMuscleHeatmap(muscleUsage);
    };
    
    /**
     * Calculate muscle group usage from workout data
     * @param {Array} workouts - Array of workout data
     * @param {Array} exercises - Array of exercise data
     * @returns {Object} - Object mapping muscle groups to their usage stats
     */
    const calculateMuscleGroupUsage = (workouts, exercises) => {
        const muscleGroups = DataManager.getMuscleGroups().map(m => m.toLowerCase());
        const usage = {};
        
        // Initialize usage object with all muscle groups
        muscleGroups.forEach(muscle => {
            usage[muscle] = {
                totalSets: 0,
                totalReps: 0,
                totalVolume: 0
            };
        });
        
        // Count sets, reps and volume for each muscle group
        workouts.forEach(workout => {
            workout.exercises.forEach(exerciseItem => {
                // Find the exercise definition to get targeted muscles
                const exerciseDef = exercises.find(ex => ex.id === exerciseItem.exerciseId);
                
                if (exerciseDef && exerciseDef.muscles) {
                    // Convert muscle names to lowercase for consistent comparison
                    const targetedMuscles = exerciseDef.muscles.map(m => m.toLowerCase());
                    
                    // For each set, add stats to all targeted muscles
                    exerciseItem.sets.forEach(set => {
                        if (set.weight && set.reps) {
                            const volume = set.weight * set.reps;
                            
                            targetedMuscles.forEach(muscle => {
                                if (usage[muscle]) {
                                    usage[muscle].totalSets++;
                                    usage[muscle].totalReps += set.reps;
                                    usage[muscle].totalVolume += volume;
                                }
                            });
                        }
                    });
                }
            });
        });
        
        return usage;
    };
    
    /**
     * Update the muscle heatmap legend with current theme colors
     */
    const updateMuscleHeatmapLegend = () => {
        // Get the legend element
        const legendScale = document.getElementById('intensity-legend-scale');
        if (!legendScale) return;
        
        // Clear existing legend colors
        legendScale.innerHTML = '';
        
        // Get current theme muscle heat colors
        const heatColors = colorPalette.getMuscleHeatColors();
        
        // Create color boxes for the legend
        heatColors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = color;
            legendScale.appendChild(colorBox);
        });
    };

    /**
     * Apply muscle usage data to the heatmap visualization
     * @param {Object} muscleUsage - Object mapping muscle groups to their usage stats
     */
    const applyMuscleHeatmap = (muscleUsage) => {
        if (!muscleUsage) return;
        
        // Update the colorPalette with current theme colors
        colorPalette = getThemeColors();
        
        // Update the legend
        updateMuscleHeatmapLegend();
        
        // Get current muscle heat colors
        const muscleHeatColors = colorPalette.getMuscleHeatColors();
        
        // Find max volume as reference for intensity scale
        const volumes = Object.values(muscleUsage).map(data => data.totalVolume);
        const maxVolume = Math.max(...volumes, 1); // Avoid division by zero
        
        // Update SVG elements with appropriate intensity
        document.querySelectorAll('.muscle-group').forEach(element => {
            const muscleName = element.dataset.muscle;
            if (muscleName && muscleUsage[muscleName]) {
                const usage = muscleUsage[muscleName];
                
                // Calculate intensity on a scale of 0-5
                // Using a log scale to better visualize differences
                const intensity = usage.totalVolume > 0 
                    ? Math.min(5, Math.floor((Math.log(usage.totalVolume) / Math.log(maxVolume)) * 6))
                    : 0;
                
                // Update element color based on intensity
                element.setAttribute('fill', muscleHeatColors[intensity]);
                element.dataset.intensity = intensity;
                
                // Add tooltip data
                element.setAttribute('data-sets', usage.totalSets);
                element.setAttribute('data-reps', usage.totalReps);
                element.setAttribute('data-volume', usage.totalVolume);
                
                // Add hover interaction
                element.addEventListener('mouseover', (e) => {
                    // Get the current primary color for highlighting
                    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--md-primary').trim();
                    
                    // Highlight the muscle group
                    e.target.setAttribute('stroke', primaryColor);
                    e.target.setAttribute('stroke-width', '2');
                    
                    // Show tooltip
                    showMuscleTooltip(e.target, muscleName, usage);
                });
                
                element.addEventListener('mouseout', (e) => {
                    // Remove highlight
                    e.target.setAttribute('stroke', 'none');
                    
                    // Hide tooltip
                    hideMuscleTooltip();
                });
            }
        });
    };
    
    /**
     * Show tooltip with muscle group information
     * @param {Element} element - SVG element representing the muscle
     * @param {string} muscleName - Name of the muscle
     * @param {Object} usage - Usage statistics for the muscle
     */
    const showMuscleTooltip = (element, muscleName, usage) => {
        // Create tooltip if it doesn't exist
        let tooltip = document.getElementById('muscle-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'muscle-tooltip';
            tooltip.className = 'muscle-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // Format the muscle name
        const formattedName = muscleName.charAt(0).toUpperCase() + muscleName.slice(1);
        
        // Set tooltip content
        tooltip.innerHTML = `
            <div class="tooltip-title">${formattedName}</div>
            <div class="tooltip-content">
                <div>Total Sets: ${usage.totalSets}</div>
                <div>Total Reps: ${usage.totalReps}</div>
                <div>Total Volume: ${new Intl.NumberFormat('en-US').format(usage.totalVolume)}</div>
            </div>
        `;
        
        // Position tooltip near the element
        const svgElement = element.closest('svg');
        const svgRect = svgElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate position relative to the viewport
        const top = elementRect.top + window.scrollY;
        const left = elementRect.left + window.scrollX + elementRect.width / 2;
        
        tooltip.style.top = `${top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${left - tooltip.offsetWidth / 2}px`;
        tooltip.style.display = 'block';
    };
    
    /**
     * Hide the muscle tooltip
     */
    const hideMuscleTooltip = () => {
        const tooltip = document.getElementById('muscle-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    };
    
    /**
     * Render workout volume distribution chart
     */
    const renderVolumeDistribution = () => {
        // This function intentionally left empty as the muscle group
        // volume visualization is now handled by WorkoutGraphics.createMuscleGroupVolumeGraphic
        // and the canvas chart has been removed
    };
    
    /**
     * Render rep ranges distribution chart
     */
    const renderRepRangesChart = () => {
        // This function intentionally left empty as the rep ranges
        // visualization is now handled by WorkoutGraphics.createRepRangesGraphic
        // and the canvas chart has been removed
    };
    
    /**
     * Render calendar heatmap visualization
     * NOTE: This feature has been disabled 
     */
    const renderCalendarHeatmap = () => {
        // Skip calendar heatmap rendering but don't interfere with other functionality
        console.log('Calendar heatmap feature has been disabled');
        
        // Do nothing but return normally to avoid breaking other features
        return;
        // Get workout data
        const workouts = DataManager.getWorkouts();
        if (workouts.length === 0) return;
        
        // Calculate workout intensity by date
        const workoutsByDate = {};
        
        workouts.forEach(workout => {
            const dateKey = workout.date.split('T')[0];
            
            if (!workoutsByDate[dateKey]) {
                workoutsByDate[dateKey] = {
                    totalVolume: 0,
                    exerciseCount: 0,
                    setCount: 0
                };
            }
            
            // Count exercises
            workoutsByDate[dateKey].exerciseCount += workout.exercises.length;
            
            // Calculate total volume and count sets
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.weight && set.reps) {
                        workoutsByDate[dateKey].totalVolume += set.weight * set.reps;
                        workoutsByDate[dateKey].setCount++;
                    }
                });
            });
        });
        
        // Find max volume for normalization
        const maxVolume = Math.max(
            ...Object.values(workoutsByDate).map(data => data.totalVolume),
            1 // Avoid division by zero
        );
        
        // Apply colors to calendar cells
        document.querySelectorAll('.calendar-day').forEach(cell => {
            const dateKey = cell.dataset.date;
            
            if (dateKey && workoutsByDate[dateKey]) {
                const data = workoutsByDate[dateKey];
                
                // Calculate intensity on a scale of 0-5
                const normalizedVolume = data.totalVolume / maxVolume;
                let intensityLevel;
                
                if (normalizedVolume <= 0.2) {
                    intensityLevel = 1; // Light
                } else if (normalizedVolume <= 0.5) {
                    intensityLevel = 3; // Moderate
                } else {
                    intensityLevel = 5; // Intense
                }
                
                // Apply color based on current theme
                const muscleHeatColors = colorPalette.getMuscleHeatColors();
                cell.style.backgroundColor = muscleHeatColors[intensityLevel];
                
                // Store data for tooltip
                cell.dataset.volume = data.totalVolume;
                cell.dataset.sets = data.setCount;
                cell.dataset.exercises = data.exerciseCount;
                
                // Add hover interaction
                cell.addEventListener('mouseover', (e) => {
                    showCalendarTooltip(e.target, dateKey, data);
                });
                
                cell.addEventListener('mouseout', () => {
                    hideCalendarTooltip();
                });
            }
        });
    };
    
    /**
     * Show tooltip with calendar day workout information
     * @param {Element} element - Calendar cell element
     * @param {string} dateKey - ISO date string
     * @param {Object} data - Workout data for this date
     */
    const showCalendarTooltip = (element, dateKey, data) => {
        // Create tooltip if it doesn't exist
        let tooltip = document.getElementById('calendar-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'calendar-tooltip';
            tooltip.className = 'calendar-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // Format date for display
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Set tooltip content
        tooltip.innerHTML = `
            <div class="tooltip-title">${formattedDate}</div>
            <div class="tooltip-content">
                <div>Exercises: ${data.exerciseCount}</div>
                <div>Sets: ${data.setCount}</div>
                <div>Total Volume: ${new Intl.NumberFormat('en-US').format(data.totalVolume)}</div>
            </div>
        `;
        
        // Position tooltip near the element
        const elementRect = element.getBoundingClientRect();
        
        // Calculate position relative to the viewport
        const top = elementRect.top + window.scrollY - 5;
        const left = elementRect.left + window.scrollX + elementRect.width + 5;
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.display = 'block';
    };
    
    /**
     * Hide the calendar tooltip
     */
    const hideCalendarTooltip = () => {
        const tooltip = document.getElementById('calendar-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    };
    
    /**
     * Render personal record achievements with animations
     */
    const renderPrAchievements = () => {
        const container = document.getElementById('pr-achievements-container');
        if (!container) return;
        
        // Get workout data
        const workouts = DataManager.getWorkouts();
        if (workouts.length < 2) {
            container.innerHTML = '<div class="empty-state">Complete more workouts to see your personal record achievements!</div>';
            return;
        }
        
        // Get all exercises
        const exercises = DataManager.getExercises();
        
        // Find PRs by comparing each workout with previous workouts
        const prs = findPersonalRecords(workouts, exercises);
        
        // Sort PRs by date (newest first)
        prs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Limit to most recent 5 PRs
        const recentPrs = prs.slice(0, 5);
        
        // Display PRs
        if (recentPrs.length === 0) {
            container.innerHTML = '<div class="empty-state">No personal records achieved yet. Keep working out!</div>';
            return;
        }
        
        // Create PR achievements
        container.innerHTML = '';
        
        recentPrs.forEach((pr, index) => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'pr-achievement';
            
            // Add animation delay based on index
            achievementCard.style.animationDelay = `${index * 0.15}s`;
            
            // Calculate time since PR
            const prDate = new Date(pr.date);
            const now = new Date();
            const diffTime = Math.abs(now - prDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let timeAgo;
            if (diffDays === 0) {
                timeAgo = 'Today';
            } else if (diffDays === 1) {
                timeAgo = 'Yesterday';
            } else if (diffDays < 7) {
                timeAgo = `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                timeAgo = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
                const months = Math.floor(diffDays / 30);
                timeAgo = `${months} ${months === 1 ? 'month' : 'months'} ago`;
            }
            
            achievementCard.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas ${pr.type === 'weight' ? 'fa-dumbbell' : pr.type === 'reps' ? 'fa-list-ol' : 'fa-chart-line'}"></i>
                </div>
                <div class="achievement-content">
                    <div class="achievement-title">
                        <span class="pr-type">${pr.type === 'weight' ? 'Weight PR' : pr.type === 'reps' ? 'Reps PR' : 'Volume PR'}</span>
                        <span class="pr-exercise">${pr.exerciseName}</span>
                    </div>
                    <div class="achievement-details">
                        <div class="pr-value">${pr.type === 'weight' ? `${pr.value} lbs` : pr.type === 'reps' ? `${pr.value} reps` : `${pr.value} volume`}</div>
                        <div class="pr-improvement">+${pr.improvement}${pr.type === 'weight' ? ' lbs' : pr.type === 'reps' ? ' reps' : ' volume'} increase</div>
                    </div>
                    <div class="achievement-date">${timeAgo}</div>
                </div>
                <div class="achievement-medal">
                    <i class="fas fa-medal"></i>
                </div>
            `;
            
            container.appendChild(achievementCard);
        });
    };
    
    /**
     * Find personal records by comparing workouts
     * @param {Array} workouts - Array of workout data
     * @param {Array} exercises - Array of exercise data
     * @returns {Array} - Array of personal record objects
     */
    const findPersonalRecords = (workouts, exercises) => {
        // Sort workouts by date (oldest first)
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Track PRs for each exercise
        const exercisePrs = {};
        const personalRecords = [];
        
        // Initialize PR tracking for each exercise
        exercises.forEach(exercise => {
            exercisePrs[exercise.id] = {
                maxWeight: 0,
                maxReps: 0,
                maxVolume: 0,
                name: exercise.name
            };
        });
        
        // Process workouts chronologically
        sortedWorkouts.forEach(workout => {
            workout.exercises.forEach(exerciseItem => {
                const exerciseId = exerciseItem.exerciseId;
                const exerciseName = exerciseItem.exerciseName || 
                    exercises.find(ex => ex.id === exerciseId)?.name || 
                    'Unknown Exercise';
                
                // Track PRs
                exerciseItem.sets.forEach(set => {
                    if (!set.weight || !set.reps) return;
                    
                    const volume = set.weight * set.reps;
                    
                    // Check for weight PR (for single rep)
                    if (set.reps === 1 && set.weight > exercisePrs[exerciseId].maxWeight) {
                        const improvement = set.weight - exercisePrs[exerciseId].maxWeight;
                        if (improvement > 0) {
                            personalRecords.push({
                                type: 'weight',
                                exerciseId,
                                exerciseName,
                                value: set.weight,
                                improvement,
                                date: workout.date
                            });
                        }
                        exercisePrs[exerciseId].maxWeight = set.weight;
                    }
                    
                    // Check for reps PR (bodyweight exercises)
                    if (set.weight === 0 && set.reps > exercisePrs[exerciseId].maxReps) {
                        const improvement = set.reps - exercisePrs[exerciseId].maxReps;
                        if (improvement > 0) {
                            personalRecords.push({
                                type: 'reps',
                                exerciseId,
                                exerciseName,
                                value: set.reps,
                                improvement,
                                date: workout.date
                            });
                        }
                        exercisePrs[exerciseId].maxReps = set.reps;
                    }
                    
                    // Check for volume PR (single set)
                    if (volume > exercisePrs[exerciseId].maxVolume) {
                        const improvement = volume - exercisePrs[exerciseId].maxVolume;
                        if (improvement > 0) {
                            personalRecords.push({
                                type: 'volume',
                                exerciseId,
                                exerciseName,
                                value: volume,
                                improvement,
                                date: workout.date
                            });
                        }
                        exercisePrs[exerciseId].maxVolume = volume;
                    }
                });
            });
        });
        
        return personalRecords;
    };
    
    /**
     * Render an empty chart with a message
     * @param {HTMLElement} canvas - Canvas element
     * @param {string} message - Message to display
     */
    const renderEmptyChart = (canvas, message) => {
        // Clear any existing chart
        const chartId = canvas.id;
        if (charts[chartId]) {
            charts[chartId].destroy();
            charts[chartId] = null;
        }
        
        // Create a container for the message
        const parent = canvas.parentElement;
        let emptyState = parent.querySelector('.empty-state');
        
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            parent.appendChild(emptyState);
        }
        
        emptyState.innerHTML = `<p>${message}</p>`;
        canvas.style.display = 'none';
    };

    // Add additional styles for new visualizations
    const addVisualizationStyles = () => {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
        /* Enhanced visualizations styles */
        .charts-row {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .half-width {
            flex: 1;
            min-width: 300px;
        }
        
        /* Muscle Map Styles */
        .muscle-heatmap-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
        }
        
        .muscle-map-svg-container {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
            position: relative;
        }
        
        .muscle-map {
            display: none;
            width: 100%;
        }
        
        .muscle-map.active {
            display: block;
        }
        
        .muscle-map svg {
            width: 100%;
            height: auto;
        }
        
        .muscle-group {
            cursor: pointer;
            transition: fill 0.3s ease;
        }
        
        .muscle-map-controls {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        
        .muscle-view-button {
            background-color: var(--md-surface-variant);
            color: var(--md-on-surface-variant);
            border: none;
            padding: 8px 16px;
            border-radius: var(--md-sys-shape-corner-full);
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
        }
        
        .muscle-view-button.active {
            background-color: var(--md-primary);
            color: var(--md-on-primary);
        }
        
        /* Muscle Group Legend */
        .muscle-group-legend {
            margin-top: 20px;
            text-align: center;
        }
        
        .legend-title {
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .legend-scale {
            display: flex;
            justify-content: center;
            gap: 0;
        }
        
        .legend-color {
            width: 30px;
            height: 20px;
        }
        
        .legend-labels {
            display: flex;
            justify-content: space-between;
            width: 180px;
            margin: 4px auto 0;
            font-size: 12px;
            color: var(--md-on-surface-variant);
        }
        
        /* Muscle tooltip */
        .muscle-tooltip {
            position: absolute;
            background-color: var(--md-primary);
            color: var(--md-on-primary);
            padding: 8px 12px;
            border-radius: var(--md-sys-shape-corner-medium);
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            box-shadow: var(--md-elevation-2);
            display: none;
        }
        
        .tooltip-title {
            font-weight: 500;
            margin-bottom: 4px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 4px;
        }
        
        .tooltip-content {
            font-size: 12px;
        }
        
        /* Calendar Heatmap */
        .calendar-heatmap-container {
            overflow-x: auto;
            padding: 12px 0;
        }
        
        #workout-calendar-heatmap {
            width: 100%;
            min-width: 800px;
        }
        
        .calendar-grid {
            display: flex;
            margin-top: 10px;
        }
        
        .calendar-months {
            display: flex;
            margin-left: 30px; /* Space for day labels */
        }
        
        .calendar-month-label {
            flex: 1;
            text-align: center;
            font-size: 12px;
            color: var(--md-on-surface-variant);
            padding-bottom: 5px;
            min-width: 28px;
        }
        
        .calendar-days {
            display: grid;
            grid-template-rows: repeat(7, 1fr);
            grid-gap: 2px;
            margin-right: 4px;
        }
        
        .calendar-day-label {
            height: 12px;
            font-size: 10px;
            color: var(--md-on-surface-variant);
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 4px;
        }
        
        .calendar-month {
            display: grid;
            grid-gap: 2px;
            grid-template-rows: repeat(7, 1fr);
            min-width: 28px;
        }
        
        .calendar-day {
            width: 12px;
            height: 12px;
            background-color: var(--md-outline-variant);
            border-radius: 2px;
            cursor: pointer;
            transition: transform 0.1s ease;
        }
        
        .calendar-day:hover {
            transform: scale(1.2);
        }
        
        .calendar-tooltip {
            position: absolute;
            background-color: var(--md-primary);
            color: var(--md-on-primary);
            padding: 8px 12px;
            border-radius: var(--md-sys-shape-corner-medium);
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            box-shadow: var(--md-elevation-2);
            display: none;
        }
        
        .calendar-legend {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
        }
        
        .legend-scale {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
        
        .legend-item span {
            font-size: 12px;
            color: var(--md-on-surface-variant);
        }
        
        /* PR Achievements */
        .pr-achievements-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .pr-achievement {
            display: flex;
            align-items: center;
            background-color: var(--md-surface);
            border-radius: var(--md-sys-shape-corner-large);
            padding: 16px;
            box-shadow: var(--md-elevation-1);
            border: 1px solid var(--md-outline-variant);
            animation: slideInUp 0.5s forwards;
            transform: translateY(20px);
            opacity: 0;
        }
        
        @keyframes slideInUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .achievement-icon {
            width: 50px;
            height: 50px;
            background-color: var(--md-primary-container);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--md-on-primary-container);
            font-size: 24px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .achievement-content {
            flex: 1;
        }
        
        .achievement-title {
            display: flex;
            flex-direction: column;
        }
        
        .pr-type {
            font-weight: 600;
            font-size: 16px;
            color: var(--md-primary);
        }
        
        .pr-exercise {
            font-size: 14px;
            color: var(--md-on-surface-variant);
        }
        
        .achievement-details {
            display: flex;
            align-items: baseline;
            gap: 12px;
            margin-top: 8px;
        }
        
        .pr-value {
            font-size: 20px;
            font-weight: 700;
            color: var(--md-on-surface);
        }
        
        .pr-improvement {
            font-size: 14px;
            color: var(--success-color);
            font-weight: 500;
        }
        
        .achievement-date {
            font-size: 12px;
            color: var(--md-on-surface-variant);
            margin-top: 8px;
        }
        
        .achievement-medal {
            color: #FFD700;
            font-size: 24px;
            margin-left: 16px;
            animation: pulse 2s infinite;
            flex-shrink: 0;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
        
        @media (max-width: 768px) {
            .charts-row {
                flex-direction: column;
            }
            
            .half-width {
                width: 100%;
            }
            
            .pr-achievement {
                flex-wrap: wrap;
            }
            
            .achievement-medal {
                margin-left: auto;
                margin-top: 8px;
            }
        }
    `;
    
        document.head.appendChild(styleEl);
    };
    
    // Add initialization function that will be called by the app
    const initialize = () => {
        // Configure Chart.js defaults
        configureChartDefaults();
        
        // Create containers for new visualizations
        createVisualizationContainers();
        
        // Setup event listeners
        setupEventListeners();
        
        // Add visualization styles
        addVisualizationStyles();
        
        // Initialize data and render charts
        renderAllVisualizations();
    };
    
    // Return public API
    return {
        initialize,
        renderAllVisualizations,
        renderProgressTimeline,
        renderMuscleHeatmap,
        renderVolumeDistribution,
        renderRepRangesChart,
        renderCalendarHeatmap,
        renderPrAchievements,
        getThemeColors,
        // Add method to access color palette for external components
        getColorPalette: () => getThemeColors()
    };
})();

/**
 * LiftMate - D3.js Charts Module
 * Custom D3.js chart implementations for LiftMate
 */

const D3ChartsManager = (() => {
    // Module constants
    const ANIMATION_DURATION = 750;
    const TRANSITION_EASE = d3.easeCubicInOut;

    // Store theme-related colors
    let themeColors = {
        lightMode: {
            primary: '#6750A4',
            secondary: '#625B71',
            tertiary: '#7D5260',
            background: '#FFFFFF',
            surface: '#FFFBFE',
            text: '#1C1B1F',
            textSecondary: '#49454E',
            grid: 'rgba(0, 0, 0, 0.05)',
            accent: '#625B71',
            success: '#4CAF50',
            error: '#F44336'
        },
        darkMode: {
            primary: '#D0BCFF',
            secondary: '#CCC2DC',
            tertiary: '#FFB4AB',
            background: '#121212',
            surface: '#1C1B1F',
            text: '#E6E1E5',
            textSecondary: '#CAC4D0',
            grid: 'rgba(255, 255, 255, 0.1)',
            accent: '#D0BCFF',
            success: '#81C784',
            error: '#E57373'
        }
    };

    /**
     * Initialize the D3 charts 
     */
    const initialize = () => {
        // Update theme colors from UI module
        updateThemeColors();

        // Listen for theme changes
        document.addEventListener('themeChanged', updateThemeColors);
    };

    /**
     * Update theme colors based on current app settings
     */
    const updateThemeColors = () => {
        try {
            const settings = DataManager.getSettings();
            const theme = settings.theme || 'default';
            const isDarkMode = settings.darkMode || false;
            
            // Get UI theme colors
            const uiThemeColors = UI.getThemeColors(theme);
            
            // Update our color schemes
            const mode = isDarkMode ? 'darkMode' : 'lightMode';
            
            if (isDarkMode) {
                // Dark mode colors (lighter variants for better contrast)
                themeColors.darkMode.primary = uiThemeColors.primary;
                themeColors.darkMode.secondary = uiThemeColors.secondary || '#CCC2DC';
                themeColors.darkMode.tertiary = uiThemeColors.tertiary || '#FFB4AB';
                themeColors.darkMode.background = '#121212';
                themeColors.darkMode.surface = '#1C1B1F';
                themeColors.darkMode.text = '#E6E1E5';
                themeColors.darkMode.textSecondary = '#CAC4D0';
                themeColors.darkMode.grid = 'rgba(255, 255, 255, 0.1)';
                themeColors.darkMode.accent = lightenColor(uiThemeColors.primary, 0.3);
            } else {
                // Light mode colors
                themeColors.lightMode.primary = uiThemeColors.primary;
                themeColors.lightMode.secondary = uiThemeColors.secondary || '#625B71';
                themeColors.lightMode.tertiary = uiThemeColors.tertiary || '#7D5260';
                themeColors.lightMode.background = '#FFFFFF';
                themeColors.lightMode.surface = '#FFFBFE';
                themeColors.lightMode.text = '#1C1B1F';
                themeColors.lightMode.textSecondary = '#49454E';
                themeColors.lightMode.grid = 'rgba(0, 0, 0, 0.05)';
                themeColors.lightMode.accent = uiThemeColors.secondary || '#625B71';
            }
            
        } catch (error) {
            console.error('Error updating theme colors for D3 charts:', error);
        }
    };
    
    /**
     * Helper function to lighten a color
     * @param {string} color - CSS color string
     * @param {number} amount - Amount to lighten (0-1)
     * @returns {string} Lightened color
     */
    const lightenColor = (color, amount) => {
        // Handle hex colors
        if (color.startsWith('#')) {
            let hex = color.slice(1);
            
            // Expand shorthand (3 digits) to full form (6 digits)
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            
            // Convert to RGB
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            // Lighten each component
            const lighter = [
                Math.min(255, r + Math.round((255 - r) * amount)),
                Math.min(255, g + Math.round((255 - g) * amount)),
                Math.min(255, b + Math.round((255 - b) * amount))
            ];
            
            // Convert back to hex
            return '#' + lighter.map(c => c.toString(16).padStart(2, '0')).join('');
        }
        
        // Handle rgb/rgba
        if (color.startsWith('rgb')) {
            const rgbValues = color.match(/\d+/g).map(Number);
            if (rgbValues.length >= 3) {
                const r = rgbValues[0];
                const g = rgbValues[1];
                const b = rgbValues[2];
                const a = rgbValues.length > 3 ? rgbValues[3] : 1;
                
                // Lighten each component
                const lighter = [
                    Math.min(255, r + Math.round((255 - r) * amount)),
                    Math.min(255, g + Math.round((255 - g) * amount)),
                    Math.min(255, b + Math.round((255 - b) * amount))
                ];
                
                if (rgbValues.length > 3) {
                    return `rgba(${lighter[0]}, ${lighter[1]}, ${lighter[2]}, ${a})`;
                } else {
                    return `rgb(${lighter[0]}, ${lighter[1]}, ${lighter[2]})`;
                }
            }
        }
        
        // Return original if can't parse
        return color;
    };

    /**
     * Get current theme colors based on dark mode setting
     * @returns {Object} Theme color object
     */
    const getCurrentThemeColors = () => {
        const settings = DataManager.getSettings();
        const isDarkMode = settings.darkMode || false;
        return isDarkMode ? themeColors.darkMode : themeColors.lightMode;
    };

    /**
     * Create SVG with margins for a D3 chart
     * @param {string} selector - CSS selector for container
     * @param {Object} dimensions - Chart dimensions
     * @returns {Object} SVG and dimensions
     */
    const createChartSVG = (selector, dimensions = {}) => {
        try {
            const container = d3.select(selector);
            if (container.empty()) {
                console.error(`Container not found: ${selector}`);
                return null;
            }

            // Clear any existing SVG and contents
            container.selectAll('*').remove();

            // Add class for styling
            container.classed('d3-chart', true);
            
            // Set container size first to ensure accurate measurements
            container
                .style('width', '100%')
                .style('position', 'relative')
                .style('display', 'block');
                
            // Force layout calculation to get correct dimensions
            void container.node().offsetWidth;
            
            // Set dimensions with defaults - prioritize full width
            const containerWidth = container.node().getBoundingClientRect().width;
            // Use the full container width, and ensure it's at least 90% of container width
            const width = dimensions.width || Math.max(containerWidth * 0.98, 300);
            const height = dimensions.height || 300;
            // Use smaller margins to maximize chart area
            const margin = dimensions.margin || { top: 40, right: 20, bottom: 60, left: 40 };
            
            // Verify chart area dimensions will be positive and maximize width
            const chartWidth = Math.max(1, width - margin.left - margin.right);
            const chartHeight = Math.max(1, height - margin.top - margin.bottom);
            
            console.log(`Creating chart with dimensions: ${width}x${height}, area: ${chartWidth}x${chartHeight}`);
            
            // Create a chart container div for better positioning
            const chartContainer = container
                .append('div')
                .attr('class', 'd3-chart-container')
                .style('position', 'relative')
                .style('height', `${height}px`)
                .style('width', '100%')
                .style('max-width', '100%');
            
            // Create SVG element with full width expansion
            const svg = chartContainer
                .append('svg')
                .attr('width', "100%")
                .attr('height', height)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .style('overflow', 'visible')
                .style('width', '100%');
                
            // Create a defs section for gradients and patterns
            const defs = svg.append('defs');
            
            // Create gradient for fills
            const colors = getCurrentThemeColors();
            const gradient = defs.append('linearGradient')
                .attr('id', `area-gradient-${Math.random().toString(36).substring(2, 9)}`) // Unique ID to avoid conflicts
                .attr('gradientUnits', 'userSpaceOnUse')
                .attr('x1', 0).attr('y1', 0)
                .attr('x2', 0).attr('y2', height);
                
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', colors.primary)
                .attr('stop-opacity', 0.7);
                
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colors.primary)
                .attr('stop-opacity', 0.1);
                
            // Create a group for the chart with margins
            const chart = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
                
            return {
                container,
                chartContainer,
                svg,
                chart,
                defs,
                width,
                height,
                chartWidth,
                chartHeight,
                margin,
                gradientId: gradient.attr('id')
            };
        } catch (error) {
            console.error('Error creating chart SVG:', error);
            // Return null with a specific error message
            return null;
        }
    };
    
    /**
     * Create a responsive D3.js line chart for exercise progress
     * @param {Array} data - Progress data array with date and weight properties
     * @param {string} exerciseName - Name of the exercise
     */
    const createProgressChart = (data, exerciseName) => {
        if (!data || data.length === 0) {
            console.log('No data available for progress chart');
            return;
        }

        // Get current theme colors
        const colors = getCurrentThemeColors();

        // Create SVG and margins
        const chart = createChartSVG('.progress-chart-container', {
            height: 350,
            margin: { top: 30, right: 30, bottom: 50, left: 50 }
        });
        
        if (!chart) return;
        
        // Sort data by date
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Setup scales
        // Add a bit of padding to y domain (10%)
        const yMin = d3.min(sortedData, d => d.weight) * 0.9;
        const yMax = d3.max(sortedData, d => d.weight) * 1.1;
        
        const x = d3.scaleTime()
            .domain(d3.extent(sortedData, d => new Date(d.date)))
            .range([0, chart.chartWidth]);
            
        const y = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([chart.chartHeight, 0])
            .nice();
            
        // Add fancy background with gradient
        chart.chart.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chart.chartWidth)
            .attr('height', chart.chartHeight)
            .attr('fill', colors.background)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('opacity', 0.3);
        
        // Create axes
        const xAxis = chart.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${chart.chartHeight})`)
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat('%b %d'))
                .ticks(Math.min(sortedData.length, 5)))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .style('font-weight', '500'));
                
        const yAxis = chart.chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => `${d} lbs`))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .style('font-weight', '500'));
                
        // Style axes and grid
        chart.svg.selectAll('.domain')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
            
        chart.svg.selectAll('.tick line')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
        
        // Add grid lines
        chart.chart.append('g')
            .attr('class', 'grid y-grid')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chart.chartWidth)
                .tickFormat(''))
            .call(g => g.selectAll('.tick line')
                .attr('stroke', colors.grid)
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '3,3'))
            .call(g => g.selectAll('.domain').remove());
        
        // Create line generator with nice curve
        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.weight))
            .curve(d3.curveCatmullRom.alpha(0.5));
        
        // Create area generator for fill
        const area = d3.area()
            .x(d => x(new Date(d.date)))
            .y0(chart.chartHeight)
            .y1(d => y(d.weight))
            .curve(d3.curveCatmullRom.alpha(0.5));
        
        // Add area fill with gradient
        const areaPath = chart.chart.append('path')
            .datum(sortedData)
            .attr('class', 'area')
            .attr('fill', `url(#${chart.gradientId})`) // Use the dynamic gradient ID
            .attr('d', area);
            
        // Add line path with shadow effect
        // First add a shadow path
        const shadowPath = chart.chart.append('path')
            .datum(sortedData)
            .attr('class', 'line-shadow')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0,0,0,0.2)')
            .attr('stroke-width', 6)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.5)
            .attr('filter', 'blur(4px)')
            .attr('d', line);
            
        // Then add the main path
        const path = chart.chart.append('path')
            .datum(sortedData)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', colors.primary)
            .attr('stroke-width', 3)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', line);
        
        // Animate line drawing with path length
        const pathLength = path.node().getTotalLength();
        path
            .attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(ANIMATION_DURATION)
            .ease(TRANSITION_EASE)
            .attr('stroke-dashoffset', 0);
            
        shadowPath
            .attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(ANIMATION_DURATION)
            .ease(TRANSITION_EASE)
            .attr('stroke-dashoffset', 0);
            
        // Animate area fill
        areaPath
            .style('opacity', 0)
            .transition()
            .delay(ANIMATION_DURATION * 0.5)
            .duration(ANIMATION_DURATION * 0.5)
            .style('opacity', 1);
        
        // Add dots for each data point
        const dots = chart.chart.selectAll('.dot')
            .data(sortedData)
            .enter()
            .append('g')
            .attr('class', 'data-point');
            
        // Add shadow circles
        dots.append('circle')
            .attr('class', 'dot-shadow')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.weight))
            .attr('r', 0)
            .attr('fill', 'rgba(0,0,0,0.2)')
            .attr('filter', 'blur(2px)')
            .transition()
            .delay((d, i) => ANIMATION_DURATION * 0.75 + (i * 50))
            .duration(300)
            .attr('r', 8);
        
        // Add main circles    
        dots.append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.weight))
            .attr('r', 0) // Start with radius 0 for animation
            .attr('fill', colors.primary)
            .attr('stroke', colors.background)
            .attr('stroke-width', 2)
            .transition()
            .delay((d, i) => ANIMATION_DURATION * 0.75 + (i * 50))
            .duration(300)
            .attr('r', 6);
            
        // Add numeric labels for each data point in progress chart
        dots.append('text')
            .attr('class', 'dot-label')
            .attr('x', (d, i) => {
                const date = new Date(d.date);
                // Check if point is near the y-axis (first 15% of chart width)
                if (x(date) < chart.chartWidth * 0.15) {
                    return x(date) + 15; // Shift right for points near the y-axis
                }
                return x(date);
            })
            .attr('y', d => y(d.weight) - 15) // Position above the dot
            .attr('text-anchor', (d, i) => {
                const date = new Date(d.date);
                // Right-align text for points shifted right
                return x(date) < chart.chartWidth * 0.15 ? 'start' : 'middle';
            })
            .attr('fill', colors.text) // Use theme color
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('opacity', 0)
            .text(d => d.weight) // Include label for all data points
            .transition()
            .delay((d, i) => ANIMATION_DURATION * 0.75 + (i * 50) + 150) // Slightly delayed after dots
            .duration(300)
            .style('opacity', 1);
        
        // Add chart title
        chart.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', chart.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.text)
            .style('font-size', '18px')
            .style('font-weight', '600')
            .text(`${exerciseName} Progress`);
            
        // Y-axis label removed as requested
            
        chart.svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', chart.width / 2)
            .attr('y', chart.height - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.textSecondary)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text('Date');
            
        // Calculate stats for display
        const firstWeight = sortedData[0].weight;
        const lastWeight = sortedData[sortedData.length - 1].weight;
        const change = lastWeight - firstWeight;
        const changePercent = ((change / firstWeight) * 100).toFixed(1);
        const changeTrend = change >= 0 ? 'increase' : 'decrease';
            
        // Create a stats card that will only show on hover/click
        const statsCard = chart.svg.append('g')
            .attr('class', 'stats-card')
            .attr('transform', `translate(${chart.width - chart.margin.right - 120}, ${chart.margin.top - 20})`)
            .style('opacity', 0) // Initially hidden
            .style('pointer-events', 'none');
            
        statsCard.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 120)
            .attr('height', 65)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', colors.surface)
            .attr('stroke', colors.primary)
            .attr('stroke-width', 1);
            
        statsCard.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .attr('fill', colors.text)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text(`Last: ${lastWeight} lbs`);
            
        statsCard.append('text')
            .attr('x', 10)
            .attr('y', 40)
            .attr('fill', change >= 0 ? colors.success : colors.error)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text(`Change: ${change >= 0 ? '+' : ''}${change} lbs`);
            
        statsCard.append('text')
            .attr('x', 10)
            .attr('y', 55)
            .attr('fill', change >= 0 ? colors.success : colors.error)
            .style('font-size', '10px')
            .text(`${changePercent}% ${changeTrend}`);
        
        // Create an invisible overlay to detect hover/click over the entire chart area
        const chartOverlay = chart.chart.append('rect')
            .attr('class', 'chart-interactive-overlay')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chart.chartWidth)
            .attr('height', chart.chartHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer');
            
        // Add hover/click interactions
        chartOverlay
            .on('mouseover', function() {
                statsCard.transition()
                    .duration(200)
                    .style('opacity', 0.95)
                    .style('pointer-events', 'all');
            })
            .on('mouseout', function() {
                // Only hide if not in 'clicked' mode
                if (!chartOverlay.classed('clicked')) {
                    statsCard.transition()
                        .duration(200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none');
                }
            })
            .on('click', function() {
                // Toggle clicked state
                const isClicked = chartOverlay.classed('clicked');
                chartOverlay.classed('clicked', !isClicked);
                
                if (isClicked) {
                    // Was clicked, now unclicked - hide if not hovering
                    statsCard.transition()
                        .duration(200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none');
                } else {
                    // Was not clicked, now clicked - ensure visible
                    statsCard.transition()
                        .duration(200)
                        .style('opacity', 0.95)
                        .style('pointer-events', 'all');
                }
            });
        
        // Setup tooltip with enhanced style
        const tooltip = chart.container
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', colors.surface)
            .style('color', colors.text)
            .style('border', `2px solid ${colors.primary}`)
            .style('border-radius', '8px')
            .style('padding', '10px 15px')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('pointer-events', 'none')
            .style('box-shadow', '0 4px 20px rgba(0,0,0,0.15)');
        
        // Add hover interactions
        dots.on('mouseover', function(event, d) {
                const date = new Date(d.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric'
                });
                
                // Calculate changes from the start
                const fromStart = d.weight - firstWeight;
                const percentChange = ((fromStart / firstWeight) * 100).toFixed(1);
                
                tooltip.html(`
                    <div style="font-weight:600;margin-bottom:5px;color:${colors.primary}">${date}</div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                        <span>Weight:</span>
                        <span style="font-weight:600">${d.weight} lbs</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                        <span>Reps:</span>
                        <span style="font-weight:600">${d.reps}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:5px;color:${fromStart >= 0 ? colors.success : colors.error}">
                        <span>From start:</span>
                        <span style="font-weight:600">${fromStart >= 0 ? '+' : ''}${fromStart} lbs (${percentChange}%)</span>
                    </div>
                `)
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 25}px`);
                
                // Highlight the dot
                d3.select(this).select('.dot')
                    .transition()
                    .duration(200)
                    .attr('r', 9)
                    .attr('stroke-width', 3);
                    
                d3.select(this).select('.dot-shadow')
                    .transition()
                    .duration(200)
                    .attr('r', 12);
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 25}px`);
            })
            .on('mouseout', function() {
                tooltip.style('opacity', 0);
                
                // Restore dot size
                d3.select(this).select('.dot')
                    .transition()
                    .duration(200)
                    .attr('r', 6)
                    .attr('stroke-width', 2);
                    
                d3.select(this).select('.dot-shadow')
                    .transition()
                    .duration(200)
                    .attr('r', 8);
            });
    };
    
    /**
     * Create a responsive D3.js line chart for weight tracking
     * @param {Array} data - Weight data array with date and weight properties
     */
    const createWeightChart = (data) => {
        if (!data || data.length === 0) {
            console.log('No data available for weight chart');
            return;
        }

        // Get current theme colors
        const colors = getCurrentThemeColors();

        // Create SVG and margins
        const chart = createChartSVG('.weight-chart-container', {
            height: 350,
            margin: { top: 30, right: 30, bottom: 50, left: 50 }
        });
        
        if (!chart) return;
        
        // Sort data by date and calculate statistics
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const average = d3.mean(sortedData, d => d.weight);
        const firstWeight = sortedData[0].weight;
        const latestWeight = sortedData[sortedData.length - 1].weight;
        const change = latestWeight - firstWeight;
        
        // Setup scales
        // Add a bit of padding to y domain (10%)
        const yExtent = d3.extent(sortedData, d => d.weight);
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
        const yMin = Math.max(0, yExtent[0] - yPadding);
        const yMax = yExtent[1] + yPadding;
        
        const x = d3.scaleTime()
            .domain(d3.extent(sortedData, d => new Date(d.date)))
            .range([0, chart.chartWidth]);
            
        const y = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([chart.chartHeight, 0])
            .nice();
        
        // Add fancy background with gradient
        chart.chart.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chart.chartWidth)
            .attr('height', chart.chartHeight)
            .attr('fill', colors.background)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('opacity', 0.3);
            
        // Create axes
        const xAxis = chart.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${chart.chartHeight})`)
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat('%b %d'))
                .ticks(Math.min(sortedData.length, 5)))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .style('font-weight', '500'));
                
        const yAxis = chart.chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => `${d.toFixed(1)} lbs`))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .style('font-weight', '500'));
                
        // Style axes and grid
        chart.svg.selectAll('.domain')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
            
        chart.svg.selectAll('.tick line')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
        
        // Add grid lines
        chart.chart.append('g')
            .attr('class', 'grid y-grid')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chart.chartWidth)
                .tickFormat(''))
            .call(g => g.selectAll('.tick line')
                .attr('stroke', colors.grid)
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '3,3'))
            .call(g => g.selectAll('.domain').remove());
        
        // Reference line for average
        chart.chart.append('line')
            .attr('class', 'reference-line average-line')
            .attr('x1', 0)
            .attr('x2', chart.chartWidth)
            .attr('y1', y(average))
            .attr('y2', y(average))
            .attr('stroke', colors.accent)
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0)
            .transition()
            .delay(ANIMATION_DURATION)
            .duration(500)
            .attr('opacity', 0.8);
            
        // Reference line label with pill design
        const refLabelG = chart.chart.append('g')
            .attr('class', 'reference-label-group')
            .attr('transform', `translate(${chart.chartWidth}, ${y(average) - 10})`)
            .attr('opacity', 0)
            .transition()
            .delay(ANIMATION_DURATION + 200)
            .duration(500)
            .attr('opacity', 1);
            
        chart.chart.append('rect')
            .attr('class', 'reference-label-bg')
            .attr('x', chart.chartWidth - 80)
            .attr('y', y(average) - 18)
            .attr('width', 80)
            .attr('height', 20)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', colors.accent)
            .attr('opacity', 0.2)
            .attr('opacity', 0)
            .transition()
            .delay(ANIMATION_DURATION + 200)
            .duration(500)
            .attr('opacity', 0.2);
            
        chart.chart.append('text')
            .attr('class', 'reference-label')
            .attr('x', chart.chartWidth)
            .attr('y', y(average) - 5)
            .attr('text-anchor', 'end')
            .attr('fill', colors.accent)
            .style('font-size', '12px')
            .style('font-weight', '600')
            .text(`Avg: ${average.toFixed(1)} lbs`)
            .attr('opacity', 0)
            .transition()
            .delay(ANIMATION_DURATION + 200)
            .duration(500)
            .attr('opacity', 1);
        
        // Create a nicer curved line
        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.weight))
            .curve(d3.curveCatmullRom.alpha(0.5));
        
        // Create area generator for fill with curve
        const area = d3.area()
            .x(d => x(new Date(d.date)))
            .y0(chart.chartHeight)
            .y1(d => y(d.weight))
            .curve(d3.curveCatmullRom.alpha(0.5));
        
        // Add area fill with gradient
        const areaPath = chart.chart.append('path')
            .datum(sortedData)
            .attr('class', 'area')
            .attr('fill', `url(#${chart.gradientId})`) // Use dynamic gradient ID
            .attr('d', area);
        
        // Add shadow path for elevation effect
        const shadowPath = chart.chart.append('path')
            .datum(sortedData)
            .attr('class', 'line-shadow')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0,0,0,0.2)')
            .attr('stroke-width', 6)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.5)
            .attr('filter', 'blur(4px)')
            .attr('d', line);
            
        // Add line path
        const path = chart.chart.append('path')
            .datum(sortedData)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', colors.primary)
            .attr('stroke-width', 3)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', line);
        
        // Animate line drawing with path length
        const pathLength = path.node().getTotalLength();
        path
            .attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(ANIMATION_DURATION)
            .ease(TRANSITION_EASE)
            .attr('stroke-dashoffset', 0);
            
        shadowPath
            .attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(ANIMATION_DURATION)
            .ease(TRANSITION_EASE)
            .attr('stroke-dashoffset', 0);
            
        // Animate area fill
        areaPath
            .style('opacity', 0)
            .transition()
            .delay(ANIMATION_DURATION * 0.5)
            .duration(ANIMATION_DURATION * 0.5)
            .style('opacity', 1);
        
        // Add dots for each data point
        const dots = chart.chart.selectAll('.dot')
            .data(sortedData)
            .enter()
            .append('g')
            .attr('class', 'data-point');
        
        // Add shadow circles
        dots.append('circle')
            .attr('class', 'dot-shadow')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.weight))
            .attr('r', 0)
            .attr('fill', 'rgba(0,0,0,0.2)')
            .attr('filter', 'blur(2px)')
            .transition()
            .delay((d, i) => ANIMATION_DURATION * 0.75 + (i * 50))
            .duration(300)
            .attr('r', 8);
        
        // Add main circles    
        dots.append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.weight))
            .attr('r', 0) // Start with radius 0 for animation
            .attr('fill', colors.primary)
            .attr('stroke', colors.background)
            .attr('stroke-width', 2)
            .transition()
            .delay((d, i) => ANIMATION_DURATION * 0.75 + (i * 50))
            .duration(300)
            .attr('r', 6);
            
        // Add numeric labels for each data point in weight chart
        dots.append('text')
            .attr('class', 'dot-label')
            .attr('x', (d, i) => {
                const date = new Date(d.date);
                // Check if point is near the y-axis (first 15% of chart width)
                if (x(date) < chart.chartWidth * 0.15) {
                    return x(date) + 15; // Shift right for points near the y-axis
                }
                return x(date);
            })
            .attr('y', d => y(d.weight) - 15) // Position above the dot
            .attr('text-anchor', (d, i) => {
                const date = new Date(d.date);
                // Right-align text for points shifted right
                return x(date) < chart.chartWidth * 0.15 ? 'start' : 'middle';
            })
            .attr('fill', colors.text) // Use theme color
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('opacity', 0)
            .text(d => d.weight.toFixed(1)) // Include label for all data points
            .transition()
            .delay((d, i) => ANIMATION_DURATION * 0.75 + (i * 50) + 150) // Slightly delayed after dots
            .duration(300)
            .style('opacity', 1);
        
        // Add chart title
        chart.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', chart.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.text)
            .style('font-size', '18px')
            .style('font-weight', '600')
            .text('Body Weight Progress');
            
        // Y-axis label removed as requested
            
        chart.svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', chart.width / 2)
            .attr('y', chart.height - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.textSecondary)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text('Date');
            
        // Create a stats-box that will only show on hover/click
        // Define positioning and dimensions
        const firstPointX = x(new Date(sortedData[0].date));
        const lastPointX = x(new Date(sortedData[sortedData.length - 1].date));
        const statsBoxWidth = 130;
        const statsBoxPadding = 20;
        
        // Calculate the position for the stats box based on weight trend
        // If weight increased (positive change), position on top-left
        // If weight decreased (negative change), position on top-right
        let statsBoxX;
        if (change >= 0) {
            // For positive change, place on top-left
            statsBoxX = chart.margin.left + statsBoxPadding;
        } else {
            // For negative change, place on top-right
            statsBoxX = chart.width - chart.margin.right - statsBoxWidth - statsBoxPadding;
        }
        
        // Create stats card but hide it initially
        const statsCard = chart.svg.append('g')
            .attr('class', 'stats-box')
            .attr('transform', `translate(${statsBoxX}, ${chart.margin.top - 5})`)
            .style('opacity', 0) // Initially hidden
            .style('pointer-events', 'none');
            
        statsCard.append('rect')
            .attr('width', statsBoxWidth)
            .attr('height', 95)
            .attr('fill', colors.surface)
            .attr('stroke', colors.primary)
            .attr('stroke-width', 1)
            .attr('rx', 8)
            .attr('ry', 8);
            
        statsCard.append('text')
            .attr('x', 10)
            .attr('y', 25)
            .attr('fill', colors.text)
            .style('font-size', '13px')
            .style('font-weight', '600')
            .text(`Current: ${latestWeight.toFixed(1)} lbs`);
            
        // Add change with arrow icon
        statsCard.append('text')
            .attr('x', 10)
            .attr('y', 50)
            .attr('fill', change >= 0 ? colors.success : colors.error)
            .style('font-size', '13px')
            .style('font-weight', '600')
            .text(`Change: ${change >= 0 ? '+' : ''}${change.toFixed(1)} lbs`);
            
        // Add change percentage
        const changePercent = ((change / firstWeight) * 100).toFixed(1);
        statsCard.append('text')
            .attr('x', 35)
            .attr('y', 68)
            .attr('fill', change >= 0 ? colors.success : colors.error)
            .style('font-size', '11px')
            .text(`${changePercent}% from start`);
            
        // Add arrow icon
        statsCard.append('path')
            .attr('d', change >= 0 
                ? 'M10,70 L20,60 L30,70' // Up arrow
                : 'M10,60 L20,70 L30,60') // Down arrow
            .attr('fill', 'none')
            .attr('stroke', change >= 0 ? colors.success : colors.error)
            .attr('stroke-width', 2);
            
        statsCard.append('text')
            .attr('x', 10)
            .attr('y', 85)
            .attr('fill', colors.text)
            .style('font-size', '13px')
            .style('font-weight', '600')
            .text(`Avg: ${average.toFixed(1)} lbs`);
        
        // Create an invisible overlay to detect hover/click over the entire chart area
        const chartOverlay = chart.chart.append('rect')
            .attr('class', 'chart-interactive-overlay')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chart.chartWidth)
            .attr('height', chart.chartHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer');
            
        // Add hover/click interactions
        chartOverlay
            .on('mouseover', function() {
                statsCard.transition()
                    .duration(200)
                    .style('opacity', 0.95)
                    .style('pointer-events', 'all');
            })
            .on('mouseout', function() {
                // Only hide if not in 'clicked' mode
                if (!chartOverlay.classed('clicked')) {
                    statsCard.transition()
                        .duration(200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none');
                }
            })
            .on('click', function() {
                // Toggle clicked state
                const isClicked = chartOverlay.classed('clicked');
                chartOverlay.classed('clicked', !isClicked);
                
                if (isClicked) {
                    // Was clicked, now unclicked - hide if not hovering
                    statsCard.transition()
                        .duration(200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none');
                } else {
                    // Was not clicked, now clicked - ensure visible
                    statsCard.transition()
                        .duration(200)
                        .style('opacity', 0.95)
                        .style('pointer-events', 'all');
                }
            });
        
        // Setup tooltip with enhanced style
        const tooltip = chart.container
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', colors.surface)
            .style('color', colors.text)
            .style('border', `2px solid ${colors.primary}`)
            .style('border-radius', '8px')
            .style('padding', '10px 15px')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('pointer-events', 'none')
            .style('box-shadow', '0 4px 20px rgba(0,0,0,0.15)');
        
        // Add hover interactions
        dots.on('mouseover', function(event, d) {
                const date = new Date(d.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric'
                });
                
                const fromStart = d.weight - firstWeight;
                const fromStartPercent = ((fromStart / firstWeight) * 100).toFixed(1);
                const fromAvg = d.weight - average;
                const fromAvgPercent = ((fromAvg / average) * 100).toFixed(1);
                
                tooltip.html(`
                    <div style="font-weight:600;margin-bottom:5px;color:${colors.primary}">${date}</div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                        <span>Weight:</span>
                        <span style="font-weight:600">${d.weight.toFixed(1)} lbs</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;color:${fromStart >= 0 ? colors.success : colors.error}">
                        <span>From start:</span>
                        <span style="font-weight:600">${fromStart >= 0 ? '+' : ''}${fromStart.toFixed(1)} lbs (${fromStartPercent}%)</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;color:${fromAvg >= 0 ? colors.success : colors.error}">
                        <span>From avg:</span>
                        <span style="font-weight:600">${fromAvg >= 0 ? '+' : ''}${fromAvg.toFixed(1)} lbs (${fromAvgPercent}%)</span>
                    </div>
                `)
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 25}px`);
                
                // Highlight the dot
                d3.select(this).select('.dot')
                    .transition()
                    .duration(200)
                    .attr('r', 9)
                    .attr('stroke-width', 3);
                    
                d3.select(this).select('.dot-shadow')
                    .transition()
                    .duration(200)
                    .attr('r', 12);
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 25}px`);
            })
            .on('mouseout', function() {
                tooltip.style('opacity', 0);
                
                // Restore dot size
                d3.select(this).select('.dot')
                    .transition()
                    .duration(200)
                    .attr('r', 6)
                    .attr('stroke-width', 2);
                    
                d3.select(this).select('.dot-shadow')
                    .transition()
                    .duration(200)
                    .attr('r', 8);
            });
    };
    
    /**
     * Create workout distribution chart in the statistics tab
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Selected timeframe ('week', 'month', 'year', 'all')
     */
    const createWorkoutDistributionChart = (workouts, timeframe) => {
        if (!workouts || workouts.length === 0) {
            console.log('No workout data available for distribution chart');
            return;
        }

        // Filter workouts by timeframe
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, timeframe);
        if (filteredWorkouts.length === 0) {
            console.log('No workout data available for selected timeframe');
            return;
        }

        // Get current theme colors
        const colors = getCurrentThemeColors();

        // Find or create container for the chart
        let container = d3.select('.stats-dashboard').select('.workout-distribution-container');
        if (container.empty()) {
            container = d3.select('.stats-dashboard')
                .append('div')
                .attr('class', 'workout-distribution-container card')
                .style('margin-top', '20px')
                .style('width', '100%')
                .style('height', '350px')
                .style('padding', '15px')
                .style('border-radius', '12px')
                .style('box-shadow', '0 4px 15px rgba(0, 0, 0, 0.1)')
                .style('display', 'flex')
                .style('justify-content', 'center')
                .style('align-items', 'center');
        }

        // Create SVG and margins - use full container width
        const chart = createChartSVG('.workout-distribution-container', {
            height: 250,
            margin: { top: 40, right: 15, bottom: 60, left: 30 },
            width: container.node().offsetWidth * 0.98 // Use 98% of container width
        });
        
        if (!chart) return;
        
        // Aggregate workout data by day of week
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCount = Array(7).fill(0);
        
        filteredWorkouts.forEach(workout => {
            const date = new Date(workout.date);
            const dayIndex = date.getDay();
            dayCount[dayIndex]++;
        });
        
        // Prepare data for chart
        const chartData = daysOfWeek.map((day, i) => ({
            day,
            count: dayCount[i]
        }));
        
        // Set up scales
        const x = d3.scaleBand()
            .domain(daysOfWeek)
            .range([0, chart.chartWidth])
            .padding(0.2);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(dayCount) * 1.2])
            .range([chart.chartHeight, 0]);
            
        // Add background with rounded corners
        chart.chart.append('rect')
            .attr('x', -10)
            .attr('y', -10)
            .attr('width', chart.chartWidth + 20)
            .attr('height', chart.chartHeight + 20)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', colors.background)
            .attr('opacity', 0.3);
            
        // Create axes
        chart.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${chart.chartHeight})`)
            .call(d3.axisBottom(x))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .style('font-weight', '600')
                .style('font-size', '12px')
                .style('text-anchor', 'middle'));
                
        chart.chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => Math.floor(d) === d ? d : ''))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .style('font-weight', '500'));
                
        // Style axes
        chart.svg.selectAll('.domain')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
            
        chart.svg.selectAll('.tick line')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
            
        // Add grid lines
        chart.chart.append('g')
            .attr('class', 'grid y-grid')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chart.chartWidth)
                .tickFormat(''))
            .call(g => g.selectAll('.tick line')
                .attr('stroke', colors.grid)
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '3,3'))
            .call(g => g.selectAll('.domain').remove());
            
        // Create gradient for bars with unique ID
        const barGradientId = `bar-gradient-${Math.random().toString(36).substring(2, 9)}`;
        const barGradient = chart.defs.append('linearGradient')
            .attr('id', barGradientId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', 0).attr('y2', chart.chartHeight);
            
        barGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colors.primary);
            
        barGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colors.secondary || colors.primary);

        // Create shadow filter for bars with unique ID
        const barShadowId = `bar-shadow-${Math.random().toString(36).substring(2, 9)}`;
        const filter = chart.defs.append('filter')
            .attr('id', barShadowId)
            .attr('height', '130%');
            
        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3)
            .attr('result', 'blur');
            
        filter.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 0)
            .attr('dy', 3)
            .attr('result', 'offsetBlur');
            
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');
            
        // Add bars with gradient and shadow - make bars wider
        const bars = chart.chart.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.day))
            .attr('width', x.bandwidth())
            .attr('y', chart.chartHeight)
            .attr('height', 0)
            .attr('fill', `url(#${barGradientId})`)
            .attr('filter', `url(#${barShadowId})`)
            .attr('rx', 6)
            .attr('ry', 6);
            
        // Animate bars
        bars.transition()
            .duration(ANIMATION_DURATION)
            .delay((d, i) => i * 100)
            .attr('y', d => y(d.count))
            .attr('height', d => chart.chartHeight - y(d.count));
            
        // Add value labels
        chart.chart.selectAll('.bar-label')
            .data(chartData)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.day) + x.bandwidth() / 2)
            .attr('y', d => d.count > 0 ? y(d.count) - 10 : y(0) - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.text)
            .style('font-weight', '600')
            .style('font-size', '14px')
            .style('opacity', 0)
            .text(d => d.count > 0 ? d.count : '')
            .transition()
            .duration(300)
            .delay((d, i) => ANIMATION_DURATION + (i * 100))
            .style('opacity', 1);
            
        // Add chart title
        chart.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', chart.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.text)
            .style('font-size', '16px')
            .style('font-weight', '600')
            .text('Workout Distribution by Day');
            
        // Calculate totals for insight text
        const totalWorkouts = d3.sum(dayCount);
        const mostActiveDay = daysOfWeek[dayCount.indexOf(d3.max(dayCount))];
        
        // Add insight text below chart
        chart.svg.append('text')
            .attr('class', 'chart-insight')
            .attr('x', chart.width / 2)
            .attr('y', chart.height - 15)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.textSecondary)
            .style('font-size', '12px')
            .style('font-style', 'italic')
            .text(`Total: ${totalWorkouts} workouts • Most active: ${mostActiveDay}`);
    };
    
    /**
     * Create exercise distribution chart in the statistics tab
     * @param {Array} workouts - Array of workout data
     * @param {string} timeframe - Selected timeframe ('week', 'month', 'year', 'all')
     */
    const createExerciseDistributionChart = (workouts, timeframe) => {
        if (!workouts || workouts.length === 0) {
            console.log('No workout data available for exercise distribution chart');
            return;
        }

        // Filter workouts by timeframe
        const filteredWorkouts = UI.filterDataByTimeframe(workouts, timeframe);
        if (filteredWorkouts.length === 0) {
            console.log('No workout data available for selected timeframe');
            return;
        }

        // Get current theme colors
        const colors = getCurrentThemeColors();
        
        // Get exercise data
        const exercises = DataManager.getExercises();
        if (!exercises || exercises.length === 0) {
            console.log('No exercise data available');
            return;
        }

        // Find or create container for the chart
        let container = d3.select('.stats-dashboard').select('.exercise-distribution-container');
        if (container.empty()) {
            container = d3.select('.stats-dashboard')
                .append('div')
                .attr('class', 'exercise-distribution-container card')
                .style('margin-top', '20px')
                .style('margin-bottom', '20px')
                .style('width', '100%')
                .style('height', '350px')
                .style('padding', '15px')
                .style('border-radius', '12px')
                .style('box-shadow', '0 4px 15px rgba(0, 0, 0, 0.1)')
                .style('display', 'flex')
                .style('justify-content', 'center')
                .style('align-items', 'center');
        }

        // Create SVG and margins - use full container width
        const chart = createChartSVG('.exercise-distribution-container', {
            height: 320,
            margin: { top: 40, right: 15, bottom: 80, left: 40 },
            width: container.node().offsetWidth * 0.98 // Use 98% of container width
        });
        
        if (!chart) return;
        
        // Count exercise frequency and total volume
        const exerciseStats = {};
        
        filteredWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const exerciseId = exercise.exerciseId;
                
                if (!exerciseStats[exerciseId]) {
                    exerciseStats[exerciseId] = {
                        id: exerciseId,
                        count: 0,
                        volume: 0,
                        sets: 0
                    };
                }
                
                exerciseStats[exerciseId].count++;
                
                // Calculate volume (weight * reps) and count sets
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        exerciseStats[exerciseId].volume += (set.weight * set.reps);
                        exerciseStats[exerciseId].sets++;
                    }
                });
            });
        });
        
        // Convert to array and sort by count
        let statsArray = Object.values(exerciseStats);
        
        // Map exercise IDs to names
        statsArray = statsArray.map(stat => {
            const exercise = exercises.find(ex => ex.id === stat.id);
            return {
                ...stat,
                name: exercise ? exercise.name : 'Unknown'
            };
        });
        
        // Sort and limit to top 8 exercises
        statsArray = statsArray
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
            
        // Add background with rounded corners
        chart.chart.append('rect')
            .attr('x', -10)
            .attr('y', -10)
            .attr('width', chart.chartWidth + 20)
            .attr('height', chart.chartHeight + 20)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', colors.background)
            .attr('opacity', 0.3);
        
        // Set up horizontal scales
        const y = d3.scaleBand()
            .domain(statsArray.map(d => d.name))
            .range([0, chart.chartHeight])
            .padding(0.2);
            
        const x = d3.scaleLinear()
            .domain([0, d3.max(statsArray, d => d.count) * 1.2])
            .range([0, chart.chartWidth]);
            
        // Create color scale based on volume
        const volumeExtent = d3.extent(statsArray, d => d.volume);
        const colorScale = d3.scaleLinear()
            .domain(volumeExtent)
            .range(['rgba(150,150,150,0.3)', colors.primary]); // Low volume to primary color
            
        // Create horizontal bar gradient with unique ID
        const hBarGradientId = `horizontal-bar-gradient-${Math.random().toString(36).substring(2, 9)}`;
        const barGradient = chart.defs.append('linearGradient')
            .attr('id', hBarGradientId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '0%');
            
        barGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colors.primary)
            .attr('stop-opacity', 0.7);
            
        barGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colors.primary)
            .attr('stop-opacity', 1);
        
        // Create shadow filter for horizontal bars with unique ID
        const hBarShadowId = `h-bar-shadow-${Math.random().toString(36).substring(2, 9)}`;
        const filter = chart.defs.append('filter')
            .attr('id', hBarShadowId)
            .attr('height', '130%');
            
        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3)
            .attr('result', 'blur');
            
        filter.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 3)
            .attr('dy', 0)
            .attr('result', 'offsetBlur');
            
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');
            
        // Create axes
        chart.chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .style('font-weight', '500')
                .style('font-size', '12px')
                .style('text-anchor', 'end'));
                
        chart.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${chart.chartHeight})`)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => Math.floor(d) === d ? d : ''))
            .call(g => g.selectAll('text')
                .attr('fill', colors.text)
                .style('font-weight', '500'));
                
        // Style axes
        chart.svg.selectAll('.domain')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
            
        chart.svg.selectAll('.tick line')
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1.5);
            
        // Add grid lines
        chart.chart.append('g')
            .attr('class', 'grid x-grid')
            .attr('transform', `translate(0,${chart.chartHeight})`)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickSize(-chart.chartHeight)
                .tickFormat(''))
            .call(g => g.selectAll('.tick line')
                .attr('stroke', colors.grid)
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '3,3'))
            .call(g => g.selectAll('.domain').remove());
            
        // Add horizontal bars - make bars taller to better fill space
        const bars = chart.chart.selectAll('.bar')
            .data(statsArray)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('y', d => y(d.name))
            .attr('height', y.bandwidth())
            .attr('x', 0)
            .attr('width', 0)
            .attr('fill', `url(#${hBarGradientId})`)
            .attr('filter', `url(#${hBarShadowId})`)
            .attr('rx', 5)
            .attr('ry', 5);
            
        // Animate bars
        bars.transition()
            .duration(ANIMATION_DURATION)
            .delay((d, i) => i * 100)
            .attr('width', d => x(d.count));
            
        // Add value labels inside bars
        chart.chart.selectAll('.bar-value')
            .data(statsArray)
            .enter()
            .append('text')
            .attr('class', 'bar-value')
            .attr('x', d => x(d.count) - 10)
            .attr('y', d => y(d.name) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('fill', '#FFFFFF')
            .style('font-weight', '600')
            .style('font-size', '12px')
            .style('opacity', 0)
            .text(d => d.count)
            .transition()
            .duration(400)
            .delay((d, i) => ANIMATION_DURATION + (i * 100))
            .style('opacity', 1);
            
        // Add total volume labels to right side
        chart.chart.selectAll('.volume-label')
            .data(statsArray)
            .enter()
            .append('text')
            .attr('class', 'volume-label')
            .attr('x', d => x(d.count) + 5)
            .attr('y', d => y(d.name) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('fill', colors.textSecondary)
            .style('font-size', '10px')
            .style('opacity', 0)
            .text(d => `${d.volume.toLocaleString()} lbs total`)
            .transition()
            .duration(400)
            .delay((d, i) => ANIMATION_DURATION + 200 + (i * 100))
            .style('opacity', 0.8);
            
        // Add chart title
        chart.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', chart.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.text)
            .style('font-size', '16px')
            .style('font-weight', '600')
            .text('Most Frequent Exercises');
            
        // Add subtitle/description
        chart.svg.append('text')
            .attr('class', 'chart-subtitle')
            .attr('x', chart.width / 2)
            .attr('y', chart.height - 15)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.textSecondary)
            .style('font-size', '12px')
            .style('font-style', 'italic')
            .text('Bars show frequency, labels show total volume');
            
        // Add tooltip
        const tooltip = chart.container
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', colors.surface)
            .style('color', colors.text)
            .style('border', `2px solid ${colors.primary}`)
            .style('border-radius', '8px')
            .style('padding', '10px 15px')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('pointer-events', 'none')
            .style('box-shadow', '0 4px 20px rgba(0,0,0,0.15)');
            
        // Add hover interactions
        bars.on('mouseover', function(event, d) {
                const avgVolumePerSet = d.sets > 0 ? Math.round(d.volume / d.sets) : 0;
                
                tooltip.html(`
                    <div style="font-weight:600;margin-bottom:5px;color:${colors.primary}">${d.name}</div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                        <span>Frequency:</span>
                        <span style="font-weight:600">${d.count} workouts</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                        <span>Total Volume:</span>
                        <span style="font-weight:600">${d.volume.toLocaleString()} lbs</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Total Sets:</span>
                        <span style="font-weight:600">${d.sets}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Avg Volume/Set:</span>
                        <span style="font-weight:600">${avgVolumePerSet} lbs</span>
                    </div>
                `)
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 25}px`);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8);
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 25}px`);
            })
            .on('mouseout', function() {
                tooltip.style('opacity', 0);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1);
            });
    };
    
    // Public API
    return {
        initialize,
        updateThemeColors,
        createProgressChart,
        createWeightChart,
        createWorkoutDistributionChart,
        createExerciseDistributionChart
    };
})();
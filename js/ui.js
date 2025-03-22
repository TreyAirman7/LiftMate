/**
 * LiftMate - UI Module
 * Handles general UI interactions and helpers
 */

const UI = (() => {
    /**
     * Initialize UI event listeners
     */
    const initialize = () => {
        // Tab navigation
        setupTabNavigation();
        
        // Modal functionality
        setupModals();
        
        // Setup confirmation modal
        setupConfirmationModal();
        
        // Setup theme toggle
        setupThemeToggle();
        
        // Setup dark mode toggle
        setupDarkModeToggle();
    };
    
    /**
     * Setup tab navigation functionality
     */
    const setupTabNavigation = () => {
        const navButtons = document.querySelectorAll('.nav-button');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Update active tab button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show active tab content
                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Scroll to top when changing tabs
                window.scrollTo(0, 0);
            });
        });
    };
    
    /**
     * Setup modal functionality
     */
    const setupModals = () => {
        // Close modal when clicking the close button or outside the modal
        const closeButtons = document.querySelectorAll('.close-modal');
        const modals = document.querySelectorAll('.modal');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = button.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Close modal when clicking outside the modal content
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
    };
    
    /**
     * Open a modal by ID
     * @param {string} modalId - ID of the modal to open
     * @returns {boolean} - Whether the modal was opened successfully
     */
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID '${modalId}' not found`);
            return false;
        }
        
        // Add active class to make modal visible
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        
        // Force a reflow to ensure the browser renders the modal
        // This helps with timing issues where elements might not be accessible right away
        void modal.offsetHeight;
        
        return true;
    };
    
    /**
     * Close a modal
     * @param {HTMLElement} modal - Modal element to close
     */
    const closeModal = (modal) => {
        if (!modal) {
            console.error('Attempted to close a null or undefined modal');
            return;
        }
        
        // Handle both direct element and string ID
        const modalElement = typeof modal === 'string' ? document.getElementById(modal) : modal;
        
        if (!modalElement) {
            console.error('Modal element not found');
            return;
        }
        
        modalElement.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };
    
    /**
     * Close all open modals
     */
    const closeAllModals = () => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            closeModal(modal);
        });
    };
    
    /**
     * Setup confirmation modal
     */
    const setupConfirmationModal = () => {
        // Store for confirmation callback
        window.confirmCallback = null; // Make it globally accessible for debugging
        
        // Cancel button
        const cancelButton = document.getElementById('cancel-confirmation');
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Confirmation cancelled');
            closeModal(document.getElementById('confirmation-modal'));
            window.confirmCallback = null;
        });
        
        // Confirm button
        const confirmButton = document.getElementById('confirm-action');
        confirmButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Confirmation confirmed, executing callback');
            
            if (window.confirmCallback && typeof window.confirmCallback === 'function') {
                // Execute the callback in a setTimeout to ensure modal closing doesn't interfere
                setTimeout(() => {
                    try {
                        window.confirmCallback();
                    } catch (error) {
                        console.error('Error executing confirmation callback:', error);
                    }
                    window.confirmCallback = null;
                }, 10);
            }
            
            closeModal(document.getElementById('confirmation-modal'));
        });
    };
    
    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {function} onConfirm - Callback for confirmation
     */
    const showConfirmation = (title, message, onConfirm) => {
        console.log('Showing confirmation dialog:', title, message);
        
        const modal = document.getElementById('confirmation-modal');
        const titleElement = document.getElementById('confirmation-title');
        const messageElement = document.getElementById('confirmation-message');
        
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        // Store callback for confirm button
        window.confirmCallback = onConfirm;
        console.log('Stored confirmation callback');
        
        openModal('confirmation-modal');
    };
    
    /**
     * Show a toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    const showToast = (message, type = 'info') => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after timeout
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    };
    
    /**
     * Format date string to readable format
     * @param {string} dateString - ISO date string
     * @param {string} format - Format type ('short' for MM/DD, 'default' for default format)
     * @returns {string} - Formatted date string
     */
    const formatDate = (dateString, format = 'default') => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (format === 'short') {
            // Format as MM/DD
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
        
        // Check if date is today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        // Check if date is yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        // Format as MM/DD/YYYY
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    
    /**
     * Format time duration in minutes to human readable string
     * @param {number} minutes - Duration in minutes
     * @returns {string} - Formatted duration string
     */
    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
        }
    };
    
    /**
     * Format time in seconds to MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    /**
     * Clear all form inputs in a given element
     * @param {HTMLElement} formElement - Form element to clear
     */
    const clearForm = (formElement) => {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    };
    
    /**
     * Get date ranges for various timeframes
     * @param {string} timeframe - Timeframe identifier (week, month, year, all)
     * @returns {Object} - Object with start and end dates
     */
    const getDateRange = (timeframe) => {
        const end = new Date();
        let start = new Date();
        
        switch (timeframe) {
            case 'week':
                // Start from beginning of current week (Sunday)
                start.setDate(end.getDate() - end.getDay());
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                // Start from first day of current month
                start = new Date(end.getFullYear(), end.getMonth(), 1);
                break;
            case 'year':
                // Start from first day of current year
                start = new Date(end.getFullYear(), 0, 1);
                break;
            case 'all':
            default:
                // No start date limitation for "all time"
                start = new Date(0);
                break;
        }
        
        return {
            start,
            end
        };
    };
    
    /**
     * Filter data by date range
     * @param {Array} data - Array of objects with date property
     * @param {string} timeframe - Timeframe to filter by
     * @returns {Array} - Filtered data
     */
    const filterDataByTimeframe = (data, timeframe) => {
        if (timeframe === 'all') {
            return data;
        }
        
        const { start, end } = getDateRange(timeframe);
        
        return data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });
    };
    
    /**
     * Setup timeframe selector buttons
     * @param {string} selectorClass - Class of the timeframe selector container
     * @param {string} buttonClass - Class of the timeframe buttons
     * @param {function} callback - Function to call when timeframe changes
     */
    const setupTimeframeSelector = (selectorClass, buttonClass, callback) => {
        const buttons = document.querySelectorAll(`.${selectorClass} .${buttonClass}`);
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const timeframe = button.getAttribute('data-timeframe') || 
                                  button.getAttribute('data-chart-timeframe') || 
                                  button.getAttribute('data-filter');
                
                // Update active button
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Call the callback with the selected timeframe
                if (callback && typeof callback === 'function') {
                    callback(timeframe);
                }
            });
        });
    };
    
    /**
     * Parse a short date (MM/DD) back to a full date
     * @param {string} shortDate - Date in MM/DD format
     * @returns {string} - ISO date string
     */
    const parseShortDate = (shortDate) => {
        const parts = shortDate.split('/');
        if (parts.length < 2) return null;
        
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = new Date().getFullYear();
        
        return new Date(year, month, day).toISOString();
    };
    
    /**
     * Calculate percent change between two values
     * @param {number} oldValue - Original value
     * @param {number} newValue - New value
     * @returns {number} - Percent change
     */
    const calculatePercentChange = (oldValue, newValue) => {
        if (oldValue === 0) return newValue > 0 ? 100 : 0;
        return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    };
    
    /**
     * Generate color with opacity
     * @param {string} baseColor - Base color in rgba format
     * @param {number} opacity - Opacity value (0-1)
     * @returns {string} - RGBA color string
     */
    const getColorWithOpacity = (baseColor, opacity) => {
        if (baseColor.startsWith('rgba')) {
            const parts = baseColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
            if (parts) {
                return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
            }
        } else if (baseColor.startsWith('rgb')) {
            const parts = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (parts) {
                return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
            }
        }
        
        // Default fallback for hex or named colors
        return baseColor;
    };
    
    /**
     * Generate a random yet visually pleasing color
     * @param {number} index - Index for generating consistent colors
     * @returns {string} - RGBA color string
     */
    const getChartColor = (index) => {
        const colors = [
            'rgba(103, 80, 164, 0.8)',  // Primary
            'rgba(98, 91, 113, 0.8)',   // Secondary
            'rgba(125, 82, 96, 0.8)',   // Tertiary
            'rgba(46, 125, 50, 0.8)',   // Success
            'rgba(13, 101, 116, 0.8)',  // Teal
            'rgba(68, 138, 255, 0.8)',  // Blue
            'rgba(213, 0, 249, 0.8)',   // Purple
            'rgba(197, 17, 98, 0.8)',   // Pink
            'rgba(239, 108, 0, 0.8)',   // Orange
            'rgba(192, 202, 51, 0.8)',  // Lime
            'rgba(0, 77, 64, 0.8)',     // Dark Teal
            'rgba(183, 28, 28, 0.8)'    // Dark Red
        ];
        
        return colors[index % colors.length];
    };
    
    /**
     * Get current theme color for charts
     * @param {number} opacity - Opacity for the color (0-1)
     * @returns {object} - Object with borderColor and backgroundColor
     */
    const getThemeColorForChart = (opacity = 1) => {
        const settings = DataManager.getSettings();
        const theme = settings.theme || 'default';
        const isDarkMode = settings.darkMode;
        
        // Default primary color (Purple)
        let rgbColor = '103, 80, 164';
        
        // Get RGB values based on theme
        switch (theme) {
            case 'blue':
                rgbColor = '12, 140, 233';
                break;
            case 'green':
                rgbColor = '46, 125, 50';
                break;
            case 'orange':
                rgbColor = '230, 81, 0';
                break;
            case 'red':
                rgbColor = '198, 40, 40';
                break;
            case 'teal':
                rgbColor = '0, 121, 107';
                break;
            case 'pink':
                rgbColor = '194, 24, 91';
                break;
            case 'indigo':
                rgbColor = '48, 63, 159';
                break;
            case 'amber':
                rgbColor = '255, 160, 0';
                break;
            case 'cyan':
                rgbColor = '0, 151, 167';
                break;
            default: // Purple
                rgbColor = '103, 80, 164';
        }
        
        return {
            borderColor: `rgba(${rgbColor}, ${opacity})`,
            backgroundColor: `rgba(${rgbColor}, ${opacity * 0.2})`,
            tooltipColor: `rgba(${rgbColor}, 0.9)`,
            darkMode: isDarkMode,
            // Text colors for scales and labels
            textColor: isDarkMode ? '#ffffff' : '#1C1B1F',
            gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        };
    };

    /**
     * Setup theme toggle functionality
     */
    const setupThemeToggle = () => {
        const themeToggle = document.getElementById('theme-toggle');
        const themePanel = document.getElementById('theme-panel');
        const themeOptions = document.querySelectorAll('.theme-option');
        
        // Apply saved theme on page load
        applyTheme();
        
        // Update active theme in panel
        updateActiveThemeInPanel();
        
        // Add click event to theme toggle button to show panel
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent body click from immediately closing panel
                toggleThemePanel();
            });
        }
        
        // Add click event to theme options
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = option.getAttribute('data-theme');
                setTheme(theme);
                toggleThemePanel(false); // Close the panel
            });
        });
        
        // Close theme panel when clicking elsewhere
        document.body.addEventListener('click', () => {
            if (themePanel && themePanel.classList.contains('active')) {
                toggleThemePanel(false);
            }
        });
        
        // Prevent clicks within the panel from bubbling to body
        themePanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    };
    
    /**
     * Toggle theme panel visibility
     * @param {boolean} [force] - Force specific state (true = open, false = close)
     */
    const toggleThemePanel = (force) => {
        const themePanel = document.getElementById('theme-panel');
        
        if (force === true) {
            themePanel.classList.add('active');
        } else if (force === false) {
            themePanel.classList.remove('active');
        } else {
            themePanel.classList.toggle('active');
        }
    };
    
    /**
     * Update active theme highlighting in the theme panel
     */
    const updateActiveThemeInPanel = () => {
        const settings = DataManager.getSettings();
        const currentTheme = settings.theme;
        
        // Remove active class from all options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to current theme
        const activeOption = document.querySelector(`.theme-option[data-theme="${currentTheme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    };
    
    /**
     * Set theme to specified theme name
     * @param {string} theme - Theme name to set ('default', 'blue', 'green', etc.)
     */
    const setTheme = (theme) => {
        // Get current settings
        const settings = DataManager.getSettings();
        
        // If theme hasn't changed, do nothing
        if (settings.theme === theme) return;
        
        // Update theme setting
        settings.theme = theme;
        
        // Save the setting
        DataManager.saveSettings(settings);
        
        // Apply the theme
        applyTheme();
        
        // Update active theme in panel
        updateActiveThemeInPanel();
        
        // Show toast notification with theme name (capitalize first letter)
        const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
        showToast(`Theme changed to ${themeName}`, 'info');
    };
    
    /**
     * Apply the current theme setting
     */
    const applyTheme = () => {
        const settings = DataManager.getSettings();
        const root = document.documentElement;
        const theme = settings.theme || 'default';
        
        // Remove all theme classes
        root.classList.remove('theme-blue', 'theme-green', 'theme-orange', 'theme-red', 
                            'theme-teal', 'theme-pink', 'theme-indigo', 'theme-amber', 'theme-cyan');
        
        // Add appropriate theme class based on setting
        if (theme !== 'default') {
            root.classList.add(`theme-${theme}`);
        }
        
        // Apply dark mode if enabled
        if (settings.darkMode) {
            root.classList.add('dark-mode');
            // Update dark mode button icon
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                darkModeToggle.title = 'Switch to light mode';
            }
        } else {
            root.classList.remove('dark-mode');
            // Update dark mode button icon
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                darkModeToggle.title = 'Switch to dark mode';
            }
        }
        
        // Update charts with new theme colors
        refreshChartsWithThemeColors();
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            // Get the computed primary color
            let themeColor = '#6750A4'; // Default purple
            
            switch (theme) {
                case 'blue':
                    themeColor = '#0C8CE9';
                    break;
                case 'green':
                    themeColor = '#2E7D32';
                    break;
                case 'orange':
                    themeColor = '#E65100';
                    break;
                case 'red':
                    themeColor = '#C62828';
                    break;
                case 'teal':
                    themeColor = '#00796B';
                    break;
                case 'pink':
                    themeColor = '#C2185B';
                    break;
                case 'indigo':
                    themeColor = '#303F9F';
                    break;
                case 'amber':
                    themeColor = '#FFA000';
                    break;
                case 'cyan':
                    themeColor = '#0097A7';
                    break;
            }
            
            // Adjust theme color for dark mode
            if (settings.darkMode) {
                themeColor = '#121212';
            }
            
            metaThemeColor.setAttribute('content', themeColor);
        }
    };
    
    /**
     * Setup dark mode toggle functionality
     */
    const setupDarkModeToggle = () => {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDarkMode();
            });
        }
        
        // Apply initial dark mode state
        applyDarkMode();
    };
    
    /**
     * Toggle dark mode
     */
    const toggleDarkMode = () => {
        const settings = DataManager.getSettings();
        settings.darkMode = !settings.darkMode;
        DataManager.saveSettings(settings);
        applyDarkMode();
        
        // Show toast notification
        const modeText = settings.darkMode ? 'Dark' : 'Light';
        showToast(`${modeText} mode enabled`, 'info');
    };
    
    /**
     * Apply dark mode based on current setting
     */
    const applyDarkMode = () => {
        const settings = DataManager.getSettings();
        const root = document.documentElement;
        
        if (settings.darkMode) {
            root.classList.add('dark-mode');
            // Update dark mode button icon
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                darkModeToggle.title = 'Switch to light mode';
            }
        } else {
            root.classList.remove('dark-mode');
            // Update dark mode button icon
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                darkModeToggle.title = 'Switch to dark mode';
            }
        }
        
        // Refresh charts when dark mode changes
        refreshChartsWithThemeColors();
    };
    
    /**
     * Refresh all charts with current theme colors
     */
    const refreshChartsWithThemeColors = () => {
        // Refresh weight chart if it exists
        if (typeof WeightManager !== 'undefined' && 
            typeof WeightManager.renderWeightChart === 'function') {
            setTimeout(() => WeightManager.renderWeightChart(), 10);
        }
        
        // Refresh progress chart if it exists
        if (typeof ProgressManager !== 'undefined' && 
            document.querySelector('.tab-content.active#progress')) {
            const exerciseSelect = document.getElementById('exercise-select');
            if (exerciseSelect && exerciseSelect.value) {
                const event = new Event('change');
                exerciseSelect.dispatchEvent(event);
            }
        }
    };
    
    // Public API
    return {
        initialize,
        openModal,
        closeModal,
        closeAllModals,
        showConfirmation,
        showToast,
        formatDate,
        formatDuration,
        formatTime,
        clearForm,
        getDateRange,
        filterDataByTimeframe,
        setupTimeframeSelector,
        parseShortDate,
        calculatePercentChange,
        getColorWithOpacity,
        getChartColor,
        getThemeColorForChart,
        setTheme,
        applyTheme,
        toggleDarkMode,
        applyDarkMode
    };
})();
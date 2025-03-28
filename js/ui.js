/**
 * LiftMate - UI Module
 * Handles general UI interactions and helpers
 */

const UI = (() => {
    /**
     * Determines if a color is light or dark
     * @param {string} colorStr - CSS color string (hex, rgb, rgba)
     * @returns {boolean} True if the color is light, false if dark
     */
    const isLightColor = (colorStr) => {
        // Default to assuming dark if we can't parse
        if (!colorStr) return false;
        
        let r, g, b;
        
        // Handle hex colors
        if (colorStr.startsWith('#')) {
            const hex = colorStr.slice(1);
            // Convert short hex (#rgb) to full hex (#rrggbb)
            const fullHex = hex.length === 3 
                ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] 
                : hex;
                
            r = parseInt(fullHex.slice(0, 2), 16);
            g = parseInt(fullHex.slice(2, 4), 16);
            b = parseInt(fullHex.slice(4, 6), 16);
        } 
        // Handle rgb/rgba colors
        else if (colorStr.startsWith('rgb')) {
            const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) || 
                             colorStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
            
            if (rgbMatch) {
                r = parseInt(rgbMatch[1]);
                g = parseInt(rgbMatch[2]);
                b = parseInt(rgbMatch[3]);
            } else {
                return false; // Couldn't parse
            }
        } else {
            return false; // Unknown color format
        }
        
        // Calculate perceived brightness using YIQ formula
        // YIQ = (R * 299 + G * 587 + B * 114) / 1000
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        
        // YIQ < 128 is considered dark, >= 128 is light
        return yiq >= 128;
    };
    
    /**
     * Update icon backgrounds based on theme brightness
     */
    const updateIconBackgrounds = () => {
        try {
            // Get the settings
            const settings = DataManager.getSettings();
            const theme = settings.theme || 'default';
            const isDarkMode = settings.darkMode || false;
            
            // Try to get the primary color from our theme system first
            let primaryColor;
            const themeColors = getThemeColors(theme);
            
            if (themeColors && themeColors.primary) {
                primaryColor = themeColors.primary;
            } else {
                // Fallback to getting from CSS
                primaryColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--md-primary')
                    .trim();
            }
            
            // Determine if the theme color is light or dark
            const isLightTheme = isLightColor(primaryColor);
            
            // Set CSS property for icon backgrounds based on theme brightness
            // For light themes (like amber/yellow) in light mode, use darker grey
            // For dark themes in light mode, use lighter grey
            // For dark mode, invert the logic
            let iconBgColor;
            
            if (isDarkMode) {
                // In dark mode, light themes get darker backgrounds (less contrast)
                // Dark themes get lighter backgrounds (more contrast)
                iconBgColor = isLightTheme 
                    ? 'rgba(90, 90, 90, 0.2)' 
                    : 'rgba(180, 180, 180, 0.2)';
            } else {
                // In light mode, light themes get darker backgrounds (more contrast)
                // Dark themes get lighter backgrounds (less contrast)
                iconBgColor = isLightTheme 
                    ? 'rgba(80, 80, 80, 0.2)' 
                    : 'rgba(200, 200, 200, 0.2)';
            }
            
            // Apply the icon background color CSS variable
            document.documentElement.style.setProperty('--icon-bg-color', iconBgColor);
            
            // Also set a fallback color for elements that might not be properly updated
            document.documentElement.style.setProperty('--fallback-icon-bg', iconBgColor);
        } catch (error) {
            console.error('Error updating icon backgrounds:', error);
            
            // Apply a safe fallback if anything fails
            const isDarkMode = document.body.classList.contains('dark-mode');
            const fallbackColor = isDarkMode ? 'rgba(180, 180, 180, 0.2)' : 'rgba(80, 80, 80, 0.2)';
            document.documentElement.style.setProperty('--icon-bg-color', fallbackColor);
            document.documentElement.style.setProperty('--fallback-icon-bg', fallbackColor);
        }
    };
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
        
        // Setup storage info toggle
        setupStorageInfoToggle();
        
        // Setup navigation bar hide/show on scroll
        setupNavBarScroll();
    };
    
    /**
     * Setup tab navigation functionality with elastic slide transition
     */
    const setupTabNavigation = () => {
        const navButtons = document.querySelectorAll('.nav-button');
        const tabContents = document.querySelectorAll('.tab-content');
        const tabContainer = document.querySelector('.tab-container');
        let isAnimating = false;
        let currentTab = null;
        let currentTabIndex = 0;
        
        /**
         * Initialize the first tab and set up the tab container
         */
        const initTabNavigation = () => {
            // Get active tab from DOM or default to first tab
            const activeNavButton = document.querySelector('.nav-button.active') || navButtons[0];
            
            if (activeNavButton) {
                const activeTabId = activeNavButton.getAttribute('data-tab');
                currentTab = document.getElementById(activeTabId);
                
                // Ensure active tab is visible and others are hidden
                tabContents.forEach(tab => {
                    if (tab.id === activeTabId) {
                        tab.classList.add('active');
                        tab.style.display = 'block';
                        tab.style.opacity = '1';
                    } else {
                        tab.classList.remove('active');
                        tab.style.display = 'none';
                        tab.style.opacity = '0';
                    }
                });
                
                // Ensure correct nav button is active
                navButtons.forEach((btn, idx) => {
                    if (btn === activeNavButton) {
                        btn.classList.add('active');
                        currentTabIndex = idx;
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        };
        
        /**
         * Perform the tab transition with elastic slide effect
         * @param {HTMLElement} oldTab - The tab to slide out
         * @param {HTMLElement} newTab - The tab to slide in
         * @param {boolean} goingRight - Direction of the transition
         */
        const performTransition = (oldTab, newTab, goingRight) => {
            if (isAnimating) return;
            isAnimating = true;
            
            // Check if on iOS device
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            
            // Make sure both tabs are ready for animation
            oldTab.style.display = 'block';
            newTab.style.display = 'block';
            
            // Remove any lingering animation classes
            oldTab.classList.remove('sliding-in-right', 'sliding-in-left', 'sliding-out-right', 'sliding-out-left');
            newTab.classList.remove('sliding-in-right', 'sliding-in-left', 'sliding-out-right', 'sliding-out-left');
            
            // Force reflow to ensure clean animation state
            void oldTab.offsetWidth;
            void newTab.offsetWidth;
            
            // Remove old tab immediately
            oldTab.style.display = 'none';
            oldTab.classList.remove('active');
            
            // Special handling for iOS devices
            if (isIOS) {
                // Add a special class for iOS animation trigger
                newTab.classList.add('ios-tab-transition');
                
                // Force browser to recognize the change
                void newTab.offsetWidth;
            }
            
            // Start animation for the new tab only
            // Invert the directions to match visual expectations
            if (goingRight) {
                newTab.classList.add('sliding-in-left');
            } else {
                newTab.classList.add('sliding-in-right');
            }
            
            // Ensure the sliding-in tab is properly positioned and visible
            newTab.style.opacity = '1';
            
            // Listen for animation completion with multiple event types for better iOS support
            const animationEndEvents = ['animationend', 'webkitAnimationEnd', 'oAnimationEnd', 'MSAnimationEnd'];
            
            const animationEndHandler = (event) => {
                if (event.target === newTab) {
                    completeAnimation();
                }
            };
            
            // Function to complete the animation (called by event or timer)
            const completeAnimation = () => {
                if (!isAnimating) return; // Avoid duplicate calls
                
                // Animation complete, clean up
                // Make new tab active
                newTab.classList.add('active');
                newTab.classList.remove('sliding-in-right', 'sliding-in-left', 'ios-tab-transition');
                
                // Reset animation state
                isAnimating = false;
                
                // Remove all listeners
                animationEndEvents.forEach(eventName => {
                    newTab.removeEventListener(eventName, animationEndHandler);
                });
            };
            
            // Add listeners for all animation end events for cross-browser/iOS support
            animationEndEvents.forEach(eventName => {
                newTab.addEventListener(eventName, animationEndHandler);
            });
            
            // More reliable fallback with longer timeout for iOS 
            setTimeout(completeAnimation, isIOS ? 500 : 400);
        };
        
        // Initialize tabs
        initTabNavigation();
        
        // Attach click handlers to navigation buttons with extra iOS support
        navButtons.forEach((button, index) => {
            // Use both click and touchend for better iOS support
            const handleTabSwitch = (e) => {
                // Prevent default only for touchend to avoid delays
                if (e.type === 'touchend') {
                    e.preventDefault();
                }
                
                const tabId = button.getAttribute('data-tab');
                const newTab = document.getElementById(tabId);
                
                if (!newTab || newTab === currentTab || isAnimating) return;
                
                // Check if on iOS device
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                
                // Update navigation buttons
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Determine slide direction
                const goingRight = index > currentTabIndex;
                
                // Perform the transition with a small delay for iOS to ensure UI updates first
                if (isIOS) {
                    // Small delay can help iOS process the UI changes first
                    setTimeout(() => {
                        performTransition(currentTab, newTab, goingRight);
                    }, 10);
                } else {
                    performTransition(currentTab, newTab, goingRight);
                }
                
                // Update current tab references
                currentTab = newTab;
                currentTabIndex = index;
                
                // Scroll to top
                window.scrollTo(0, 0);
            };
            
            // Add both event listeners for better iOS support
            button.addEventListener('click', handleTabSwitch);
            button.addEventListener('touchend', handleTabSwitch);
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
        
        // Ensure confirmation modal has higher z-index than the active workout modal
        modal.style.zIndex = "1200";
        
        openModal('confirmation-modal');
    };
    
    /**
     * Show a toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     * @param {string} themeColor - Optional theme color to use for the toast
     */
    const showToast = (message, type = 'info', themeColor = null) => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // If themeColor is provided, style the toast with the theme color
        if (themeColor) {
            toast.style.backgroundColor = themeColor;
            toast.style.color = '#FFFFFF';
            toast.style.border = `1px solid ${themeColor}`;
            // Add slight glow effect
            toast.style.boxShadow = `0 0 10px ${themeColor}40`;
        }
        
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
            getComputedStyle(document.documentElement).getPropertyValue('--md-primary').trim().replace('rgb(', 'rgba(').replace(')', ', 0.8)'),  // Primary (dynamically from theme)
            getComputedStyle(document.documentElement).getPropertyValue('--md-secondary').trim().replace('rgb(', 'rgba(').replace(')', ', 0.8)'),   // Secondary
            getComputedStyle(document.documentElement).getPropertyValue('--md-tertiary').trim().replace('rgb(', 'rgba(').replace(')', ', 0.8)'),   // Tertiary
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
        try {
            const settings = DataManager.getSettings();
            const theme = settings.theme || 'default';
            const isDarkMode = settings.darkMode;
            
            // Get colors from our centralized theme system
            const themeColors = getThemeColors(theme);
            
            // Convert to rgb format if it's a hex color
            let rgbColor;
            const primaryColor = themeColors.primary;
            
            if (primaryColor.startsWith('#')) {
                const rgb = hexToRgb(primaryColor);
                if (rgb) {
                    rgbColor = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                } else {
                    // Fallback if parsing fails
                    rgbColor = '103, 80, 164'; // Default purple
                }
            } else if (primaryColor.startsWith('rgb(')) {
                // Extract RGB values from rgb() format
                const matches = primaryColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (matches && matches.length === 4) {
                    rgbColor = `${matches[1]}, ${matches[2]}, ${matches[3]}`;
                } else {
                    rgbColor = '103, 80, 164'; // Default purple
                }
            } else if (primaryColor.startsWith('rgba(')) {
                // Extract RGB values from rgba() format
                const matches = primaryColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
                if (matches && matches.length === 4) {
                    rgbColor = `${matches[1]}, ${matches[2]}, ${matches[3]}`;
                } else {
                    rgbColor = '103, 80, 164'; // Default purple
                }
            } else {
                // Fallback to default
                rgbColor = '103, 80, 164'; // Default purple
            }
            
            // Get secondary color for accents (with fallback)
            let secondaryRgbColor;
            try {
                const secondaryColor = themeColors.secondary;
                if (secondaryColor.startsWith('#')) {
                    const rgb = hexToRgb(secondaryColor);
                    if (rgb) {
                        secondaryRgbColor = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                    }
                }
            } catch (error) {
                // If secondary color fails, use primary with slightly different opacity
                secondaryRgbColor = rgbColor; 
            }
            
            // Get text and grid colors based on dark mode
            const textColor = isDarkMode ? '#E6E1E5' : '#1C1B1F';
            const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            
            return {
                borderColor: `rgba(${rgbColor}, ${opacity})`,
                backgroundColor: `rgba(${rgbColor}, ${opacity * 0.2})`,
                tooltipColor: `rgba(${rgbColor}, 0.9)`,
                darkMode: isDarkMode,
                // Text colors for scales and labels
                textColor: textColor,
                gridColor: gridColor,
                // Additional colors for multi-series charts
                secondaryColor: secondaryRgbColor ? `rgba(${secondaryRgbColor}, ${opacity})` : undefined,
                secondaryBackgroundColor: secondaryRgbColor ? `rgba(${secondaryRgbColor}, ${opacity * 0.2})` : undefined
            };
        } catch (error) {
            console.error('Error getting theme colors for chart:', error);
            
            // Return fallback values if the theme system fails
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            return {
                borderColor: 'rgba(103, 80, 164, ' + opacity + ')',
                backgroundColor: 'rgba(103, 80, 164, ' + (opacity * 0.2) + ')',
                tooltipColor: 'rgba(103, 80, 164, 0.9)',
                darkMode: isDarkMode,
                textColor: isDarkMode ? '#E6E1E5' : '#1C1B1F',
                gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            };
        }
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
        
        // Close storage info panel if open
        const storageInfoPanel = document.getElementById('storage-info-panel');
        if (storageInfoPanel && storageInfoPanel.classList.contains('active')) {
            storageInfoPanel.classList.remove('active');
        }
        
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
        try {
            // Get current settings
            const settings = DataManager.getSettings();
            
            // If theme hasn't changed, do nothing
            if (settings.theme === theme) return;
            
            console.log(`Changing theme from ${settings.theme} to ${theme}`);
            
            // First start the transition animation before changing any settings
            // This ensures the screen is blurred first, then the theme changes
            animateThemeTransition(100, () => {
                // This callback will run when the screen is covered
                // Update theme setting
                settings.theme = theme;
                
                // Save the setting
                DataManager.saveSettings(settings);
                
                // Apply the theme with all the enhanced robustness
                applyTheme();
                
                // Update active theme in panel
                updateActiveThemeInPanel();
                
                // Show toast notification with theme name (capitalize first letter)
                const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
                
                // Get the theme color for the toast from our centralized theme system
                const themeColors = getThemeColors(theme);
                const themeColor = themeColors.primary;
                
                showToast(`Theme changed to ${themeName}`, 'info', themeColor);
                
                // Dispatch theme changed event for other modules to update
                document.dispatchEvent(new CustomEvent('themeChanged', { 
                    detail: { theme, isDarkMode: settings.darkMode } 
                }));
                
                // The actual reload will happen after this callback
            })
        } catch (error) {
            console.error('Error setting theme:', error);
            
            // Emergency fallback in case of failure:
            // 1. Attempt to update settings directly
            try {
                const settings = DataManager.getSettings();
                settings.theme = theme;
                DataManager.saveSettings(settings);
            } catch (saveError) {
                console.error('Failed to save theme setting:', saveError);
            }
            
            // 2. Apply theme using class-based fallback
            try {
                const root = document.documentElement;
                
                // Remove all theme classes
                root.classList.remove('theme-blue', 'theme-green', 'theme-orange', 'theme-red', 
                                    'theme-teal', 'theme-pink', 'theme-indigo', 'theme-amber', 'theme-cyan');
                
                // Add appropriate theme class
                if (theme !== 'default') {
                    root.classList.add(`theme-${theme}`);
                }
            } catch (classError) {
                console.error('Failed to apply theme classes:', classError);
            }
            
            // 3. Show a basic toast without theme color
            try {
                const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
                showToast(`Theme changed to ${themeName}`, 'info');
                
                // Still attempt to reload with animation in error case
                animateThemeTransition(50, null);
            } catch (toastError) {
                console.error('Failed to show theme change toast:', toastError);
                
                // Last resort reload with animation
                animateThemeTransition(50, null);
            }
        }
    };
    
    /**
     * Create a smooth transition animation and reload the page
     * @param {number} delay - Optional delay before starting the animation
     * @param {Function} [callback] - Optional callback to run when screen is covered but before reload
     */
    const animateThemeTransition = (delay = 50, callback = null) => {
        // Create or get the transition overlay element
        let transitionOverlay = document.getElementById('theme-transition-overlay');
        if (!transitionOverlay) {
            transitionOverlay = document.createElement('div');
            transitionOverlay.id = 'theme-transition-overlay';
            transitionOverlay.className = 'theme-transition-overlay';
            document.body.appendChild(transitionOverlay);
        } else {
            // Reset animation by removing and re-adding the element
            transitionOverlay.classList.remove('theme-transition-active');
        }
        
        // Ensure the overlay will be visible even before animation by forcing a reflow
        void transitionOverlay.offsetWidth;
        
        // Apply the animation after the specified delay
        setTimeout(() => {
            // Add the active class to start the animation
            transitionOverlay.classList.add('theme-transition-active');
            
            // Force any pending style changes to be applied immediately
            void transitionOverlay.offsetWidth;
            
            // Wait for animation to reach a point where the screen is sufficiently covered
            // (Around 70-80% opacity, which happens at about 100-150ms into the animation)
            setTimeout(() => {
                // Execute the callback if provided (for theme/mode changes)
                if (callback && typeof callback === 'function') {
                    callback();
                }
                
                // Small additional pause to ensure theme changes are applied
                // before the reload happens
                setTimeout(() => {
                    location.reload();
                }, 150);
            }, 120);
        }, delay);
    };

    /**
     * Map of theme colors for consistent reference
     * This centralized map ensures colors are consistent across the app
     */
    const THEME_COLORS = {
        default: {
            primary: '#6750A4',
            primaryContainer: '#EADDFF',
            secondary: '#625B71',
            secondaryContainer: '#E8DEF8',
            tertiary: '#7D5260',
            tertiaryContainer: '#FFD8E4',
            primaryDarker: '#483475'
        },
        blue: {
            primary: '#0C8CE9',
            primaryContainer: '#D1E4FF',
            secondary: '#0B57D0',
            secondaryContainer: '#D0E6FF',
            tertiary: '#175CDC',
            tertiaryContainer: '#DAE2FF',
            primaryDarker: '#0a65a6'
        },
        green: {
            primary: '#2E7D32',
            primaryContainer: '#B8F5B8',
            secondary: '#1B5E20',
            secondaryContainer: '#D7FFD9',
            tertiary: '#388E3C',
            tertiaryContainer: '#D8F8D8',
            primaryDarker: '#1c4d1f'
        },
        orange: {
            primary: '#E65100',
            primaryContainer: '#FFD9B6',
            secondary: '#F57C00',
            secondaryContainer: '#FFE0B2',
            tertiary: '#FF8F00',
            tertiaryContainer: '#FFECC9',
            primaryDarker: '#9e3700'
        },
        red: {
            primary: '#C62828',
            primaryContainer: '#FFDAD6',
            secondary: '#D32F2F',
            secondaryContainer: '#FFCDD2',
            tertiary: '#B71C1C',
            tertiaryContainer: '#FFCDD2',
            primaryDarker: '#8c1c1c'
        },
        teal: {
            primary: '#00796B',
            primaryContainer: '#B2DFDB',
            secondary: '#00695C',
            secondaryContainer: '#B2DFDB',
            tertiary: '#004D40',
            tertiaryContainer: '#A7FFEB',
            primaryDarker: '#004D40'
        },
        pink: {
            primary: '#C2185B',
            primaryContainer: '#FFD6EC',
            secondary: '#AD1457',
            secondaryContainer: '#F8BBD0',
            tertiary: '#880E4F',
            tertiaryContainer: '#FFD6EC',
            primaryDarker: '#880E4F'
        },
        indigo: {
            primary: '#303F9F',
            primaryContainer: '#D1D9FF',
            secondary: '#3949AB',
            secondaryContainer: '#C5CAE9',
            tertiary: '#1A237E',
            tertiaryContainer: '#C5CAE9',
            primaryDarker: '#1A237E'
        },
        amber: {
            primary: '#FFA000',
            primaryContainer: '#FFECB3',
            secondary: '#FF8F00',
            secondaryContainer: '#FFE082',
            tertiary: '#FF6F00',
            tertiaryContainer: '#FFE082',
            primaryDarker: '#FF8F00'
        },
        cyan: {
            primary: '#0097A7',
            primaryContainer: '#B2EBF2',
            secondary: '#00838F',
            secondaryContainer: '#B2EBF2',
            tertiary: '#006064',
            tertiaryContainer: '#84FFFF',
            primaryDarker: '#006064'
        }
    };
    
    /**
     * Get theme colors object for specified theme
     * @param {string} themeName - Name of the theme
     * @returns {Object} - Theme color object
     */
    const getThemeColors = (themeName) => {
        const theme = themeName || 'default';
        return THEME_COLORS[theme] || THEME_COLORS.default;
    };
    
    /**
     * Apply theme colors to CSS variables
     * @param {string} theme - Theme name
     * @param {boolean} isDarkMode - Whether dark mode is enabled
     */
    const applyThemeColors = (theme, isDarkMode) => {
        try {
            const root = document.documentElement;
            const colors = getThemeColors(theme);
            
            // Apply main theme colors to CSS variables
            root.style.setProperty('--md-primary', colors.primary);
            root.style.setProperty('--md-primary-container', colors.primaryContainer);
            root.style.setProperty('--md-secondary', colors.secondary);
            root.style.setProperty('--md-secondary-container', colors.secondaryContainer);
            root.style.setProperty('--md-tertiary', colors.tertiary);
            root.style.setProperty('--md-tertiary-container', colors.tertiaryContainer);
            root.style.setProperty('--md-primary-darker', colors.primaryDarker);
            
            // Set RGB values separately for opacity variants
            const primaryRgb = hexToRgb(colors.primary);
            if (primaryRgb) {
                root.style.setProperty('--md-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
                root.style.setProperty('--md-primary-opacity-10', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
                root.style.setProperty('--md-primary-opacity-15', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`);
            }
            
            // Apply additional dark mode specific colors if needed
            if (isDarkMode) {
                // Additional dark mode specific color adjustments can be applied here
                root.style.setProperty('--md-surface', '#121212');
                root.style.setProperty('--md-background', '#121212');
                root.style.setProperty('--md-on-surface', '#E6E1E5');
                root.style.setProperty('--md-on-surface-variant', '#CAC4D0');
            } else {
                // Reset to light mode colors
                root.style.setProperty('--md-surface', '#FFFBFE');
                root.style.setProperty('--md-background', '#FFFBFE');
                root.style.setProperty('--md-on-surface', '#1C1B1F');
                root.style.setProperty('--md-on-surface-variant', '#49454E');
            }
        } catch (error) {
            console.error('Failed to apply theme colors:', error);
            // Fallback to class-based approach if direct CSS variables fail
            applyThemeWithClasses(theme, isDarkMode);
        }
    };
    
    /**
     * Convert hex color to RGB components
     * @param {string} hex - Hex color string
     * @returns {Object|null} - Object with r, g, b components or null if invalid
     */
    const hexToRgb = (hex) => {
        try {
            // Handle both with and without # prefix
            const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
            
            // Handle short hex format (e.g., #ABC)
            if (cleanHex.length === 3) {
                return {
                    r: parseInt(cleanHex[0] + cleanHex[0], 16),
                    g: parseInt(cleanHex[1] + cleanHex[1], 16),
                    b: parseInt(cleanHex[2] + cleanHex[2], 16)
                };
            }
            
            // Handle standard hex format (e.g., #AABBCC)
            return {
                r: parseInt(cleanHex.slice(0, 2), 16),
                g: parseInt(cleanHex.slice(2, 4), 16),
                b: parseInt(cleanHex.slice(4, 6), 16)
            };
        } catch (error) {
            console.error('Failed to parse hex color', hex, error);
            return null;
        }
    };
    
    /**
     * Fallback method to apply theme using CSS classes
     * @param {string} theme - Theme name
     * @param {boolean} isDarkMode - Whether dark mode is enabled
     */
    const applyThemeWithClasses = (theme, isDarkMode) => {
        const root = document.documentElement;
        
        // Remove all theme classes
        root.classList.remove('theme-blue', 'theme-green', 'theme-orange', 'theme-red', 
                            'theme-teal', 'theme-pink', 'theme-indigo', 'theme-amber', 'theme-cyan');
        
        // Add appropriate theme class based on setting
        if (theme !== 'default') {
            root.classList.add(`theme-${theme}`);
        }
        
        // Apply dark mode if enabled
        if (isDarkMode) {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
    };
    
    /**
     * Apply the current theme setting
     */
    const applyTheme = () => {
        try {
            console.log('Applying theme...');
            const settings = DataManager.getSettings();
            const root = document.documentElement;
            const theme = settings.theme || 'default';
            const isDarkMode = settings.darkMode || false;
            
            // First approach: Apply CSS variables directly
            applyThemeColors(theme, isDarkMode);
            
            // Second approach: Apply theme classes as fallback
            applyThemeWithClasses(theme, isDarkMode);
            
            // Update dark mode button icon
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = isDarkMode ? 
                    '<i class="fas fa-sun"></i>' : 
                    '<i class="fas fa-moon"></i>';
                darkModeToggle.title = isDarkMode ? 
                    'Switch to light mode' : 
                    'Switch to dark mode';
            }
            
            // Update all components that depend on theme colors
            updateThemeComponents();
            
            // Update meta theme-color for mobile browsers
            updateMetaThemeColor(theme, isDarkMode);
            
            console.log('Theme applied successfully');
        } catch (error) {
            console.error('Error applying theme:', error);
            // Emergency fallback to default purple theme
            document.documentElement.classList.remove('theme-blue', 'theme-green', 'theme-orange', 'theme-red', 
                'theme-teal', 'theme-pink', 'theme-indigo', 'theme-amber', 'theme-cyan', 'dark-mode');
            if (settings && settings.darkMode) {
                document.documentElement.classList.add('dark-mode');
            }
        }
    };
    
    /**
     * Update all components that depend on theme colors
     */
    const updateThemeComponents = () => {
        // Use try/catch blocks for each component to prevent failures cascading
        
        try {
            // Update charts with new theme colors
            refreshChartsWithThemeColors();
        } catch (error) {
            console.error('Error updating charts with theme colors:', error);
        }
        
        try {
            // Update muscle visualizations with new theme colors
            if (typeof VisualizationManager !== 'undefined') {
                // Update muscle heatmap colors
                if (VisualizationManager.renderMuscleHeatmap) {
                    VisualizationManager.renderMuscleHeatmap();
                }
                
                // Update legend for muscle heatmap
                const legendScale = document.getElementById('intensity-legend-scale');
                if (legendScale) {
                    // Clear and update muscle heatmap legend
                    legendScale.innerHTML = '';
                    const colorPalette = VisualizationManager.getColorPalette();
                    if (colorPalette && colorPalette.getMuscleHeatColors) {
                        const heatColors = colorPalette.getMuscleHeatColors();
                        heatColors.forEach(color => {
                            const colorBox = document.createElement('div');
                            colorBox.className = 'legend-color';
                            colorBox.style.backgroundColor = color;
                            legendScale.appendChild(colorBox);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error updating visualizations with theme colors:', error);
        }
        
        try {
            // Update icon backgrounds based on theme brightness
            updateIconBackgrounds();
        } catch (error) {
            console.error('Error updating icon backgrounds:', error);
        }
    };
    
    /**
     * Update meta theme-color for mobile browsers
     * @param {string} theme - Theme name
     * @param {boolean} isDarkMode - Whether dark mode is enabled
     */
    const updateMetaThemeColor = (theme, isDarkMode) => {
        try {
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (!metaThemeColor) return;
            
            // Get theme colors from our central color dictionary
            const colors = getThemeColors(theme);
            let themeColor = colors.primary; // Default to theme primary color
            
            // Adjust theme color for dark mode
            if (isDarkMode) {
                themeColor = '#121212';
            }
            
            metaThemeColor.setAttribute('content', themeColor);
        } catch (error) {
            console.error('Error updating meta theme color:', error);
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
        // First, start the transition animation before changing any settings
        // This ensures the screen is blurred first, then the theme changes
        animateThemeTransition(100, () => {
            // This callback will run when the screen is covered
            const settings = DataManager.getSettings();
            settings.darkMode = !settings.darkMode;
            DataManager.saveSettings(settings);
            applyDarkMode();
            
            // Show toast notification
            const modeText = settings.darkMode ? 'Dark' : 'Light';
            
            // Get current theme color
            const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--md-primary').trim();
            
            showToast(`${modeText} mode enabled`, 'info', themeColor);
            
            // Dispatch theme changed event for other modules to update
            document.dispatchEvent(new CustomEvent('themeChanged', { 
                detail: { theme: settings.theme, isDarkMode: settings.darkMode } 
            }));
            
            // The actual reload will happen after this callback
        });
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
        
        // Update icon backgrounds based on theme brightness
        updateIconBackgrounds();
        
        // Refresh charts when dark mode changes
        refreshChartsWithThemeColors();
        
        // Update muscle visualizations with new theme colors
        if (typeof VisualizationManager !== 'undefined') {
            // Update muscle heatmap colors
            if (VisualizationManager.renderMuscleHeatmap) {
                VisualizationManager.renderMuscleHeatmap();
            }
            
            // Update legend for muscle heatmap
            const legendScale = document.getElementById('intensity-legend-scale');
            if (legendScale) {
                // Clear and update muscle heatmap legend
                legendScale.innerHTML = '';
                const colorPalette = VisualizationManager.getColorPalette();
                if (colorPalette && colorPalette.getMuscleHeatColors) {
                    const heatColors = colorPalette.getMuscleHeatColors();
                    heatColors.forEach(color => {
                        const colorBox = document.createElement('div');
                        colorBox.className = 'legend-color';
                        colorBox.style.backgroundColor = color;
                        legendScale.appendChild(colorBox);
                    });
                }
            }
        }
    };
    
    /**
     * Setup storage info toggle button
     */
    const setupStorageInfoToggle = () => {
        const storageInfoToggle = document.getElementById('storage-info-toggle');
        const storageInfoPanel = document.getElementById('storage-info-panel');
        
        if (storageInfoToggle) {
            storageInfoToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleStorageInfoPanel();
                
                // Immediately update storage usage when panel is opened
                if (storageInfoPanel.classList.contains('active')) {
                    updateStorageInfo();
                }
            });
        }
        
        // Close storage info panel when clicking elsewhere
        document.body.addEventListener('click', () => {
            if (storageInfoPanel && storageInfoPanel.classList.contains('active')) {
                toggleStorageInfoPanel(false);
            }
        });
        
        // Prevent clicks within the panel from bubbling to body
        if (storageInfoPanel) {
            storageInfoPanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Set initial update
        setTimeout(updateStorageInfo, 1000);
    };
    
    /**
     * Toggle storage info panel visibility
     * @param {boolean} [force] - Force specific state (true = open, false = close)
     */
    const toggleStorageInfoPanel = (force) => {
        const storageInfoPanel = document.getElementById('storage-info-panel');
        
        // Close theme panel if open
        toggleThemePanel(false);
        
        if (force === true) {
            storageInfoPanel.classList.add('active');
        } else if (force === false) {
            storageInfoPanel.classList.remove('active');
        } else {
            storageInfoPanel.classList.toggle('active');
        }
    };
    
    /**
     * Format bytes to human-readable format
     * @param {number} bytes - Number of bytes
     * @param {number} [decimals=2] - Number of decimal places
     * @returns {string} - Formatted string with appropriate unit
     */
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    /**
     * Update storage info display
     */
    const updateStorageInfo = async () => {
        try {
            const storageInfo = await DataManager.getStorageInfo();
            
            // Update local storage info
            const localStorageBar = document.getElementById('local-storage-bar');
            const localStoragePercent = document.getElementById('local-storage-percent');
            const localStorageUsage = document.getElementById('local-storage-usage');
            
            if (localStorageBar && localStoragePercent && localStorageUsage && storageInfo.localStorage) {
                const percent = parseFloat(storageInfo.localStorage.usagePercent);
                localStorageBar.style.width = `${percent}%`;
                
                // Change color based on usage
                if (percent > 90) {
                    localStorageBar.style.backgroundColor = 'var(--md-error)';
                } else if (percent > 70) {
                    localStorageBar.style.backgroundColor = 'var(--warning-color)';
                } else {
                    localStorageBar.style.backgroundColor = 'var(--md-primary)';
                }
                
                localStoragePercent.textContent = `${percent}%`;
                const formattedUsage = formatBytes(storageInfo.localStorage.usage);
                const formattedCapacity = formatBytes(storageInfo.localStorage.capacity);
                localStorageUsage.textContent = `${formattedUsage} / ${formattedCapacity}`;
            }
            
            // Update IndexedDB info
            const indexedDBBar = document.getElementById('indexeddb-bar');
            const indexedDBPercent = document.getElementById('indexeddb-percent');
            const indexedDBUsage = document.getElementById('indexeddb-usage');
            
            if (indexedDBBar && indexedDBPercent && indexedDBUsage && storageInfo.indexedDB) {
                const percent = parseFloat(storageInfo.indexedDB.usagePercent);
                indexedDBBar.style.width = `${percent}%`;
                
                // Change color based on usage
                if (percent > 90) {
                    indexedDBBar.style.backgroundColor = 'var(--md-error)';
                } else if (percent > 70) {
                    indexedDBBar.style.backgroundColor = 'var(--warning-color)';
                } else {
                    indexedDBBar.style.backgroundColor = 'var(--md-primary)';
                }
                
                indexedDBPercent.textContent = `${percent}%`;
                const formattedUsage = formatBytes(storageInfo.indexedDB.usage);
                const formattedCapacity = formatBytes(storageInfo.indexedDB.capacity);
                indexedDBUsage.textContent = `${formattedUsage} / ${formattedCapacity}`;
            }
        } catch (error) {
            console.error('Error updating storage info:', error);
        }
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
        
        // Refresh visualization charts if they exist
        if (typeof VisualizationManager !== 'undefined') {
            // Update rep ranges chart
            if (VisualizationManager.renderRepRangesChart) {
                setTimeout(() => VisualizationManager.renderRepRangesChart(), 10);
            }
            
            // Update volume distribution chart
            if (VisualizationManager.renderVolumeDistribution) {
                setTimeout(() => VisualizationManager.renderVolumeDistribution(), 10);
            }
        }
    };
    
    
    /**
     * Setup navigation bar hide/show on scroll
     */
    const setupNavBarScroll = () => {
        try {
            const mobileNav = document.querySelector('.mobile-nav');
            if (!mobileNav) return;
            
            let lastScrollTop = 0;
            let ticking = false;
            
            // Function to handle the scroll event
            const handleScroll = () => {
                const currentScrollTop = window.scrollY;
                
                // Show navbar when scrolling up, hide when scrolling down
                if (currentScrollTop > 10) { // Ignore small scroll positions
                    if (currentScrollTop > lastScrollTop) {
                        // Scrolling down
                        mobileNav.classList.add('nav-hidden');
                    } else {
                        // Scrolling up
                        mobileNav.classList.remove('nav-hidden');
                    }
                } else {
                    // At the top of the page, always show
                    mobileNav.classList.remove('nav-hidden');
                }
                
                lastScrollTop = currentScrollTop;
                ticking = false;
            };
            
            // Add scroll event listener with throttling
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        handleScroll();
                    });
                    ticking = true;
                }
            });
            
            // Show navbar when user touches the bottom area of the screen
            const touchBottom = (e) => {
                const touchY = e.touches[0].clientY;
                const windowHeight = window.innerHeight;
                
                // If the touch is in the bottom 20% of the screen
                if (touchY > windowHeight * 0.8) {
                    mobileNav.classList.remove('nav-hidden');
                }
            };
            
            document.addEventListener('touchstart', touchBottom);
            
            console.log('Navigation bar scroll behavior initialized');
        } catch (error) {
            console.warn('Error setting up navigation bar scroll behavior:', error);
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
        applyDarkMode,
        isLightColor,
        updateIconBackgrounds,
        // Expose theme color system to other modules
        getThemeColors,
        hexToRgb
    };
})();


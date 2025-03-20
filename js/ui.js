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
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @returns {string} - Formatted date string
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
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
        setupTimeframeSelector
    };
})();

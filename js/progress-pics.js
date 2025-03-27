/**
 * LiftMate - Progress Pictures Module
 * Handles functionality for uploading, viewing, and comparing progress pictures
 */

const ProgressPicsManager = (() => {
    // DOM Elements
    let addPicButton;
    let progressPicsGrid;
    let noMessageElement;
    let beforeDateSelect;
    let afterDateSelect;
    let beforeImageElement;
    let afterImageElement;
    let picDateInput;
    let picCategorySelect;
    let picNotesInput;
    let picUploadInput;
    let uploadPreviewImg;
    let uploadPlaceholderElement;
    let saveProgressPicButton;
    let cancelProgressPicButton;
    let deletePicButton;
    let backToPicsButton;
    let filterButtons;
    
    // State variables
    let currentFilter = 'all';
    let currentImageFile = null;
    let selectedPicId = null;
    
    /**
     * Initialize the progress pictures module
     */
    const initialize = () => {
        console.log('Initializing ProgressPicsManager');
        
        // Ensure DOM is ready before proceeding
        setTimeout(() => {
            // Cache DOM elements
            addPicButton = document.getElementById('add-progress-pic');
            progressPicsGrid = document.getElementById('progress-pics-grid');
            noMessageElement = document.getElementById('no-pics-message');
            // Comparison elements removed
            picDateInput = document.getElementById('pic-date');
            picCategorySelect = document.getElementById('pic-category');
            picNotesInput = document.getElementById('pic-notes');
            picUploadInput = document.getElementById('pic-upload');
            uploadPreviewImg = document.getElementById('upload-preview-img');
            uploadPlaceholderElement = document.getElementById('upload-placeholder');
            saveProgressPicButton = document.getElementById('save-progress-pic');
            cancelProgressPicButton = document.getElementById('cancel-progress-pic');
            deletePicButton = document.getElementById('delete-pic');
            backToPicsButton = document.getElementById('back-to-pics');
            filterButtons = document.querySelectorAll('.date-filter-button');
            
            // Set up event listener for tab activation first, which is less likely to fail
            document.querySelectorAll('.nav-button').forEach(button => {
                button.addEventListener('click', () => {
                    const tabId = button.getAttribute('data-tab');
                    if (tabId === 'progress-pics') {
                        console.log('Progress pics tab activated');
                        // Refresh data when tab is activated
                        refreshProgressPics();
                    }
                });
            });
            
            // Ensure IndexedDB is initialized before displaying pictures
            initializeIndexedDB().then(() => {
                // Set up event listeners safely
                if (addPicButton && picUploadInput && deletePicButton && backToPicsButton) {
                    setupEventListeners();
                }
                
                // Load and display progress pictures
                refreshProgressPics();
            }).catch(error => {
                console.error('Error initializing IndexedDB:', error);
                
                // Continue anyway to avoid blocking user
                if (addPicButton && picUploadInput && deletePicButton && backToPicsButton) {
                    setupEventListeners();
                }
                
                refreshProgressPics();
            });
        }, 100); // Short delay to ensure DOM is ready
    };
    
    /**
     * Initialize IndexedDB for progress pictures
     * @returns {Promise} - Promise that resolves when DB is ready
     */
    const initializeIndexedDB = () => {
        return new Promise((resolve, reject) => {
            const dbName = 'ProgressPicsDB';
            const storeName = 'pictures';
            const dbVersion = 1;
            
            // Check if IndexedDB is supported
            if (!window.indexedDB) {
                reject(new Error('Your browser does not support IndexedDB'));
                return;
            }
            
            // Open or create the database
            const request = indexedDB.open(dbName, dbVersion);
            
            request.onerror = (event) => {
                reject(event.target.error);
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
                resolve();
            };
        });
    };
    
    /**
     * Set up event listeners for the progress pictures functionality
     */
    const setupEventListeners = () => {
        // Add new picture button
        addPicButton.addEventListener('click', () => {
            openAddPicModal();
        });
        
        // File upload preview and auto-save
        picUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                currentImageFile = file;
                displayFilePreview(file);
                console.log('File selected:', file.name, 'Size:', file.size);
            } else {
                console.log('No file selected in change event');
            }
        });
        
        // Make the upload placeholder and preview clickable to trigger file input
        uploadPlaceholderElement.addEventListener('click', () => {
            picUploadInput.click();
        });
        
        uploadPreviewImg.addEventListener('click', () => {
            picUploadInput.click();
        });
        
        // Save progress picture via button click
        saveProgressPicButton.addEventListener('click', (event) => {
            event.preventDefault();
            saveProgressPic();
        });
        
        // Cancel add picture
        cancelProgressPicButton.addEventListener('click', () => {
            UI.closeModal(document.getElementById('progress-pic-modal'));
            resetPicForm();
        });
        
        // Delete picture
        deletePicButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Try to get the ID from the selectedPicId variable or the button data attribute as fallback
            const picIdToDelete = selectedPicId || deletePicButton.getAttribute('data-pic-id');
            
            console.log('Delete button clicked, ID to delete:', picIdToDelete);
            
            if (picIdToDelete) {
                // Show confirmation dialog before deleting
                UI.showConfirmation(
                    'Delete Picture',
                    'Are you sure you want to delete this progress picture? This action cannot be undone.',
                    () => deleteProgressPic(picIdToDelete)
                );
            } else {
                console.error('No picture ID found for deletion');
                UI.showToast('Error: Cannot identify which picture to delete', 'error');
            }
        });
        
        // Back to pictures list
        backToPicsButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back to pics button clicked');
            const modal = document.getElementById('pic-detail-modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update filter and refresh display
                currentFilter = filter;
                refreshProgressPics();
            });
        });
        
        // Comparison feature removed
    };
    
    /**
     * Open the add picture modal and prepare the form
     */
    const openAddPicModal = () => {
        // Reset the form
        resetPicForm();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        picDateInput.value = today;
        
        // Open the modal
        UI.openModal('progress-pic-modal');
    };
    
    /**
     * Reset the picture upload form
     */
    const resetPicForm = () => {
        document.getElementById('progress-pic-form').reset();
        currentImageFile = null;
        uploadPreviewImg.src = '';
        uploadPreviewImg.classList.add('hidden');
        uploadPlaceholderElement.classList.remove('hidden');
    };
    
    /**
     * Display a preview of the selected image file
     * @param {File} file - The image file to preview
     */
    const displayFilePreview = (file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                uploadPreviewImg.src = e.target.result;
                uploadPreviewImg.classList.remove('hidden');
                uploadPlaceholderElement.classList.add('hidden');
            };
            
            reader.readAsDataURL(file);
        }
    };
    
    /**
     * Save a new progress picture
     */
    const saveProgressPic = () => {
        console.log('Save progress pic called, currentImageFile:', currentImageFile ? 'exists' : 'null');
        
        if (!currentImageFile) {
            UI.showToast('Please select an image to upload', 'error');
            // Re-open the file dialog to prompt user to select a file
            picUploadInput.click();
            return;
        }
        
        // Create picture metadata
        const picData = {
            id: generateId(), // Ensure we have a unique ID
            date: picDateInput.value,
            category: picCategorySelect.value,
            notes: picNotesInput.value.trim(),
            timestamp: new Date().toISOString()
        };
        
        console.log('Processing image file:', currentImageFile.name, 'Size:', currentImageFile.size);
        
        // Show loading state
        saveProgressPicButton.disabled = true;
        saveProgressPicButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        // Convert the image file to a blob for storage
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log('File read successfully, creating blob');
            const imageBlob = new Blob([event.target.result], { type: currentImageFile.type });
            
            // Save the image and metadata
            DataManager.saveProgressPic(picData, imageBlob)
                .then(() => {
                    console.log('Progress picture saved successfully');
                    UI.closeModal(document.getElementById('progress-pic-modal'));
                    UI.showToast('Progress picture saved successfully', 'success');
                    refreshProgressPics();
                })
                .catch(error => {
                    console.error('Error saving progress picture:', error);
                    UI.showToast('Error saving progress picture: ' + (error.message || 'Unknown error'), 'error');
                    // Reset button state
                    saveProgressPicButton.disabled = false;
                    saveProgressPicButton.innerHTML = 'SAVE';
                });
        };
        
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            UI.showToast('Error reading image file', 'error');
            // Reset button state
            saveProgressPicButton.disabled = false;
            saveProgressPicButton.innerHTML = 'SAVE';
        };
        
        try {
            reader.readAsArrayBuffer(currentImageFile);
        } catch (error) {
            console.error('Exception reading file:', error);
            UI.showToast('Error processing image file: ' + (error.message || 'Unknown error'), 'error');
            // Reset button state
            saveProgressPicButton.disabled = false;
            saveProgressPicButton.innerHTML = 'SAVE';
        }
    };
    
    /**
     * Generate a unique ID for pictures
     * @returns {string} - Unique ID
     */
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    /**
     * Refresh the progress pictures grid
     */
    const refreshProgressPics = () => {
        // Get all progress pics metadata
        let pics = DataManager.getProgressPicsMeta();
        
        // Apply date filter
        if (currentFilter !== 'all') {
            pics = UI.filterDataByTimeframe(pics, currentFilter);
        }
        
        // Clear the grid
        progressPicsGrid.innerHTML = '';
        
        // Check if there are any pictures
        if (pics.length === 0) {
            noMessageElement.classList.remove('hidden');
        } else {
            noMessageElement.classList.add('hidden');
            
            // Add pictures to the grid
            pics.forEach(pic => {
                addPicToGrid(pic);
            });
        }
    };
    
    /**
     * Add a picture to the grid
     * @param {Object} pic - Picture metadata object
     */
    const addPicToGrid = (pic) => {
        // Create grid item
        const gridItem = document.createElement('div');
        gridItem.className = 'pic-grid-item';
        gridItem.setAttribute('data-id', pic.id);
        
        // Add date heading
        const dateHeading = document.createElement('div');
        dateHeading.className = 'pic-date';
        dateHeading.textContent = UI.formatDate(pic.date);
        gridItem.appendChild(dateHeading);
        
        // Add image container
        const imgContainer = document.createElement('div');
        imgContainer.className = 'pic-thumbnail';
        
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        imgContainer.appendChild(loadingIndicator);
        
        // Load and add image with retry mechanism
        const loadImage = (retryCount = 0) => {
            DataManager.getProgressPicImage(pic.id)
                .then(imageBlob => {
                    // Create image URL
                    const imageUrl = URL.createObjectURL(imageBlob);
                    
                    // Create and add image element
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = `Progress pic from ${pic.date}`;
                    img.onload = () => {
                        // Remove loading indicator once image is loaded
                        if (loadingIndicator.parentNode) {
                            loadingIndicator.remove();
                        }
                    };
                    
                    imgContainer.appendChild(img);
                })
                .catch(error => {
                    console.error(`Error loading image (attempt ${retryCount + 1}):`, error);
                    
                    // Retry up to 3 times with exponential backoff
                    if (retryCount < 3) {
                        setTimeout(() => {
                            loadImage(retryCount + 1);
                        }, 300 * Math.pow(2, retryCount));
                    } else {
                        imgContainer.innerHTML = '<div class="error-loading"><i class="fas fa-exclamation-circle"></i><p>Error loading image</p></div>';
                    }
                });
        };
        
        // Start loading the image
        loadImage();
        
        gridItem.appendChild(imgContainer);
        
        // Add category label
        const categoryLabel = document.createElement('div');
        categoryLabel.className = 'pic-category';
        categoryLabel.textContent = getCategoryDisplayName(pic.category);
        gridItem.appendChild(categoryLabel);
        
        // Add click event to view details
        gridItem.addEventListener('click', () => {
            openPicDetailModal(pic);
        });
        
        // Add to grid
        progressPicsGrid.appendChild(gridItem);
    };
    
    /**
     * Get display name for a picture category
     * @param {string} category - Category value
     * @returns {string} - Display name for category
     */
    const getCategoryDisplayName = (category) => {
        switch (category) {
            case 'front': return 'Front View';
            case 'back': return 'Back View';
            case 'side': return 'Side View';
            case 'other': return 'Other';
            default: return category;
        }
    };
    
    /**
     * Open the picture detail modal
     * @param {Object} pic - Picture metadata object
     */
    const openPicDetailModal = (pic) => {
        console.log('Opening detail modal for picture:', pic);
        
        // Store the selected picture ID
        selectedPicId = pic.id;
        
        // Also store it as a data attribute on the delete button for debugging
        const deleteButton = document.getElementById('delete-pic');
        deleteButton.setAttribute('data-pic-id', pic.id);
        
        // Make sure the buttons are responsive
        deleteButton.disabled = false;
        document.getElementById('back-to-pics').disabled = false;
        
        // Set modal content
        document.getElementById('pic-detail-date').textContent = UI.formatDate(pic.date);
        document.getElementById('pic-detail-category').textContent = getCategoryDisplayName(pic.category);
        
        // Handle notes
        const notesContainer = document.getElementById('pic-detail-notes-container');
        const notesElement = document.getElementById('pic-detail-notes');
        
        if (pic.notes && pic.notes.trim()) {
            notesElement.textContent = pic.notes;
            notesContainer.classList.remove('hidden');
        } else {
            notesContainer.classList.add('hidden');
        }
        
        // Load and display the image
        const detailImg = document.getElementById('pic-detail-img');
        detailImg.src = ''; // Clear previous image
        
        // Add loading indicator
        const imgContainer = document.querySelector('.pic-detail-image');
        imgContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Load image with retry mechanism
        const loadDetailImage = (retryCount = 0) => {
            DataManager.getProgressPicImage(pic.id)
                .then(imageBlob => {
                    // Create image URL
                    const imageUrl = URL.createObjectURL(imageBlob);
                    
                    // Clear loading indicator and add image
                    imgContainer.innerHTML = '';
                    detailImg.src = imageUrl;
                    imgContainer.appendChild(detailImg);
                })
                .catch(error => {
                    console.error(`Error loading detail image (attempt ${retryCount + 1}):`, error);
                    
                    // Retry up to 3 times with exponential backoff
                    if (retryCount < 3) {
                        setTimeout(() => {
                            loadDetailImage(retryCount + 1);
                        }, 300 * Math.pow(2, retryCount));
                    } else {
                        imgContainer.innerHTML = '<div class="error-loading"><i class="fas fa-exclamation-circle"></i><p>Error loading image</p></div>';
                    }
                });
        };
        
        // Start loading the image
        loadDetailImage();
        
        // Open the modal
        UI.openModal('pic-detail-modal');
    };
    
    /**
     * Delete a progress picture
     * @param {string} picId - ID of picture to delete
     */
    const deleteProgressPic = (picId) => {
        if (!picId) {
            console.error('No picture ID provided for deletion');
            UI.showToast('Error deleting picture: No ID provided', 'error');
            return;
        }
        
        console.log('Deleting picture with ID:', picId);
        
        // Show loading state
        const deleteButton = document.getElementById('delete-pic');
        const originalHtml = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        deleteButton.disabled = true;
        
        try {
            DataManager.deleteProgressPic(picId)
                .then(success => {
                    console.log('Delete result:', success);
                    if (success) {
                        UI.closeModal(document.getElementById('pic-detail-modal'));
                        UI.showToast('Progress picture deleted', 'success');
                        refreshProgressPics();
                    } else {
                        // Restore button state
                        deleteButton.innerHTML = originalHtml;
                        deleteButton.disabled = false;
                        UI.showToast('Error deleting picture: Not found in storage', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error deleting progress picture:', error);
                    // Restore button state
                    deleteButton.innerHTML = originalHtml;
                    deleteButton.disabled = false;
                    UI.showToast('Error deleting picture: ' + (error.message || 'Unknown error'), 'error');
                });
        } catch (error) {
            console.error('Exception when deleting picture:', error);
            deleteButton.innerHTML = originalHtml;
            deleteButton.disabled = false;
            UI.showToast('Error deleting picture: ' + (error.message || 'Unknown error'), 'error');
        }
    };
    
    /**
     * Populate the comparison dropdown menus with dates
     */
    const populateComparisonsDropdowns = () => {
        // Get all progress pics metadata
        const pics = DataManager.getProgressPicsMeta();
        
        // Clear current options (keep the default empty option)
        beforeDateSelect.innerHTML = '<option value="">Select date...</option>';
        afterDateSelect.innerHTML = '<option value="">Select date...</option>';
        
        // Group pictures by date
        const dateMap = new Map();
        pics.forEach(pic => {
            if (!dateMap.has(pic.date)) {
                dateMap.set(pic.date, []);
            }
            dateMap.get(pic.date).push(pic);
        });
        
        // Sort dates (oldest to newest)
        const sortedDates = Array.from(dateMap.keys()).sort();
        
        // Add options to dropdowns
        sortedDates.forEach(date => {
            const displayDate = UI.formatDate(date);
            const beforeOption = document.createElement('option');
            beforeOption.value = date;
            beforeOption.textContent = displayDate;
            
            const afterOption = document.createElement('option');
            afterOption.value = date;
            afterOption.textContent = displayDate;
            
            beforeDateSelect.appendChild(beforeOption);
            afterDateSelect.appendChild(afterOption);
        });
    };
    
    /**
     * Update the comparison view based on selected dates
     */
    const updateComparison = () => {
        const beforeDate = beforeDateSelect.value;
        const afterDate = afterDateSelect.value;
        
        // Update before image
        if (beforeDate) {
            updateComparisonImage('before', beforeDate);
        } else {
            resetComparisonImage('before');
        }
        
        // Update after image
        if (afterDate) {
            updateComparisonImage('after', afterDate);
        } else {
            resetComparisonImage('after');
        }
    };
    
    /**
     * Update a comparison image with pictures from a specific date
     * @param {string} position - 'before' or 'after'
     * @param {string} date - Date string to get pictures for
     */
    const updateComparisonImage = (position, date) => {
        // Get all pictures from the selected date
        const pics = DataManager.getProgressPicsMeta().filter(pic => pic.date === date);
        
        // If no pictures, reset the display
        if (pics.length === 0) {
            resetComparisonImage(position);
            return;
        }
        
        // Get container element
        const containerElement = position === 'before' ? beforeImageElement : afterImageElement;
        
        // Clear current content and add loading indicator
        containerElement.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Use the front view image if available, otherwise use the first image
        const targetPic = pics.find(pic => pic.category === 'front') || pics[0];
        
        // Load image with retry mechanism
        const loadImage = (retryCount = 0) => {
            DataManager.getProgressPicImage(targetPic.id)
                .then(imageBlob => {
                    // Create image URL
                    const imageUrl = URL.createObjectURL(imageBlob);
                    
                    // Create image element
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = `${position} picture from ${date}`;
                    
                    // Add category label
                    const categoryLabel = document.createElement('div');
                    categoryLabel.className = 'comparison-category';
                    categoryLabel.textContent = getCategoryDisplayName(targetPic.category);
                    
                    // Clear container and add image with label
                    containerElement.innerHTML = '';
                    containerElement.appendChild(img);
                    containerElement.appendChild(categoryLabel);
                })
                .catch(error => {
                    console.error(`Error loading ${position} image (attempt ${retryCount + 1}):`, error);
                    
                    // Retry up to 3 times with exponential backoff
                    if (retryCount < 3) {
                        setTimeout(() => {
                            loadImage(retryCount + 1);
                        }, 300 * Math.pow(2, retryCount));
                    } else {
                        containerElement.innerHTML = '<div class="error-loading"><i class="fas fa-exclamation-circle"></i><p>Error loading image</p></div>';
                    }
                });
        };
        
        // Start loading the image
        loadImage();
    };
    
    /**
     * Reset a comparison image to the placeholder
     * @param {string} position - 'before' or 'after'
     */
    const resetComparisonImage = (position) => {
        const containerElement = position === 'before' ? beforeImageElement : afterImageElement;
        containerElement.innerHTML = `
            <div class="image-placeholder">
                <i class="fas fa-image"></i>
                <p>Select a "${position}" date</p>
            </div>
        `;
    };
    
    // Public API
    return {
        initialize
    };
})();
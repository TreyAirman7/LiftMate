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
        // Cache DOM elements
        addPicButton = document.getElementById('add-progress-pic');
        progressPicsGrid = document.getElementById('progress-pics-grid');
        noMessageElement = document.getElementById('no-pics-message');
        beforeDateSelect = document.getElementById('before-date');
        afterDateSelect = document.getElementById('after-date');
        beforeImageElement = document.getElementById('before-image');
        afterImageElement = document.getElementById('after-image');
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
        
        // Set up event listeners
        setupEventListeners();
        
        // Load and display progress pictures
        refreshProgressPics();
        populateComparisonsDropdowns();
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
                
                // Auto-save after a short delay to allow the preview to display
                setTimeout(() => {
                    saveProgressPic();
                }, 500);
            }
        });
        
        // Save progress picture via form submission (removed to avoid double submission)
        // Add direct click handler to save button instead
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
        deletePicButton.addEventListener('click', () => {
            if (selectedPicId) {
                UI.showConfirmation(
                    'Delete Picture',
                    'Are you sure you want to delete this progress picture? This action cannot be undone.',
                    () => deleteProgressPic(selectedPicId)
                );
            }
        });
        
        // Back to pictures list
        backToPicsButton.addEventListener('click', () => {
            UI.closeModal(document.getElementById('pic-detail-modal'));
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
        
        // Comparison dropdowns
        beforeDateSelect.addEventListener('change', updateComparison);
        afterDateSelect.addEventListener('change', updateComparison);
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
        if (!currentImageFile) {
            UI.showToast('Please select an image to upload', 'error');
            return;
        }
        
        // Create picture metadata
        const picData = {
            date: picDateInput.value,
            category: picCategorySelect.value,
            notes: picNotesInput.value.trim(),
            timestamp: new Date().toISOString()
        };
        
        // Convert the image file to a blob for storage
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageBlob = new Blob([event.target.result], { type: currentImageFile.type });
            
            // Save the image and metadata
            DataManager.saveProgressPic(picData, imageBlob)
                .then(() => {
                    UI.closeModal(document.getElementById('progress-pic-modal'));
                    UI.showToast('Progress picture saved successfully', 'success');
                    refreshProgressPics();
                    populateComparisonsDropdowns();
                })
                .catch(error => {
                    console.error('Error saving progress picture:', error);
                    UI.showToast('Error saving progress picture', 'error');
                });
        };
        
        reader.onerror = () => {
            UI.showToast('Error reading image file', 'error');
        };
        
        reader.readAsArrayBuffer(currentImageFile);
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
        
        // Load and add image
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
                    loadingIndicator.remove();
                };
                
                imgContainer.appendChild(img);
            })
            .catch(error => {
                console.error('Error loading image:', error);
                imgContainer.innerHTML = '<div class="error-loading"><i class="fas fa-exclamation-circle"></i><p>Error loading image</p></div>';
            });
        
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
        // Store the selected picture ID
        selectedPicId = pic.id;
        
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
        
        // Load image
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
                console.error('Error loading image:', error);
                imgContainer.innerHTML = '<div class="error-loading"><i class="fas fa-exclamation-circle"></i><p>Error loading image</p></div>';
            });
        
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
        
        // Show loading state
        const deleteButton = document.getElementById('delete-pic');
        const originalHtml = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        deleteButton.disabled = true;
        
        DataManager.deleteProgressPic(picId)
            .then(success => {
                if (success) {
                    UI.closeModal(document.getElementById('pic-detail-modal'));
                    UI.showToast('Progress picture deleted', 'success');
                    refreshProgressPics();
                    populateComparisonsDropdowns();
                } else {
                    // Restore button state
                    deleteButton.innerHTML = originalHtml;
                    deleteButton.disabled = false;
                    UI.showToast('Error deleting picture', 'error');
                }
            })
            .catch(error => {
                console.error('Error deleting progress picture:', error);
                // Restore button state
                deleteButton.innerHTML = originalHtml;
                deleteButton.disabled = false;
                UI.showToast('Error deleting picture', 'error');
            });
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
        
        // Load and display the image
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
                console.error(`Error loading ${position} image:`, error);
                containerElement.innerHTML = '<div class="error-loading"><i class="fas fa-exclamation-circle"></i><p>Error loading image</p></div>';
            });
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

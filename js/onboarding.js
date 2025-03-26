/**
 * LiftMate - Onboarding Module
 * Handles first-time user onboarding and welcome back screen
 */

const OnboardingManager = (() => {
    // Private flag to track initialization state
    let isInitialized = false;

    // Check if the user is new or returning
    const initialize = () => {
        // Prevent double initialization
        if (isInitialized) {
            console.log('OnboardingManager already initialized');
            return;
        }
        
        console.log('Initializing OnboardingManager...');
        
        // First set up event listeners
        setupEventListeners();
        
        // Mark as initialized to prevent duplicate modals
        isInitialized = true;
        
        // Get user profile to determine if this is a new user
        const userProfile = DataManager.getUserProfile();
        
        // Only show the onboarding modal for new users
        if (!userProfile || !userProfile.name || userProfile.name.trim() === '') {
            console.log('No user profile found. Waiting 3 seconds before showing onboarding modal...');
            // 3-second delay before showing the onboarding modal for new users
            setTimeout(() => {
                console.log('Showing onboarding modal for new user...');
                showOnboardingModal();
            }, 3000);
        } else {
            // For returning users, don't show any popup since there's already a greeting in the app
            console.log('User profile found. No startup modal needed.');
        }
        
    };
    
    // Setup event listeners for the onboarding process
    const setupEventListeners = () => {
        // Handle onboarding form submission
        document.getElementById('onboarding-form').addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserProfile();
        });
    };
    
    // Show the onboarding modal for first-time users
    const showOnboardingModal = () => {
        UI.openModal('onboarding-modal');
    };
    
    // Save the user profile from the onboarding form
    const saveUserProfile = () => {
        const name = document.getElementById('user-name').value.trim();
        const sex = document.getElementById('user-sex').value;
        const age = parseInt(document.getElementById('user-age').value);
        
        // Get existing profile if available
        const existingProfile = DataManager.getUserProfile() || {};
        
        // Create or update user profile object
        const userProfile = {
            ...existingProfile,
            name,
            sex,
            age,
            // Only set joinDate if it doesn't already exist
            joinDate: existingProfile.joinDate || new Date().toISOString()
        };
        
        // Save to localStorage
        DataManager.saveUserProfile(userProfile);
        
        // Close the onboarding modal
        UI.closeModal(document.getElementById('onboarding-modal')); // This is correct - closeModal uses the element
        
        // Show welcome message
        const isNewUser = !existingProfile.joinDate;
        if (isNewUser) {
            UI.showToast(`Welcome to LiftMate, ${name}!`, 'success');
        } else {
            UI.showToast(`Profile updated, ${name}!`, 'success');
        }
    };
    
    // Public API
    return {
        initialize
    };
})();
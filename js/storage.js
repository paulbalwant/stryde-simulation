/**
 * Storage Manager for STRYDE Simulation
 * Handles saving and loading progress using localStorage
 */

const StorageManager = {
    STORAGE_KEY: 'stryde_simulation_progress',

    /**
     * Save simulation progress
     */
    saveProgress(progressData) {
        try {
            const dataToSave = {
                ...progressData,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            console.log('✓ Progress saved');
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    },

    /**
     * Load saved progress
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                console.log('✓ Progress loaded');
                return data;
            }
            console.log('No saved progress found');
            return null;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return null;
        }
    },

    /**
     * Clear all saved progress
     */
    clearProgress() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('✓ Progress cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear progress:', error);
            return false;
        }
    },

    /**
     * Check if progress exists
     */
    hasProgress() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
};
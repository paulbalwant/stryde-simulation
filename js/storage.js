/**
 * STRYDE Leadership Simulation - Storage Manager
 * Handles saving/loading progress using localStorage
 */

const StorageManager = {
    STORAGE_KEY: 'stryde_simulation_progress',

    /**
     * Save simulation progress to localStorage
     */
    saveProgress(progressData) {
        try {
            const dataToSave = {
                version: '1.0',
                savedAt: new Date().toISOString(),
                data: progressData
            };

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(dataToSave)
            );

            console.log('Progress saved successfully');
            return true;

        } catch (error) {
            console.error('Error saving progress:', error);
            
            // Check if storage quota exceeded
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Your progress could not be saved. Try clearing old data.');
            }
            
            return false;
        }
    },

    /**
     * Load simulation progress from localStorage
     */
    loadProgress() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);

            if (!savedData) {
                console.log('No saved progress found');
                return null;
            }

            const parsed = JSON.parse(savedData);

            // Validate data structure
            if (!parsed.data || !parsed.data.responses) {
                console.warn('Invalid saved data structure');
                return null;
            }

            console.log('Progress loaded successfully');
            return parsed.data;

        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    },

    /**
     * Clear all saved progress
     */
    clearProgress() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Progress cleared successfully');
            return true;

        } catch (error) {
            console.error('Error clearing progress:', error);
            return false;
        }
    },

    /**
     * Check if saved progress exists
     */
    hasProgress() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    },

    /**
     * Get storage usage info
     */
    getStorageInfo() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        
        return {
            exists: saved !== null,
            size: saved ? saved.length : 0,
            sizeKB: saved ? (saved.length / 1024).toFixed(2) : 0
        };
    },

    /**
     * Export progress as JSON file for download
     */
    exportProgress() {
        try {
            const progress = this.loadProgress();
            
            if (!progress) {
                alert('No progress to export');
                return;
            }

            const exportData = {
                exportedAt: new Date().toISOString(),
                studentName: progress.studentName,
                scenarios: progress.responses.map(r => ({
                    scenarioId: r.scenarioId,
                    scenarioTitle: r.scenarioTitle,
                    response: r.response,
                    strengths: r.evaluation.strengths,
                    suggestions: r.evaluation.suggestions,
                    timestamp: r.timestamp
                }))
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `stryde-simulation-${progress.studentName}-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('Progress exported successfully');

        } catch (error) {
            console.error('Error exporting progress:', error);
            alert('Failed to export progress');
        }
    },

    /**
     * Import progress from JSON file
     */
    importProgress(jsonFile) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);

                // Validate structure
                if (!imported.scenarios || !Array.isArray(imported.scenarios)) {
                    throw new Error('Invalid import file structure');
                }

                // Convert back to internal format
                const progressData = {
                    studentName: imported.studentName,
                    currentScenarioIndex: imported.scenarios.length,
                    responses: imported.scenarios.map(s => ({
                        scenarioId: s.scenarioId,
                        scenarioTitle: s.scenarioTitle,
                        response: s.response,
                        evaluation: {
                            strengths: s.strengths,
                            suggestions: s.suggestions
                        },
                        timestamp: new Date(s.timestamp)
                    })),
                    startTime: new Date(),
                    lastSaved: new Date()
                };

                this.saveProgress(progressData);
                alert('Progress imported successfully! Reload the page to continue.');

            } catch (error) {
                console.error('Error importing progress:', error);
                alert('Failed to import progress. Please check the file format.');
            }
        };

        reader.readAsText(jsonFile);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}

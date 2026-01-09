/**
 * STRYDE Leadership Simulation - Main Application
 * Enhanced with all features: progress tracking, word count, personalization, navigation
 */

class LeadershipSimulation {
    constructor() {
        this.currentScenarioIndex = 0;
        this.responses = [];
        this.studentName = '';
        this.startTime = null;
        
        this.init();
    }

    init() {
        console.log('Initializing STRYDE Leadership Simulation...');
        
        // Show loading screen briefly
        this.showScreen('loading-screen');
        
        // Setup event listeners immediately
        this.setupEventListeners();
        
        // Check for saved progress after brief delay
        setTimeout(() => {
            const savedProgress = StorageManager.loadProgress();
            
            if (savedProgress && savedProgress.responses && savedProgress.responses.length > 0) {
                // Has saved progress - ask to resume
                const resume = confirm(
                    `Welcome back! You have saved progress from ${new Date(savedProgress.lastSaved).toLocaleString()}.\n\n` +
                    `You were on Scenario ${savedProgress.currentScenarioIndex + 1} of ${ScenarioData.scenarios.length}.\n\n` +
                    `Would you like to resume where you left off?`
                );
    
                if (resume) {
                    this.currentScenarioIndex = savedProgress.currentScenarioIndex;
                    this.responses = savedProgress.responses;
                    this.studentName = savedProgress.studentName;
                    this.startTime = new Date(savedProgress.startTime);
                    
                    this.loadScenario(this.currentScenarioIndex);
                    this.showScreen('scenario-screen');
                } else {
                    // User declined to resume - show welcome screen
                    this.showScreen('welcome-screen');
                }
            } else {
                // No saved progress - show welcome screen
                console.log('No saved progress found');
                this.showScreen('welcome-screen');
            }
        }, 1500);
    }
    
    setupEventListeners() {
        // Welcome screen
        const startBtn = document.getElementById('start-simulation');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startSimulation());
        }

        // Handbook toggle
        const handbookToggle = document.getElementById('toggle-handbook');
        if (handbookToggle) {
            handbookToggle.addEventListener('click', () => this.toggleHandbook());
        }

        // Scenario response submission
        const submitBtn = document.getElementById('submit-response');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitResponse());
        }

        // Response textarea word count
        const responseInput = document.getElementById('response-input');
        if (responseInput) {
            responseInput.addEventListener('input', () => this.updateWordCount());
        }

        // Navigation buttons
        const nextBtn = document.getElementById('next-scenario');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextScenario());
        }

        const restartBtn = document.getElementById('restart-simulation');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartSimulation());
        }

        // Save progress periodically
        setInterval(() => this.saveProgress(), 30000); // Every 30 seconds
    }

    toggleHandbook() {
        const content = document.getElementById('handbook-content');
        const button = document.getElementById('toggle-handbook');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            button.textContent = '▲ Hide Leadership Handbook';
        } else {
            content.style.display = 'none';
            button.textContent = '▼ Show Leadership Handbook';
        }
    }

    startSimulation() {
        // Get student name (optional)
        const nameInput = document.getElementById('student-name');
        this.studentName = nameInput ? nameInput.value.trim() : '';
        
        // Default to "Team Leader" if no name provided
        if (!this.studentName) {
            this.studentName = 'Team Leader';
        }

        this.startTime = new Date();
        this.currentScenarioIndex = 0;
        this.responses = [];
        
        // Clear any saved progress
        StorageManager.clearProgress();
        
        // Load first scenario
        this.loadScenario(0);
        this.showScreen('scenario-screen');
    }

    loadScenario(index) {
        const scenario = ScenarioData.scenarios[index];
        if (!scenario) {
            console.error('Scenario not found:', index);
            return;
        }

        console.log(`Loading scenario ${index + 1}: ${scenario.title}`);

        // Update progress bar
        this.updateProgressBar();

        // Update scenario type badge
        const typeBadge = document.getElementById('scenario-type');
        if (typeBadge) {
            typeBadge.textContent = scenario.type === 'major' ? 'Major Scenario' : 
                                   scenario.type === 'micro' ? 'Micro Scenario' : 
                                   'AI-Adaptive Scenario';
        }

        // Update scenario title
        const titleElement = document.getElementById('scenario-title');
        if (titleElement) {
            titleElement.textContent = scenario.title;
        }

        // Update scenario character (if applicable)
        const characterSection = document.querySelector('.scenario-character');
        if (characterSection) {
            if (scenario.characterName) {
                characterSection.style.display = 'flex';
                
                const characterImg = characterSection.querySelector('img');
                const characterName = characterSection.querySelector('h3');
                const characterRole = characterSection.querySelector('p');
                
                if (characterImg) {
                    characterImg.src = `images/${scenario.characterImage}`;
                    characterImg.alt = scenario.characterName;
                }
                if (characterName) characterName.textContent = scenario.characterName;
                if (characterRole) characterRole.textContent = scenario.characterRole;
            } else {
                characterSection.style.display = 'none';
            }
        }

        // Update scenario text with personalization
        const scenarioText = document.getElementById('scenario-text');
        if (scenarioText) {
            // Replace generic references with student's name
            let personalizedText = scenario.text;
            
            // Add personalized greeting for first scenario
            if (index === 0 && this.studentName !== 'Team Leader') {
                personalizedText = `Good morning, ${this.studentName}!\n\n` + personalizedText;
            }
            
            scenarioText.innerHTML = this.formatScenarioText(personalizedText);
        }

        // Update learning objectives
        const objectivesList = document.getElementById('learning-objectives-list');
        if (objectivesList && scenario.learningObjectives) {
            objectivesList.innerHTML = scenario.learningObjectives
                .map(obj => `<li>${obj}</li>`)
                .join('');
        }

        // Clear previous response
        const responseInput = document.getElementById('response-input');
        if (responseInput) {
            responseInput.value = '';
            this.updateWordCount();
        }

        // Enable submit button
        const submitBtn = document.getElementById('submit-response');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Response';
        }

        // Check if this is an AI-generated scenario
        if (scenario.isAIGenerated) {
            this.generateAIScenario(scenario);
        }
    }

    formatScenarioText(text) {
        // Convert markdown-style formatting to HTML
        let formatted = text;
        
        // Bold text (**text**)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Bullet points (• item)
        formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
        
        // Wrap lists in <ul> tags
        formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        
        // Paragraphs
        formatted = formatted.split('\n\n').map(para => {
            if (para.trim() && !para.includes('<ul>') && !para.includes('<li>')) {
                return `<p>${para.trim()}</p>`;
            }
            return para;
        }).join('\n');
        
        return formatted;
    }

    updateProgressBar() {
        const totalScenarios = ScenarioData.scenarios.length;
        const currentScenario = this.currentScenarioIndex + 1;
        const percentage = Math.round((currentScenario / totalScenarios) * 100);

        // Update progress bar fill
        const progressFill = document.querySelector('.progress-bar-fill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
            progressFill.textContent = `${percentage}%`;
        }

        // Update counter
        const counter = document.getElementById('scenario-counter');
        if (counter) {
            counter.textContent = `Scenario ${currentScenario} of ${totalScenarios}`;
        }

        // Update percentage text
        const percentageText = document.getElementById('progress-percentage');
        if (percentageText) {
            percentageText.textContent = `${percentage}% Complete`;
        }
    }

    updateWordCount() {
        const responseInput = document.getElementById('response-input');
        const wordCountDisplay = document.getElementById('word-count');
        
        if (!responseInput || !wordCountDisplay) return;

        const text = responseInput.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;

        wordCountDisplay.textContent = `${wordCount} words`;

        // Color coding
        if (wordCount < 50) {
            wordCountDisplay.style.color = '#dc3545'; // Red
        } else if (wordCount < 100) {
            wordCountDisplay.style.color = '#ffc107'; // Yellow
        } else {
            wordCountDisplay.style.color = '#28a745'; // Green
        }
    }

    async submitResponse() {
        const responseInput = document.getElementById('response-input');
        const submitBtn = document.getElementById('submit-response');
        
        if (!responseInput || !submitBtn) return;

        const responseText = responseInput.value.trim();

        // Validation
        if (!responseText) {
            alert('Please write a response before submitting.');
            return;
        }

        if (responseText.split(/\s+/).length < 30) {
            const proceed = confirm('Your response is quite short (less than 30 words). Are you sure you want to submit?');
            if (!proceed) return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Evaluating...';

        try {
            // Get current scenario
            const scenario = ScenarioData.scenarios[this.currentScenarioIndex];

            // Get AI evaluation
            const evaluation = await evaluateResponse(scenario, responseText, this.studentName);

            // Store response
            this.responses.push({
                scenarioId: scenario.id,
                scenarioTitle: scenario.title,
                response: responseText,
                evaluation: evaluation,
                timestamp: new Date()
            });

            // Save progress
            this.saveProgress();

            // Show feedback
            this.showFeedback(evaluation, scenario);

        } catch (error) {
            console.error('Error evaluating response:', error);
            alert('There was an error processing your response. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Response';
        }
    }

    showFeedback(evaluation, scenario) {
        // Populate feedback content
        const strengthsElement = document.getElementById('feedback-strengths');
        const suggestionsElement = document.getElementById('feedback-suggestions');

        if (strengthsElement) {
            strengthsElement.innerHTML = `<p>${evaluation.strengths || 'Great effort on this response!'}</p>`;
        }

        if (suggestionsElement) {
            suggestionsElement.innerHTML = `<p>${evaluation.suggestions || 'Continue practicing your leadership communication skills.'}</p>`;
        }

        // Update scenario info
        const scenarioInfo = document.querySelector('.scenario-info');
        if (scenarioInfo) {
            const totalScenarios = ScenarioData.scenarios.length;
            const nextScenario = this.currentScenarioIndex + 2;
            
            if (nextScenario <= totalScenarios) {
                scenarioInfo.innerHTML = `
                    <strong>Progress:</strong> You've completed ${this.currentScenarioIndex + 1} of ${totalScenarios} scenarios.<br>
                    <strong>Next:</strong> Scenario ${nextScenario} - ${ScenarioData.scenarios[this.currentScenarioIndex + 1]?.title || 'Final Report'}
                `;
            } else {
                scenarioInfo.innerHTML = `
                    <strong>Congratulations!</strong> You've completed all ${totalScenarios} scenarios!
                `;
            }
        }

        // Show feedback screen
        this.showScreen('feedback-screen');
    }

    nextScenario() {
        this.currentScenarioIndex++;

        if (this.currentScenarioIndex >= ScenarioData.scenarios.length) {
            // Finished all scenarios
            this.showFinalReport();
        } else {
            // Load next scenario
            this.loadScenario(this.currentScenarioIndex);
            this.showScreen('scenario-screen');
        }
    }

    showFinalReport() {
        const nameDisplay = document.getElementById('final-name-display');
        const totalScenarios = document.getElementById('final-total-scenarios');
        const completionTime = document.getElementById('final-completion-time');
        const avgScore = document.getElementById('final-avg-score');

        // Calculate completion time
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 60000); // minutes

        // Update display
        if (nameDisplay) {
            nameDisplay.textContent = this.studentName !== 'Team Leader' 
                ? `Congratulations, ${this.studentName}!` 
                : 'Congratulations!';
        }

        if (totalScenarios) totalScenarios.textContent = ScenarioData.scenarios.length;
        if (completionTime) completionTime.textContent = `${duration} minutes`;

        // Note: Score calculation would require numeric scores from AI
        // For now, we show qualitative completion
        if (avgScore) {
            avgScore.textContent = 'Review your feedback for each scenario to see your growth!';
        }

        // Generate score breakdown (placeholder for now)
        this.generateScoreBreakdown();

        this.showScreen('final-report-screen');
    }

    generateScoreBreakdown() {
        const container = document.getElementById('score-breakdown');
        if (!container) return;

        container.innerHTML = '<h3>Your Leadership Journey:</h3>';

        this.responses.forEach((response, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <div>
                    <strong>Scenario ${index + 1}:</strong> ${response.scenarioTitle}
                </div>
                <div class="score-stars">✓ Completed</div>
            `;
            container.appendChild(scoreItem);
        });
    }

    async generateAIScenario(scenario) {
        // This will generate a personalized scenario based on previous responses
        console.log('Generating AI-adaptive scenario for:', scenario.id);

        const scenarioText = document.getElementById('scenario-text');
        if (scenarioText) {
            scenarioText.innerHTML = '<p><em>Generating personalized scenario based on your previous responses...</em></p>';
        }

        try {
            // Analyze previous responses to identify patterns
            const recentResponses = this.responses.slice(-5); // Last 5 responses
            
            // Generate adaptive scenario
            const adaptiveContent = await generateAdaptiveScenario(
                scenario,
                recentResponses,
                this.studentName
            );

            // Update scenario with generated content
            if (scenarioText) {
                scenarioText.innerHTML = this.formatScenarioText(adaptiveContent);
            }

        } catch (error) {
            console.error('Error generating AI scenario:', error);
            
            // Fallback to generic scenario
            if (scenarioText) {
                scenarioText.innerHTML = `
                    <p>Based on your responses in previous scenarios, here's a customized leadership challenge:</p>
                    <p><strong>Your Task:</strong> Reflect on your leadership journey so far. What patterns do you notice in how you communicate? Where have you grown? What areas still challenge you?</p>
                    <p>Write a response that demonstrates self-awareness and commitment to continued development.</p>
                `;
            }
        }
    }

    restartSimulation() {
        const confirm = window.confirm('Are you sure you want to restart? All progress will be lost.');
        if (confirm) {
            StorageManager.clearProgress();
            this.currentScenarioIndex = 0;
            this.responses = [];
            this.studentName = '';
            this.showScreen('welcome-screen');
        }
    }

    saveProgress() {
        const progressData = {
            currentScenarioIndex: this.currentScenarioIndex,
            responses: this.responses,
            studentName: this.studentName,
            startTime: this.startTime,
            lastSaved: new Date()
        };

        StorageManager.saveProgress(progressData);
        console.log('Progress saved');
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.simulation = new LeadershipSimulation();
});


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
                // ⭐ NEW: Check if all scenarios completed
                if (savedProgress.responses.length >= ScenarioData.scenarios.length) {
                    console.log('All scenarios completed - restoring final report');
                    
                    // Restore state
                    this.currentScenarioIndex = savedProgress.currentScenarioIndex;
                    this.responses = savedProgress.responses;
                    this.studentName = savedProgress.studentName;
                    this.startTime = new Date(savedProgress.startTime);
                    
                    // Show final report immediately (no prompt)
                    this.showFinalReport();
                    return;
                }
                
                // Has incomplete progress - ask to resume
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
                    this.showScreen('welcome-screen');
                }
            } else {
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
        console.log('=== START SIMULATION CLICKED ===');
        
        // Get student name (optional)
        const nameInput = document.getElementById('student-name');
        this.studentName = nameInput ? nameInput.value.trim() : '';
        
        // Default to "Team Leader" if no name provided
        if (!this.studentName) {
            this.studentName = 'Team Leader';
        }
        
        console.log('Student name:', this.studentName);
    
        this.startTime = new Date();
        this.currentScenarioIndex = 0;
        this.responses = [];
        
        // Clear any saved progress
        StorageManager.clearProgress();
        
        console.log('About to load scenario 0...');
        
        // Load first scenario
        this.loadScenario(0);
        
        console.log('About to show scenario screen...');
        
        // Force show scenario screen
        this.showScreen('scenario-screen');
        
        console.log('=== START SIMULATION COMPLETE ===');
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
        
        // Calculate average score
        const averageScore = this.calculateAverageScore();
    
        // Update display
        if (nameDisplay) {
            nameDisplay.textContent = this.studentName !== 'Team Leader' 
                ? `Congratulations, ${this.studentName}!` 
                : 'Congratulations!';
        }
    
        if (totalScenarios) totalScenarios.textContent = ScenarioData.scenarios.length;
        if (completionTime) completionTime.textContent = duration;
    
        // Show average score
        if (avgScore) {
            avgScore.innerHTML = `
                <strong>Overall Average:</strong> ${this.generateStars(averageScore)} 
                <span style="font-size: 1.2em; color: #0066cc; font-weight: bold;">${averageScore.toFixed(1)}/5.0</span>
            `;
        }
    
        // Generate comprehensive report with feedback
        this.generateComprehensiveReport();
    
        // Show the screen
        this.showScreen('final-report-screen');
    }
 
    generateComprehensiveReport() {
        const container = document.getElementById('score-breakdown');
        if (!container) return;
    
        container.innerHTML = '<h3>📋 Your Complete Leadership Journey:</h3>';
    
        // Create detailed breakdown for each scenario
        this.responses.forEach((response, index) => {
            const score = response.evaluation.score || 3;
            const stars = this.generateStars(score);
            
            const scenarioDiv = document.createElement('div');
            scenarioDiv.className = 'scenario-report-item';
            scenarioDiv.innerHTML = `
                <div class="scenario-report-header">
                    <div>
                        <strong>Scenario ${index + 1}:</strong> ${response.scenarioTitle}
                        <div class="scenario-score">${stars} <span class="score-number">${score.toFixed(1)}/5.0</span></div>
                    </div>
                    <span class="scenario-timestamp">${new Date(response.timestamp).toLocaleDateString()}</span>
                </div>
                
                <div class="scenario-feedback-summary">
                    <div class="feedback-strengths-summary">
                        <h4>✅ Strengths:</h4>
                        <p>${response.evaluation.strengths || 'Great effort on this scenario!'}</p>
                    </div>
                    
                    <div class="feedback-suggestions-summary">
                        <h4>💡 Growth Areas:</h4>
                        <p>${response.evaluation.suggestions || 'Continue developing your skills.'}</p>
                    </div>
                </div>
                
                <details class="scenario-response-details">
                    <summary>View Your Response</summary>
                    <div class="response-text">
                        ${response.response}
                    </div>
                </details>
            `;
            container.appendChild(scenarioDiv);
        });
    
        // Calculate overall average score
        const avgScore = this.calculateAverageScore();
    
        // Add overall leadership commentary
        const overallDiv = document.createElement('div');
        overallDiv.className = 'overall-leadership-commentary';
        overallDiv.innerHTML = `
            <h3>🌟 Overall Leadership Development Summary</h3>
            <div class="overall-score-display">
                <div class="overall-score-large">
                    ${this.generateStars(avgScore)}
                    <div class="overall-score-number">${avgScore.toFixed(1)}/5.0</div>
                </div>
                <p class="score-interpretation">${this.getScoreInterpretation(avgScore)}</p>
            </div>
            <div class="commentary-content">
                ${this.generateOverallCommentary()}
            </div>
        `;
        container.appendChild(overallDiv);
    
        // Add PDF download button
        const downloadDiv = document.createElement('div');
        downloadDiv.className = 'download-section';
        downloadDiv.innerHTML = `
            <button id="download-pdf-report" class="btn btn-primary btn-large">
                📥 Download Complete Report (PDF)
            </button>
            <p class="download-hint">Get a comprehensive PDF report with all your responses and feedback</p>
        `;
        container.appendChild(downloadDiv);
    
        // Add download functionality
        const downloadBtn = document.getElementById('download-pdf-report');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPDFReport());
        }
    }

    generateStars(score) {
        const fullStars = Math.floor(score);
        const hasHalfStar = (score % 1) >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '⭐'.repeat(fullStars);
        if (hasHalfStar) stars += '⭐'; // Could use ½ star character if available
        stars += '☆'.repeat(emptyStars);
        
        return stars;
    }
    
    calculateAverageScore() {
        if (this.responses.length === 0) return 0;
        
        const totalScore = this.responses.reduce((sum, response) => {
            return sum + (response.evaluation.score || 3);
        }, 0);
        
        return totalScore / this.responses.length;
    }
    
    getScoreInterpretation(avgScore) {
        if (avgScore >= 4.5) return "Outstanding leadership communication throughout!";
        if (avgScore >= 4.0) return "Strong leadership communication with excellent growth!";
        if (avgScore >= 3.5) return "Solid leadership foundation with clear development!";
        if (avgScore >= 3.0) return "Good effort with significant learning opportunities!";
        return "Developing leadership skills - keep practicing!";
    }
    
    generateOverallCommentary() {
        const totalScenarios = this.responses.length;
        const studentName = this.studentName !== 'Team Leader' ? this.studentName : 'You';
        
        // Analyze patterns across all responses
        const avgResponseLength = Math.round(
            this.responses.reduce((sum, r) => sum + r.response.split(/\s+/).length, 0) / totalScenarios
        );
    
        return `
            <p><strong>${studentName} completed ${totalScenarios} leadership scenarios</strong> covering crisis management, 
            team dynamics, ethical decision-making, stakeholder communication, and strategic thinking.</p>
            
            <p><strong>Response Pattern:</strong> Your average response length was ${avgResponseLength} words, 
            ${avgResponseLength > 150 ? 'showing thorough engagement with complex leadership challenges' : 
              avgResponseLength > 100 ? 'demonstrating solid consideration of key issues' : 
              'suggesting opportunities to develop more comprehensive analysis'}.</p>
            
            <p><strong>Key Development Areas Identified:</strong></p>
            <ul>
                <li><strong>Crisis Communication:</strong> You navigated supplier delays, budget pressures, and quality issues</li>
                <li><strong>Emotional Intelligence:</strong> You addressed team burnout, gave difficult feedback, and managed conflicts</li>
                <li><strong>Strategic Decision-Making:</strong> You balanced competing priorities and stakeholder needs</li>
                <li><strong>Authentic Leadership:</strong> You demonstrated your voice across diverse challenging situations</li>
            </ul>
            
            <p><strong>Next Steps for Continued Growth:</strong></p>
            <ul>
                <li>Review the specific suggestions in each scenario - they're tailored to your responses</li>
                <li>Identify 2-3 patterns in your communication style (directness, empathy, analytical thinking)</li>
                <li>Practice the scenarios where you received the most developmental feedback</li>
                <li>Apply these principles in your real leadership roles</li>
            </ul>
            
            <p><strong>Remember:</strong> Leadership communication is a lifelong journey. This simulation provided 
            20 opportunities to practice - each real leadership moment is another chance to grow. Keep developing 
            your authentic leadership voice!</p>
        `;
    }

    downloadPDFReport() {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        
        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>STRYDE Leadership Simulation Report - ${this.studentName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 { color: #0066cc; border-bottom: 3px solid #00a86b; padding-bottom: 10px; }
                    h2 { color: #1a2332; margin-top: 30px; }
                    h3 { color: #0066cc; margin-top: 20px; }
                    .scenario-item {
                        border-left: 4px solid #00a86b;
                        padding-left: 20px;
                        margin: 30px 0;
                        page-break-inside: avoid;
                    }
                    .strengths { background: #e8f5e9; padding: 15px; margin: 10px 0; border-radius: 8px; }
                    .suggestions { background: #fff3e0; padding: 15px; margin: 10px 0; border-radius: 8px; }
                    .response { background: #f5f7fa; padding: 15px; margin: 10px 0; border-radius: 8px; font-size: 0.9em; }
                    .commentary { background: #e3f2fd; padding: 20px; margin: 30px 0; border-radius: 8px; }
                    .header-info { color: #666; margin: 20px 0; }
                    @media print {
                        body { padding: 20px; }
                        .scenario-item { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>🎯 STRYDE Leadership Simulation Report</h1>
                
                <div class="header-info">
                    <p><strong>Participant:</strong> ${this.studentName}</p>
                    <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Scenarios Completed:</strong> ${this.responses.length} of 20</p>
                    <p><strong>Time Invested:</strong> ${Math.round((new Date() - this.startTime) / 60000)} minutes</p>
                </div>
                
                <h2>📊 Scenario-by-Scenario Feedback</h2>
                
                ${this.responses.map((response, index) => `
                    <div class="scenario-item">
                        <h3>Scenario ${index + 1}: ${response.scenarioTitle}</h3>
                        
                        <div class="strengths">
                            <strong>✅ Strengths:</strong><br>
                            ${response.evaluation.strengths || 'Great effort on this scenario!'}
                        </div>
                        
                        <div class="suggestions">
                            <strong>💡 Growth Areas:</strong><br>
                            ${response.evaluation.suggestions || 'Continue developing your skills.'}
                        </div>
                        
                        <div class="response">
                            <strong>Your Response:</strong><br>
                            ${response.response.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `).join('')}
                
                <div class="commentary">
                    <h2>🌟 Overall Leadership Development Commentary</h2>
                    ${this.generateOverallCommentary()}
                </div>
                
                <hr style="margin: 40px 0;">
                <p style="text-align: center; color: #666; font-size: 0.9em;">
                    Generated by STRYDE Leadership Simulation | ${new Date().toLocaleString()}
                </p>
            </body>
            </html>
        `;
        
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        
        // Auto-trigger print dialog after brief delay
        setTimeout(() => {
            printWindow.print();
        }, 500);
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
        console.log(`showScreen called: ${screenId}`);
        
        // Hide all screens
        const allScreens = document.querySelectorAll('.screen');
        console.log(`Found ${allScreens.length} screens`);
        
        allScreens.forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none'; // Force hide
        });
    
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            console.log(`✅ Showing screen: ${screenId}`);
            targetScreen.classList.add('active');
            targetScreen.style.display = 'block'; // Force show
        } else {
            console.error(`❌ Screen not found: ${screenId}`);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.simulation = new LeadershipSimulation();
});








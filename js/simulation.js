/**
 * STRYDE Simulation - Main Application Logic
 * Coordinates the entire simulation flow
 */

const SimulationApp = {
    // State management
    state: {
        currentScenarioIndex: 0,
        scenarios: [],
        responses: [],
        scenarioHistory: [],
        evaluations: [],
        isProcessing: false,
        startTime: null
    },

	/**
	 * Initialize the simulation
	 */
	async init() {
		console.log('Initializing STRYDE Simulation...');
		
		try {
			this.showScreen('loading-screen');
			
			// Test AI connection
			const aiConnected = await AIIntegration.testConnection(); // ← FIXED
			
			if (!aiConnected) {
				console.warn('AI service not available - using fallback evaluation');
			}
			
			// Load scenarios
			this.state.scenarios = ScenarioData.scenarios;
			console.log(`Loaded ${this.state.scenarios.length} scenarios`);
			
			// Setup event listeners
			this.setupEventListeners();
			
			// Check for saved progress
			const savedProgress = StorageManager.loadProgress();
			
			if (savedProgress) {
				console.log('Found saved progress');
				// Could add option to resume here
				// For now, just start fresh
				StorageManager.clearProgress();
			}
			
			// Show welcome screen
			this.showScreen('welcome-screen');
			
			console.log('✓ Initialization complete');
			
		} catch (error) {
			console.error('Initialization error:', error);
			console.error('Error name:', error.name);
			console.error('Error message:', error.message);
			console.error('Error stack:', error.stack);
			
			// Show error screen
			this.showAIConnectionError();
		}
	},

	/**
	 * Setup all event listeners with null checks
	 */
	setupEventListeners() {
		console.log('Setting up event listeners...');
		
		// Start simulation button
		const startBtn = document.getElementById('start-simulation');
		if (startBtn) {
			startBtn.addEventListener('click', () => this.startSimulation());
			console.log('✓ Start button listener added');
		} else {
			console.error('❌ Start button not found');
		}

		// Submit response button
		const submitBtn = document.getElementById('submit-response');
		if (submitBtn) {
			submitBtn.addEventListener('click', () => this.submitResponse());
			console.log('✓ Submit button listener added');
		} else {
			console.error('❌ Submit button not found');
		}

		// Next scenario button
		const nextBtn = document.getElementById('next-scenario');
		if (nextBtn) {
			nextBtn.addEventListener('click', () => this.nextScenario());
			console.log('✓ Next button listener added');
		} else {
			console.error('❌ Next button not found');
		}

		// Finish simulation button
		const finishBtn = document.getElementById('finish-simulation');
		if (finishBtn) {
			finishBtn.addEventListener('click', () => this.finishSimulation());
			console.log('✓ Finish button listener added');
		} else {
			console.error('❌ Finish button not found');
		}

		console.log('Event listeners setup complete');
	},

    /**
     * Start new simulation
     */
    startSimulation() {
        // Clear any previous progress
        StorageManager.clearProgress();
        
        // Reset state
        this.state.currentScenarioIndex = 0;
        this.state.responses = [];
        this.state.scenarioHistory = [];
        this.state.evaluations = [];
        this.state.startTime = new Date().toISOString();
        
        // Show first scenario
        this.showScreen('simulation-screen');
        this.loadScenario(0);
    },

    /**
     * Resume saved simulation
     */
    resumeSimulation() {
        const savedData = StorageManager.loadProgress();
        
        if (!savedData) {
            alert('No saved progress found. Starting new simulation.');
            this.startSimulation();
            return;
        }

        // Restore state
        this.state.currentScenarioIndex = savedData.currentScenario;
        this.state.responses = savedData.responses;
        this.state.scenarioHistory = savedData.scenarioHistory;
		this.state.evaluations = savedData.evaluations || [];
        this.state.startTime = savedData.startTime;
        
		console.log('Resumed from scenario', savedData.currentScenario);
		console.log('Restored', this.state.evaluations.length, 'evaluations');
		console.log('Restored', this.state.responses.length, 'responses');
		
        // Show simulation screen
        this.showScreen('simulation-screen');
        this.loadScenario(savedData.currentScenario);
        
        console.log('Resumed from scenario', savedData.currentScenario);
    },

	/**
	 * Load a scenario
	 */
	loadScenario(index) {
		console.log('Loading scenario:', this.state.scenarios[index].title);
		
		this.state.currentScenarioIndex = index;
		const scenario = this.state.scenarios[index];
		
		const scenarioContent = document.getElementById('scenario-content');
		if (scenarioContent) {
			scenarioContent.innerHTML = `
				<div class="scenario-header">
					<span class="scenario-type">${scenario.type}</span>
					<h2>${scenario.title}</h2>
				</div>
				
				<div class="scenario-text">
					${scenario.text.split('\n\n').map(para => `<p>${para}</p>`).join('')}
				</div>
				
				${scenario.learningObjectives ? `
					<div class="learning-objectives">
						<h3>Learning Objectives:</h3>
						<ul>
							${scenario.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}
						</ul>
					</div>
				` : ''}
			`;
		}
		
		// Clear previous response
		const responseInput = document.getElementById('response-input');
		if (responseInput) {
			responseInput.value = '';
		}
		
		// Update progress bar
		this.updateProgressBar();
	},

    /**
     * Build HTML for scenario display
     * @param {Object} scenario - Scenario object
     * @returns {string} HTML string
     */
    buildScenarioHTML(scenario) {
        return `
            <div class="scenario-header">
                <span class="scenario-type">${scenario.type}</span>
                <h2>${scenario.title}</h2>
            </div>
            
            <div class="scenario-body">
                <div class="scenario-context">
                    <strong>📋 Context:</strong>
                    <p>${scenario.context}</p>
                </div>
                
                <div class="scenario-situation">
                    <strong>🎯 Situation:</strong>
                    <p>${scenario.situation}</p>
                </div>
                
                <div class="scenario-prompt">
                    <strong>✍️ Your Task:</strong>
                    <p>${scenario.prompt}</p>
                </div>
                
                ${scenario.expectedWordRange ? `
                    <p class="text-secondary mt-md">
                        <em>Recommended length: ${scenario.expectedWordRange[0]}-${scenario.expectedWordRange[1]} words</em>
                    </p>
                ` : ''}
            </div>
        `;
    },

    /**
     * Submit current response
     */
	async submitResponse() {
		const responseText = document.getElementById('response-input').value.trim();
		
		if (!responseText) {
			alert('Please enter a response before submitting.');
			return;
		}

		if (this.state.isProcessing) {
			console.log('Already processing, ignoring submit');
			return;
		}

		this.state.isProcessing = true;

		try {
			const scenario = this.state.scenarios[this.state.currentScenarioIndex];
			
			// Show processing state
			const submitButton = document.getElementById('submit-response');
			const originalText = submitButton.textContent;
			submitButton.textContent = 'Evaluating...';
			submitButton.disabled = true;

			console.log('Requesting AI evaluation...');

			// Call AI evaluation - PASS THE SCENARIO TEXT, NOT THE OBJECT
			const evaluation = await AIIntegration.evaluateResponse(
				scenario.text,                    // ← FIX: Use scenario.text (string)
				responseText,
				scenario.learningObjectives || [] // ← FIX: Provide default empty array
			);

			console.log('Evaluation received:', evaluation);

			// Store the response and evaluation
			this.state.responses.push(responseText);
			this.state.evaluations.push(evaluation);
			
			// Add to scenario history
			this.state.scenarioHistory.push({
				scenarioIndex: this.state.currentScenarioIndex,
				scenarioTitle: scenario.title,
				response: responseText,
				evaluation: evaluation,
				timestamp: new Date().toISOString()
			});

			// Save progress
			StorageManager.saveProgress({
				currentScenarioIndex: this.state.currentScenarioIndex,
				responses: this.state.responses,
				evaluations: this.state.evaluations,
				scenarioHistory: this.state.scenarioHistory,
				startTime: this.state.startTime
			});

			// Show feedback
			this.showFeedback(evaluation);

			// Reset button
			submitButton.textContent = originalText;
			submitButton.disabled = false;

		} catch (error) {
			console.error('Error submitting response:', error);
			alert('An error occurred while processing your response. Please try again.');
			
			// Reset button on error
			const submitButton = document.getElementById('submit-response');
			submitButton.textContent = 'Submit Response';
			submitButton.disabled = false;
		} finally {
			this.state.isProcessing = false;
		}
	},

	/**
	 * Show feedback screen with evaluation results
	 */
	showFeedback(evaluation) {
		const feedbackContent = document.getElementById('feedback-content');
		
		if (feedbackContent) {
			// Determine score color
			let scoreColor = '#dc3545'; // red for poor
			if (evaluation.score >= 4) scoreColor = '#28a745'; // green for excellent
			else if (evaluation.score >= 3) scoreColor = '#ffc107'; // yellow for good
			
			// Star rating
			const stars = '★'.repeat(evaluation.score) + '☆'.repeat(5 - evaluation.score);
			
			feedbackContent.innerHTML = `
				<div class="evaluation-summary">
					<div class="score-display" style="color: ${scoreColor};">
						<div class="score-number">${evaluation.score}/5</div>
						<div class="score-stars">${stars}</div>
					</div>
				</div>
				
				<div class="feedback-section">
					<h3>✅ What You Did Well:</h3>
					<p>${evaluation.feedback}</p>
				</div>
				
				<div class="feedback-section">
					<h3>💡 Suggestions for Improvement:</h3>
					<p>${evaluation.suggestions}</p>
				</div>
				
				<div class="scenario-info">
					<p><strong>Scenario ${this.state.currentScenarioIndex + 1} of ${this.state.scenarios.length}</strong></p>
				</div>
			`;
		}
		
		// Show/hide navigation buttons based on progress
		const nextBtn = document.getElementById('next-scenario');
		const finishBtn = document.getElementById('finish-simulation');
		
		if (this.state.currentScenarioIndex < this.state.scenarios.length - 1) {
			// More scenarios remain
			if (nextBtn) nextBtn.style.display = 'inline-block';
			if (finishBtn) finishBtn.style.display = 'none';
		} else {
			// Last scenario completed
			if (nextBtn) nextBtn.style.display = 'none';
			if (finishBtn) finishBtn.style.display = 'inline-block';
		}
		
		// Show feedback screen
		this.showScreen('feedback-screen');
	},

	/**
	 * Move to next scenario
	 */
	nextScenario() {
		if (this.state.currentScenarioIndex < this.state.scenarios.length - 1) {
			this.loadScenario(this.state.currentScenarioIndex + 1);
			this.showScreen('simulation-screen');
		} else {
			console.log('No more scenarios');
		}
	},

	/**
	 * Finish the simulation and show final results
	 */
	finishSimulation() {
		console.log('Simulation complete!');
		
		// Calculate average score
		const avgScore = this.state.evaluations.reduce((sum, eval) => sum + eval.score, 0) / this.state.evaluations.length;
		
		const feedbackContent = document.getElementById('feedback-content');
		if (feedbackContent) {
			feedbackContent.innerHTML = `
				<div class="completion-message">
					<h2>🎉 Simulation Complete!</h2>
					<p>You have completed all ${this.state.scenarios.length} scenarios.</p>
					
					<div class="final-stats">
						<h3>Your Performance:</h3>
						<p><strong>Average Score:</strong> ${avgScore.toFixed(1)}/5</p>
						<p><strong>Scenarios Completed:</strong> ${this.state.evaluations.length}</p>
					</div>
					
					<button class="btn btn-primary" onclick="location.reload()">Start New Simulation</button>
				</div>
			`;
		}
		
		// Clear saved progress
		StorageManager.clearProgress();
	},

    /**
     * Generate and display final feedback
     */
    async generateFinalFeedback() {
        this.showScreen('loading-screen');
        this.updateLoadingStatus('Generating your personalized feedback report...');

        try {
            // Calculate competency scores
            const competencyScores = this.calculateCompetencyScores();
            
            // Generate summary feedback
            const summaryFeedback = await AIIntegration.generateSummaryFeedback(
                this.state.evaluations,
                competencyScores
            );
            
            // Build feedback HTML
            const feedbackHTML = this.buildFeedbackHTML(competencyScores, summaryFeedback);
            document.getElementById('feedback-content').innerHTML = feedbackHTML;
            
            // Save feedback
            const feedbackData = {
                evaluations: this.state.evaluations,
                competencyScores: competencyScores,
                summaryFeedback: summaryFeedback,
                responses: this.state.responses,
                completionTime: new Date().toISOString(),
                startTime: this.state.startTime
            };
            
            StorageManager.saveFeedback(feedbackData);
            
            // Show feedback screen
            this.showScreen('feedback-screen');
            
        } catch (error) {
            console.error('Error generating feedback:', error);
            alert('An error occurred while generating feedback.');
        }
    },

    /**
     * Calculate competency scores from evaluations
     * @returns {Object} Competency scores
     */
    calculateCompetencyScores() {
        const competencies = {
            'Emotional Intelligence': [],
            'Persuasion & Influence': [],
            'Strategic Communication': [],
            'Crisis Leadership': [],
            'Inclusive Leadership': []
        };

        // Map concepts to competencies
        this.state.evaluations.forEach(eval => {
            eval.conceptsEvaluated.forEach(concept => {
                const lowerConcept = concept.toLowerCase();
                
                if (lowerConcept.includes('emotional') || lowerConcept.includes('empathy') || 
                    lowerConcept.includes('self-awareness') || lowerConcept.includes('self-regulation')) {
                    competencies['Emotional Intelligence'].push(eval.score);
                }
                
                if (lowerConcept.includes('persuasion') || lowerConcept.includes('influence')) {
                    competencies['Persuasion & Influence'].push(eval.score);
                }
                
                if (lowerConcept.includes('strategic') || lowerConcept.includes('vision')) {
                    competencies['Strategic Communication'].push(eval.score);
                }
                
                if (lowerConcept.includes('crisis') || lowerConcept.includes('conflict')) {
                    competencies['Crisis Leadership'].push(eval.score);
                }
                
                if (lowerConcept.includes('inclusive') || lowerConcept.includes('active listening')) {
                    competencies['Inclusive Leadership'].push(eval.score);
                }
            });
        });

        // Calculate averages as percentages
        const scores = {};
        Object.keys(competencies).forEach(comp => {
            const values = competencies[comp];
            if (values.length > 0) {
                const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                scores[comp] = (avg / 5) * 100;
            } else {
                scores[comp] = 0;
            }
        });

        return scores;
    },

    /**
     * Build feedback HTML
     * @param {Object} competencyScores - Competency scores
     * @param {string} summaryFeedback - Summary feedback text
     * @returns {string} HTML string
     */
    buildFeedbackHTML(competencyScores, summaryFeedback) {
        const avgScore = this.state.evaluations.reduce((sum, e) => sum + e.score, 0) / 
                         this.state.evaluations.length;
        const percentageScore = (avgScore / 5) * 100;
        const totalPoints = this.state.evaluations.reduce((sum, e) => sum + e.score, 0);
        const maxPoints = this.state.evaluations.length * 5;

        let html = `
            <div class="feedback-summary">
                <h2>Overall Performance</h2>
                <div class="overall-score">${percentageScore.toFixed(1)}%</div>
                <p>${totalPoints} out of ${maxPoints} points</p>
                <p>Average Score: ${avgScore.toFixed(2)}/5</p>
            </div>

            <div class="competency-breakdown">
                <h3>Competency Breakdown</h3>
                <div class="competency-grid">
        `;

        Object.entries(competencyScores).forEach(([comp, score]) => {
            if (score > 0) {
                html += `
                    <div class="competency-card">
                        <div class="competency-score">${score.toFixed(1)}%</div>
                        <div class="competency-name">${comp}</div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>

            <div class="development-recommendations">
                <h3>📈 Your Personalized Development Plan</h3>
                <p>${summaryFeedback}</p>
            </div>

            <h3 class="mt-lg">Scenario-by-Scenario Feedback</h3>
        `;

        // Add individual scenario feedback
        this.state.evaluations.forEach((eval, index) => {
            const response = this.state.responses[index];
            html += `
                <div class="scenario-feedback">
                    <div class="scenario-feedback-header">
                        <div>
                            <h4>Scenario ${index + 1}: ${eval.scenarioTitle}</h4>
                            <p class="text-secondary">${eval.conceptsEvaluated.join(', ')}</p>
                        </div>
                        <div class="scenario-score">${eval.score}/5</div>
                    </div>
                    
                    <div class="feedback-section">
                        <strong>Your Response:</strong>
                        <p class="text-secondary">${response.response.substring(0, 200)}${response.response.length > 200 ? '...' : ''}</p>
                    </div>
                    
                    <div class="feedback-section">
                        <strong>Feedback:</strong>
                        <p class="feedback-text">${eval.feedback}</p>
                    </div>
                </div>
            `;
        });

        return html;
    },

    /**
     * Download feedback report as text file
     */
    downloadReport() {
        const feedbackData = StorageManager.loadFeedback();
        
        if (!feedbackData) {
            alert('No feedback data available');
            return;
        }

        // Create text report
        let report = 'STRYDE LEADERSHIP COMMUNICATION SIMULATION\n';
        report += 'FEEDBACK REPORT\n';
        report += '='.repeat(60) + '\n\n';
        
        report += `Completed: ${new Date(feedbackData.completionTime).toLocaleString()}\n`;
        report += `Started: ${new Date(feedbackData.startTime).toLocaleString()}\n\n`;
        
        const avgScore = feedbackData.evaluations.reduce((sum, e) => sum + e.score, 0) / 
                        feedbackData.evaluations.length;
        report += `Overall Score: ${avgScore.toFixed(2)}/5 (${((avgScore/5)*100).toFixed(1)}%)\n\n`;
        
        report += 'COMPETENCY BREAKDOWN:\n';
        Object.entries(feedbackData.competencyScores).forEach(([comp, score]) => {
            if (score > 0) {
                report += `- ${comp}: ${score.toFixed(1)}%\n`;
            }
        });
        
        report += '\n' + '='.repeat(60) + '\n\n';
        report += 'DEVELOPMENTAL SUMMARY:\n';
        report += feedbackData.summaryFeedback + '\n\n';
        
        report += '='.repeat(60) + '\n\n';
        report += 'SCENARIO FEEDBACK:\n\n';
        
        feedbackData.evaluations.forEach((eval, index) => {
            report += `SCENARIO ${index + 1}: ${eval.scenarioTitle}\n`;
            report += `Score: ${eval.score}/5\n`;
            report += `Concepts: ${eval.conceptsEvaluated.join(', ')}\n\n`;
            report += `Your Response:\n${feedbackData.responses[index].response}\n\n`;
            report += `Feedback:\n${eval.feedback}\n\n`;
            report += '-'.repeat(60) + '\n\n';
        });

        // Create blob and download
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `STRYDE_Feedback_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Restart simulation
     */
    restartSimulation() {
        if (confirm('Are you sure you want to start a new simulation? This will clear your current progress.')) {
            StorageManager.clearProgress();
            location.reload();
        }
    },

    /**
     * Save current progress
     */
    saveProgress() {
        const saved = StorageManager.saveProgress(
            this.state.currentScenarioIndex,
            this.state.responses,
            this.state.scenarioHistory,
			this.state.evaluations
        );
        
        if (saved) {
            // Show brief save confirmation
            const saveBtn = document.getElementById('save-btn');
            const originalTitle = saveBtn.title;
            saveBtn.title = '✓ Saved!';
            saveBtn.style.color = 'var(--success-green)';
            
            setTimeout(() => {
                saveBtn.title = originalTitle;
                saveBtn.style.color = '';
            }, 2000);
        }
    },

    /**
     * Show handbook in modal
     */
    async showHandbook() {
        const response = await fetch('data/handbook.html');
        const content = await response.text();
        document.getElementById('reference-content').innerHTML = content;
        document.getElementById('reference-modal').classList.add('active');
    },

    /**
     * Show team profiles in modal
     */
    async showProfiles() {
        // Build profiles HTML from the handbook content we created earlier
        const profilesHTML = `
            <h2>STRYDE PULSE Team Member Profiles</h2>
            <p class="mb-lg">Get to know your cross-functional team members:</p>
            
            ${this.buildProfileCard('Dr. Keisha Ramdial', 'Product Innovation Lead (R&D)', 
                'PhD in Biomechanics, 12 years at STRYDE. Data-driven perfectionist passionate about athlete safety.',
                'Direct and technical. Expects thorough testing and evidence-based decisions.',
                'Worried that eco-materials may compromise performance. Skeptical of rushed timelines.')}
            
            ${this.buildProfileCard('Andre Baptiste', 'Marketing & Brand Strategist',
                '8 years at STRYDE. Creative storyteller focused on authentic brand connections.',
                'Narrative-oriented, empathetic. Prefers face-to-face conversations.',
                'Concerned about greenwashing accusations. Values brand authenticity above sales.')}
            
            ${this.buildProfileCard('Malik Joseph', 'Supply Chain & Operations Manager',
                '10 years in supply chain, 6 at STRYDE. Pragmatic deadline-driven miracle worker.',
                'Bottom-line focused. Wants "what, when, how much." Action-oriented.',
                'New suppliers lack proven track record. Higher costs threaten margins.')}
            
            ${this.buildProfileCard('Sadie Persad', 'HR & People Experience Partner',
                '7 years at STRYDE. Warm, perceptive, emotionally intelligent coach and mediator.',
                'Reflective, asks open-ended questions. Comfortable with emotional topics.',
                'Team showing stress signs. Worried about burnout and interpersonal friction.')}
            
            ${this.buildProfileCard('Tristen Thompson', 'Finance & Strategy Analyst',
                '5 years at STRYDE. Sharp analyst from investment banking. Youngest senior analyst ever.',
                'Numbers-focused, detail-oriented. Uses data to challenge assumptions.',
                'Current margins below target. Eco-materials 30% more expensive than standard.')}
        `;
        
        document.getElementById('reference-content').innerHTML = profilesHTML;
        document.getElementById('reference-modal').classList.add('active');
    },

    /**
     * Build profile card HTML
     */
    buildProfileCard(name, title, background, style, concerns) {
        return `
            <div class="scenario-feedback mb-md">
                <h3 class="text-primary">${name}</h3>
                <h4 class="text-secondary mb-sm">${title}</h4>
                <p><strong>Background:</strong> ${background}</p>
                <p><strong>Communication Style:</strong> ${style}</p>
                <p><strong>Current Concerns:</strong> ${concerns}</p>
            </div>
        `;
    },

    /**
     * Show reference materials modal
     */
    showReferenceMaterials() {
        const html = `
            <h2>Reference Materials</h2>
            <p>Access key information to help with your responses:</p>
            <div class="button-group">
                <button class="btn btn-primary" onclick="SimulationApp.showHandbook()">
                    📚 Company Handbook
                </button>
                <button class="btn btn-primary" onclick="SimulationApp.showProfiles()">
                    👥 Team Profiles
                </button>
            </div>
        `;
        document.getElementById('reference-content').innerHTML = html;
        document.getElementById('reference-modal').classList.add('active');
    },

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('reference-modal').classList.remove('active');
    },

	/**
	 * Update word count display (if element exists)
	 */
	updateWordCount() {
		const responseInput = document.getElementById('response-input');
		const wordCountDisplay = document.getElementById('word-count');
		
		if (responseInput && wordCountDisplay) {
			const text = responseInput.value.trim();
			const wordCount = text.length > 0 ? text.split(/\s+/).length : 0;
			wordCountDisplay.textContent = `${wordCount} words`;
		}
	},

	/**
	 * Update progress bar
	 */
	updateProgressBar() {
		const progressFill = document.getElementById('progress-fill');
		const scenarioCounter = document.getElementById('scenario-counter');
		
		if (progressFill) {
			const percentage = ((this.state.currentScenarioIndex + 1) / this.state.scenarios.length) * 100;
			progressFill.style.width = `${percentage}%`;
		}
		
		if (scenarioCounter) {
			scenarioCounter.textContent = `Scenario ${this.state.currentScenarioIndex + 1} of ${this.state.scenarios.length}`;
		}
	},

	/**
	* Show specific screen and hide all others
	* @param {string} screenId - Screen element ID
	*/
	showScreen(screenId) {
		console.log('Showing screen:', screenId);
    
		// Hide ALL screens (remove active class AND set display none)
		const allScreens = document.querySelectorAll('.screen');
		allScreens.forEach(screen => {
			screen.classList.remove('active');
			screen.style.display = 'none';  // Force hide
		});
    
		// Show target screen (add active class AND set display block)
		const targetScreen = document.getElementById(screenId);
		if (targetScreen) {
			targetScreen.classList.add('active');
			targetScreen.style.display = 'block';  // Force show
		} else {
			console.error('Screen not found:', screenId);
		}
	},
	
    /**
     * Update loading status message
     * @param {string} message - Status message
     */
    updateLoadingStatus(message) {
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    },

	/**
	 * Show AI connection error
	 */
	showAIConnectionError() {
		const loadingScreen = document.getElementById('loading-screen');
		if (loadingScreen) {
			loadingScreen.innerHTML = `
				<div class="container">
					<div class="logo">STRYDE Athletics</div>
					<h1 style="color: #dc3545;">⚠️ AI Connection Error</h1>
				
					<div class="info-box" style="border-left: 4px solid #dc3545;">
						<h3>Cannot Connect to AI Service</h3>
						<p>The simulation requires an AI service (Groq) to evaluate your responses.</p>
					
						<h4 style="margin-top: 1.5rem;">Possible Issues:</h4>
						<ol style="text-align: left; padding-left: 2rem;">
							<li><strong>API Key Missing or Invalid:</strong>
								<ul>
									<li>Check that the Groq API key is set in <code>js/ai-integration.js</code></li>
									<li>Key should start with <code>gsk_</code></li>
									<li>Get a free key at: <a href="https://console.groq.com/keys" target="_blank">console.groq.com/keys</a></li>
								</ul>
							</li>
							<li><strong>No Internet Connection:</strong>
								<ul>
									<li>Groq API requires an active internet connection</li>
									<li>Check your network connection</li>
								</ul>
							</li>
							<li><strong>Browser Blocking Request:</strong>
								<ul>
									<li>Check browser console (F12) for errors</li>
									<li>Disable browser extensions that might block API calls</li>
								</ul>
							</li>
						</ol>
					
						<h4 style="margin-top: 1.5rem;">Console Error Details:</h4>
						<p style="font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">
							Check browser console (F12) for specific error messages.
						</p>
					</div>
				
					<button class="btn btn-primary" style="margin-top: 2rem;" onclick="location.reload()">
						↻ Retry Connection
					</button>
				</div>
			`;
			this.showScreen('loading-screen');
		}
	}
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    SimulationApp.init();
});
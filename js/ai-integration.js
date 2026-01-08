/**
 * AI Integration Module for STRYDE Simulation
 * Handles Groq API communication and evaluation
 */

const AIIntegration = {
    // Groq API Configuration
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    GROQ_API_KEY: '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',
    MODEL: 'llama-3.3-70b-versatile',

    /**
     * Test connection to Groq API
     */
    async testConnection() {
        console.log('Testing Groq AI connection...');
        try {
            const response = await fetch(this.GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 10
                })
            });

            if (response.ok) {
                console.log('✓ Groq AI connection successful');
                return true;
            } else {
                const error = await response.json();
                console.error('✗ Groq AI connection failed:', error);
                return false;
            }
        } catch (error) {
            console.error('✗ Groq AI connection error:', error);
            return false;
        }
    },

    /**
     * Evaluate student response using Groq API
     */
    async evaluateResponse(scenarioText, studentResponse, learningObjectives = []) {
        console.log('Evaluating response with Groq AI...');
        console.log('Scenario:', scenarioText?.substring(0, 100) || 'N/A');
        console.log('Response:', studentResponse?.substring(0, 100) || 'N/A');
        console.log('Learning Objectives:', learningObjectives);

        if (!Array.isArray(learningObjectives)) {
            learningObjectives = [];
        }

        const objectivesText = learningObjectives.length > 0 
            ? learningObjectives.join(', ') 
            : 'effective leadership communication';

        const prompt = `You are evaluating a student's response to a leadership communication scenario.

SCENARIO:
${scenarioText || 'Leadership communication scenario'}

STUDENT RESPONSE:
${studentResponse}

LEARNING OBJECTIVES: ${objectivesText}

Evaluate this response and provide:
1. A score from 1-5 (1=Poor, 2=Fair, 3=Good, 4=Very Good, 5=Excellent)
2. Brief feedback (2-3 sentences) on what was done well
3. Brief suggestions (2-3 sentences) for improvement

Respond ONLY with valid JSON in this exact format:
{
    "score": 4,
    "feedback": "Your feedback here",
    "suggestions": "Your suggestions here"
}`;

        try {
            const response = await this.callGroqWithRetry(prompt);
            const evaluation = this.parseEvaluationResponse(response);
            console.log('✓ Groq evaluation successful:', evaluation);
            return evaluation;

        } catch (error) {
            console.error('Groq evaluation failed:', error);
            console.log('Using fallback evaluation...');
            return this.fallbackEvaluation(studentResponse);
        }
    },

    /**
     * Call Groq API with retry logic
     */
    async callGroqWithRetry(prompt, maxRetries = 3) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Groq API attempt ${attempt}/${maxRetries}...`);
                
                const response = await fetch(this.GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.MODEL,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 500
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Groq API error: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.choices?.[0]?.message?.content) {
                    throw new Error('Invalid response format from Groq API');
                }

                console.log('✓ Groq API response received');
                return data.choices[0].message.content;

            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                lastError = error;
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                throw error;
            }
        }
        
        throw lastError;
    },

    /**
     * Parse AI response into evaluation object
     */
    parseEvaluationResponse(responseText) {
        try {
            // Remove markdown code blocks if present
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/```json\n?/g, '');
            cleaned = cleaned.replace(/```\n?/g, '');
            cleaned = cleaned.trim();

            const parsed = JSON.parse(cleaned);

            return {
                score: Math.max(1, Math.min(5, parseInt(parsed.score) || 3)),
                feedback: parsed.feedback || 'Response evaluated.',
                suggestions: parsed.suggestions || 'Continue practicing.'
            };

        } catch (error) {
            console.error('Failed to parse AI response:', error);
            console.log('Raw response:', responseText);
            
            // Try to extract info from unstructured text
            const scoreMatch = responseText.match(/score["\s:]+(\d)/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 3;

            return {
                score: Math.max(1, Math.min(5, score)),
                feedback: 'Your response demonstrates understanding of the scenario.',
                suggestions: 'Continue to practice applying leadership communication principles.'
            };
        }
    },

    /**
     * Fallback evaluation when AI is unavailable
     */
    fallbackEvaluation(responseText) {
        console.log('Generating fallback evaluation...');
        
        if (!responseText || typeof responseText !== 'string') {
            responseText = '';
        }
        
        const wordCount = responseText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const hasGreeting = /dear|hello|hi|greetings/i.test(responseText);
        const hasClosing = /sincerely|regards|best|thank you/i.test(responseText);
        const isProfessional = !/\b(lol|omg|wtf|lmao)\b/i.test(responseText);
        
        let score = 3;
        let feedback = [];
        let suggestions = [];
        
        if (wordCount < 30) {
            score -= 1;
            suggestions.push('Consider providing more detail (aim for 50-100 words).');
        } else if (wordCount > 200) {
            suggestions.push('Consider being more concise.');
        } else {
            feedback.push('Good level of detail.');
        }
        
        if (isProfessional) {
            feedback.push('Professional tone maintained.');
        } else {
            score -= 1;
            suggestions.push('Use more professional language.');
        }
        
        if (hasGreeting && hasClosing) {
            feedback.push('Proper structure with greeting and closing.');
            score += 1;
        } else {
            suggestions.push('Include appropriate greeting and closing.');
        }
        
        score = Math.max(1, Math.min(5, score));
        
        return {
            score: score,
            feedback: feedback.join(' ') || 'Response received.',
            suggestions: suggestions.join(' ') || 'Continue practicing.'
        };
    }
};
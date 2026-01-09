/**
 * STRYDE Leadership Simulation - AI Integration
 * Groq API integration with personalized "you" language feedback
 */

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Evaluate a student's response using Groq AI
 * Returns personalized feedback in "you" language
 */
async function evaluateResponse(scenario, response, studentName = 'Team Leader') {
    console.log(`Evaluating response for scenario: ${scenario.title}`);
    
    try {
        // Build the evaluation prompt with personalized language
        const prompt = buildEvaluationPrompt(scenario, response, studentName);
        
        // Call Groq API with retry logic
        const evaluation = await callGroqWithRetry(prompt);
        
        return evaluation;
        
    } catch (error) {
        console.error('Error in evaluateResponse:', error);
        
        // Return fallback evaluation
        return getFallbackEvaluation(scenario, studentName);
    }
}

/**
 * Build evaluation prompt with personalized "you" language
 */
function buildEvaluationPrompt(scenario, response, studentName) {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    return `You are an expert leadership communication professor evaluating a student's response to a leadership scenario.

**CRITICAL INSTRUCTION: Use "you/your" language throughout. Address the student directly as "${displayName}".**

SCENARIO CONTEXT:
Title: ${scenario.title}
Type: ${scenario.type}
Learning Objectives: ${scenario.learningObjectives.join(', ')}

SCENARIO DESCRIPTION:
${scenario.text}

STUDENT'S RESPONSE:
${response}

EVALUATION TASK:
Provide constructive feedback using ONLY "you" language (never "the student", "they", "the leader").

Format your response EXACTLY as follows:

STRENGTHS:
[List 2-3 specific strengths in ${displayName}'s response. Use "you" language: "You demonstrated...", "Your approach to...", "You effectively..."]

SUGGESTIONS:
[List 2-3 specific areas for improvement. Use "you" language: "You could strengthen...", "Consider revising your...", "You might improve..."]

EVALUATION CRITERIA:
- Clarity and structure of communication
- Emotional intelligence and empathy
- Strategic thinking and decision-making
- Stakeholder awareness
- Use of persuasion principles (if applicable)
- Authenticity and leadership voice
- Addressing the specific learning objectives

Keep feedback:
- Specific and actionable
- Balanced (acknowledge strengths while noting growth areas)
- Encouraging and supportive
- Focused on communication skills
- Written in direct "you" language to ${displayName}`;
}

/**
 * Call Groq API with retry logic
 */
async function callGroqWithRetry(prompt, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Calling Groq API (attempt ${attempt}/${maxRetries})...`);
            
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                    top_p: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from Groq API');
            }

            const feedbackText = data.choices[0].message.content;
            console.log('Groq API response received successfully');
            
            // Parse the feedback
            return parseEvaluationResponse(feedbackText);
            
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;
            
            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    // All retries failed
    throw lastError;
}

/**
 * Parse AI response into structured feedback
 */
function parseEvaluationResponse(text) {
    const evaluation = {
        strengths: '',
        suggestions: '',
        rawResponse: text
    };

    try {
        // Split by sections
        const strengthsMatch = text.match(/STRENGTHS:?\s*([\s\S]*?)(?=SUGGESTIONS:|$)/i);
        const suggestionsMatch = text.match(/SUGGESTIONS:?\s*([\s\S]*?)$/i);

        if (strengthsMatch && strengthsMatch[1]) {
            evaluation.strengths = strengthsMatch[1].trim();
        }

        if (suggestionsMatch && suggestionsMatch[1]) {
            evaluation.suggestions = suggestionsMatch[1].trim();
        }

        // Clean up markdown formatting
        evaluation.strengths = cleanMarkdown(evaluation.strengths);
        evaluation.suggestions = cleanMarkdown(evaluation.suggestions);

        // Ensure we have content
        if (!evaluation.strengths) {
            evaluation.strengths = extractFirstParagraph(text);
        }
        if (!evaluation.suggestions) {
            evaluation.suggestions = extractSecondParagraph(text);
        }

    } catch (error) {
        console.error('Error parsing evaluation:', error);
        evaluation.strengths = text.substring(0, 300) + '...';
        evaluation.suggestions = 'Continue developing your leadership communication skills.';
    }

    return evaluation;
}

/**
 * Clean markdown formatting from text
 */
function cleanMarkdown(text) {
    return text
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '')   // Remove italics
        .replace(/#{1,6}\s/g, '') // Remove headers
        .trim();
}

/**
 * Extract first substantial paragraph
 */
function extractFirstParagraph(text) {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
    return paragraphs[0] || text.substring(0, 200);
}

/**
 * Extract second substantial paragraph
 */
function extractSecondParagraph(text) {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
    return paragraphs[1] || paragraphs[0] || 'Continue refining your approach.';
}

/**
 * Fallback evaluation when API fails
 */
function getFallbackEvaluation(scenario, studentName) {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    const fallbacks = {
        'crisis': {
            strengths: `${displayName === 'you' ? 'You' : displayName} addressed the crisis situation and showed awareness of stakeholder concerns. Your response demonstrated an understanding of the urgency and complexity of the situation.`,
            suggestions: `You could strengthen your response by being more specific about action steps and timelines. Consider how you might provide more concrete reassurance to your team while maintaining transparency about challenges.`
        },
        'feedback': {
            strengths: `You showed consideration for the person's feelings and attempted to provide constructive input. Your response demonstrates awareness of the sensitive nature of giving feedback.`,
            suggestions: `You could enhance your feedback by being more specific with examples and balancing critical observations with recognition of strengths. Consider using more direct language while maintaining empathy.`
        },
        'conflict': {
            strengths: `You recognized the conflict and attempted to address it. Your response shows awareness that team dynamics matter and conflicts need attention.`,
            suggestions: `You could strengthen your conflict resolution approach by being more explicit about finding common ground and facilitating direct communication between parties. Consider how you might create psychological safety for both sides.`
        },
        'decision': {
            strengths: `You worked through the decision-making process and provided reasoning for your choice. Your response shows you're weighing multiple factors and stakeholder perspectives.`,
            suggestions: `You could improve your decision communication by being more explicit about trade-offs and providing clearer rationale for why you chose this path over alternatives. Consider addressing potential objections more directly.`
        },
        'default': {
            strengths: `You engaged thoughtfully with this leadership scenario and demonstrated effort in crafting your response. Your writing shows you're thinking about the complexities of the situation.`,
            suggestions: `You could strengthen your response by being more specific and concrete in your communication. Consider using more vivid examples and addressing stakeholder concerns more directly.`
        }
    };

    // Select appropriate fallback based on scenario type
    const scenarioType = scenario.title.toLowerCase();
    let selectedFallback = fallbacks.default;

    if (scenarioType.includes('crisis') || scenarioType.includes('delay')) {
        selectedFallback = fallbacks.crisis;
    } else if (scenarioType.includes('feedback') || scenarioType.includes('recognition')) {
        selectedFallback = fallbacks.feedback;
    } else if (scenarioType.includes('conflict')) {
        selectedFallback = fallbacks.conflict;
    } else if (scenarioType.includes('decision') || scenarioType.includes('launch')) {
        selectedFallback = fallbacks.decision;
    }

    return {
        strengths: selectedFallback.strengths,
        suggestions: selectedFallback.suggestions,
        isFallback: true
    };
}

/**
 * Generate adaptive AI scenario based on student's response patterns
 */
async function generateAdaptiveScenario(scenario, previousResponses, studentName) {
    console.log('Generating adaptive scenario...');
    
    try {
        // Analyze patterns in previous responses
        const patterns = analyzeResponsePatterns(previousResponses);
        
        // Build prompt for scenario generation
        const prompt = buildAdaptiveScenarioPrompt(scenario, patterns, studentName);
        
        // Call Groq API
        const response = await callGroqWithRetry(prompt);
        
        return response.strengths; // Using strengths field for scenario text
        
    } catch (error) {
        console.error('Error generating adaptive scenario:', error);
        return getDefaultAdaptiveScenario(scenario, studentName);
    }
}

/**
 * Analyze patterns in student's previous responses
 */
function analyzeResponsePatterns(responses) {
    const patterns = {
        avgLength: 0,
        commonThemes: [],
        communicationStyle: 'balanced',
        strengthAreas: [],
        growthAreas: []
    };

    if (!responses || responses.length === 0) return patterns;

    // Calculate average response length
    const lengths = responses.map(r => r.response.split(/\s+/).length);
    patterns.avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);

    // Extract common themes from evaluations
    const allFeedback = responses.map(r => 
        (r.evaluation.strengths || '') + ' ' + (r.evaluation.suggestions || '')
    ).join(' ').toLowerCase();

    // Check for communication style patterns
    if (allFeedback.includes('direct') || allFeedback.includes('clear')) {
        patterns.communicationStyle = 'direct';
    } else if (allFeedback.includes('empathetic') || allFeedback.includes('considerate')) {
        patterns.communicationStyle = 'empathetic';
    } else if (allFeedback.includes('strategic') || allFeedback.includes('analytical')) {
        patterns.communicationStyle = 'analytical';
    }

    return patterns;
}

/**
 * Build prompt for adaptive scenario generation
 */
function buildAdaptiveScenarioPrompt(scenario, patterns, studentName) {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    return `You are creating a personalized leadership scenario for ${displayName}.

SCENARIO TEMPLATE:
${scenario.text}

STUDENT PATTERNS:
- Communication style: ${patterns.communicationStyle}
- Average response length: ${patterns.avgLength} words

TASK:
Create a customized version of this scenario that challenges ${displayName} to grow beyond their current patterns.

If they tend to be:
- Very direct: Add emotional complexity requiring empathy
- Very empathetic: Add pressure requiring decisive action
- Very analytical: Add ambiguity requiring intuitive judgment

Keep the core scenario but adapt the details and specific challenges to push ${displayName}'s development.

Return ONLY the scenario text, written in second person addressing ${displayName}.`;
}

/**
 * Default adaptive scenario when generation fails
 */
function getDefaultAdaptiveScenario(scenario, studentName) {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    return `Based on your responses in previous scenarios, here's a leadership challenge tailored for you, ${displayName}:

**Your Adaptive Challenge:**

Reflect on your leadership journey through the STRYDE PULSE launch. You've navigated crises, managed team conflicts, given feedback, and made difficult decisions.

**What patterns do you notice in your leadership communication?**
- Do you tend to prioritize task completion or relationship building?
- Are you more comfortable with analytical decisions or intuitive judgment?
- How do you balance directness with empathy?

**Your Task:**
Write a reflection that demonstrates self-awareness about your leadership style. Identify:
1. One strength you've consistently shown
2. One area where you've grown
3. One area that still challenges you
4. How you'll continue developing as a leader

Be honest and specific. The best leaders know themselves deeply.`;
}

// Export functions for use in simulation.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        evaluateResponse,
        generateAdaptiveScenario
    };
}

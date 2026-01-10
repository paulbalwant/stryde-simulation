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
 * Parse AI response into structured feedback with score
 */
function parseEvaluationResponse(text) {
    const evaluation = {
        strengths: '',
        suggestions: '',
        score: 0,
        rawResponse: text
    };

    try {
        // Split by sections
        const strengthsMatch = text.match(/STRENGTHS:?\s*([\s\S]*?)(?=SUGGESTIONS:|SCORE:|$)/i);
        const suggestionsMatch = text.match(/SUGGESTIONS:?\s*([\s\S]*?)(?=SCORE:|$)/i);
        const scoreMatch = text.match(/SCORE:?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*5|out of 5|stars?)?/i);

        if (strengthsMatch && strengthsMatch[1]) {
            evaluation.strengths = strengthsMatch[1].trim();
        }

        if (suggestionsMatch && suggestionsMatch[1]) {
            evaluation.suggestions = suggestionsMatch[1].trim();
        }

        if (scoreMatch && scoreMatch[1]) {
            evaluation.score = parseFloat(scoreMatch[1]);
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
        
        // If no score found, estimate from feedback quality
        if (!evaluation.score || evaluation.score === 0) {
            evaluation.score = estimateScoreFromFeedback(evaluation.strengths, evaluation.suggestions);
        }
        
        // Ensure score is between 1-5
        evaluation.score = Math.max(1, Math.min(5, evaluation.score));

    } catch (error) {
        console.error('Error parsing evaluation:', error);
        evaluation.strengths = text.substring(0, 300) + '...';
        evaluation.suggestions = 'Continue developing your leadership communication skills.';
        evaluation.score = 3; // Default middle score
    }

    return evaluation;
}

/**
 * Estimate score based on feedback language
 */
function estimateScoreFromFeedback(strengths, suggestions) {
    const text = (strengths + ' ' + suggestions).toLowerCase();
    
    // Excellent indicators (4-5 stars)
    const excellentWords = ['excellent', 'outstanding', 'exceptional', 'strong', 'effectively', 'comprehensive', 'well-structured'];
    const excellentCount = excellentWords.filter(word => text.includes(word)).length;
    
    // Good indicators (3-4 stars)
    const goodWords = ['good', 'solid', 'demonstrated', 'addressed', 'considered'];
    const goodCount = goodWords.filter(word => text.includes(word)).length;
    
    // Needs improvement indicators (2-3 stars)
    const improvementWords = ['could improve', 'consider adding', 'missing', 'unclear', 'vague', 'needs'];
    const improvementCount = improvementWords.filter(word => text.includes(word)).length;
    
    // Calculate score
    if (excellentCount >= 3) return 5;
    if (excellentCount >= 2) return 4.5;
    if (excellentCount >= 1 || goodCount >= 3) return 4;
    if (goodCount >= 2) return 3.5;
    if (improvementCount >= 3) return 2.5;
    if (improvementCount >= 2) return 3;
    
    return 3.5; // Default good score
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
    
    return `You are creating a personalized leadership scenario for ${displayName} in the STRYDE PULSE product launch simulation.

CONTEXT - THE STRYDE PULSE STORY SO FAR:
- ${displayName} is leading the launch of STRYDE PULSE (eco-engineered running shoes)
- The team navigated a supplier crisis (3-week delay from Vietnam supplier)
- Budget pressures required emergency approval from Tristen Thompson (Finance)
- Team members are: Dr. Keisha Ramdial (R&D), Andre Baptiste (Marketing), Malik Joseph (Operations), Sadie Persad (HR), Tristen Thompson (Finance)
- Launch is in 2-3 weeks, team is under pressure
- Previous scenarios covered: crisis management, budget negotiation, supplier relations, team morale, launch decisions

STUDENT'S COMMUNICATION PATTERNS:
- Communication style: ${patterns.communicationStyle}
- Average response length: ${patterns.avgLength} words
- This is scenario ${scenario.id} of 20

YOUR TASK:
Create a NEW leadership challenge that:

1. STAYS IN THE STRYDE PULSE CONTEXT (don't invent mergers, acquisitions, or external employees)
2. USES ONLY THE 5 TEAM MEMBERS LISTED ABOVE (no made-up names)
3. CHALLENGES ${displayName}'s development based on their patterns:
   - If they're very direct: Add emotional complexity requiring empathy
   - If they're very empathetic: Add pressure requiring decisive action  
   - If they're very analytical: Add ambiguity requiring intuitive judgment

4. FOLLOWS THIS EXACT STRUCTURE:

**Scenario Title Idea:** [Brief title related to STRYDE PULSE launch]

**The Situation:**
[2-3 paragraphs describing a specific challenge involving 1-2 team members. Include concrete details about the STRYDE PULSE launch context. Make it feel real and urgent.]

**What You Know:**
- [Specific detail about the team member(s) involved]
- [What's at stake for the STRYDE PULSE launch]
- [Time pressure or constraint]

**The Challenge:**
[What makes this situation difficult? What competing priorities exist?]

**Your Task:** [CRYSTAL CLEAR action prompt: "Write an email to...", "Prepare talking points for...", "Draft a message that..."]

EXAMPLES OF GOOD SCENARIOS:
- "Andre (Marketing) just told you the sustainability blogger agreed to an interview tomorrow, but Keisha (R&D) says the eco-materials data isn't ready to share publicly. You need to decide..."
- "Malik (Operations) discovered a potential quality issue in 10% of STRYDE PULSE inventory. Launch is in 5 days. Tristen (Finance) says fixing it will cost $50K. What do you communicate to senior management?"
- "Sadie (HR) just informed you that Keisha hasn't taken a day off in 6 weeks and is showing burnout signs. But Keisha insists she's 'fine' and the launch testing needs her. Write your response..."

CRITICAL RULES:
- Use ONLY the 5 team members listed
- Keep it specific to STRYDE PULSE launch
- End with clear "Your Task:" instruction
- Make it feel like scenarios 1-10 (same tone, same context)
- Address ${displayName} directly using "you/your"

Now create the scenario:`;
}

/**
 * Default adaptive scenario when generation fails
 */
function getDefaultAdaptiveScenario(scenario, studentName) {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    // Different fallbacks for scenarios 11, 12, 13
    const fallbackScenarios = {
        11: `**Adaptive Challenge: Media Crisis Response**

You're 10 days from the STRYDE PULSE launch. A popular fitness influencer with 500K followers just posted: "Excited for @STRYDEAthletics new launch but concerned about their vague sustainability claims. Will they walk the talk?"

**The Situation:**
Andre Baptiste (Marketing) is panicking. "We need to respond NOW," he says. "Silence looks guilty." He's drafted a defensive response emphasizing your certifications.

But Dr. Keisha Ramdial (R&D) disagrees. "That response is too corporate. Let's invite her to visit our supplier in Vietnam and see our process firsthand. Transparency beats PR spin."

Tristen Thompson (Finance) warns: "Flying an influencer to Vietnam costs $15K we don't have budgeted."

**What You Know:**
- The influencer has legitimate concerns - your eco-claims ARE real, but complex
- Andre's response is factually correct but sounds defensive
- Keisha's idea is bold but expensive and risky (what if she finds something to criticize?)
- The post already has 5K likes and growing
- Your senior management is watching how you handle this

**Your Task:** Write your response to the team outlining your decision. Will you: (1) Post Andre's response, (2) Pursue Keisha's transparency approach, (3) Something else? Explain your reasoning and what you'll communicate publicly.`,

        12: `**Adaptive Challenge: Team Member Conflict Escalation**

The tension between Dr. Keisha Ramdial (R&D) and Tristen Thompson (Finance) that you mediated earlier has resurfaced - worse than before.

**The Situation:**
Yesterday, in a meeting with senior management, Tristen openly questioned Keisha's material choices: "We're paying premium prices for marginal performance gains. It's not financially defensible."

Keisha responded sharply: "Maybe if Finance understood product integrity, we wouldn't have to explain basic science."

The room went silent. Senior management looked uncomfortable.

**What Happened After:**
- Sadie Persad (HR) pulled you aside: "This is beyond normal disagreement. It's personal now."
- Andre Baptiste (Marketing) told you he's caught in the middle - both have approached him separately to vent
- Malik Joseph (Operations) said: "I'm tired of walking on eggshells in meetings"
- Both Keisha and Tristen are avoiding eye contact with each other

**The Stakes:**
- Launch is 8 days away
- You need both of them collaborating on final preparations
- The team morale is suffering
- Senior management is questioning your leadership

**Your Task:** You've scheduled a meeting with Keisha and Tristen together (tomorrow, 9am). Write your opening statement for that meeting. How will you address the conflict directly while preserving both relationships and getting them aligned for launch?`,

        13: `**Adaptive Challenge: Unexpected Opportunity**

STRYDE PULSE launches in 6 days. This morning, your CEO forwarded you an email from a major retail chain's buyer.

**The Opportunity:**
"We saw the STRYDE PULSE preview. We want to place an exclusive order for 10,000 units for our flagship stores nationwide. But we need commitment by Friday (tomorrow) and delivery within 4 weeks of launch."

**The Reality Check:**
- This order is 3x larger than your initial retail commitments
- Malik Joseph (Operations): "We can do it, but it'll require diverting 60% of other orders and working our suppliers overtime. It's tight."
- Tristen Thompson (Finance): "This is a game-changer for our margins. We HAVE to say yes."
- Dr. Keisha Ramdial (R&D): "Rushing production increases quality risk. We haven't tested at this scale."
- Andre Baptiste (Marketing): "Our other retail partners will be furious if we prioritize one chain. Relationship damage."

**What You Know:**
- This could define STRYDE PULSE's success (or failure)
- Saying yes requires breaking commitments to smaller partners
- Saying no means missing a massive opportunity
- Your team is already exhausted - this will push them harder
- You have 24 hours to decide

**Your Task:** Write your recommendation email to the CEO. Will you accept the order, decline it, or negotiate modified terms? Explain your reasoning, address the risks, and outline what you'd need from the organization to execute your decision.`
    };

    return fallbackScenarios[scenario.id] || `**Adaptive Challenge: Leadership Reflection**

${displayName}, you've navigated ${scenario.id - 1} scenarios in the STRYDE PULSE launch journey. Now it's time for honest self-reflection.

**Your Leadership Journey So Far:**
You've handled supplier crises, budget negotiations, team conflicts, burnout concerns, and difficult decisions. Each response revealed something about your leadership style.

**Your Task:**
Write a reflection addressing these questions:

1. **What patterns do you notice in your leadership communication?**
   - Do you tend to prioritize tasks or relationships?
   - Are you more comfortable with data-driven decisions or intuitive judgment?
   - How do you balance directness with empathy?

2. **Where have you grown most during this simulation?**
   - Point to a specific scenario where you surprised yourself
   - What did you learn about yourself as a leader?

3. **What still challenges you?**
   - Be honest about a leadership skill you're still developing
   - What makes it difficult?

4. **How will you continue developing?**
   - What specific actions will you take to strengthen your leadership?

Be specific and authentic. The best leaders know themselves deeply.`;
}

// Export functions for use in simulation.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        evaluateResponse,
        generateAdaptiveScenario
    };
}



/**
 * STRYDE Leadership Simulation - AI Integration
 * Groq API integration with personalized "you" language feedback
 */

// Multiple API keys for load balancing
const GROQ_API_KEYS = [
    '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',
    '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',
    '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'
];

// Rotate through keys
let currentKeyIndex = 0;

function getApiKey() {
    const key = GROQ_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
    return key;
}

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
        const evaluation = await callGroqWithRetry(prompt, response);
        
        return evaluation;
        
    } catch (error) {
        console.error('Error in evaluateResponse:', error);
        
        // Return fallback evaluation
        return getFallbackEvaluation(scenario, studentName, response);
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

SCORE:
[Provide a numerical score from 1-5 based on the criteria below]
- 5 stars: Exceptional leadership communication - comprehensive, empathetic, strategic, clear action steps
- 4 stars: Strong response - addresses key issues well with minor areas for enhancement  
- 3 stars: Solid effort - demonstrates understanding but needs more depth or clarity
- 2 stars: Basic response - addresses situation but lacks depth, empathy, or clear direction
- 1 star: Needs significant development - misses key issues or lacks appropriate communication approach

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
async function callGroqWithRetry(prompt, studentResponse = '', maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Calling Groq API (attempt ${attempt}/${maxRetries})...`);
            
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getApiKey()}`,
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
            return parseEvaluationResponse(feedbackText, studentResponse);
            
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
function parseEvaluationResponse(text, studentResponse) {
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
        
        // ⭐ NEW: Validate score against actual response quality
        evaluation.score = validateScoreAgainstQuality(evaluation.score, studentResponse, evaluation.suggestions);
        
        // Ensure score is between 1-5
        evaluation.score = Math.max(1, Math.min(5, evaluation.score));

    } catch (error) {
        console.error('Error parsing evaluation:', error);
        evaluation.strengths = text.substring(0, 300) + '...';
        evaluation.suggestions = 'Continue developing your leadership communication skills.';
        evaluation.score = analyzeResponseQuality(studentResponse); // Use quality analyzer
    }

    return evaluation;
}

/**
 * Validate AI score against actual response quality
 * Prevents AI from being too generous with low-effort responses
 */
function validateScoreAgainstQuality(aiScore, studentResponse, suggestions) {
    const qualityScore = analyzeResponseQuality(studentResponse);
    const suggestionsSeverity = analyzeSuggestionsSeverity(suggestions);
    
    // If response quality is very poor, cap the score
    if (qualityScore <= 1.5) {
        return Math.min(aiScore, 2.0); // Cap at 2.0 for terrible responses
    }
    
    if (qualityScore <= 2.5) {
        return Math.min(aiScore, 3.0); // Cap at 3.0 for weak responses
    }
    
    // If suggestions indicate serious problems, reduce score
    if (suggestionsSeverity === 'severe' && aiScore > 3.0) {
        return Math.max(qualityScore, aiScore - 1.0);
    }
    
    if (suggestionsSeverity === 'moderate' && aiScore > 4.0) {
        return Math.min(aiScore, 4.0);
    }
    
    // Otherwise trust AI score but ensure it aligns with quality
    return Math.max(qualityScore, Math.min(aiScore, qualityScore + 1.5));
}

/**
 * Analyze the actual quality of the student's response
 * Returns a score from 1-5 based on objective metrics
 */
function analyzeResponseQuality(response) {
    if (!response || typeof response !== 'string') return 1;
    
    const text = response.trim();
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    const hasStructure = /\n/.test(text) || text.length > 200;
    
    // Extremely low effort (1-10 words, or gibberish like "t", "idk", "ok")
    if (wordCount <= 10 || /^[a-z]{1,3}$/i.test(text)) {
        return 1.0;
    }
    
    // Very minimal effort (11-30 words, single sentence)
    if (wordCount <= 30 && sentenceCount <= 2) {
        return 1.5;
    }
    
    // Basic effort (31-60 words, lacks structure)
    if (wordCount <= 60 && !hasStructure) {
        return 2.0;
    }
    
    // Adequate effort (61-100 words, some structure)
    if (wordCount <= 100) {
        return hasStructure ? 3.0 : 2.5;
    }
    
    // Good effort (101-150 words, good structure)
    if (wordCount <= 150) {
        return avgWordsPerSentence > 15 ? 3.5 : 3.0;
    }
    
    // Strong effort (151-250 words, well-structured)
    if (wordCount <= 250) {
        return avgWordsPerSentence > 12 ? 4.0 : 3.5;
    }
    
    // Excellent effort (250+ words, comprehensive)
    return avgWordsPerSentence > 10 ? 4.5 : 4.0;
}

/**
 * Analyze severity of suggestions to detect if AI identified serious issues
 */
function analyzeSuggestionsSeverity(suggestions) {
    if (!suggestions) return 'minimal';
    
    const text = suggestions.toLowerCase();
    
    // Severe issues
    const severeIndicators = [
        'lacks depth',
        'misses key',
        'does not address',
        'fails to',
        'no clear',
        'vague',
        'unclear',
        'insufficient',
        'needs significant',
        'major gap'
    ];
    
    const severeCount = severeIndicators.filter(indicator => text.includes(indicator)).length;
    if (severeCount >= 2) return 'severe';
    
    // Moderate issues
    const moderateIndicators = [
        'could be stronger',
        'needs more',
        'consider adding',
        'would benefit',
        'missing',
        'could improve'
    ];
    
    const moderateCount = moderateIndicators.filter(indicator => text.includes(indicator)).length;
    if (moderateCount >= 2) return 'moderate';
    
    return 'minimal';
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
function getFallbackEvaluation(scenario, studentName, studentResponse = '') {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    const fallbacks = {
        'crisis': {
            strengths: `${displayName === 'you' ? 'You' : displayName} addressed the crisis situation and showed awareness of stakeholder concerns. Your response demonstrated an understanding of the urgency and complexity of the situation.`,
            suggestions: `You could strengthen your response by being more specific about action steps and timelines. Consider how you might provide more concrete reassurance to your team while maintaining transparency about challenges.`,
            score: 3.5
        },
        'feedback': {
            strengths: `You showed consideration for the person's feelings and attempted to provide constructive input. Your response demonstrates awareness of the sensitive nature of giving feedback.`,
            suggestions: `You could enhance your feedback by being more specific with examples and balancing critical observations with recognition of strengths. Consider using more direct language while maintaining empathy.`,
            score: 3.5
        },
        'conflict': {
            strengths: `You recognized the conflict and attempted to address it. Your response shows awareness that team dynamics matter and conflicts need attention.`,
            suggestions: `You could strengthen your conflict resolution approach by being more explicit about finding common ground and facilitating direct communication between parties. Consider how you might create psychological safety for both sides.`,
            score: 3
        },
        'decision': {
            strengths: `You worked through the decision-making process and provided reasoning for your choice. Your response shows you're weighing multiple factors and stakeholder perspectives.`,
            suggestions: `You could improve your decision communication by being more explicit about trade-offs and providing clearer rationale for why you chose this path over alternatives. Consider addressing potential objections more directly.`,
            score: 3.5
        },
        'default': {
            strengths: `You engaged thoughtfully with this leadership scenario and demonstrated effort in crafting your response. Your writing shows you're thinking about the complexities of the situation.`,
            suggestions: `You could strengthen your response by being more specific and concrete in your communication. Consider using more vivid examples and addressing stakeholder concerns more directly.`,
            score: 3
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

    const baseScore = selectedFallback.score;
    const qualityAdjustedScore = analyzeResponseQuality(studentResponse);
    const finalScore = Math.min(baseScore, qualityAdjustedScore + 1.0);
    
    return {
        strengths: selectedFallback.strengths,
        suggestions: selectedFallback.suggestions,
        score: finalScore,
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
 * Build prompt for AI to generate adaptive scenarios
 */
function buildAdaptiveScenarioPrompt(scenarioTemplate, recentResponses, studentName) {
    const displayName = studentName !== 'Team Leader' ? studentName : 'you';
    
    // Analyze what topics have been covered
    const coveredTopics = recentResponses.map(r => r.scenarioTitle).join(', ');
    
    // Get specific topic from template
    const topicHint = scenarioTemplate.topicHint || 'a new leadership challenge';
    
    return `You are creating a unique leadership scenario for the STRYDE PULSE product launch simulation.

**CONTEXT:**
- STRYDE Athletics is launching STRYDE PULSE (eco-engineered running shoes)
- Launch is 2 weeks away
- Team Leader: ${displayName}
- 5-person cross-functional team:
  * Dr. Keisha Ramdial (R&D/Product Innovation)
  * Andre Baptiste (Marketing & Brand Strategy)
  * Malik Joseph (Supply Chain & Operations)
  * Sadie Persad (HR & People Experience)
  * Tristen Thompson (Finance & Strategy)

**TOPICS ALREADY COVERED:**
${coveredTopics || 'None yet'}

**YOUR TASK:**
Generate a UNIQUE scenario focused on: ${topicHint}

**CRITICAL REQUIREMENTS:**

1. **MUST BE DIFFERENT from previous scenarios** - avoid repetition of burnout, stress, or team morale
2. **MUST include "Your Task:" section** with clear action items
3. **MUST use ONLY the 5 team members listed** (no invented characters)
4. **MUST relate to STRYDE PULSE launch specifically**
5. Keep it realistic and grounded in the case context

**SCENARIO TOPICS TO EXPLORE (pick ONE that hasn't been covered):**
- Supplier suddenly raises prices for eco-materials (Malik issue)
- Celebrity athlete wants to partner but demands changes (Andre dilemma)
- Competitor announces similar product same week (strategic crisis)
- Factory reports production defect in 15% of units (quality vs timeline)
- CFO questions sustainability ROI and profit margins (Tristen conflict)
- Major retailer demands exclusive deal or won't stock product (negotiation)
- Influencer posts negative review of prototype (brand crisis)
- Team disagrees on final pricing strategy (decision-making)
- Environmental certification delayed by 2 weeks (launch timing)
- Key supplier in Trinidad offers local partnership opportunity (strategic choice)

**STRUCTURE YOUR RESPONSE EXACTLY LIKE THIS:**

**The Situation:**
[2-3 sentences setting up the specific challenge - be concrete and specific, not generic]

**The Details:**
[Provide 3-4 specific facts, numbers, or quotes that make this scenario real and urgent. Use bullet points.]

**Stakeholder Perspectives:**
[What do 2-3 team members think about this situation? Include brief quotes or positions.]

**Your Task:**
As Team Leader, you must:
1. [Specific action item 1]
2. [Specific action item 2]
3. [Specific action item 3]

Consider: [1-2 reflection questions about leadership principles]

**EXAMPLE OF GOOD SCENARIO:**

**The Situation:**
Malik just informed you that the Trinidad-based eco-material supplier has offered STRYDE a 20% discount if you commit to a 3-year exclusive partnership with their facility. However, this would mean cutting ties with your current Brazilian supplier, who has been reliable but more expensive. The decision needs to be made by Friday to lock in materials for launch.

**The Details:**
- Trinidad supplier: 20% cost savings, supports local economy, newer facility with less proven track record
- Brazilian supplier: 15% more expensive, established relationship, ISO-certified for 10 years, family-owned business that depends on STRYDE's orders
- Finance (Tristen) is pushing hard for the cost savings to improve margins
- Marketing (Andre) loves the "Made in Trinidad" story for the brand
- Operations (Malik) is nervous about switching suppliers 2 weeks before launch

**Stakeholder Perspectives:**
Tristen (Finance): "This saves us $40,000 on this production run alone. Our margins are already tight - we need this."
Andre (Marketing): "A Trinidad partnership is authentic and aligns with our brand values. It's a great story."
Malik (Operations): "I'm worried about switching suppliers this close to launch. What if something goes wrong?"

**Your Task:**
As Team Leader, you must:
1. Decide whether to switch to the Trinidad supplier or stay with the Brazilian partner
2. Communicate your decision to the team with clear rationale
3. Address concerns from those who disagree with your choice
4. Create a contingency plan if your decision leads to complications

Consider: How do you balance cost savings, risk management, brand values, and stakeholder relationships in this decision?

**NOW CREATE YOUR UNIQUE SCENARIO** following this structure. Make it specific, concrete, and different from previous scenarios.`;
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











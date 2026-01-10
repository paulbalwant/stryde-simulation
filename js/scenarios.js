/**
 * STRYDE PULSE Scenario Data
 * All 20 scenarios with personalized language
 */

const ScenarioData = {
    scenarios: [
        // ========================================
        // SCENARIOS 1-5: SUPPLIER CRISIS ARC
        // ========================================
        
        {
            id: 1,
            title: "Supplier Delay Announcement",
            type: "major",
            characterImage: "malik-joseph.jpg",
            characterName: "Malik Joseph",
            characterRole: "Supply Chain & Operations Manager",
            text: `You are the team leader for STRYDE PULSE, a new line of eco-engineered running shoes set to launch in 6 weeks.

This morning, you received an email from Malik Joseph (Supply Chain & Operations) forwarding urgent news from your key supplier in Vietnam: a 3-week delay in delivery of sustainable materials due to unexpected quality control issues.

**This delay threatens:**
- Product launch timeline
- Marketing campaign coordination (Andre Baptiste is concerned)
- Retail partner commitments
- Team morale and workload (Sadie Persad is worried)
- Budget implications (Tristen Thompson needs clarity)

**Team Status:**
- Dr. Keisha Ramdial (R&D) is concerned about compressed testing time
- Andre Baptiste (Marketing) has media commitments scheduled
- Malik Joseph (Operations) needs to coordinate with logistics
- Sadie Persad (HR) is worried about team stress levels
- Tristen Thompson (Finance) is concerned about budget impacts

Your team is waiting for your leadership response.

**Your Task:** Write an email to your team addressing this crisis situation. Consider transparency, reassurance, next steps, and how you'll manage stakeholder concerns.`,
            learningObjectives: [
                "Crisis communication",
                "Stakeholder management", 
                "Transparency and authenticity",
                "Managing uncertainty"
            ]
        },

        {
            id: 2,
            title: "Emergency Budget Approval",
            type: "micro",
            characterImage: "tristen-thompson.jpg",
            characterName: "Tristen Thompson",
            characterRole: "Finance & Strategy Analyst",
            text: `Following the supplier delay announcement, you need emergency budget approval from Tristen Thompson (Finance) to expedite alternative materials sourcing.

**The Situation:**
- Additional $75,000 needed for expedited shipping and premium material sourcing
- Tristen is data-driven and skeptical of unplanned expenses
- You have a meeting with Tristen in 30 minutes
- This decision could make or break the launch timeline

**What You Know About Tristen:**
- Values: Clear ROI, risk mitigation, strategic alignment
- Communication style: Prefers concrete data over emotional appeals
- Current concern: Project margins are already below target

**Your Task:** Write your opening statement to persuade Tristen to approve the emergency budget increase. Use persuasion principles from the handbook (Authority, Reciprocity, Social Proof, Scarcity, etc.).`,
            learningObjectives: [
                "Persuasion principles",
                "Financial communication",
                "Building credibility",
                "Influence without authority"
            ]
        },

        {
            id: 3,
            title: "Managing Supplier Relationship",
            type: "micro",
            characterImage: "malik-joseph.jpg",
            characterName: "Supplier CEO",
            characterRole: "Vietnam Manufacturing Partner",
            text: `The supplier delay has been partially resolved, but trust has been damaged. The supplier's CEO has reached out requesting a video call to discuss the relationship moving forward.

**Background:**
- This supplier is your only source for the specific eco-materials STRYDE PULSE requires
- They've been a reliable partner for 3 years until now
- The CEO seems defensive but wants to maintain the partnership
- Your team (especially Malik) is frustrated with them

**Your Challenge:** Balance multiple competing needs:
- Hold the supplier accountable for the delay
- Maintain the partnership (limited alternatives exist)
- Protect STRYDE's interests and timeline
- Demonstrate strong leadership to your team

**Your Task:** Write the key talking points for your video call with the supplier CEO. Show how you'll navigate this difficult conversation while preserving the relationship and ensuring accountability.`,
            learningObjectives: [
                "Difficult conversations",
                "Relationship management",
                "Negotiation communication",
                "Balancing assertiveness with diplomacy"
            ]
        },

        {
            id: 4,
            title: "Team Morale Check-In",
            type: "major",
            characterImage: "sadie-persad.jpg",
            characterName: "Sadie Persad",
            characterRole: "HR & People Experience Partner",
            text: `It's been 2 weeks since the supplier delay announcement. Sadie Persad (HR) has privately informed you that team members are showing concerning signs of burnout and stress.

**What Sadie Shared:**
- Dr. Keisha Ramdial has been working 12-hour days trying to compress the testing timeline
- Andre Baptiste seems increasingly frustrated in meetings and has made several sharp comments
- Malik Joseph has been short-tempered with his logistics team
- General team energy is low, and people are avoiding collaboration

**The Pressure:**
- Launch deadline is still firm from senior management
- Media commitments cannot be postponed
- Retail partners are expecting delivery
- BUT your team's wellbeing is deteriorating

You've scheduled an all-team meeting for tomorrow morning to address team morale while maintaining focus on the launch.

**Your Task:** Write your opening remarks for this team meeting. You need to acknowledge the strain, show empathy, maintain motivation, and provide genuine support—while keeping everyone focused on the critical work ahead.`,
            learningObjectives: [
                "Empathy and emotional intelligence",
                "Team motivation under pressure",
                "Authentic leadership",
                "Work-life balance awareness",
                "Managing competing priorities"
            ]
        },

        {
            id: 5,
            title: "Final Launch Decision",
            type: "major",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `You're now 10 days from the original launch date. After intense work, your team has partially recovered from the supplier delay, but you face a critical decision that will define your leadership.

**Option A: Launch on Schedule with Limited Inventory**
- Pros: Meet commitments, maintain momentum, test market response, preserve media coverage
- Cons: Only 60% of planned stock available, risk of stockouts, potential customer disappointment, team is exhausted
- **Andre (Marketing) strongly advocates for this option**

**Option B: Delay Launch by 3 Weeks**
- Pros: Full inventory preparation, team recovery time, quality assurance, proper testing completion
- Cons: Break commitments to retail partners and media, lose scheduled coverage, competitor may gain advantage
- **Keisha (R&D) strongly advocates for this option**

**The Others:**
- Malik (Operations): "I can make either work, but Option A is risky"
- Sadie (HR): "The team needs rest, but they'll push through if you ask"
- Tristen (Finance): "Option A protects margins, Option B reduces risk"

**Your senior management wants YOUR recommendation, with clear rationale.**

**Your Task:** Write an email to senior management with your decision and comprehensive rationale. Demonstrate strategic thinking, stakeholder awareness, and confident decision-making under uncertainty.`,
            learningObjectives: [
                "Decision-making under pressure",
                "Strategic thinking",
                "Stakeholder management",
                "Leadership courage",
                "Communicating difficult decisions"
            ]
        },

        // ========================================
        // SCENARIOS 6-10: MICRO LEADERSHIP MOMENTS
        // ========================================

        {
            id: 6,
            title: "Giving Difficult Feedback",
            type: "micro",
            characterImage: "andre-baptiste.jpg",
            characterName: "Andre Baptiste",
            characterRole: "Marketing & Brand Strategist",
            text: `Andre Baptiste (Marketing) recently presented the STRYDE PULSE brand campaign to senior leadership. While creative, the presentation lacked the data and ROI projections that executives expected. The feedback from leadership was lukewarm.

**What You Observed:**
- Andre focused heavily on creative storytelling but minimal business metrics
- The presentation was visually impressive but light on strategy
- Senior leaders asked pointed questions Andre couldn't answer
- Andre seems unaware of how the presentation landed

**Andre's Perspective:**
- He's proud of the creative work
- He's passionate about brand storytelling
- He values authenticity over "corporate metrics"
- He's sensitive to criticism about his creative vision

You need to give Andre feedback that helps him grow without damaging his confidence or your relationship.

**Your Task:** Write the feedback you'll give Andre in your upcoming one-on-one meeting. Balance directness with kindness, and help him understand the business context while preserving his creative strengths.`,
            learningObjectives: [
                "Giving constructive feedback",
                "Balancing directness with empathy",
                "Coaching for development",
                "Maintaining relationships while setting expectations"
            ]
        },

        {
            id: 7,
            title: "Conflict Between Team Members",
            type: "micro",
            characterImage: "keisha-tristen-conflict.jpg",
            characterName: "Keisha & Tristen",
            characterRole: "Team Conflict",
            text: `You've noticed growing tension between Dr. Keisha Ramdial (R&D) and Tristen Thompson (Finance). It came to a head in yesterday's meeting when they had a heated disagreement about material costs.

**The Conflict:**
- Keisha wants premium sustainable materials for product integrity
- Tristen is pushing for cost reduction to meet margin targets
- Both are making passive-aggressive comments in meetings
- Other team members are uncomfortable and avoiding taking sides

**What You've Observed:**
- Keisha feels Tristen "doesn't understand product quality"
- Tristen feels Keisha is "unrealistic about business constraints"
- Both are brilliant professionals who usually collaborate well
- This conflict is affecting team dynamics and slowing decisions

**The Challenge:**
- You need both of them to find middle ground
- You can't take sides—both have valid concerns
- The team is watching how you handle this

**Your Task:** Write an email to both Keisha and Tristen (joint message) addressing the conflict. Use your emotional intelligence and conflict resolution skills to help them move forward productively.`,
            learningObjectives: [
                "Conflict resolution",
                "Emotional intelligence",
                "Finding common ground",
                "Facilitative leadership"
            ]
        },

        {
            id: 8,
            title: "Recognizing Excellent Work",
            type: "micro",
            characterImage: "malik-joseph.jpg",
            characterName: "Malik Joseph",
            characterRole: "Supply Chain & Operations Manager",
            text: `Despite all the supplier challenges, Malik Joseph (Operations) has worked miracles behind the scenes. He personally flew to Vietnam, renegotiated contracts, found backup suppliers, and got the project back on track—all while managing his regular workload.

**What Malik Did:**
- Worked 70+ hour weeks for the past month
- Personally resolved the supplier relationship
- Found creative solutions that saved $30,000
- Never complained or asked for recognition
- Kept the team informed and calm throughout

**What You've Noticed:**
- Malik is humble and doesn't seek attention
- He's starting to look exhausted
- His contributions haven't been publicly acknowledged
- Other team members may not realize what he accomplished

**The Opportunity:**
- Recognition can motivate and energize
- Public acknowledgment reinforces team values
- Showing appreciation models inclusive leadership

**Your Task:** Write a message recognizing Malik's exceptional contributions. Consider: Should this be public (team email) or private (one-on-one)? How can you make the recognition meaningful and authentic?`,
            learningObjectives: [
                "Recognition and appreciation",
                "Authentic praise",
                "Motivating through acknowledgment",
                "Building team culture"
            ]
        },

        {
            id: 9,
            title: "Delegating a High-Stakes Task",
            type: "micro",
            characterImage: "sadie-persad.jpg",
            characterName: "Sadie Persad",
            characterRole: "HR & People Experience Partner",
            text: `Senior management has asked you to present the STRYDE PULSE "People Strategy" to the executive team next week. This presentation will cover team development, diversity initiatives, and culture-building for the product launch.

**The Situation:**
- You're overwhelmed with other launch priorities
- Sadie Persad (HR) is the expert on this topic
- This would be a great development opportunity for Sadie
- BUT it's a high-visibility presentation to senior executives
- You've never delegated something this important before

**Your Hesitation:**
- What if Sadie doesn't meet executive expectations?
- This reflects on your leadership
- You could probably do it "better" yourself
- But you're already stretched too thin

**The Opportunity:**
- Sadie has been asking for more strategic exposure
- This aligns perfectly with her expertise
- Delegation shows trust and develops your team
- It frees you to focus on other critical priorities

**Your Task:** Write the message delegating this presentation to Sadie. Show that you trust her, provide the necessary context and support, and set her up for success.`,
            learningObjectives: [
                "Delegation",
                "Empowerment",
                "Trust-building",
                "Developing team members",
                "Letting go of control"
            ]
        },

        {
            id: 10,
            title: "Responding to Public Criticism",
            type: "micro",
            characterImage: "andre-baptiste.jpg",
            characterName: "Andre Baptiste",
            characterRole: "Marketing & Brand Strategist",
            text: `STRYDE PULSE's sustainability claims have been questioned publicly on social media. An influential environmental blogger posted: "STRYDE claims eco-friendly but won't share full supply chain transparency. Greenwashing?"

**The Reality:**
- Your sustainability claims ARE legitimate
- Full supply chain transparency is complicated (competitive concerns)
- The post has 15K likes and growing
- Media outlets are starting to pick up the story
- Your team is worried about brand damage

**Andre's Recommendation:**
- Ignore it—"responding gives it more attention"
- Focus on positive messaging instead

**Your Concern:**
- Silence might seem like admission of guilt
- This could hurt pre-launch buzz
- But a defensive response could backfire

**What You Know:**
- Authentic communication builds trust
- Transparency (where possible) demonstrates integrity
- How you respond reveals your values

**Your Task:** Write a public response (social media post or statement) addressing the criticism. Demonstrate transparency, authenticity, and confident leadership while protecting legitimate business interests.`,
            learningObjectives: [
                "Crisis communication",
                "Public relations",
                "Authenticity under pressure",
                "Balancing transparency with business needs"
            ]
        },

        // ========================================
        // SCENARIOS 11-13: AI-ADAPTIVE SCENARIOS
        // These are dynamically generated based on student's response patterns
        // ========================================

        {
            id: 11,
            title: "Adaptive Challenge: Communication Style",
            type: "ai-generated",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `[This scenario will be dynamically generated by AI based on your communication patterns in previous scenarios. It will target your specific development areas.]`,
            learningObjectives: [
                "Personalized development",
                "Adaptive learning",
                "Self-awareness"
            ],
            isAIGenerated: true
        },

        {
            id: 12,
            title: "Adaptive Challenge: Leadership Decision",
            type: "ai-generated",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `[This scenario will be dynamically generated by AI based on your decision-making patterns. It will present situations that challenge your default approaches.]`,
            learningObjectives: [
                "Decision-making flexibility",
                "Overcoming biases",
                "Growth mindset"
            ],
            isAIGenerated: true
        },

        {
            id: 13,
            title: "Adaptive Challenge: Stakeholder Management",
            type: "ai-generated",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `[This scenario will be dynamically generated by AI to test your stakeholder management in complex situations specific to your leadership style.]`,
            learningObjectives: [
                "Complex stakeholder dynamics",
                "Influence strategies",
                "Political savvy"
            ],
            isAIGenerated: true
        },

        // ========================================
        // SCENARIOS 14-18: TEAM BURNOUT ARC
        // ========================================

        {
            id: 14,
            title: "Burnout Warning Signs",
            type: "major",
            characterImage: "keisha-ramdial.jpg",
            characterName: "Dr. Keisha Ramdial",
            characterRole: "Product Innovation Lead",
            text: `You're now 3 weeks from launch. The pace has been relentless. This morning, Dr. Keisha Ramdial—your most dedicated team member—sent you a worrying 2am email with technical updates, then didn't show up to today's 9am meeting. This is completely out of character.

**What You've Noticed About Keisha:**
- Working until midnight regularly
- Responding to emails at 3am
- Skipping lunch to run tests
- Looking exhausted and pale
- Making uncharacteristic small errors

**What Sadie (HR) Just Told You:**
- Keisha's direct reports are concerned
- She snapped at a junior researcher yesterday
- She's been dismissive of work-life balance suggestions
- She's "fine" whenever anyone asks

**The Larger Pattern:**
- The whole team is running on fumes
- But Keisha's burnout is most severe
- Her leadership role means others are watching
- If she breaks down, it could cascade

**Your Dilemma:**
- You need Keisha's expertise for launch
- But her health and wellbeing matter more
- How do you intervene without making it worse?
- What message does this send to the team?

**Your Task:** Write a message to Keisha addressing your concerns. Show genuine care, set appropriate boundaries, and model healthy leadership—even under intense deadline pressure.`,
            learningObjectives: [
                "Recognizing burnout",
                "Caring leadership",
                "Setting healthy boundaries",
                "Modeling work-life integration"
            ]
        },

        {
            id: 15,
            title: "Mandatory Team Reset",
            type: "major",
            characterImage: "sadie-persad.jpg",
            characterName: "Sadie Persad",
            characterRole: "HR & People Experience Partner",
            text: `After Keisha's breakdown, you've decided to implement a mandatory 3-day team reset before the final launch push. Sadie Persad (HR) supports this fully, but you're facing resistance from multiple directions.

**The Pushback:**
- Senior management: "We can't afford delays right now"
- Andre (Marketing): "Media commitments can't be moved"
- Tristen (Finance): "This will cost us in overtime later"
- Even some team members: "I'd rather just power through"

**Sadie's Warning:**
- Three team members are at serious burnout risk
- Productivity is actually DECLINING due to exhaustion
- You're at risk of losing people post-launch
- "Sometimes the brave thing is to stop, not push harder"

**Your Conviction:**
- Sustainable performance requires recovery
- You won't sacrifice people for deadlines
- This models the culture you want to build
- Short-term pain, long-term gain

**The Challenge:**
- You need to stand firm against pressure
- Communicate the decision confidently
- Get buy-in from skeptical stakeholders
- Set the right tone for the reset

**Your Task:** Write an announcement to the entire team (with senior management CC'd) explaining the mandatory 3-day reset. Demonstrate conviction, explain your reasoning, and rally the team around recovery and the final push.`,
            learningObjectives: [
                "Courageous leadership",
                "Standing firm under pressure",
                "Values-driven decisions",
                "Change management"
            ]
        },

        {
            id: 16,
            title: "Post-Reset Re-Energizing",
            type: "micro",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `The 3-day team reset is complete. People are visibly more rested, and you've received positive feedback. Now comes the critical transition: re-energizing the team for the intense final 2-week push to launch.

**What You Need to Achieve:**
- Rebuild momentum without triggering burnout again
- Create excitement and energy around the final stretch
- Set sustainable work expectations
- Acknowledge the challenge ahead honestly

**What You've Learned:**
- The reset was necessary and appreciated
- People are ready to finish strong
- But they're watching to see if you'll revert to unsustainable pace
- Your communication here sets the tone

**The Opportunity:**
- Fresh start to model better practices
- Channel renewed energy productively
- Finish strong AND sustainably
- Create a memorable launch experience

**Your Task:** Write your "welcome back" message to the team for your first meeting after the reset. Balance energy and realism, set healthy expectations, and inspire them for the final push.`,
            learningObjectives: [
                "Motivational communication",
                "Sustainable performance",
                "Team re-engagement",
                "Inspirational leadership"
            ]
        },

        {
            id: 17,
            title: "Individual Team Member Check-In",
            type: "micro",
            characterImage: "andre-baptiste.jpg",
            characterName: "Andre Baptiste",
            characterRole: "Marketing & Brand Strategist",
            text: `It's now 1 week from launch. During the intense final preparation, you notice Andre Baptiste (Marketing) is quieter than usual. Normally energetic and vocal, he's been withdrawn in meetings and hasn't been contributing his usual creative ideas.

**What You've Noticed:**
- Andre leaves meetings immediately instead of chatting
- His usual enthusiasm seems muted
- He's completing tasks but without his typical creative spark
- He declined to join the team for lunch yesterday

**What You're Wondering:**
- Is something wrong personally?
- Is he still recovering from the burnout period?
- Did something happen you're not aware of?
- Or is he just in "execution mode" for launch?

**Your Leadership Instinct:**
- Check in, but don't pry
- Show you care without being invasive
- Create space for him to share if he wants
- But respect his privacy if he doesn't

**Your Task:** Write a message to Andre checking in on how he's doing. Show genuine concern, create psychological safety, but respect boundaries.`,
            learningObjectives: [
                "Emotional intelligence",
                "Individual care",
                "Psychological safety",
                "Reading non-verbal cues"
            ]
        },

        {
            id: 18,
            title: "Launch Week Preparation",
            type: "major",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `It's 48 hours before launch. Your team has worked incredibly hard to get here. The product is ready, marketing is prepared, operations are set, and everyone is in position.

**The Moment:**
- This is the culmination of months of work
- Challenges overcome, relationships tested
- People have grown, struggled, and persevered
- Success is within reach

**Your Team's State:**
- Nervous excitement
- Pride in what they've accomplished
- Some anxiety about what could go wrong
- Looking to you for final leadership

**What This Moment Requires:**
- Acknowledgment of the journey
- Confidence in the team and preparation
- Realistic optimism about launch
- Gratitude and inspiration

**Your Opportunity:**
- This is your final message before launch
- Set the tone for how you want them to show up
- Acknowledge individual and collective contributions
- Send them into launch day confident and united

**Your Task:** Write your final pre-launch message to the team. This is your leadership moment—make it count. Inspire, acknowledge, energize, and prepare them for launch day.`,
            learningObjectives: [
                "Inspirational leadership",
                "Team acknowledgment",
                "Setting tone and expectations",
                "Celebrating journey and preparation"
            ]
        },

        // ========================================
        // SCENARIOS 19-20: LAUNCH & REFLECTION
        // ========================================

        {
            id: 19,
            title: "Launch Day Presentation",
            type: "major",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `LAUNCH DAY. STRYDE PULSE is officially launching today. You're presenting to senior leadership, the board, and key stakeholders about the launch and the journey to get here.

**What You'll Cover:**
- Product launch results and early metrics
- The challenges faced and how you navigated them
- Team performance and growth
- Lessons learned as a leader
- Vision for STRYDE PULSE's future

**Your Audience Includes:**
- CEO and executive team (evaluating your leadership)
- Board members (assessing strategic decisions)
- Team members (watching how you represent their work)
- External partners (forming impressions of STRYDE)

**What You Want to Convey:**
- Competent, strategic leadership
- Authentic acknowledgment of challenges
- Recognition of team contributions
- Vision and confidence for the future
- Personal growth as a leader

**Your Task:** Write the opening and closing of your launch presentation (approximately 150-200 words total). Demonstrate executive presence, strategic thinking, and authentic leadership.`,
            learningObjectives: [
                "Executive communication",
                "Strategic presentation",
                "Authentic leadership voice",
                "Stakeholder management"
            ]
        },

        {
            id: 20,
            title: "Post-Launch Leadership Reflection",
            type: "major",
            characterImage: null,
            characterName: null,
            characterRole: null,
            text: `One week after launch, you're meeting with your mentor/coach for a reflection session on your leadership journey through the STRYDE PULSE launch.

**The Journey:**
- Supplier crisis and tough decisions
- Team conflicts and relationship management
- Burnout prevention and team wellbeing
- Persuasion, influence, and stakeholder management
- 20 critical leadership moments navigated

**Reflection Questions:**
- What did you learn about your leadership style?
- Where did you grow most? Where do you still need development?
- What surprised you about leading through crisis?
- How did your communication evolve?
- What will you do differently in your next leadership challenge?

**Your Mentor Wants to Know:**
- Your honest self-assessment
- Evidence of self-awareness
- Specific examples of growth
- Clear development goals going forward
- How you'll apply these lessons

**Your Task:** Write your reflection on this leadership journey. Be honest, specific, and forward-looking. Show self-awareness and commitment to continued growth. This is your leadership story—own it.`,
            learningObjectives: [
                "Leadership self-awareness",
                "Reflective practice",
                "Growth mindset",
                "Personal development planning",
                "Authentic self-assessment"
            ]
        }
    ]
};

// Master Prompt Templates for Campaign Generation
class PromptTemplates {
  constructor() {
    this.templates = {
      strategyAnalysis: {
        systemPrompt: "You are a senior marketing strategist with 15+ years of experience. Analyze marketing briefs and create strategic foundations that drive results.",
        getUserPrompt: (brief) => `
Analyze this marketing brief and create a comprehensive strategic foundation:

Campaign Objective: ${brief.objective}
Target Audience: ${brief.audience}
Product/Service: ${brief.product}
Occasion/Timing: ${brief.occasion || 'General campaign'}
Budget Range: ${brief.budget || 'Not specified'}
Channels: ${brief.channels.join(', ') || 'To be determined'}
Brand Guidelines: ${brief.guidelines || 'Standard professional approach'}

Provide a strategic analysis in this EXACT JSON format:
{
  "strategic_concept": "Compelling 4-6 word campaign concept",
  "target_audience_analysis": "Detailed psychographic and demographic analysis",
  "key_messages": ["Primary message", "Secondary message", "Supporting message"],
  "brand_positioning": "Clear positioning statement",
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
}

Focus on actionable insights and measurable outcomes. Be specific and strategic.`,
        tokenLimit: 800
      },
      
      visualDirection: {
        systemPrompt: "You are a creative director specializing in brand visual identity. Create detailed visual directions that inspire and guide creative teams.",
        getUserPrompt: (brief, strategy) => `
Create a comprehensive visual direction based on this campaign:

Campaign: ${brief.objective}
Strategic Concept: ${strategy.strategic_concept}
Target Audience: ${brief.audience}
Brand Guidelines: ${brief.guidelines || 'Open to creative interpretation'}

Provide visual direction in this EXACT JSON format:
{
  "mood_board_description": "Detailed description of visual mood and aesthetic",
  "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "typography_style": "Typography recommendation with rationale",
  "visual_elements": ["Element 1", "Element 2", "Element 3", "Element 4"],
  "photography_style": "Photo style and composition guidelines",
  "overall_aesthetic": "Cohesive visual theme description"
}

Ensure colors work well together and reflect the brand personality. Be specific about visual execution.`,
        tokenLimit: 600
      },
      
      copywriting: {
        systemPrompt: "You are an expert copywriter who creates compelling, conversion-focused content across all marketing channels.",
        getUserPrompt: (brief, strategy) => `
Create compelling copy variations for this campaign:

Campaign: ${brief.objective}
Strategic Concept: ${strategy.strategic_concept}
Target Audience: ${brief.audience}
Key Messages: ${strategy.key_messages.join(', ')}
Channels: ${brief.channels.join(', ')}

Generate copy in this EXACT JSON format:
{
  "headlines": ["Headline 1", "Headline 2", "Headline 3"],
  "social_posts": [
    "Social post 1 with emojis and hashtags",
    "Social post 2 with emojis and hashtags", 
    "Social post 3 with emojis and hashtags",
    "Social post 4 with emojis and hashtags",
    "Social post 5 with emojis and hashtags"
  ],
  "ad_copy": [
    "Long-form ad copy 1 (150-200 words)",
    "Long-form ad copy 2 (150-200 words)"
  ],
  "tagline": "Memorable campaign tagline",
  "call_to_action": ["CTA 1", "CTA 2", "CTA 3"]
}

Make copy engaging, actionable, and platform-appropriate. Include relevant emojis and hashtags for social posts.`,
        tokenLimit: 1000
      },
      
      marketResearch: {
        systemPrompt: "You are a market research analyst specializing in digital marketing insights and competitive analysis.",
        getUserPrompt: (brief) => `
Provide market research insights for this campaign:

Campaign: ${brief.objective}
Target Audience: ${brief.audience}
Product: ${brief.product}
Channels: ${brief.channels.join(', ')}

Deliver insights in this EXACT JSON format:
{
  "audience_insights": [
    "Behavioral insight 1",
    "Preference insight 2", 
    "Trend insight 3",
    "Platform usage insight 4"
  ],
  "competitor_analysis": [
    "Competitor 1: Strengths and positioning",
    "Competitor 2: Strengths and positioning",
    "Competitor 3: Strengths and positioning"
  ],
  "influencer_recommendations": [
    {
      "name": "@influencer1",
      "followers": "50K",
      "engagement": "4.8%",
      "niche": "Specific niche area",
      "rationale": "Why this influencer fits"
    },
    {
      "name": "@influencer2", 
      "followers": "75K",
      "engagement": "3.9%",
      "niche": "Specific niche area",
      "rationale": "Why this influencer fits"
    }
  ],
  "market_opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
}

Base recommendations on current market trends and audience behavior patterns.`,
        tokenLimit: 700
      },
      
      mediaPlanning: {
        systemPrompt: "You are a media planning expert who creates strategic, results-driven campaign timelines and budget allocations.",
        getUserPrompt: (brief, strategy) => `
Create a comprehensive media plan for this campaign:

Campaign: ${brief.objective}
Strategic Concept: ${strategy.strategic_concept}
Budget: ${brief.budget}
Channels: ${brief.channels.join(', ')}
Duration: ${brief.occasion ? '4 weeks (event-driven)' : '6 weeks (ongoing)'}

Structure the plan in this EXACT JSON format:
{
  "timeline": [
    {
      "week": "Week 1",
      "focus": "Phase focus area",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "week": "Week 2", 
      "focus": "Phase focus area",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "week": "Week 3",
      "focus": "Phase focus area", 
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "week": "Week 4",
      "focus": "Phase focus area",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "budget_allocation": [
    {
      "category": "Content Creation",
      "percentage": "30%",
      "rationale": "Why this allocation"
    },
    {
      "category": "Paid Advertising", 
      "percentage": "40%",
      "rationale": "Why this allocation"
    },
    {
      "category": "Influencer Marketing",
      "percentage": "20%", 
      "rationale": "Why this allocation"
    },
    {
      "category": "Tools & Analytics",
      "percentage": "10%",
      "rationale": "Why this allocation"
    }
  ],
  "channel_strategy": "Detailed strategy for channel utilization and sequencing",
  "optimization_plan": "How to monitor and optimize campaign performance"
}

Ensure timeline is realistic and budget allocation is strategic.`,
        tokenLimit: 600
      }
    };
  }
  
  getPrompt(type, brief, additionalData = null) {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown prompt type: ${type}`);
    }
    
    const fullPrompt = template.systemPrompt + "\n\n" + template.getUserPrompt(brief, additionalData);
    
    return {
      prompt: fullPrompt,
      maxTokens: template.tokenLimit,
      expectedFormat: 'JSON'
    };
  }
  
  validateJsonResponse(response, type) {
    try {
      const parsed = JSON.parse(response);
      
      // Basic validation based on prompt type
      const validationRules = {
        strategyAnalysis: ['strategic_concept', 'target_audience_analysis', 'key_messages'],
        visualDirection: ['mood_board_description', 'color_palette', 'typography_style'],
        copywriting: ['headlines', 'social_posts', 'ad_copy'],
        marketResearch: ['audience_insights', 'competitor_analysis', 'influencer_recommendations'],
        mediaPlanning: ['timeline', 'budget_allocation', 'channel_strategy']
      };
      
      const requiredFields = validationRules[type] || [];
      const missingFields = requiredFields.filter(field => !(field in parsed));
      
      if (missingFields.length > 0) {
        console.warn(`Missing fields in ${type} response:`, missingFields);
      }
      
      return { valid: true, data: parsed, issues: missingFields };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  // Token estimation for cost optimization
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
  
  optimizePromptLength(prompt, maxTokens) {
    const estimatedTokens = this.estimateTokens(prompt);
    
    if (estimatedTokens > maxTokens * 0.8) {
      // Truncate if approaching limit, keeping essential parts
      const essentialParts = prompt.split('\n\n');
      let optimizedPrompt = essentialParts[0]; // Keep system prompt
      
      for (let i = 1; i < essentialParts.length; i++) {
        const testPrompt = optimizedPrompt + '\n\n' + essentialParts[i];
        if (this.estimateTokens(testPrompt) < maxTokens * 0.8) {
          optimizedPrompt = testPrompt;
        } else {
          break;
        }
      }
      
      return optimizedPrompt;
    }
    
    return prompt;
  }
}

// Global prompt templates instance
const promptTemplates = new PromptTemplates();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PromptTemplates, promptTemplates };
}
// Master Prompt Templates for Campaign Generation
console.log('=== TEMPLATES LOADED ===');

class PromptTemplates {

  constructor() {
    this.templates = {
      strategyAnalysis: {
        systemPrompt: "You are a senior marketing strategist with 15+ years of experience. Analyze marketing briefs and create strategic foundations that drive results.",
        getUserPrompt: (brief) => `
CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no comments, no additional text. Just the JSON object.

Analyze this marketing brief and create a comprehensive strategic foundation:

Campaign Objective: ${brief.objective}
Target Audience: ${brief.audience}
Product/Service: ${brief.product}
Occasion/Timing: ${brief.occasion || 'General campaign'}
Budget Range: ${brief.budget || 'Not specified'}
Channels: ${brief.channels.join(', ') || 'To be determined'}
Brand Guidelines: ${brief.guidelines || 'Standard professional approach'}

RESPOND WITH ONLY THIS JSON STRUCTURE (no additional text):

{
  "strategic_concept": "Compelling 4-6 word campaign concept",
  "target_audience_analysis": "Detailed psychographic and demographic analysis",
  "key_messages": ["Primary message", "Secondary message", "Supporting message"],
  "brand_positioning": "Clear positioning statement",
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
}`,
        tokenLimit: 800
      },

      visualDirection: {
        systemPrompt: "You are a creative director specializing in brand visual identity. Create detailed visual directions that inspire and guide creative teams.",
        getUserPrompt: (brief, strategy) => `
CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no comments, no additional text. Just the JSON object.

Create a comprehensive visual direction based on this campaign:

Campaign: ${brief.objective}
Strategic Concept: ${strategy?.strategic_concept || 'Not provided'}
Target Audience: ${brief.audience}
Brand Guidelines: ${brief.guidelines || 'Open to creative interpretation'}

RESPOND WITH ONLY THIS JSON STRUCTURE (no additional text):

{
  "mood_board_description": "Detailed description of visual mood and aesthetic",
  "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "typography_style": "Typography recommendation with rationale",
  "visual_elements": ["Element 1", "Element 2", "Element 3", "Element 4"],
  "photography_style": "Photo style and composition guidelines",
  "overall_aesthetic": "Cohesive visual theme description"
}`,
        tokenLimit: 600
      },

      copywriting: {
        systemPrompt: "You are an expert copywriter who creates compelling, conversion-focused content across all marketing channels.",
        getUserPrompt: (brief, strategy) => `
CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no comments, no additional text. Just the JSON object.

Create compelling copy variations for this campaign:

Campaign: ${brief.objective}
Strategic Concept: ${strategy?.strategic_concept || 'Not provided'}
Target Audience: ${brief.audience}
Key Messages: ${strategy?.key_messages?.join(', ') || 'Not provided'}
Channels: ${brief.channels.join(', ')}

RESPOND WITH ONLY THIS JSON STRUCTURE (no additional text):

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
}`,
        tokenLimit: 1000
      },

            
      imageGeneration: {
        systemPrompt: "You are an AI that generates detailed image prompts for marketing campaigns. Create vivid, professional descriptions for marketing imagery.",
        getUserPrompt: (brief) => `
      Create 2 detailed image generation prompts for a marketing campaign with these details:
      
      Campaign Brief:
      - Objective: ${brief.objective}
      - Target Audience: ${brief.audience}
      - Product/Service: ${brief.product}
      - Channels: ${brief.channels?.join(', ') || 'Digital marketing'}
      
      Generate exactly 2 image prompts:
      1. Product/Service Hero Image: Professional product shot or service visualization
      2. Lifestyle Marketing Scene: People using/enjoying the product in real-world context
      
      Each prompt should be:
      - Detailed and specific (lighting, composition, style)
      - Professional marketing quality
      - Suitable for ${brief.audience}
      - 50-100 words each
      
      RESPOND WITH ONLY JSON:
      {
        "image_prompts": [
          "Detailed prompt for hero product image...",
          "Detailed prompt for lifestyle scene..."
        ]
      }`,
        tokenLimit: 400,
        expectedFormat: {
          image_prompts: 'array'
        }
      },

      marketResearch: {
        systemPrompt: "You are a market research analyst specializing in digital marketing insights and competitive analysis.",
        getUserPrompt: (brief) => `
CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no comments, no additional text. Just the JSON object.

Provide market research insights for this campaign:

Campaign: ${brief.objective}
Target Audience: ${brief.audience}
Product: ${brief.product}
Channels: ${brief.channels.join(', ')}

RESPOND WITH ONLY THIS JSON STRUCTURE (no additional text):

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
}`,
        tokenLimit: 700
      },

      mediaPlanning: {
        systemPrompt: "You are a media planning expert who creates strategic, results-driven campaign timelines and budget allocations.",
        getUserPrompt: (brief, strategy) => `
CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no comments, no additional text. Just the JSON object.

Create a comprehensive media plan for this campaign:

Campaign: ${brief.objective}
Strategic Concept: ${strategy?.strategic_concept || 'Not provided'}
Budget: ${brief.budget}
Channels: ${brief.channels.join(', ')}
Duration: ${brief.occasion ? '4 weeks (event-driven)' : '6 weeks (ongoing)'}

RESPOND WITH ONLY THIS JSON STRUCTURE (no additional text):

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
}`,
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

  // â ULEPSZONA WALIDACJA JSON z czyszczeniem
  validateJsonResponse(response, type) {
    try {
      // Najpierw sprĂłbuj sparsowaÄ bezpoĹrednio
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (initialError) {
        // JeĹli nie udaĹo siÄ, sprĂłbuj wyczyĹciÄ odpowiedĹş
        const cleanedResponse = this.cleanJsonResponse(response);
        parsed = JSON.parse(cleanedResponse);
      }

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
      console.error('JSON validation failed:', error.message);
      console.error('Original response:', response);
      return { valid: false, error: error.message };
    }
  }

  cleanJsonResponse(response) {
    console.log('🧹 Cleaning JSON response:', response);

    // Usuń typowe frazy wprowadzające
    let cleaned = response
      .replace(/.*?(here\s+is|here's|json|format|response|result).{0,50}?\s*(\{|\[)/gi, '$2')
      .replace(/```\s*json/gi, '')
      .replace(/```\s*$/gi, '')
      .replace(/^\s*,/, ''); // Usuń przecinek na początku

    // Znajdź pierwszy { i ostatni }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // POPRAW NIEKOMPLETNY JSON
    // Jeśli kończy się przecinkiem i nie ma zamknięcia
    if (cleaned.match(/,\s*$/)) {
      // Usuń końcowy przecinek
      cleaned = cleaned.replace(/,\s*$/, '');

      // Spróbuj dodać brakujące zamknięcia
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;

      // Dodaj brakujące zamknięcia
      for (let i = 0; i < (openBrackets - closeBrackets); i++) {
        cleaned += ']';
      }
      for (let i = 0; i < (openBraces - closeBraces); i++) {
        cleaned += '}';
      }
    }

    console.log('✅ Cleaned JSON:', cleaned);
    return cleaned;
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
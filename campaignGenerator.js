// Campaign Generation Engine
console.log('=== GENERATOR LOADED ===');

class CampaignGenerator {
  constructor(geminiClient, promptTemplates) {
    this.gemini = geminiClient;
    this.prompts = promptTemplates;
    this.currentCampaign = null;
    this.generationSteps = [
      { id: 'analyze', name: 'Analyzing Brief', icon: 'ÄÂÂÂ' },
      { id: 'strategy', name: 'Formulating Strategy', icon: 'ÄÂÂÄ' },
      { id: 'visuals', name: 'Creating Visual Concepts', icon: 'ÄÂÂÂ¨' },
      { id: 'copy', name: 'Generating Content', icon: 'Ă˘ÂÂÄÂ¸Â' },
      { id: 'research', name: 'Market Research', icon: 'ÄÂÂÂ' },
      { id: 'planning', name: 'Media Planning', icon: 'ÄÂÂÂ' }
    ];
  }

  async generateCampaign(briefData, progressCallback) {
    this.currentCampaign = {
      brief: briefData,
      generatedAt: new Date().toISOString(),
      id: this.generateCampaignId()
    };

    try {
      // Step 1: Strategy Analysis
      progressCallback?.('strategy', 'active', 'Analyzing brief and formulating strategic concept...');
      const strategy = await this.generateStrategy(briefData);
      this.currentCampaign.strategy = strategy;
      progressCallback?.('strategy', 'completed', 'Strategic foundation complete');

      // Step 2: Visual Direction
      progressCallback?.('visuals', 'active', 'Creating visual identity and mood boards...');
      const visuals = await this.generateVisuals(briefData, strategy);
      this.currentCampaign.visuals = visuals;
      progressCallback?.('visuals', 'completed', 'Visual concepts ready');

      // Step 3: Copywriting
      progressCallback?.('copy', 'active', 'Writing compelling copy and headlines...');
      const copy = await this.generateCopy(briefData, strategy);
      this.currentCampaign.copy = copy;
      progressCallback?.('copy', 'completed', 'Content creation finished');

      // Step 4: Market Research
      progressCallback?.('research', 'active', 'Conducting market analysis and research...');
      const research = await this.generateResearch(briefData);
      this.currentCampaign.research = research;
      progressCallback?.('research', 'completed', 'Market insights ready');

      // Step 5: Media Planning
      progressCallback?.('planning', 'active', 'Creating timeline and budget allocation...');
      const planning = await this.generatePlanning(briefData, strategy);
      this.currentCampaign.planning = planning;
      progressCallback?.('planning', 'completed', 'Campaign plan complete');

      // Finalize campaign
      this.finalizeCampaign();

      return this.currentCampaign;

    } catch (error) {
      console.error('Campaign generation error:', error);
      progressCallback?.('error', 'error', error.message);

      // Return partial campaign or fallback
      return this.createFallbackCampaign(briefData, error);
    }
  }

  async generateStrategy(briefData) {
    const promptData = this.prompts.getPrompt('strategyAnalysis', briefData);
    const result = await this.gemini.generateContent(promptData.prompt);

    if (result.success) {
      const validation = this.prompts.validateJsonResponse(result.content, 'strategyAnalysis');
      if (validation.valid) {
        return {
          ...validation.data,
          _meta: {
            tokensUsed: result.tokensUsed,
            model: result.model,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    // Fallback strategy
    return this.createFallbackStrategy(briefData);
  }

  async generateVisuals(briefData, strategy) {
    const promptData = this.prompts.getPrompt('visualDirection', briefData, strategy);
    const result = await this.gemini.generateContent(promptData.prompt);

    if (result.success) {
      const validation = this.prompts.validateJsonResponse(result.content, 'visualDirection');
      if (validation.valid) {
        return {
          ...validation.data,
          _meta: {
            tokensUsed: result.tokensUsed,
            model: result.model,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    return this.createFallbackVisuals(briefData);
  }

  async generateCopy(briefData, strategy) {
    const promptData = this.prompts.getPrompt('copywriting', briefData, strategy);
    const result = await this.gemini.generateContent(promptData.prompt);

    if (result.success) {
      const validation = this.prompts.validateJsonResponse(result.content, 'copywriting');
      if (validation.valid) {
        return {
          ...validation.data,
          _meta: {
            tokensUsed: result.tokensUsed,
            model: result.model,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    return this.createFallbackCopy(briefData, strategy);
  }

  async generateResearch(briefData) {
    const promptData = this.prompts.getPrompt('marketResearch', briefData);
    const result = await this.gemini.generateContent(promptData.prompt);

    if (result.success) {
      const validation = this.prompts.validateJsonResponse(result.content, 'marketResearch');
      if (validation.valid) {
        return {
          ...validation.data,
          _meta: {
            tokensUsed: result.tokensUsed,
            model: result.model,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    return this.createFallbackResearch(briefData);
  }

  async generatePlanning(briefData, strategy) {
    const promptData = this.prompts.getPrompt('mediaPlanning', briefData, strategy);
    const result = await this.gemini.generateContent(promptData.prompt);

    if (result.success) {
      const validation = this.prompts.validateJsonResponse(result.content, 'mediaPlanning');
      if (validation.valid) {
        return {
          ...validation.data,
          _meta: {
            tokensUsed: result.tokensUsed,
            model: result.model,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    return this.createFallbackPlanning(briefData);
  }

  // Regenerate specific campaign elements
  async regenerateElement(elementType, options = {}) {
    if (!this.currentCampaign) {
      throw new Error('No current campaign to regenerate');
    }

    const briefData = this.currentCampaign.brief;
    const strategy = this.currentCampaign.strategy;

    switch (elementType) {
      case 'headlines':
        const newCopy = await this.generateCopy(briefData, strategy);
        this.currentCampaign.copy.headlines = newCopy.headlines;
        return newCopy.headlines;

      case 'social':
        const socialCopy = await this.generateCopy(briefData, strategy);
        this.currentCampaign.copy.social_posts = socialCopy.social_posts;
        return socialCopy.social_posts;

      case 'visuals':
        const newVisuals = await this.generateVisuals(briefData, strategy);
        this.currentCampaign.visuals = { ...this.currentCampaign.visuals, ...newVisuals };
        return newVisuals;

      case 'research':
        const newResearch = await this.generateResearch(briefData);
        this.currentCampaign.research = { ...this.currentCampaign.research, ...newResearch };
        return newResearch;

      default:
        throw new Error(`Unknown element type: ${elementType}`);
    }
  }

  // Fallback content creators
  createFallbackStrategy(briefData) {
    return {
      strategic_concept: this.generateStrategicConcept(briefData.objective),
      target_audience_analysis: `Primary demographic analysis for ${briefData.audience} reveals high digital engagement and preference for authentic brand communication`,
      key_messages: [
        "Innovation meets authenticity",
        "Customer-centric solutions",
        "Results-driven approach"
      ],
      brand_positioning: "The strategic partner for modern marketing challenges",
      success_metrics: ["Engagement rate improvement", "Conversion optimization", "Brand awareness lift"],
      _fallback: true
    };
  }

  createFallbackVisuals(briefData) {
    const industry = this.detectIndustry(briefData.product);
    const colorPalettes = {
      tech: ["#1a365d", "#2d5aa0", "#f7fafc", "#e2e8f0", "#4299e1"],
      food: ["#2d5016", "#8fbc8f", "#f5e6d3", "#a0522d", "#68d391"],
      fashion: ["#742a2a", "#f56565", "#fed7d7", "#fff5f5", "#fc8181"],
      default: ["#1a202c", "#2d3748", "#4a5568", "#718096", "#a0aec0"]
    };

    return {
      mood_board_description: `Contemporary ${industry} aesthetic with clean lines and professional appeal`,
      color_palette: colorPalettes[industry] || colorPalettes.default,
      typography_style: "Modern sans-serif with strong hierarchy and excellent readability",
      visual_elements: ["Clean iconography", "Subtle geometric patterns", "Strategic whitespace", "Cohesive imagery"],
      photography_style: "Authentic lifestyle photography with natural lighting",
      overall_aesthetic: "Professional yet approachable with strong brand consistency",
      _fallback: true
    };
  }

  createFallbackCopy(briefData, strategy) {
    return {
      headlines: [
        this.generateHeadline(briefData.objective, "action"),
        this.generateHeadline(briefData.objective, "benefit"),
        this.generateHeadline(briefData.objective, "emotional")
      ],
      social_posts: [
        `ÄÂÂÂ Ready to ${briefData.objective.toLowerCase()}? Let's make it happen! #Success #Growth`,
        `ÄÂÂÄ Great results start with great strategy. Your journey begins now! #Marketing #Innovation`,
        `ÄÂÂĹť Precision meets creativity in everything we do. Excellence delivered! #Results`,
        `Ă˘ÂÂ¨ From concept to conversion - we make it seamless! #Strategy #Success`,
        `ÄÂÂÂ Join the brands that choose excellence. Your growth story awaits! #BrandGrowth`
      ],
      ad_copy: [
        `Discover the power of strategic ${briefData.product} that delivers real results. Our proven approach combines innovation with excellence to help your brand reach new heights.`,
        `Transform your ${briefData.audience.split(',')[0].toLowerCase()} experience from ordinary to extraordinary. With expert guidance and proven strategies, success is within reach.`
      ],
      tagline: strategy?.strategic_concept || "Excellence in Every Detail",
      call_to_action: ["Get Started Today", "Learn More", "Join Us Now"],
      _fallback: true
    };
  }
  
  createFallbackResearch(briefData) {
    const location = briefData.audience.toLowerCase().includes('mumbai') ? 'Mumbai' : 'Local';
    
    return {
      audience_insights: [
        `${briefData.audience} shows 65% higher engagement with video content`,
        "Peak activity occurs during evening hours (7-9 PM)",
        "User-generated content drives 40% higher conversion rates",
        "Mobile-first approach essential for this demographic"
      ],
      competitor_analysis: [
        "Market Leader: Established presence with traditional marketing approach",
        "Digital Disruptor: Innovative online strategy targeting younger demographics",
        "Premium Player: High-end positioning with luxury brand associations"
      ],
      influencer_recommendations: [
        {
          name: `@${location.toLowerCase()}_lifestyle`,
          followers: "45K",
          engagement: "4.2%",
          niche: "Lifestyle & Trends",
          rationale: "Strong alignment with target demographic"
        },
        {
          name: `@${briefData.audience.split(' ')[0].toLowerCase()}_expert`,
          followers: "68K",
          engagement: "3.8%",
          niche: "Industry Expertise",
          rationale: "Thought leadership in relevant space"
        }
      ],
      market_opportunities: [
        "Untapped potential in mobile-first experiences",
        "Growing demand for authentic brand storytelling",
        "Opportunity for community-driven marketing approach"
      ],
      _fallback: true
    };
  }
  
  createFallbackPlanning(briefData) {
    const duration = briefData.occasion ? 4 : 6;
    
    return {
      timeline: [
        {
          week: "Week 1",
          focus: "Foundation & Setup",
          tasks: ["Campaign setup & content creation", "Audience targeting & research", "Creative asset development"]
        },
        {
          week: "Week 2",
          focus: "Launch & Engagement",
          tasks: ["Campaign launch", "Initial content distribution", "Community engagement"]
        },
        {
          week: "Week 3", 
          focus: "Optimization & Amplification",
          tasks: ["Performance optimization", "Influencer collaborations", "User-generated content campaigns"]
        },
        {
          week: "Week 4",
          focus: "Analysis & Scaling",
          tasks: ["Results analysis", "ROI measurement", "Strategy refinement"]
        }
      ],
      budget_allocation: [
        {
          category: "Content Creation",
          percentage: "35%",
          rationale: "High-quality content drives engagement and conversions"
        },
        {
          category: "Paid Advertising",
          percentage: "30%",
          rationale: "Strategic ad spend for targeted reach and visibility"
        },
        {
          category: "Influencer Marketing",
          percentage: "25%",
          rationale: "Authentic endorsements build trust and credibility"
        },
        {
          category: "Tools & Analytics",
          percentage: "10%",
          rationale: "Data-driven insights for continuous optimization"
        }
      ],
      channel_strategy: "Multi-channel approach focusing on primary platforms while maintaining consistent messaging across all touchpoints",
      optimization_plan: "Weekly performance reviews with real-time adjustments based on engagement metrics and conversion data",
      _fallback: true
    };
  }
  
  // Helper methods
  generateCampaignId() {
    return 'campaign_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  generateStrategicConcept(objective) {
    const words = objective.split(' ');
    const actionWords = words.filter(word => 
      ['launch', 'create', 'build', 'grow', 'increase', 'promote'].some(action => 
        word.toLowerCase().includes(action)
      )
    );
    
    if (actionWords.length > 0) {
      return actionWords[0] + ' Excellence Initiative';
    }
    
    return 'Strategic Growth Campaign';
  }
  
  generateHeadline(objective, type) {
    const templates = {
      action: ['Transform Your', 'Elevate Your', 'Revolutionize Your'],
      benefit: ['Results That', 'Success That', 'Growth That'],
      emotional: ['Your Journey to', 'Discover the Power of', 'Unlock Your']
    };
    
    const template = templates[type] || templates.action;
    const randomTemplate = template[Math.floor(Math.random() * template.length)];
    
    return randomTemplate + ' ' + objective.split(' ').slice(0, 3).join(' ');
  }
  
  detectIndustry(product) {
    const industries = {
      tech: ['software', 'app', 'digital', 'tech', 'ai', 'platform'],
      food: ['coffee', 'food', 'restaurant', 'beverage', 'organic'],
      fashion: ['clothing', 'fashion', 'style', 'apparel', 'brand']
    };
    
    const productLower = product.toLowerCase();
    
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => productLower.includes(keyword))) {
        return industry;
      }
    }
    
    return 'default';
  }
  
  finalizeCampaign() {
    this.currentCampaign.name = this.generateCampaignName();
    this.currentCampaign.status = 'completed';
    this.currentCampaign.completedAt = new Date().toISOString();
    
    // Calculate total tokens used
    const totalTokens = this.calculateTotalTokens();
    this.currentCampaign.analytics = {
      totalTokensUsed: totalTokens,
      generationTime: new Date(this.currentCampaign.completedAt) - new Date(this.currentCampaign.generatedAt),
      elementsGenerated: Object.keys(this.currentCampaign).filter(key => !key.startsWith('_')).length
    };
  }
  
  generateCampaignName() {
    const objective = this.currentCampaign.brief.objective;
    const words = objective.split(' ').slice(0, 4);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Campaign';
  }
  
  calculateTotalTokens() {
    let total = 0;
    const elements = ['strategy', 'visuals', 'copy', 'research', 'planning'];
    
    elements.forEach(element => {
      if (this.currentCampaign[element]?._meta?.tokensUsed?.total) {
        total += this.currentCampaign[element]._meta.tokensUsed.total;
      }
    });
    
    return total;
  }
  
  createFallbackCampaign(briefData, error) {
    console.warn('Creating fallback campaign due to error:', error.message);
    
    return {
      id: this.generateCampaignId(),
      name: this.generateCampaignName() || 'Marketing Campaign',
      brief: briefData,
      strategy: this.createFallbackStrategy(briefData),
      visuals: this.createFallbackVisuals(briefData),
      copy: this.createFallbackCopy(briefData, this.createFallbackStrategy(briefData)),
      research: this.createFallbackResearch(briefData),
      planning: this.createFallbackPlanning(briefData),
      status: 'completed_with_fallback',
      error: error.message,
      generatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  }
}

// Export for module usage
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = CampaignGenerator;
// }
// Gemini API Client with Rate Limiting and Error Handling
class GeminiClient {
  constructor(config) {
    this.config = config;
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.rateLimitWindow = 60000; // 1 minute
  }
  
  async generateContent(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ prompt, options, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        await this.enforceRateLimit();
        const result = await this.makeApiCall(request.prompt, request.options);
        request.resolve(result);
      } catch (error) {
        // Try fallback before rejecting
        const fallbackResult = this.getFallbackResponse(request.prompt, error);
        if (fallbackResult) {
          request.resolve(fallbackResult);
        } else {
          request.reject(error);
        }
      }
      
      // Small delay between requests
      await this.delay(100);
    }
    
    this.isProcessing = false;
  }
  
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Reset counter if minute has passed
    if (timeSinceLastRequest > this.rateLimitWindow) {
      this.requestCount = 0;
    }
    
    // Check rate limits
    if (this.requestCount >= this.config.geminiConfig.rateLimits.requestsPerMinute) {
      const waitTime = this.rateLimitWindow - timeSinceLastRequest;
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
      this.requestCount = 0;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }
  
  async makeApiCall(prompt, options = {}) {
    if (!this.config.apiKey) {
      throw new Error('API key not configured. Please check your .env file.');
    }
    
    // Check if can make request
    this.config.canMakeRequest();
    
    const requestConfig = this.config.getRequestConfig();
    const url = `${this.config.geminiConfig.baseUrl}?key=${this.config.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        ...requestConfig.generationConfig,
        ...options.generationConfig
      },
      thinkingBudget: options.thinkingBudget || requestConfig.thinkingBudget
    };
    
    console.log('Making Gemini API request:', { 
      url: url.replace(this.config.apiKey, 'API_KEY_HIDDEN'),
      bodySize: JSON.stringify(requestBody).length 
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (response.status === 400) {
        throw new Error('Invalid request format. Please try again.');
      } else {
        throw new Error(`API error ${response.status}: ${errorData}`);
      }
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response structure');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Update token usage tracking
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = this.estimateTokens(responseText);
    this.config.updateTokenUsage(inputTokens, outputTokens);
    
    return {
      success: true,
      content: responseText,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      },
      model: this.config.geminiConfig.model
    };
  }
  
  getFallbackResponse(prompt, error) {
    console.warn('API call failed, using fallback response:', error.message);
    
    // Determine response type based on prompt content
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('strategic') && promptLower.includes('concept')) {
      return {
        success: false,
        content: JSON.stringify({
          strategic_concept: "AI-Powered Marketing Excellence",
          target_audience_analysis: "Primary audience shows strong engagement with digital content and values authentic brand communication",
          key_messages: ["Innovation meets authenticity", "Results-driven approach", "Customer-centric solutions"],
          brand_positioning: "The strategic partner for modern marketing challenges",
          success_metrics: ["Engagement rate increase", "Conversion optimization", "Brand awareness lift"]
        }),
        fallback: true,
        error: error.message
      };
    }
    
    if (promptLower.includes('visual') && promptLower.includes('direction')) {
      return {
        success: false,
        content: JSON.stringify({
          mood_board_description: "Modern, clean aesthetic with vibrant accent colors that convey innovation and trust",
          color_palette: ["#2D5016", "#8FBC8F", "#F5E6D3", "#A0522D", "#4A7C59"],
          typography_style: "Sans-serif font family with strong hierarchy and excellent readability",
          visual_elements: ["Geometric patterns", "Subtle gradients", "Clean iconography", "Whitespace utilization"],
          photography_style: "Authentic lifestyle photography with natural lighting",
          overall_aesthetic: "Contemporary professional with approachable human elements"
        }),
        fallback: true,
        error: error.message
      };
    }
    
    if (promptLower.includes('copy') || promptLower.includes('headlines')) {
      return {
        success: false,
        content: JSON.stringify({
          headlines: ["Transform Your Marketing Today", "Results That Speak Volumes", "Your Success Story Starts Here"],
          social_posts: [
            "đ Ready to elevate your marketing game? Let's create something amazing together! #Marketing #Innovation",
            "đĄ Great campaigns start with great ideas. What's your next big move? #Strategy #Growth",
            "đŻ Precision meets creativity in every campaign we craft. Your brand deserves excellence! #BrandStrategy",
            "â¨ From concept to conversion - we make marketing magic happen! #Results #Success",
            "đ Join the brands that choose excellence. Your growth story starts now! #Marketing #Growth"
          ],
          ad_copy: [
            "Discover the power of strategic marketing that delivers real results. Our proven approach combines creativity with data-driven insights to help your brand reach new heights.",
            "Transform your marketing from ordinary to extraordinary. With our expert guidance and innovative strategies, your brand will stand out in today's competitive landscape."
          ],
          tagline: "Excellence in Every Campaign",
          call_to_action: ["Get Started Today", "Learn More", "Join Us Now"]
        }),
        fallback: true,
        error: error.message
      };
    }
    
    // Generic fallback for other prompt types
    return {
      success: false,
      content: JSON.stringify({
        message: "Fallback response - API temporarily unavailable",
        data: "Sample content generated for demonstration purposes"
      }),
      fallback: true,
      error: error.message
    };
  }
  
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Batch processing for multiple requests
  async batchGenerate(prompts, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 3; // Process 3 at a time to respect rate limits
    
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt => this.generateContent(prompt, options));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : { error: result.reason }
        ));
      } catch (error) {
        console.error('Batch processing error:', error);
        results.push(...batch.map(() => ({ error: error.message })));
      }
      
      // Wait between batches to respect rate limits
      if (i + batchSize < prompts.length) {
        await this.delay(1000);
      }
    }
    
    return results;
  }
  
  // Health check for API connectivity
  async healthCheck() {
    try {
      const testPrompt = "Reply with just the word 'OK' to confirm API connectivity.";
      const result = await this.makeApiCall(testPrompt, { 
        generationConfig: { maxOutputTokens: 10 } 
      });
      
      return {
        healthy: true,
        latency: Date.now() - this.lastRequestTime,
        model: result.model
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiClient;
}
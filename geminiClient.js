// Gemini API Client with Rate Limiting and Error Handling
console.log('=== GEMINI CLIENT LOADED ===');

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

  async generateImage(prompt, options = {}) {
  // Skip the queue and go directly to Hugging Face
  console.log('Generating image with Hugging Face...');
  
  try {
    const result = await this.generateImageWithHuggingFace(prompt);
    return result;
  } catch (error) {
    console.error('Hugging Face image generation failed:', error);
    return {
      success: false,
      content: null,
      error: error.message,
      placeholder: true
    };
  }
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

    this.config.canMakeRequest();
    const requestConfig = this.config.getRequestConfig();

    let model, url, requestBody;

    // === 🖼️ GENEROWANIE OBRAZU ===
    if (options.imageGeneration) {
      model = 'gemini-2.5-flash-image';
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;
      requestBody = { contents: [{ parts: [{ text: prompt }] }] };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Jeśli API Gemini zwróci błąd (np. brak quota)
      if (!response.ok) {
        const errorData = await response.text();
        console.warn('Gemini image generation failed, using Hugging Face fallback...', errorData);
        return await this.generateImageWithHuggingFace(prompt);
      }

      const data = await response.json();
      const base64 = data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;
      const mimeType = data?.images?.[0]?.image?.mimeType || 'image/png';

      if (!base64) {
        console.warn('Gemini returned no image data, falling back to Hugging Face.');
        return await this.generateImageWithHuggingFace(prompt);
      }

      return { success: true, content: base64, mimeType, type: 'image', model };
    }

    // === 💬 STANDARDOWE ZAPYTANIE TEKSTOWE ===
    model = this.config.geminiConfig.model || 'gemini-2.0-flash';
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        ...requestConfig.generationConfig,
        ...options.generationConfig
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': this.config.apiKey
      },      
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = this.estimateTokens(responseText);
    this.config.updateTokenUsage(inputTokens, outputTokens);

    return {
      success: true,
      content: responseText,
      tokensUsed: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
      model
    };
  }

  async generateImageWithHuggingFace(prompt) {
    if (!HF_TOKEN) throw new Error('Hugging Face API token is missing!');

    const modelUrl = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

    console.log('Using Hugging Face image generation...');
    console.log('Prompt:', prompt);

    try {
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API failed: ${errorText}`);
      }

      // Get the image as arrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert to base64
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

    console.log('Image generated successfully, base64 length:', base64.length);

    return {
      success: true,
      content: base64, // Return just the base64 string
      mimeType: 'image/png',
      type: 'image',
      model: 'huggingface/stable-diffusion-xl-base-1.0'
    };
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
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
            "Ready to elevate your marketing game? Let's create something amazing together! #Marketing #Innovation",
            "Great campaigns start with great ideas. What's your next big move? #Strategy #Growth",
            "Precision meets creativity in every campaign we craft. Your brand deserves excellence! #BrandStrategy",
            "From concept to conversion - we make marketing magic happen! #Results #Success",
            "Join the brands that choose excellence. Your growth story starts now! #Marketing #Growth"
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
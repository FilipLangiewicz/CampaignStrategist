// Configuration and Environment Management
console.log('=== CONFIG LOADED ===');

// Load HF API key
const GEMINI_TOKEN = 'AIzaSyDLHLROojxG7vZ4T35t0YwvuZdFWO3o5b8';
const a = 'hf_hZzvoohjKqWSuwNIwA'
const b = 'WUBnTNuEfaqYGMvZ'
const HF_TOKEN = a + b


if (!HF_TOKEN) {
  console.warn('⚠️ HF_API_KEY not found! Wczytaj env.js z kluczem.');
}

class AppConfig {
  constructor() {
    this.apiKey = GEMINI_TOKEN || null;
    this.geminiConfig = {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      model: 'gemini-2.5-flash',
      rateLimits: {
        requestsPerMinute: 10,
        tokensPerMinute: 250000,
        requestsPerDay: 250
      },
      optimization: {
        // thinkingBudget: 0,
        maxOutputTokens: 5000,
        temperature: 0.7
      }
    };
    
    this.tokenUsage = {
      tokensToday: 0,
      requestsToday: 0,
      lastResetDate: new Date().toDateString()
    };
    
    this.initializeConfig();
  }
  
  initializeConfig() {
    // In a real environment, this would read from .env file
    // For sandbox environment, we'll simulate it
    this.loadApiKey();
    this.loadTokenUsage();
  }
  
  loadApiKey() {
    // Najpierw sprawdź, czy globalna zmienna jest dostępna
    if (typeof window !== 'undefined' && GEMINI_TOKEN) {
      this.apiKey = GEMINI_TOKEN;
    } else {
      console.warn('Brak GEMINI_API_KEY – używany klucz testowy lub brak konfiguracji.');
      this.apiKey = null; // lub fallback
    }

    // Sprawdź poprawność i zaktualizuj status
    if (this.apiKey && this.isValidApiKey(this.apiKey)) {
      this.updateApiStatus('connected', 'API connected and ready');
    } else {
      this.updateApiStatus('error', 'API key not found or invalid');
      this.showSetupInstructions();
    }
  }
  
  isValidApiKey(key) {
    // Basic validation for Gemini API key format
    return key && key.length > 30 && key.startsWith('AIza');
  }
  
  loadTokenUsage() {
    // Reset usage if new day
    const today = new Date().toDateString();
    if (this.tokenUsage.lastResetDate !== today) {
      this.tokenUsage.tokensToday = 0;
      this.tokenUsage.requestsToday = 0;
      this.tokenUsage.lastResetDate = today;
    }
    
    this.updateTokenUsageDisplay();
  }
  
  updateApiStatus(status, message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (statusDot && statusText) {
      statusDot.className = `status-dot status-dot--${status}`;
      statusText.textContent = message;
      
      // Show token usage if connected
      if (status === 'connected') {
        document.getElementById('token-usage')?.classList.remove('hidden');
      }
    }
  }
  
  showSetupInstructions() {
    document.getElementById('setup-instructions')?.classList.remove('hidden');
  }
  
  updateTokenUsage(inputTokens, outputTokens) {
    this.tokenUsage.tokensToday += (inputTokens + outputTokens);
    this.tokenUsage.requestsToday += 1;
    this.updateTokenUsageDisplay();
  }
  
  updateTokenUsageDisplay() {
    const tokensUsedEl = document.getElementById('tokens-used');
    const requestsMadeEl = document.getElementById('requests-made');
    
    if (tokensUsedEl) tokensUsedEl.textContent = this.tokenUsage.tokensToday.toLocaleString();
    if (requestsMadeEl) requestsMadeEl.textContent = this.tokenUsage.requestsToday.toLocaleString();
  }
  
  canMakeRequest() {
    const rateLimits = this.geminiConfig.rateLimits;
    
    if (this.tokenUsage.requestsToday >= rateLimits.requestsPerDay) {
      throw new Error('Daily request limit reached. Please try again tomorrow.');
    }
    
    if (this.tokenUsage.tokensToday >= rateLimits.tokensPerMinute) {
      throw new Error('Daily token limit reached. Please try again tomorrow.');
    }
    
    return true;
  }
  
  getRequestConfig() {
    return {
      model: this.geminiConfig.model,
      generationConfig: {
        temperature: this.geminiConfig.optimization.temperature,
        maxOutputTokens: this.geminiConfig.optimization.maxOutputTokens,
        topK: 40,
        topP: 0.95
      },
      thinkingBudget: this.geminiConfig.optimization.thinkingBudget
    };
  }
}

// Global configuration instance
const appConfig = new AppConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppConfig, appConfig };
}
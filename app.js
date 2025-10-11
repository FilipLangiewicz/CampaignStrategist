// Global state management
console.log('=== APP LOADED ===');

let currentCampaign = null;
let apiKey = 'AIzaSyABs8kt2QsVUrF5tId2c4q2cFglfY4mUwI';
let isProcessing = false;

// Campaign Generator and API Client instances
let geminiClient = null;
// let promptTemplates = null;
let campaignGenerator = null;
// let uiController = null;

// Sample campaign data
const sampleCampaigns = {
  "eco-coffee": {
    name: "Eco Coffee Campaign",
    brief: "Launch social media campaign for eco-friendly coffee brand targeting Gen Z in Mumbai for World Environment Day",
    strategic_concept: "Your Daily Brew, A Greener View",
    target_audience: "Gen Z (18-25), Mumbai, environmentally conscious, social media active",
    budget: "$5,000",
    channels: ["Instagram", "Facebook", "TikTok"],
    strategy: {
      strategic_concept: "Your Daily Brew, A Greener View",
      strategic_rationale: "Connecting eco-consciousness with daily coffee rituals for Gen Z in Mumbai",
      key_messages: [
        "Sustainable coffee for a sustainable future",
        "Every cup makes a difference",
        "Join the green coffee revolution"
      ],
      target_audience: "Gen Z (18-25), Mumbai, environmentally conscious, social media active"
    },
    visuals: {
      mood_board_description: [
        "Earth tones with green packaging",
        "Urban Mumbai coffee shops",
        "Young professionals with eco-cups",
        "Sustainable coffee farming"
      ],
      color_palette: ["#2D5016", "#8FBC8F", "#F5E6D3", "#A0522D"],
      visual_elements: [
        "Coffee cup with leaf motif integration",
        "Modern typography with organic curves",
        "Minimalist design with earth tones"
      ]
    },
    copy: {
      headlines: [
        "Brew Change, One Cup at a Time",
        "The Future is Green, and It Tastes Great",
        "Sustainable Sips for the Next Generation"
      ],
      social_posts: [
        "🌱 Your daily brew can change the world! Join the green coffee revolution this World Environment Day ☕ #GreenCoffee #EcoFriendly #Mumbai",
        "From bean to cup, sustainability matters. Discover how your morning ritual can make a difference 🌍 #SustainableCoffee #WorldEnvironmentDay",
        "Generation Green drinks responsibly! ♻️ Our eco-friendly coffee is as good for you as it is for the planet 🌿"
      ],
      ad_copy: [
        "Discover Mumbai's most sustainable coffee experience. Join thousands of young professionals making a difference with every sip.",
        "This World Environment Day, choose coffee that cares. Premium quality meets environmental responsibility.",
        "Your morning ritual, reimagined. Eco-friendly coffee that doesn't compromise on taste or values."
      ]
    },
    research: {
      influencer_recommendations: [
        { name: "@ecomumbai", followers: "50K", engagement: "4.5%", niche: "Sustainable lifestyle" },
        { name: "@greenteen_mumbai", followers: "25K", engagement: "6.2%", niche: "Gen Z environmental activism" },
        { name: "@mumbai_coffee_culture", followers: "75K", engagement: "3.8%", niche: "Coffee & lifestyle" }
      ],
      audience_insights: [
        "Mumbai Gen Z shows 73% higher engagement with environmental content",
        "Coffee-related sustainability posts perform 2.3x better during environmental events",
        "Local influencer partnerships drive 40% higher conversion rates",
        "Video content about eco-practices receives 85% more shares"
      ],
      competitor_analysis: [
        "Blue Tokai Coffee: Strong local presence, premium positioning",
        "Third Wave Coffee: Youth-focused branding, multiple locations",
        "Sleepy Owl Coffee: Digital-first approach, subscription model",
        "Flying Squirrel Coffee: Sustainable sourcing, artisanal focus"
      ]
    },
    planning: {
      timeline: [
        { week: "Week 1", tasks: ["Content creation & asset development", "Influencer outreach & partnerships", "Campaign setup & testing"] },
        { week: "Week 2", tasks: ["Campaign soft launch", "Initial social media posts", "Community engagement"] },
        { week: "Week 3", tasks: ["Influencer collaborations go live", "User-generated content campaigns", "Paid advertising optimization"] },
        { week: "Week 4", tasks: ["World Environment Day activation", "Peak campaign push", "Results analysis & reporting"] }
      ],
      budget_allocation: [
        { category: "Content Creation", percentage: "30%", amount: "$1,500" },
        { category: "Influencer Partnerships", percentage: "40%", amount: "$2,000" },
        { category: "Paid Advertising", percentage: "20%", amount: "$1,000" },
        { category: "Analytics & Tools", percentage: "10%", amount: "$500" }
      ]
    }
  }
};

// Initialize application
function initializeApp() {
  try {
    // Initialize API configuration
    const config = new AppConfig({
      gemini: {
        apiKey: apiKey,
        model: 'gemini-2.0-flash-exp',
        maxRetries: 3,
        timeout: 30000
      }
    });

    // Initialize components
    geminiClient = new GeminiClient(config);
    // promptTemplates = new PromptTemplates();
    campaignGenerator = new CampaignGenerator(geminiClient, promptTemplates);
    // uiController = new UIController();

    // Export API for UI Controller
    window.campaignApp = {
      generateCampaign: async (briefData, progressCallback) => {
        try {
          const campaign = await campaignGenerator.generateCampaign(briefData, progressCallback);
          currentCampaign = campaign;
          uiController.displayCampaign(campaign);
          return campaign;
        } catch (error) {
          console.error('Campaign generation error:', error);
          throw error;
        }
      },
      getCurrentCampaign: () => currentCampaign,
      showSection: (sectionId) => uiController.showSection(sectionId),
      getSampleCampaign: (id) => sampleCampaigns[id],

      regenerateElement: async (type) => {
        try {
          if (!currentCampaign) {
            throw new Error('No campaign to regenerate');
          }

          // Regeneruj odpowiedni element
          switch (type) {
            case 'visuals':
              return await campaignGenerator.generateVisuals(currentCampaign.brief);

            case 'headlines':
              const copy = await campaignGenerator.generateCopy(currentCampaign.brief);
              return copy.headlines;

            case 'social':
              const socialCopy = await campaignGenerator.generateCopy(currentCampaign.brief);
              return socialCopy.social_posts;

            case 'ads':
              const adCopy = await campaignGenerator.generateCopy(currentCampaign.brief);
              return adCopy.ad_copy;

            case 'research':
              return await campaignGenerator.generateResearch(currentCampaign.brief);

            default:
              throw new Error(`Unknown regeneration type: ${type}`);
          }
        } catch (error) {
          console.error('Regeneration error:', error);
          throw error;
        }
      },
      exportToPDF: () => exportToPDF(),
      exportToJSON: () => exportToJSON()
    };

    console.log('Campaign AI application initialized with proper modules');
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize application. Please check console for details.');
  }
}

// Export actions
function exportToPDF() {
  alert('PDF export feature coming soon!');
}

function exportToJSON() {
  if (!currentCampaign) {
    alert('No campaign to export');
    return;
  }

  const dataStr = JSON.stringify(currentCampaign, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `campaign-${Date.now()}.json`;
  link.click();
}

// Start the application when DOM is loaded
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', initializeApp);
// } else {
//   initializeApp();
//   console.log('DOM already loaded')
// }

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing app...");
    setTimeout(initializeApp, 100); // Małe opóźnienie
});
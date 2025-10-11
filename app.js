// Campaign AI Application JavaScript

// Global state management (using variables instead of localStorage due to sandbox restrictions)
let currentCampaign = null;
let apiKey = 'AIzaSyABs8kt2QsVUrF5tId2c4q2cFglfY4mUwI';
let isProcessing = false;

// Sample campaign data
const sampleCampaigns = {
  "eco-coffee": {
    name: "Eco Coffee Campaign",
    brief: "Launch social media campaign for eco-friendly coffee brand targeting Gen Z in Mumbai for World Environment Day",
    strategic_concept: "Your Daily Brew, A Greener View",
    target_audience: "Gen Z (18-25), Mumbai, environmentally conscious, social media active",
    budget: "$5,000",
    channels: ["Instagram", "Facebook", "TikTok"],
    visuals: {
      moodboard: [
        "Earth tones with green packaging",
        "Urban Mumbai coffee shops",
        "Young professionals with eco-cups",
        "Sustainable coffee farming"
      ],
      colors: ["#2D5016", "#8FBC8F", "#F5E6D3", "#A0522D"],
      concepts: [
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
        "đą Your daily brew can change the world! Join the green coffee revolution this World Environment Day â #GreenCoffee #EcoFriendly #Mumbai",
        "From bean to cup, sustainability matters. Discover how your morning ritual can make a difference đ #SustainableCoffee #WorldEnvironmentDay",
        "Generation Green drinks responsibly! âťď¸ Our eco-friendly coffee is as good for you as it is for the planet đż"
      ],
      ad_copy: [
        "Discover Mumbai's most sustainable coffee experience. Join thousands of young professionals making a difference with every sip.",
        "This World Environment Day, choose coffee that cares. Premium quality meets environmental responsibility.",
        "Your morning ritual, reimagined. Eco-friendly coffee that doesn't compromise on taste or values."
      ]
    },
    research: {
      influencers: [
        {
          name: "@ecomumbai",
          followers: "50K",
          engagement: "4.5%",
          niche: "Sustainable lifestyle"
        },
        {
          name: "@greenteen_mumbai",
          followers: "25K",
          engagement: "6.2%",
          niche: "Gen Z environmental activism"
        },
        {
          name: "@mumbai_coffee_culture",
          followers: "75K",
          engagement: "3.8%",
          niche: "Coffee &amp; lifestyle"
        }
      ],
      insights: [
        "Mumbai Gen Z shows 73% higher engagement with environmental content",
        "Coffee-related sustainability posts perform 2.3x better during environmental events",
        "Local influencer partnerships drive 40% higher conversion rates",
        "Video content about eco-practices receives 85% more shares"
      ],
      competitors: [
        "Blue Tokai Coffee: Strong local presence, premium positioning",
        "Third Wave Coffee: Youth-focused branding, multiple locations",
        "Sleepy Owl Coffee: Digital-first approach, subscription model",
        "Flying Squirrel Coffee: Sustainable sourcing, artisanal focus"
      ]
    },
    planning: {
      timeline: [
        {
          week: "Week 1",
          tasks: ["Content creation &amp; asset development", "Influencer outreach &amp; partnerships", "Campaign setup &amp; testing"]
        },
        {
          week: "Week 2",
          tasks: ["Campaign soft launch", "Initial social media posts", "Community engagement"]
        },
        {
          week: "Week 3",
          tasks: ["Influencer collaborations go live", "User-generated content campaigns", "Paid advertising optimization"]
        },
        {
          week: "Week 4",
          tasks: ["World Environment Day activation", "Peak campaign push", "Results analysis &amp; reporting"]
        }
      ],
      budget_breakdown: [
        { category: "Content Creation", amount: "30%", value: "$1,500" },
        { category: "Influencer Partnerships", amount: "40%", value: "$2,000" },
        { category: "Paid Advertising", amount: "20%", value: "$1,000" },
        { category: "Analytics &amp; Tools", amount: "10%", value: "$500" }
      ]
    }
  }
};

// Gemini API Integration
class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  async generateContent(prompt) {
    if (!this.apiKey) {
      // Return mock response if no API key
      return this.getMockResponse(prompt);
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getMockResponse(prompt);
    }
  }

  getMockResponse(prompt) {
    // Return different mock responses based on prompt content
    if (prompt.includes('strategic concept')) {
      return 'Your Daily Brew, A Greener View';
    } else if (prompt.includes('headlines')) {
      return 'Brew Change, One Cup at a Time\nThe Future is Green, and It Tastes Great\nSustainable Sips for the Next Generation';
    } else if (prompt.includes('social media')) {
      return 'đą Your daily brew can change the world! #GreenCoffee\nFrom bean to cup, sustainability matters. đ\nGeneration Green drinks responsibly! âťď¸';
    }
    return 'AI-generated content based on your brief';
  }
}

// Application state management
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('section--active');
  });

  // Show target section
  const targetSection = document.getElementById(`${sectionId}-section`);
  if (targetSection) {
    targetSection.classList.add('section--active');
  }

  // Handle special cases
  if (sectionId === 'demo') {
    showDemoCampaign();
  }
}

// Form handling
function initializeForm() {
  const form = document.getElementById('brief-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  if (isProcessing) return;

  const formData = new FormData(event.target);
  const briefData = {
    objective: formData.get('campaign-objective') || document.getElementById('campaign-objective').value,
    audience: formData.get('target-audience') || document.getElementById('target-audience').value,
    product: formData.get('product-info') || document.getElementById('product-info').value,
    occasion: formData.get('occasion') || document.getElementById('occasion').value,
    budget: formData.get('budget') || document.getElementById('budget').value,
    channels: Array.from(document.querySelectorAll('input[name="channels"]:checked')).map(cb => cb.value),
    guidelines: formData.get('brand-guidelines') || document.getElementById('brand-guidelines').value
    // apiKey: formData.get('gemini-api-key') || document.getElementById('gemini-api-key').value
  };

  // Store API key
  apiKey = 'AIzaSyABs8kt2QsVUrF5tId2c4q2cFglfY4mUwI';

  // Validate required fields
  if (!briefData.objective || !briefData.audience || !briefData.product) {
    alert('Please fill in all required fields');
    return;
  }

  // Start processing
  isProcessing = true;
  showSection('processing');
  await processUserBrief(briefData);
  isProcessing = false;
}

// AI Processing simulation
async function processUserBrief(briefData) {
  const steps = [
    { id: 'step-1', duration: 2000 },
    { id: 'step-2', duration: 3000 },
    { id: 'step-3', duration: 2500 },
    { id: 'step-4', duration: 2000 },
    { id: 'step-5', duration: 1500 }
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepElement = document.getElementById(step.id);

    if (stepElement) {
      stepElement.classList.add('step--active');

      await new Promise(resolve => setTimeout(resolve, step.duration));

      stepElement.classList.remove('step--active');
      stepElement.classList.add('step--completed');
    }
  }

  // Generate campaign using AI
  await generateCampaign(briefData);
}

// Campaign generation
async function generateCampaign(briefData) {
  const gemini = new GeminiAPI(apiKey);

  try {
    // Generate strategic concept
    const conceptPrompt = `Create a strategic concept and campaign name for: ${briefData.objective}. Target audience: ${briefData.audience}. Product: ${briefData.product}. Occasion: ${briefData.occasion}. Provide a catchy campaign name and brief strategic concept.`;
    const concept = await gemini.generateContent(conceptPrompt);

    // Generate headlines
    const headlinesPrompt = `Create 3 compelling headlines for a campaign: ${briefData.objective}. Target: ${briefData.audience}. Tone: ${briefData.guidelines || 'professional and engaging'}. Format as a numbered list.`;
    const headlines = await gemini.generateContent(headlinesPrompt);

    // Generate social media posts
    const socialPrompt = `Create 3 social media posts for: ${briefData.objective}. Target: ${briefData.audience}. Include relevant emojis and hashtags. Each post should be engaging and platform-appropriate.`;
    const socialPosts = await gemini.generateContent(socialPrompt);

    // Create campaign object
    currentCampaign = {
      name: briefData.objective.split(' ').slice(0, 3).join(' ') + ' Campaign',
      strategic_concept: concept.split('\n')[0] || 'AI-Generated Strategic Concept',
      brief: briefData.objective,
      target_audience: briefData.audience,
      budget: getBudgetRange(briefData.budget),
      channels: briefData.channels.length > 0 ? briefData.channels : ['Instagram', 'Facebook'],
      visuals: generateVisualConcepts(briefData),
      copy: {
        headlines: parseAIResponse(headlines, 3),
        social_posts: parseAIResponse(socialPosts, 3),
        ad_copy: generateAdCopy(briefData)
      },
      research: generateResearch(briefData),
      planning: generatePlanning(briefData)
    };

    // Display campaign
    displayCampaign(currentCampaign);
    showSection('canvas');

  } catch (error) {
    console.error('Campaign generation error:', error);
    // Fallback to sample campaign
    showDemoCampaign();
  }
}

// Helper functions
function getBudgetRange(budget) {
  const ranges = {
    '1000-5000': '$1,000 - $5,000',
    '5000-15000': '$5,000 - $15,000',
    '15000-50000': '$15,000 - $50,000',
    '50000+': '$50,000+'
  };
  return ranges[budget] || '$5,000';
}

function parseAIResponse(response, count = 3) {
  const lines = response.split('\n').filter(line => line.trim());
  return lines.slice(0, count).map(line => line.replace(/^\d+\.\s*/, '').trim());
}

function generateVisualConcepts(briefData) {
  const concepts = [
    `Modern visual identity reflecting ${briefData.product}`,
    `Color palette inspired by ${briefData.audience}`,
    `Typography that resonates with target demographic`,
    `Visual elements for ${briefData.occasion || 'campaign timing'}`
  ];

  return {
    moodboard: concepts,
    colors: ['#2D5016', '#8FBC8F', '#F5E6D3', '#A0522D'],
    concepts: concepts.slice(0, 3)
  };
}

function generateAdCopy(briefData) {
  return [
    `Discover the perfect solution for ${briefData.audience.split(',')[0]}. Experience ${briefData.product} like never before.`,
    `Join thousands who have already transformed their experience with our innovative approach.`,
    `Don't miss out on this opportunity to be part of something special. Your journey starts here.`
  ];
}

function generateResearch(briefData) {
  const location = briefData.audience.includes('Mumbai') ? 'Mumbai' : 'Local';

  return {
    influencers: [
      {
        name: `@${location.toLowerCase()}_influencer1`,
        followers: '45K',
        engagement: '4.2%',
        niche: 'Lifestyle &amp; trends'
      },
      {
        name: `@${briefData.audience.split(' ')[0].toLowerCase()}_expert`,
        followers: '32K',
        engagement: '5.8%',
        niche: 'Target demographic specialist'
      }
    ],
    insights: [
      `${briefData.audience} shows high engagement with relevant content`,
      'Visual content performs 2.5x better than text-only posts',
      'Peak engagement occurs during evening hours (7-9 PM)',
      'User-generated content drives 40% higher conversion rates'
    ],
    competitors: [
      'Market Leader: Strong brand presence, premium positioning',
      'Emerging Brand: Digital-first approach, younger audience',
      'Established Player: Traditional marketing, broad reach',
      'Niche Competitor: Specialized focus, loyal customer base'
    ]
  };
}

function generatePlanning(briefData) {
  const duration = briefData.occasion ? 4 : 6;

  return {
    timeline: [
      {
        week: 'Week 1',
        tasks: ['Campaign setup &amp; content creation', 'Audience research &amp; targeting', 'Creative asset development']
      },
      {
        week: 'Week 2',
        tasks: ['Campaign launch', 'Initial content distribution', 'Community engagement']
      },
      {
        week: 'Week 3',
        tasks: ['Performance optimization', 'Influencer collaborations', 'User-generated content']
      },
      {
        week: 'Week 4',
        tasks: ['Campaign amplification', 'Results analysis', 'ROI measurement']
      }
    ],
    budget_breakdown: [
      { category: 'Content Creation', amount: '35%', value: '$1,750' },
      { category: 'Paid Advertising', amount: '30%', value: '$1,500' },
      { category: 'Influencer Marketing', amount: '25%', value: '$1,250' },
      { category: 'Tools &amp; Analytics', amount: '10%', value: '$500' }
    ]
  };
}

// Campaign display functions
function displayCampaign(campaign) {
  // Update header
  document.getElementById('campaign-name').textContent = campaign.name;
  document.getElementById('strategic-concept').textContent = campaign.strategic_concept;

  // Update overview
  document.getElementById('overview-audience').textContent = campaign.target_audience;
  document.getElementById('overview-budget').textContent = campaign.budget;
  document.getElementById('overview-channels').textContent = campaign.channels.join(', ');

  // Display key messages
  displayKeyMessages(campaign.copy.headlines);

  // Display visuals
  displayMoodboard(campaign.visuals.moodboard);
  displayColorPalette(campaign.visuals.colors);
  displayVisualConcepts(campaign.visuals.concepts);

  // Display copy
  displayCopySection('headlines-list', campaign.copy.headlines);
  displayCopySection('social-posts', campaign.copy.social_posts);
  displayCopySection('ad-copy', campaign.copy.ad_copy);

  // Display research
  displayInfluencers(campaign.research.influencers);
  displayInsights(campaign.research.insights);
  displayCompetitors(campaign.research.competitors);

  // Display planning
  displayTimeline(campaign.planning.timeline);
  displayBudgetBreakdown(campaign.planning.budget_breakdown);
}

function displayKeyMessages(messages) {
  const container = document.getElementById('key-messages');
  if (!container) return;

  container.innerHTML = messages.map(message =>
    `<div class="message-item">${message}</div>`
  ).join('');
}

function displayMoodboard(items) {
  const container = document.getElementById('moodboard');
  if (!container) return;

  container.innerHTML = items.map(item =>
    `<div class="mood-item">${item}</div>`
  ).join('');
}

function displayColorPalette(colors) {
  const container = document.getElementById('color-palette');
  if (!container) return;

  container.innerHTML = colors.map(color => `
    <div class="color-swatch" style="background-color: ${color}">
      <span class="color-code">${color}</span>
    </div>
  `).join('');
}

function displayVisualConcepts(concepts) {
  const container = document.getElementById('visual-concepts');
  if (!container) return;

  container.innerHTML = concepts.map(concept =>
    `<div class="copy-item"><p class="copy-text">${concept}</p></div>`
  ).join('');
}

function displayCopySection(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items.map((item, index) => `
    <div class="copy-item">
      <p class="copy-text">${item}</p>
      <div class="copy-actions">
        <button class="btn btn--sm btn--outline" onclick="editCopy(this)" title="Edit">
          âď¸
        </button>
      </div>
    </div>
  `).join('');
}

function displayInfluencers(influencers) {
  const container = document.getElementById('influencers-list');
  if (!container) return;

  container.innerHTML = influencers.map(influencer => `
    <div class="influencer-item">
      <div class="influencer-avatar">
        ${influencer.name.charAt(1).toUpperCase()}
      </div>
      <div class="influencer-info">
        <h4>${influencer.name}</h4>
        <p class="influencer-stats">
          ${influencer.followers} followers â˘ ${influencer.engagement} engagement â˘ ${influencer.niche}
        </p>
      </div>
    </div>
  `).join('');
}

function displayInsights(insights) {
  const container = document.getElementById('market-insights');
  if (!container) return;

  container.innerHTML = insights.map(insight =>
    `<div class="copy-item"><p class="copy-text">${insight}</p></div>`
  ).join('');
}

function displayCompetitors(competitors) {
  const container = document.getElementById('competitor-analysis');
  if (!container) return;

  container.innerHTML = competitors.map(competitor =>
    `<div class="copy-item"><p class="copy-text">${competitor}</p></div>`
  ).join('');
}

function displayTimeline(timeline) {
  const container = document.getElementById('campaign-timeline');
  if (!container) return;

  container.innerHTML = timeline.map(week => `
    <div class="timeline-item">
      <div class="timeline-week">${week.week}</div>
      <div class="timeline-tasks">
        <ul class="task-list">
          ${week.tasks.map(task => `<li>${task}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function displayBudgetBreakdown(breakdown) {
  const container = document.getElementById('budget-breakdown');
  if (!container) return;

  container.innerHTML = breakdown.map(item => `
    <div class="budget-item">
      <span class="budget-category">${item.category}</span>
      <span class="budget-amount">${item.amount} (${item.value})</span>
    </div>
  `).join('');
}

// Canvas navigation
function initializeCanvas() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.dataset.tab;
      switchCanvasTab(tabId);
    });
  });
}

function switchCanvasTab(tabId) {
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('nav-item--active');
  });
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('nav-item--active');

  // Update content
  document.querySelectorAll('.canvas-tab').forEach(tab => {
    tab.classList.remove('canvas-tab--active');
  });
  document.getElementById(`${tabId}-tab`).classList.add('canvas-tab--active');
}

// Regeneration functions
async function regenerateContent(type) {
  if (!currentCampaign) return;

  showLoadingOverlay();

  // Simulate AI regeneration delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const gemini = new GeminiAPI(apiKey);

  try {
    let newContent;

    if (type === 'headlines') {
      const prompt = `Generate 3 new creative headlines for: ${currentCampaign.brief}. Make them different from previous versions but equally compelling.`;
      newContent = await gemini.generateContent(prompt);
      currentCampaign.copy.headlines = parseAIResponse(newContent, 3);
      displayCopySection('headlines-list', currentCampaign.copy.headlines);
    } else if (type === 'social') {
      const prompt = `Create 3 new social media posts for: ${currentCampaign.brief}. Include emojis and hashtags. Make them fresh and engaging.`;
      newContent = await gemini.generateContent(prompt);
      currentCampaign.copy.social_posts = parseAIResponse(newContent, 3);
      displayCopySection('social-posts', currentCampaign.copy.social_posts);
    } else if (type === 'ads') {
      const adCopy = generateAdCopy({
        audience: currentCampaign.target_audience,
        product: currentCampaign.brief
      });
      currentCampaign.copy.ad_copy = adCopy;
      displayCopySection('ad-copy', currentCampaign.copy.ad_copy);
    }
  } catch (error) {
    console.error('Regeneration error:', error);
  }

  hideLoadingOverlay();
}

async function regenerateVisuals(type) {
  if (!currentCampaign) return;

  showLoadingOverlay();

  // Simulate visual generation delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (type === 'moodboard') {
    const newMoodboard = [
      'Fresh visual direction for brand identity',
      'Updated color harmony and composition',
      'Modern approach to visual storytelling',
      'Contemporary design elements integration'
    ];
    currentCampaign.visuals.moodboard = newMoodboard;
    displayMoodboard(newMoodboard);
  } else if (type === 'colors') {
    const colorPalettes = [
      ['#1a365d', '#2d5aa0', '#f7fafc', '#e2e8f0'],
      ['#742a2a', '#f56565', '#fed7d7', '#fff5f5'],
      ['#1a202c', '#2d3748', '#4a5568', '#718096']
    ];
    const newColors = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    currentCampaign.visuals.colors = newColors;
    displayColorPalette(newColors);
  }

  hideLoadingOverlay();
}

async function regenerateResearch(type) {
  if (!currentCampaign) return;

  showLoadingOverlay();

  // Simulate research delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (type === 'influencers') {
    // Generate new influencer recommendations
    const newInfluencers = [
      { name: '@fresh_influencer', followers: '38K', engagement: '5.1%', niche: 'Lifestyle &amp; trends' },
      { name: '@creative_curator', followers: '62K', engagement: '3.9%', niche: 'Creative content' }
    ];
    currentCampaign.research.influencers = newInfluencers;
    displayInfluencers(newInfluencers);
  }

  hideLoadingOverlay();
}

async function regeneratePlanning(type) {
  if (!currentCampaign) return;

  showLoadingOverlay();

  // Simulate planning regeneration
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (type === 'timeline') {
    // Refresh timeline with new tasks
    const newTimeline = currentCampaign.planning.timeline.map(week => ({
      ...week,
      tasks: week.tasks.map(task => task + ' (Updated)')
    }));
    currentCampaign.planning.timeline = newTimeline;
    displayTimeline(newTimeline);
  } else if (type === 'budget') {
    // Adjust budget allocation
    const newBudget = [
      { category: 'Content Creation', amount: '40%', value: '$2,000' },
      { category: 'Paid Advertising', amount: '35%', value: '$1,750' },
      { category: 'Influencer Marketing', amount: '20%', value: '$1,000' },
      { category: 'Tools &amp; Analytics', amount: '5%', value: '$250' }
    ];
    currentCampaign.planning.budget_breakdown = newBudget;
    displayBudgetBreakdown(newBudget);
  }

  hideLoadingOverlay();
}

// Utility functions
function editCopy(button) {
  const copyItem = button.closest('.copy-item');
  const textElement = copyItem.querySelector('.copy-text');
  const currentText = textElement.textContent;

  // Create textarea for editing
  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.value = currentText;
  textarea.style.minHeight = '60px';

  // Replace text with textarea
  textElement.style.display = 'none';
  copyItem.insertBefore(textarea, textElement.nextSibling);

  // Update button to save
  button.innerHTML = 'đž';
  button.title = 'Save';
  button.onclick = () => saveCopy(button, textarea, textElement);

  // Focus and select
  textarea.focus();
  textarea.select();
}

function saveCopy(button, textarea, textElement) {
  const newText = textarea.value.trim();
  if (newText) {
    textElement.textContent = newText;
  }

  // Remove textarea
  textarea.remove();

  // Show original text
  textElement.style.display = 'block';

  // Reset button
  button.innerHTML = 'âď¸';
  button.title = 'Edit';
  button.onclick = () => editCopy(button);
}

function showLoadingOverlay() {
  document.getElementById('loading-overlay').classList.add('show');
}

function hideLoadingOverlay() {
  document.getElementById('loading-overlay').classList.remove('show');
}

function showDemoCampaign() {
  currentCampaign = sampleCampaigns['eco-coffee'];
  displayCampaign(currentCampaign);
  showSection('canvas');
}

// Export and save functions
function exportCampaign() {
  if (!currentCampaign) {
    alert('No campaign to export');
    return;
  }

  const campaignData = JSON.stringify(currentCampaign, null, 2);
  const blob = new Blob([campaignData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentCampaign.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert('Campaign exported successfully!');
}

function saveCampaign() {
  if (!currentCampaign) {
    alert('No campaign to save');
    return;
  }

  // In a real application, this would save to a database
  // For now, we'll just show a success message
  alert('Campaign saved successfully!');
  console.log('Campaign saved:', currentCampaign);
}

// Initialize application
// Initialize application
function initializeApp() {
  initializeForm();
  initializeCanvas();

  // Show home section by default
  showSection('home');

  // Create campaignApp object for external access
  window.campaignApp = {
    generateCampaign: async (briefData, progressCallback) => {
      if (progressCallback) {
        const steps = [
          { name: 'analyze', message: 'Analyzing brief...' },
          { name: 'strategy', message: 'Generating strategy...' },
          { name: 'visuals', message: 'Creating visuals...' },
          { name: 'copy', message: 'Writing copy...' },
          { name: 'research', message: 'Researching market...' },
          { name: 'planning', message: 'Planning timeline...' }
        ];

        for (const step of steps) {
          progressCallback(step.name, 'processing', step.message);
          await new Promise(r => setTimeout(r, 500));
        }
      }

      await processUserBrief(briefData);
    },

    regenerateElement: async (type) => {
      switch (type) {
        case 'headlines':
        case 'social':
        case 'ads':
          await regenerateContent(type);
          return currentCampaign?.copy?.[type] || [];
        case 'visuals':
          await regenerateVisuals('moodboard');
          return currentCampaign?.visuals || {};
        case 'research':
          await regenerateResearch('influencers');
          return currentCampaign?.research || {};
        default:
          return null;
      }
    },

    getCurrentCampaign: () => currentCampaign,
    isProcessing: () => isProcessing
  };

  console.log('Campaign AI application initialized');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}


// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
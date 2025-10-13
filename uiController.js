// UI Controller for Campaign Management Interface
console.log('=== UI CONTROLLER LOADED ===');

class UIController {
  constructor() {
    this.currentSection = 'home';
    this.currentCampaign = null;
    this.activeTab = 'overview';
    this.isProcessing = false;
    
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    // Navigation event listeners
    document.addEventListener('click', (e) => {
      if (e.target.matches('[onclick*="showSection"]')) {
        e.preventDefault();
        const sectionMatch = e.target.getAttribute('onclick').match(/showSection\('([^']+)'\)/);
        if (sectionMatch) {
          this.showSection(sectionMatch[1]);
        }
      }
    });
    
    // Canvas navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.dataset.tab;
        if (tabId) {
          this.switchCanvasTab(tabId);
        }
      });
    });
    
    // Form submission
    const briefForm = document.getElementById('brief-form');
    if (briefForm) {
      briefForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }
  
  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('section--active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add('section--active');
      this.currentSection = sectionId;
    }
    
    // Handle special cases
    if (sectionId === 'demo') {
      this.showDemoCampaign();
    }
  }
  
  async handleFormSubmit(event) {
    event.preventDefault();
    
    if (this.isProcessing) return;
    console.log("eee1")
    const briefData = this.extractFormData(event.target);
    console.log("eee2")

    // Validate required fields
    if (!this.validateBriefData(briefData)) {
      return;
    }
    console.log("eee3")

    // Start campaign generation
    this.isProcessing = true;
    this.showSection('processing');

    try {
      await window.campaignApp.generateCampaign(briefData, (step, status, message) => {
        this.updateProcessingStep(step, status, message);
      });
    } catch (error) {
      console.error('Campaign generation failed:', error);
      this.showErrorMessage('Campaign generation failed: ' + error.message);
    } finally {
      this.isProcessing = false;
    }
  }
  
  extractFormData(form) {
    const formData = new FormData(form);
    
    return {
      objective: document.getElementById('campaign-objective').value,
      audience: document.getElementById('target-audience').value,
      product: document.getElementById('product-info').value,
      occasion: document.getElementById('occasion').value,
      budget: document.getElementById('budget').value,
      channels: Array.from(document.querySelectorAll('input[name="channels"]:checked')).map(cb => cb.value),
      guidelines: document.getElementById('brand-guidelines').value
    };
  }
  
  validateBriefData(briefData) {
    const required = ['objective', 'audience', 'product'];
    const missing = required.filter(field => !briefData[field] || briefData[field].trim() === '');
    
    if (missing.length > 0) {
      this.showErrorMessage(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
  
  updateProcessingStep(stepId, status, message) {
    const steps = ['analyze', 'strategy', 'visuals', 'copy', 'research', 'planning'];
    
    steps.forEach((step, index) => {
      const stepElement = document.getElementById(`step-${index + 1}`);
      if (!stepElement) return;
      
      stepElement.classList.remove('step--active', 'step--completed', 'step--error', 'step--processing');
      
      if (step === stepId) {
        stepElement.classList.add(`step--${status}`);
        
        // Update step status message
        const statusElement = stepElement.querySelector('.step__status') || this.createStatusElement(stepElement);
        statusElement.textContent = message;
        
      } else if (steps.indexOf(step) < steps.indexOf(stepId)) {
        stepElement.classList.add('step--completed');
      }
    });
  }
  
  createStatusElement(stepElement) {
    const statusElement = document.createElement('div');
    statusElement.className = 'step__status';
    stepElement.querySelector('.step__content').appendChild(statusElement);
    return statusElement;
  }
  
  displayCampaign(campaign) {
    this.currentCampaign = campaign;
    
    // Update header
    this.updateCampaignHeader(campaign);
    
    // Update overview
    this.updateOverviewTab(campaign);
    
    // Update visuals
    this.updateVisualsTab(campaign);
    
    // Update copy
    this.updateCopyTab(campaign);
    
    // Update research
    this.updateResearchTab(campaign);
    
    // Update planning
    this.updatePlanningTab(campaign);
    
    // Show canvas
    this.showSection('canvas');
  }
  
  updateCampaignHeader(campaign) {
    const nameElement = document.getElementById('campaign-name');
    const conceptElement = document.getElementById('strategic-concept');
    
    if (nameElement) nameElement.textContent = campaign.name || 'Marketing Campaign';
    if (conceptElement) {
      conceptElement.textContent = campaign.strategy?.strategic_concept || 'Strategic Campaign Concept';
    }
  }
  
  updateOverviewTab(campaign) {
    // Update stats
    const audienceEl = document.getElementById('overview-audience');
    const budgetEl = document.getElementById('overview-budget');
    const channelsEl = document.getElementById('overview-channels');
    
    if (audienceEl) audienceEl.textContent = campaign.brief.audience;
    if (budgetEl) budgetEl.textContent = this.formatBudget(campaign.brief.budget);
    if (channelsEl) channelsEl.textContent = campaign.brief.channels.join(', ') || 'Multi-channel';
    
    // Update key messages
    this.displayKeyMessages(campaign.strategy?.key_messages || []);
  }
  
  updateVisualsTab(campaign) {
    if (campaign.visuals) {
      this.displayMoodboard(campaign.visuals.mood_board_description || []);
      this.displayColorPalette(campaign.visuals.color_palette || []);
      this.displayVisualConcepts(campaign.visuals.visual_elements || []);
    }
  }
  
  updateCopyTab(campaign) {
    if (campaign.copy) {
      this.displayCopySection('headlines-list', campaign.copy.headlines || []);
      this.displayCopySection('social-posts', campaign.copy.social_posts || []);
      this.displayCopySection('ad-copy', campaign.copy.ad_copy || []);
      this.displayImages(campaign.copy.images || []);

    }
  }

displayImages(images) {
  const container = document.getElementById('generated-images');
  if (!container || !images.length) return;

  container.innerHTML = images.map((image, index) => {
    if (image.data && !image.placeholder && !image.error) {
      // Real image with base64 data
      // Create the full data URL
      const dataUrl = image.data.startsWith('data:') 
        ? image.data 
        : `data:${image.mimeType || 'image/png'};base64,${image.data}`;
      
      return `
        <div class="generated-image">
          <div class="image-wrapper">
            <img src="${dataUrl}" 
                 alt="Generated marketing image ${index + 1}" 
                 loading="lazy"
                 style="max-width: 100%; height: auto; border-radius: 8px;">
            <div class="image-overlay">
              <button class="btn btn--sm btn--primary" 
                      onclick="uiController.downloadImage('${image.id}', '${image.data}', '${image.mimeType}')">
                💾 Download
              </button>
            </div>
          </div>
          <div class="image-info">
            <p class="image-prompt">${this.escapeHtml(image.prompt)}</p>
            <div class="image-actions">
              <button class="btn btn--sm btn--outline" 
                      onclick="uiController.regenerateImage(${index})">
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Placeholder or error
      return `
        <div class="generated-image generated-image--placeholder">
          <div class="image-wrapper">
            <div class="image-placeholder" style="min-height: 300px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 8px;">
              <div style="text-align: center;">
                <div class="placeholder-icon" style="font-size: 48px;">🖼️</div>
                <div class="placeholder-text" style="margin-top: 16px; color: #6b7280;">
                  ${image.error ? '⚠️ Generation failed' : '⏳ Generating image...'}
                </div>
                ${image.error ? `<p style="color: #ef4444; font-size: 12px; margin-top: 8px;">${this.escapeHtml(image.error)}</p>` : ''}
              </div>
            </div>
          </div>
          <div class="image-info">
            <p class="image-prompt">${this.escapeHtml(image.prompt)}</p>
            <div class="image-actions">
              <button class="btn btn--sm btn--primary" 
                      onclick="uiController.regenerateImage(${index})">
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');
}

async regenerateImage(index) {
  if (!this.currentCampaign || this.isProcessing) return;
  
  this.isProcessing = true;
  this.showLoadingOverlay('Regenerating image...');
  
  try {
    const images = this.currentCampaign.copy.images || [];
    if (!images[index]) {
      throw new Error('Image not found');
    }
    
    // Get the original prompt
    const prompt = images[index].prompt;
    
    // Generate new image with the same prompt
    const imageResult = await window.campaignApp.geminiClient.generateImage(prompt);
    
    if (imageResult.success && imageResult.content) {
      // Update the image data
      images[index] = {
        id: `img_regenerated_${Date.now()}_${index}`,
        prompt: prompt,
        data: imageResult.content,
        mimeType: imageResult.mimeType || 'image/png',
        generated_at: new Date().toISOString()
      };
      
      // Update display
      this.displayImages(images);
      this.showSuccessMessage('Image regenerated successfully!');
    } else {
      throw new Error(imageResult.error || 'Failed to generate image');
    }
  } catch (error) {
    console.error('Image regeneration error:', error);
    this.showErrorMessage('Failed to regenerate image: ' + error.message);
  } finally {
    this.isProcessing = false;
    this.hideLoadingOverlay();
  }
}

// Dodaj metodę do pobierania obrazów:
downloadImage(imageId, imageData, mimeType) {
  // Create proper data URL
  const dataUrl = imageData.startsWith('data:') 
    ? imageData 
    : `data:${mimeType || 'image/png'};base64,${imageData}`;
  
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `marketing-image-${imageId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  this.showSuccessMessage('Image downloaded successfully!');
}
  
  updateResearchTab(campaign) {
    if (campaign.research) {
      this.displayInfluencers(campaign.research.influencer_recommendations || []);
      this.displayInsights(campaign.research.audience_insights || []);
      this.displayCompetitors(campaign.research.competitor_analysis || []);
    }
  }
  
  updatePlanningTab(campaign) {
    if (campaign.planning) {
      this.displayTimeline(campaign.planning.timeline || []);
      this.displayBudgetBreakdown(campaign.planning.budget_allocation || []);
    }
  }
  
  // Display methods
  displayKeyMessages(messages) {
    const container = document.getElementById('key-messages');
    if (!container || !messages.length) return;
    
    container.innerHTML = messages.map(message => 
      `<div class="message-item">${this.escapeHtml(message)}</div>`
    ).join('');
  }
  
  displayMoodboard(description) {
    const container = document.getElementById('moodboard');
    if (!container) return;
    
    if (typeof description === 'string') {
      container.innerHTML = `<div class="mood-item">${this.escapeHtml(description)}</div>`;
    } else if (Array.isArray(description)) {
      container.innerHTML = description.map(item => 
        `<div class="mood-item">${this.escapeHtml(item)}</div>`
      ).join('');
    }
  }
  
  displayColorPalette(colors) {
    const container = document.getElementById('color-palette');
    if (!container || !colors.length) return;
    
    container.innerHTML = colors.map(color => `
      <div class="color-swatch" style="background-color: ${color}">
        <span class="color-code">${color}</span>
      </div>
    `).join('');
  }
  
  displayVisualConcepts(concepts) {
    const container = document.getElementById('visual-concepts');
    if (!container || !concepts.length) return;
    
    container.innerHTML = concepts.map(concept => 
      `<div class="copy-item"><p class="copy-text">${this.escapeHtml(concept)}</p></div>`
    ).join('');
  }
  
  displayCopySection(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !items.length) return;
    
    container.innerHTML = items.map((item, index) => `
      <div class="copy-item">
        <p class="copy-text">${this.escapeHtml(item)}</p>
        <div class="copy-actions">
          <button class="btn btn--sm btn--outline" onclick="uiController.editCopy(this)" title="Edit">
            Edit
          </button>
        </div>
      </div>
    `).join('');
  }

  displayInfluencers(influencers) {
    const container = document.getElementById('influencers-list');
    if (!container || !influencers.length) return;

    container.innerHTML = influencers.map(influencer => `
      <div class="influencer-item">
        <div class="influencer-avatar">
          ${influencer.name?.charAt(1)?.toUpperCase() || 'I'}
        </div>
        <div class="influencer-info">
          <h4>${this.escapeHtml(influencer.name || 'Influencer')}</h4>
          <p class="influencer-stats">
            ${influencer.followers || '0'} followers ${influencer.engagement || '0%'} engagement ${this.escapeHtml(influencer.niche || 'General')}
          </p>
        </div>
      </div>
    `).join('');
  }

  displayInsights(insights) {
    const container = document.getElementById('market-insights');
    if (!container || !insights.length) return;

    container.innerHTML = insights.map(insight =>
      `<div class="copy-item"><p class="copy-text">${this.escapeHtml(insight)}</p></div>`
    ).join('');
  }

  displayCompetitors(competitors) {
    const container = document.getElementById('competitor-analysis');
    if (!container || !competitors.length) return;

    container.innerHTML = competitors.map(competitor =>
      `<div class="copy-item"><p class="copy-text">${this.escapeHtml(competitor)}</p></div>`
    ).join('');
  }

  displayTimeline(timeline) {
    const container = document.getElementById('campaign-timeline');
    if (!container || !timeline.length) return;

    container.innerHTML = timeline.map(week => `
      <div class="timeline-item">
        <div class="timeline-week">${this.escapeHtml(week.week || 'Week')}</div>
        <div class="timeline-tasks">
          <ul class="task-list">
            ${(week.tasks || []).map(task => `<li>${this.escapeHtml(task)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  displayBudgetBreakdown(breakdown) {
    const container = document.getElementById('budget-breakdown');
    if (!container || !breakdown.length) return;

    container.innerHTML = breakdown.map(item => `
      <div class="budget-item">
        <span class="budget-category">${this.escapeHtml(item.category || 'Category')}</span>
        <span class="budget-amount">${item.percentage || '0%'}</span>
      </div>
    `).join('');
  }

  // Canvas navigation
  switchCanvasTab(tabId) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('nav-item--active');
    });
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('nav-item--active');

    // Update content
    document.querySelectorAll('.canvas-tab').forEach(tab => {
      tab.classList.remove('canvas-tab--active');
    });
    document.getElementById(`${tabId}-tab`)?.classList.add('canvas-tab--active');

    this.activeTab = tabId;
  }

  // Regeneration methods
  async regenerateContent(type) {
    if (!this.currentCampaign || this.isProcessing) return;

    this.showLoadingOverlay(`Regenerating ${type}...`);

    try {
      const newContent = await window.campaignApp.regenerateElement(type);

      // Update display based on type
      switch (type) {
        case 'headlines':
          this.displayCopySection('headlines-list', newContent);
          break;
        case 'social':
          this.displayCopySection('social-posts', newContent);
          break;
        case 'ads':
          this.displayCopySection('ad-copy', newContent);
          break;
      }

      this.showSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} regenerated successfully!`);

    } catch (error) {
      console.error('Regeneration error:', error);
      this.showErrorMessage('Failed to regenerate content: ' + error.message);
    } finally {
      this.hideLoadingOverlay();
    }
  }

  async regenerateVisuals(type) {
    if (!this.currentCampaign || this.isProcessing) return;

    this.showLoadingOverlay(`Updating ${type}...`);

    try {
      const newVisuals = await window.campaignApp.regenerateElement('visuals');
      this.updateVisualsTab({ visuals: newVisuals });
      this.showSuccessMessage('Visual concepts updated successfully!');
    } catch (error) {
      console.error('Visual regeneration error:', error);
      this.showErrorMessage('Failed to update visuals: ' + error.message);
    } finally {
      this.hideLoadingOverlay();
    }
  }

  async regenerateResearch(type) {
    if (!this.currentCampaign || this.isProcessing) return;

    this.showLoadingOverlay('Updating research...');

    try {
      const newResearch = await window.campaignApp.regenerateElement('research');
      this.updateResearchTab({ research: newResearch });
      this.showSuccessMessage('Research updated successfully!');
    } catch (error) {
      console.error('Research regeneration error:', error);
      this.showErrorMessage('Failed to update research: ' + error.message);
    } finally {
      this.hideLoadingOverlay();
    }
  }

  async regeneratePlanning(type) {
    // Implementation for planning regeneration
    this.showSuccessMessage('Planning updated successfully!');
  }

  // Copy editing
  editCopy(button) {
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
    button.innerHTML = 'Save';
    button.title = 'Save';
    button.onclick = () => this.saveCopy(button, textarea, textElement);

    // Focus and select
    textarea.focus();
    textarea.select();
  }

  saveCopy(button, textarea, textElement) {
    const newText = textarea.value.trim();
    if (newText) {
      textElement.textContent = newText;
    }

    // Remove textarea
    textarea.remove();

    // Show original text
    textElement.style.display = 'block';

    // Reset button
    button.innerHTML = 'Edit';
    button.title = 'Edit';
    button.onclick = () => this.editCopy(button);
  }

  // Campaign management
  exportCampaign() {
    if (!this.currentCampaign) {
      this.showErrorMessage('No campaign to export');
      return;
    }

    const campaignData = JSON.stringify(this.currentCampaign, null, 2);
    const blob = new Blob([campaignData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${(this.currentCampaign.name || 'campaign').replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showSuccessMessage('Campaign exported successfully!');
  }

  saveCampaign() {
    if (!this.currentCampaign) {
      this.showErrorMessage('No campaign to save');
      return;
    }

    // In a real application, this would save to a database
    console.log('Campaign saved:', this.currentCampaign);
    this.showSuccessMessage('Campaign saved successfully!');
  }

  showDemoCampaign() {
    // Load the sample campaign
    const demoCampaign = {
      id: 'demo_campaign_' + Date.now(),
      name: 'Eco Coffee Campaign',
      brief: {
        objective: 'Launch social media campaign for eco-friendly coffee brand targeting Gen Z in Mumbai for World Environment Day',
        audience: 'Gen Z (18-25), Mumbai, environmentally conscious',
        product: 'Eco-friendly coffee with sustainable packaging',
        occasion: 'World Environment Day',
        budget: '5000-15000',
        channels: ['Instagram', 'Facebook', 'TikTok'],
        guidelines: 'Environmentally conscious, authentic, youth-focused'
      },
      strategy: {
        strategic_concept: 'Your Daily Brew, A Greener View',
        target_audience_analysis: 'Gen Z Mumbai residents show 73% higher engagement with environmental content and value authenticity in brand communication',
        key_messages: ['Sustainability meets taste', 'Your coffee choice impacts the planet', 'Be part of the green revolution'],
        brand_positioning: 'The coffee brand for conscious consumers who don\'t compromise on quality',
        success_metrics: ['Engagement rate 5%+', 'Reach 100k+ impressions', 'Conversions 500+ visits']
      },
      visuals: {
        mood_board_description: 'Urban Mumbai coffee culture meets nature. Young professionals enjoying coffee in green spaces, monsoon season aesthetics, earth tones with vibrant green accents',
        color_palette: ['#2D5016', '#8FBC8F', '#F5E6D3', '#A0522D', '#4A7C59'],
        typography_style: 'Modern sans-serif with organic curves, friendly yet professional',
        visual_elements: ['Coffee cups with leaf motifs', 'Mumbai landmarks with green overlay', 'Recycling symbols integrated naturally', 'Monsoon-inspired graphics']
      },
      copy: {
        headlines: [
          'Brew Change, One Cup at a Time',
          'The Future is Green, and It Tastes Great',
          'Sustainable Sips for the Next Generation'
        ],
        social_posts: [
          'Your daily brew can change the world! Join the green coffee revolution this World Environment Day #GreenCoffee #EcoFriendly #Mumbai',
          'From bean to cup, sustainability matters. Discover how your morning ritual can make a difference #SustainableCoffee #WorldEnvironmentDay',
          'Generation Green drinks responsibly! Our eco-friendly coffee is as good for you as it is for the planet',
          'Mumbai monsoons + sustainable coffee = perfect match! Join the movement for a greener tomorrow #MumbaiCoffee #EcoChoice',
          'Wake up to a better world. Every sip supports sustainable farming and a healthier planet #ConsciousCoffee #GreenMumbai'
        ],
        ad_copy: [
          'Discover the coffee that\'s changing Mumbai\'s morning routine. Sustainably sourced, expertly roasted, responsibly packaged. Because great taste shouldn\'t cost the Earth.',
          'This World Environment Day, make every cup count. Our eco-friendly coffee delivers bold flavor while supporting sustainable farming practices. Join thousands of Mumbai coffee lovers making a difference.'
        ]
      },
      research: {
        influencer_recommendations: [
          {
            name: '@ecomumbai',
            followers: '52K',
            engagement: '4.8%',
            niche: 'Sustainable lifestyle',
            rationale: 'Strong environmental advocacy with engaged Mumbai audience'
          },
          {
            name: '@mumbai_foodie_green',
            followers: '28K', 
            engagement: '6.2%',
            niche: 'Eco-friendly food and beverage',
            rationale: 'Perfect alignment with sustainable food choices'
          }
        ],
        audience_insights: [
          'Mumbai Gen Z highly engaged with environmental causes, 78% willing to pay premium for sustainable products',
          'Instagram and YouTube are primary platforms for this demographic',
          'Video content about sustainability receives 85% more shares than static posts',
          'Peak engagement occurs during evening hours (7-9 PM) and weekends'
        ],
        competitor_analysis: [
          'Blue Tokai: Strong local presence, premium positioning, gap in sustainability messaging',
          'Third Wave Coffee: Youth-focused branding, multiple locations, limited environmental focus',
          'Sleepy Owl: Digital-first approach, subscription model, opportunity for eco-differentiation'
        ]
      },
      planning: {
        timeline: [
          {
            week: 'Week 1',
            focus: 'Foundation',
            tasks: ['Content creation & asset development', 'Influencer outreach & partnerships', 'Campaign setup & testing']
          },
          {
            week: 'Week 2', 
            focus: 'Launch',
            tasks: ['Campaign soft launch', 'Daily social posts', 'Paid advertising start']
          },
          {
            week: 'Week 3',
            focus: 'Amplification', 
            tasks: ['Influencer collaborations', 'User-generated content drive', 'Community engagement']
          },
          {
            week: 'Week 4',
            focus: 'Peak Activation',
            tasks: ['World Environment Day activation', 'Results analysis', 'Retargeting campaigns']
          }
        ],
        budget_allocation: [
          {
            category: 'Content Creation',
            percentage: '25%',
            rationale: 'High-quality visuals and video content for engagement'
          },
          {
            category: 'Influencer Partnerships', 
            percentage: '35%',
            rationale: 'Authentic endorsements drive trust and credibility'
          },
          {
            category: 'Paid Advertising',
            percentage: '30%', 
            rationale: 'Targeted reach during peak environmental awareness'
          },
          {
            category: 'Analytics & Tools',
            percentage: '10%',
            rationale: 'Data-driven optimization and performance tracking'
          }
        ]
      },
      status: 'demo'
    };
    
    this.displayCampaign(demoCampaign);
  }
  
  // Utility methods
  formatBudget(budget) {
    const ranges = {
      '1000-5000': '$1,000 - $5,000',
      '5000-15000': '$5,000 - $15,000', 
      '15000-50000': '$15,000 - $50,000',
      '50000+': '$50,000+'
    };
    return ranges[budget] || budget || 'Not specified';
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showLoadingOverlay(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('show');
      const messageEl = overlay.querySelector('p');
      if (messageEl) messageEl.textContent = message;
    }
  }
  
  hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }
  
  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  }
  
  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }
  
  showNotification(message, type = 'info') {
    // Simple alert for now - in production would use a proper notification system
    if (type === 'error') {
      console.error(message);
    }
    alert(message);
  }
}

// Global UI controller instance
const uiController = new UIController();

// Global functions for onclick handlers
function showSection(sectionId) {
  uiController.showSection(sectionId);
}

function showDemoCampaign() {
  uiController.showDemoCampaign();
}

function regenerateContent(type) {
  uiController.regenerateContent(type);
}

function regenerateVisuals(type) {
  uiController.regenerateVisuals(type);
}

function regenerateResearch(type) {
  uiController.regenerateResearch(type);
}

function regeneratePlanning(type) {
  uiController.regeneratePlanning(type);
}

function exportCampaign() {
  uiController.exportCampaign();
}

function saveCampaign() {
  uiController.saveCampaign();
}

// Export for module usage
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = { UIController, uiController };
// }
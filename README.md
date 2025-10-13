# Campaign AI Generator

An AI-powered platform that transforms marketing briefs into comprehensive, strategic campaign packages in minutes using Google's Gemini AI.

## ✨ Features

- **Strategic Analysis**: AI analyzes your brief and formulates winning strategies
- **Visual Concept Creation**: Automated mood boards, color palettes, and visual direction
- **Content Generation**: Headlines, social media posts, and ad copy creation
- **Market Research**: Audience insights, competitor analysis, and influencer recommendations
- **Media Planning**: Timeline creation, budget allocation, and channel strategy
- **Image Generation**: AI-generated marketing visuals with fallback to Hugging Face
- **Campaign Export**: JSON and PDF export capabilities

## 🚀 Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Integration**: Google Gemini 2.0 Flash API
- **Image Generation**: Gemini Vision API with Hugging Face fallback
- **Architecture**: Modular ES6 classes with event-driven design

## 📁 Project Structure

```
├── index.html              # Main application interface
├── app.js                  # Application initialization and state management
├── config.js               # API configuration and environment management
├── geminiClient.js         # Gemini API client with rate limiting
├── campaignGenerator.js    # Core campaign generation engine
├── promptTemplates.js      # AI prompt templates for different components
├── uiController.js         # User interface controller and DOM management
└── style.css              # Complete CSS styling with dark mode support
```

## 🔧 Setup Instructions

### Prerequisites

- Modern web browser with ES6 support
- Google Gemini API key

### Installation

1. **Clone or download the project files**

2. **Get your Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for configuration

3. **Configure API Key**:
   - Open `config.js`
   - Replace the placeholder API key with your actual key:
   ```javascript
   this.apiKey = 'YOUR_GEMINI_API_KEY_HERE'
   ```

4. **Serve the application**:
   - Use a local web server (recommended)
   - Or open `index.html` directly in your browser

### Local Development

For local development, you can use any of these methods:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 🎯 Usage

### Creating a Campaign

1. **Fill out the brief form**:
   - Campaign objective
   - Target audience
   - Product/service information
   - Budget range
   - Marketing channels
   - Brand guidelines (optional)

2. **Generate campaign**:
   - Click "Generate Campaign"
   - Watch AI progress through 6 generation steps
   - Review the comprehensive campaign package

3. **Explore results**:
   - **Overview**: Campaign summary and key metrics
   - **Visuals**: Mood boards, color palettes, and AI-generated images
   - **Copy**: Headlines, social posts, and ad copy
   - **Research**: Market insights and influencer recommendations
   - **Planning**: Timeline and budget allocation

### Features in Detail

#### AI Strategy Analysis
- Strategic concept development
- Target audience analysis
- Key messaging framework
- Brand positioning statements

#### Visual Direction
- Mood board descriptions
- Color palette generation
- Typography recommendations
- Visual element specifications

#### Content Creation
- Multiple headline variations
- Social media post templates
- Long-form ad copy
- Call-to-action suggestions

#### Market Research
- Audience behavioral insights
- Competitor analysis
- Influencer recommendations
- Market opportunity identification

#### Media Planning
- 4-week campaign timeline
- Budget allocation across categories
- Channel strategy recommendations
- Optimization guidelines

## 🔧 API Configuration

The application uses Google's Gemini 2.0 Flash model with the following configuration:

```javascript
// Default settings in config.js
{
  model: 'gemini-2.0-flash',
  rateLimits: {
    requestsPerMinute: 10,
    tokensPerMinute: 250000,
    requestsPerDay: 250
  },
  optimization: {
    maxOutputTokens: 5000,
    temperature: 0.7
  }
}
```

### Rate Limiting

The application includes built-in rate limiting to respect API quotas:
- Request queue management
- Automatic retry logic
- Token usage tracking
- Daily usage monitoring

## 🎨 Customization

### Modifying Prompt Templates

Edit `promptTemplates.js` to customize AI behavior:

```javascript
// Example: Modify strategy analysis prompt
strategyAnalysis: {
  systemPrompt: "You are a senior marketing strategist...",
  getUserPrompt: (brief) => `
    Analyze this marketing brief...
    ${brief.objective}
  `
}
```

### Styling

The application uses CSS custom properties for easy theming:

```css
:root {
  --color-primary: #21808d;
  --color-background: #fcfcf9;
  /* Modify these values to change the theme */
}
```

### Adding New Campaign Sections

1. Add new prompt template in `promptTemplates.js`
2. Create generation method in `campaignGenerator.js`
3. Add UI display logic in `uiController.js`
4. Update styles in `style.css`

## 🔍 Troubleshooting

### Common Issues

**API Key Issues**:
- Ensure API key is valid and has Gemini access
- Check API quotas in Google Cloud Console
- Verify network connectivity

**Generation Failures**:
- Check browser console for detailed errors
- Verify all required form fields are filled
- Try reducing input complexity

**Image Generation Problems**:
- Application automatically falls back to Hugging Face
- Check network connectivity
- Review image prompts for content policy compliance

### Error Handling

The application includes comprehensive error handling:
- Fallback responses for API failures
- Graceful degradation for missing data
- User-friendly error messages
- Automatic retry mechanisms

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Performance Optimization

- Lazy loading for generated images
- Request batching and queuing
- Efficient DOM updates
- CSS-based animations
- Minimal external dependencies

## 🔒 Security Considerations

- API keys should be secured (use environment variables in production)
- Input validation and sanitization
- XSS protection through proper escaping
- Rate limiting to prevent abuse

## 📈 Future Enhancements

- Database integration for campaign storage
- User authentication and accounts
- Advanced analytics and reporting
- A/B testing for generated content
- Integration with marketing platforms
- Team collaboration features

## 🤝 Contributing

This is a demonstration project showcasing AI-powered marketing campaign generation. Feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests
- Share feedback and improvements

## 📄 License

This project is for educational and demonstration purposes. Please ensure compliance with Google's Gemini API terms of service when using the application.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify API key configuration
4. Ensure all dependencies are properly loaded

---

**Built with ❤️ using Google Gemini AI**
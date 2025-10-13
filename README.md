# CampaignBuilder

CampaignBuilder is a client-side web application for generating and assembling marketing campaigns using customizable prompt templates and AI-powered content retrieval.

## Features

- Define and manage prompt templates in `promptTemplates.js`
- Generate text and images through the integrated Gemini client in `geminiClient.js`
- Export assembled campaigns as JSON packages for further use

## Getting Started

No external server or API key setup is required. The entire application runs in the browser.

1. Open https://filiplangiewicz.github.io/CampaignStrategist/ in any modern web browser.
3. Click **Create your first campaign** to generate your marketing campaign with AI.
5. Click **Export** to download a JSON package of your campaign assets.

## File Structure

- `index.html` – Main UI and layout structure
- `style.css` – Styling for the builder interface
- `app.js` – Application initialization and event routing
- `uiController.js` – DOM manipulation, event handling, and canvas management
- `promptTemplates.js` – Collection of default prompt definitions
- `geminiClient.js` – Wrapper for AI content generation calls
- `campaignGenerator.js` – Logic for orchestrating prompts, generation, and export
- `config.js` – Configuration for endpoints and environment variables
- `logo.jpg` – Application logo displayed in the UI

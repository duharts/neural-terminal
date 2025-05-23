# 🧠 Neural Terminal

> AI-powered voice terminal with beautiful cyberpunk interface

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fduharts%2Fneural-terminal)

## ⚡ Features

- 🎤 **Voice Recognition** - Advanced speech-to-text with OpenAI Whisper
- 🤖 **Multiple AI Models** - ChatGPT, GPT-4, and Perplexity integration
- 🎨 **Cyberpunk UI** - Beautiful terminal interface with neon green glow effects
- 💬 **Smart Memory** - Conversation history and context awareness
- ⚙️ **Configurable** - Adjustable temperature, tokens, and model settings
- 📱 **Responsive** - Works perfectly on desktop and mobile
- 🌐 **Web-based** - No installation required, runs in any modern browser

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add environment variables:
   - \OPENAI_API_KEY\: Your OpenAI API key
   - \PERPLEXITY_API_KEY\: Your Perplexity API key (optional)
4. Deploy!

### Manual Deployment
\\\ash
# Clone the repository
git clone https://github.com/duharts/neural-terminal.git
cd neural-terminal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run locally
npm run dev

# Build for production
npm run build
\\\

## 🔧 Configuration

### Environment Variables
- \OPENAI_API_KEY\: Required for ChatGPT, GPT-4, and voice transcription
- \PERPLEXITY_API_KEY\: Optional, for Perplexity AI integration

### API Keys Setup
1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Perplexity API Key**: Get from [Perplexity AI](https://www.perplexity.ai/settings/api)

## 🎮 Usage

### Voice Commands
- Click the microphone button to start voice recording
- Speak your question or command
- The AI will respond with intelligent, contextual answers

### Text Commands
- \help\ - Show available commands
- \status\ - Display system diagnostics
- \clear\ - Clear terminal output
- \history\ - Show conversation history

### AI Models
- **ChatGPT**: Fast, conversational AI (gpt-3.5-turbo)
- **GPT-4**: Advanced reasoning and analysis (gpt-4)
- **Perplexity**: Research-focused AI with web search

## 🎨 Interface

The Neural Terminal features a beautiful cyberpunk-inspired interface:
- Pure black background with neon green text
- Glowing buttons with hover effects
- Terminal-style output with ASCII art
- Smooth animations and visual feedback
- Professional monospace typography

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Icons**: Lucide React
- **AI APIs**: OpenAI GPT models, Perplexity AI
- **Voice**: Web Speech API with OpenAI Whisper
- **Deployment**: Vercel

## 📱 Browser Support

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

## 🔒 Privacy & Security

- API keys are stored securely as environment variables
- No conversation data is stored on servers
- All processing happens client-side except AI API calls
- Voice recordings are temporary and not saved

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\git checkout -b feature/amazing-feature\)
3. Commit your changes (\git commit -m 'Add amazing feature'\)
4. Push to the branch (\git push origin feature/amazing-feature\)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models and Whisper API
- Perplexity AI for research-focused AI capabilities
- Vercel for seamless deployment platform
- Next.js team for the excellent framework

---

**Made with ❤️ and ⚡ by [duharts](https://github.com/duharts)**

> Experience the future of AI interaction with Neural Terminal

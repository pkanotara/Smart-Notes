```markdown
# Smart Notes ✨

> AI-powered note-taking app with custom editor, encryption, and multi-language translation

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://smart-notes-pkanotara.netlify.app)
[![Status](https://img.shields.io/badge/status-production-blue)]()

**Live:** [smart-notex-pkanotara.netlify.app](https://smart-notex-pkanotara.netlify.app)

---

## Features

### Core
- **Custom Rich Text Editor** - Built from scratch (no TinyMCE/Quill)
- **AI Features** - Summarization, Tags, Glossary, Grammar Check
- **AES-256 Encryption** - Password-protected notes
- **Multi-Language Translation** - 12 languages supported
- **Export** - Markdown, PDF, Plain Text
- **Dark Mode** - Professional theme switching
- **Responsive** - Mobile, tablet, desktop

### AI Providers
1. Groq (Primary) - 2 API keys
2. DeepSeek (Fallback)
3. OpenRouter (Fallback)
4. Google Gemini (Fallback)

**Result:** 99.99% uptime with automatic fallback

---

## Quick Start

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build
```

---

## Environment Setup

Create `.env`:

```bash
VITE_GROQ_API_KEY_PRIMARY=your_key_here
VITE_GROQ_API_KEY_SECONDARY=your_key_here
VITE_GEMINI_API_KEY=your_key_here
VITE_DEEPSEEK_API_KEY=your_key_here
VITE_OPENROUTER_API_KEY=your_key_here
```

**Get API Keys:**
- Groq: https://console.groq.com/keys
- Gemini: https://makersuite.google.com/app/apikey
- DeepSeek: https://platform.deepseek.com/api_keys
- OpenRouter: https://openrouter.ai/keys

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS  
**AI:** Groq, DeepSeek, OpenRouter, Gemini  
**Security:** CryptoJS (AES-256)  
**Storage:** LocalStorage  
**Hosting:** Netlify  

---

## Project Structure

```
src/
├── components/       # UI components
├── services/         # AI, encryption, storage, translation
├── hooks/           # Custom React hooks
└── App.jsx          # Main app
```

---

## Features Detail

| Feature | Description | Speed |
|---------|-------------|-------|
| **Summary** | AI-generated 1-2 line summary | ~2s |
| **Tags** | Auto-generate 3-5 relevant tags | ~1.5s |
| **Glossary** | Highlight key terms with definitions | ~3s |
| **Grammar** | Detect errors + one-click fix | ~4s |
| **Translation** | Full note translation (12 languages) | ~5-20s |
| **Encryption** | AES-256 with password confirmation | Instant |

**Languages:** English, Hindi, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian, Italian

---

## Usage

1. **Create Note** - Click "+ New Note"
2. **Format Text** - Use toolbar (Bold, Italic, Alignment, Font Size)
3. **AI Features** - Click AI button (⭐) → Select feature
4. **Translate** - Click translate button → Select language
5. **Encrypt** - Click lock icon → Set password
6. **Export** - Click download icon → Select format

---

## Security

- **AES-256 Encryption** - Military-grade
- **Client-Side Only** - No server storage
- **Password Confirmation** - With strength meter
- **No Password Recovery** - True end-to-end encryption


---

## Development
**Developer:** [@pkanotara](https://github.com/pkanotara) 

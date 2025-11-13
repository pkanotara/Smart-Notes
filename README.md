# 🌟 Smart Notes - AI-Powered Note-Taking Application

![Smart Notes Banner](https://img.shields.io/badge/Smart%20Notes-AI%20Powered-6366F1?style=for-the-badge&logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

> A production-ready, full-featured note-taking application with custom rich text editor, multi-AI provider integration, military-grade encryption, and multi-language translation capabilities.

**🔗 Live Demo:** [https://smart-notes-pkanotara.netlify.app][([https://smart-notes-pkanotara.netlify.app](https://smart-notex.netlify.](https://smart-notex.netlify.app/)

**👨‍💻 Developer:** [@pkanotara](https://github.com/pkanotara)

**📅 Developed:** November 11-13, 2025 (48 hours)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [AI Integration](#-ai-integration)
- [Security](#-security)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎨 **Custom Rich Text Editor**
- Built from scratch without external WYSIWYG libraries (TinyMCE/Quill)
- **Text Formatting:** Bold, Italic, Underline
- **Alignment Options:** Left, Center, Right
- **Font Sizes:** Small, Normal, Large, Huge
- Per-note font size persistence
- Real-time auto-save functionality

### 🤖 **AI Integration (4 Features with 4-Provider Fallback)**
1. **AI Summarization**
   - Generate concise 1-2 sentence summaries
   - Powered by Groq, DeepSeek, OpenRouter, and Gemini APIs
   - Automatic provider fallback for 99.99% uptime

2. **Smart Tag Suggestions**
   - Auto-generate 3-5 relevant tags based on content
   - Intelligent keyword extraction
   - Category-based organization

3. **Auto Glossary**
   - Identify and highlight 3-7 key terms
   - Hover tooltips with AI-generated definitions
   - Context-aware term detection

4. **Grammar Check**
   - Detect grammatical errors with explanations
   - One-click fix for each error
   - Batch fix all errors functionality

### 🔒 **Security & Encryption**
- **AES-256 Military-Grade Encryption** using CryptoJS
- **Password Confirmation** with visual validation
- **Password Strength Indicator** (Weak/Medium/Strong)
- Show/hide password toggles
- True end-to-end encryption (client-side only)
- Encrypted notes excluded from AI processing for privacy

### 🌍 **Multi-Language Translation**
- **12 Popular Languages:** English, Hindi, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian, Italian
- **Complete Note Translation** (entire content, not partial)
- Preserves formatting and structure during translation
- Searchable language selector with flag icons
- Smart chunking for long notes (3000 chars per chunk)

### 📥 **Export Functionality**
- **3 Export Formats:**
  - Markdown (.md) - Maintains formatting
  - PDF (.pdf) - Professional styling
  - Plain Text (.txt) - Clean export
- One-click download functionality
- Preserves note structure

### 🎭 **User Experience**
- **Professional Dark Mode** with theme persistence
- **Fully Responsive Design** (Mobile, Tablet, Desktop)
- **Pin Important Notes** to top
- **Real-time Search** across titles and content
- **Note Timestamps** (created and modified)
- **User Attribution** (@pkanotara)
- **Toast Notifications** for all actions
- **Smooth Animations** and transitions
- **Empty State** with centered call-to-action

### 💾 **Data Management**
- **LocalStorage Persistence** (notes survive browser refresh)
- **Auto-save** on every keystroke (300ms debounce)
- **Note Metadata:** title, content, timestamps, tags, encryption status
- **Sorted Display:** Pinned notes first, then by most recent
- **Note Deletion** with confirmation

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### **AI Providers (Multi-Provider Architecture)**
1. **Groq AI** (Primary)
   - Model: `llama-3.3-70b-versatile`
   - 2 API keys for redundancy
   
2. **DeepSeek** (Fallback 1)
   - Model: `deepseek-chat`
   - Fast and reliable
   
3. **OpenRouter** (Fallback 2)
   - Model: `meta-llama/llama-3.1-8b-instruct:free`
   - Free tier with good performance
   
4. **Google Gemini** (Fallback 3)
   - Model: `gemini-1.5-flash`
   - Google's powerful AI

### **Security**
- **CryptoJS** - AES-256 encryption
- **PBKDF2** - Password-based key derivation

### **Build & Deployment**
- **Netlify** - CDN hosting with continuous deployment
- **Git** - Version control
- **GitHub** - Code repository (Private)

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/pkanotara/Smart-Notes.git

# Navigate to project directory
cd Smart-Notes

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env

# Start development server
npm run dev

# Smart Notes ✨

<div align="center">

![Smart Notes Banner](https://img.shields.io/badge/Smart%20Notes-AI%20Powered-6366F1?style=for-the-badge&logo=react&logoColor=white)

**An intelligent note-taking application with AI-powered features, built with React and modern web technologies.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/pkanotara/Smart-Notes)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#️-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📸 Screenshots

<div align="center">

### Light Mode
![Light Mode](https://via.placeholder.com/800x450/FFFFFF/6366F1?text=Smart+Notes+Light+Mode)

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x450/0A0A0A/818CF8?text=Smart+Notes+Dark+Mode)

### AI Features
![AI Features](https://via.placeholder.com/800x450/6366F1/FFFFFF?text=AI+Powered+Features)

</div>

---

## 🚀 Features

### 📝 Core Functionalities

#### ✅ Custom Rich Text Editor
- **Built from scratch** - No external libraries (TinyMCE, Quill)
- **Text formatting** - Bold, Italic, Underline
- **Text alignment** - Left, Center, Right
- **Font sizes** - Small, Normal, Large, Huge
- **Per-note font size** - Each note remembers its font size

#### 📋 Note Management
- **Create notes** - Quick note creation with auto-save
- **Edit notes** - Inline title and content editing
- **Delete notes** - With confirmation dialog
- **Pin notes** - Keep important notes at the top
- **Search notes** - Search by title or content
- **Timestamps** - Track creation and modification times
- **User attribution** - Notes tagged with @pkanotara

#### 🎨 User Interface
- **Professional design** - Inspired by Notion, Linear, and Arc Browser
- **Dark mode** - Automatic theme switching
- **Responsive layout** - Works on desktop, tablet, and mobile
- **Smooth animations** - Professional transitions
- **Clean typography** - Inter font with proper spacing

---

### 🤖 AI-Powered Features

All AI features powered by **Groq** (primary) and **Google Gemini** (fallback):

#### 📊 AI Summarization
- Generate concise 1-2 line summaries
- Perfect for quick note reviews
- Context-aware summarization

#### 🏷️ Smart Tag Suggestions
- Auto-generate 3-5 relevant tags
- Based on note content analysis
- Helps with organization

#### 📖 Auto Glossary Highlighting
- Identify key terms automatically
- Show definitions on hover
- Context-aware term extraction

#### ✍️ Grammar Check
- Detect grammatical errors
- Suggest corrections
- One-click fix or fix all
- Real-time error highlighting

---

### 🔐 Security & Privacy

#### 🔒 End-to-End Encryption
- **AES-256 encryption** - Military-grade security
- **Password protection** - Individual note encryption
- **Secure storage** - Encrypted content in localStorage
- **No server storage** - All data stays local

#### 💾 Data Persistence
- **LocalStorage** - Notes persist between sessions
- **Auto-save** - Changes saved automatically
- **No data loss** - Reliable storage mechanism

---

### 📤 Export Options

Export your notes in multiple formats:
- **Markdown (.md)** - For developers and writers
- **PDF (.pdf)** - For sharing and printing
- **Plain Text (.txt)** - Universal format

---

## 🎯 Demo

### Live Demo
**Hosted URL**: [https://smart-notes-pkanotara.netlify.app](https://smart-notes-pkanotara.netlify.app)

### Video Demo
📹 [Watch Demo on Loom](#) *(Optional)*

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ React | UI Framework | 18.x |
| ⚡ Vite | Build Tool | 5.x |
| 🎨 Tailwind CSS | Styling | 3.x |
| 🎭 Lucide Icons | Icon Library | Latest |

### AI Integration
| Service | Purpose | Model |
|---------|---------|-------|
| 🤖 Groq | Primary AI | llama-3.3-70b-versatile |
| 🧠 Google Gemini | Fallback AI | gemini-1.5-flash |

### Security & Storage
| Technology | Purpose |
|------------|---------|
| 🔐 CryptoJS | AES-256 Encryption |
| 💾 LocalStorage | Data Persistence |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** - v9.0.0 or higher (comes with Node.js)
- **Git** - For cloning the repository ([Download](https://git-scm.com/))

### API Keys Required

You'll need API keys from:
1. **Groq** - [Get API Key](https://console.groq.com/)
2. **Google Gemini** - [Get API Key](https://makersuite.google.com/app/apikey)

---

## 🚀 Installation

### Option 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/pkanotara/Smart-Notes.git

# Navigate to project directory
cd Smart-Notes

# Install dependencies
npm install

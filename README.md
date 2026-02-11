# ✨ Smart Notes

> AI-powered note-taking application with encryption, translation, and smart features

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://smart-notex.netlify.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Live Demo

**[https://smart-notex.netlify.app/](https://smart-notex.netlify.app/)**

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
  - [Note Lifecycle](#1-note-lifecycle)
  - [AI Features](#2-ai-features)
  - [Encryption and Decryption](#3-encryption-and-decryption)
  - [Translation](#4-translation)
  - [Export](#5-export)
  - [Search and Sort](#6-search-and-sort)
  - [Dark Mode](#7-dark-mode)
- [Component Reference](#-component-reference)
- [Service Layer Reference](#-service-layer-reference)
- [Data Model](#-data-model)
- [AI Provider Fallback Strategy](#-ai-provider-fallback-strategy)
- [Security Model](#-security-model)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 📖 Overview

Smart Notes is a **full-featured, AI-powered note-taking web application** that runs entirely in the browser. It combines a rich text editor with multiple AI providers to offer intelligent features like summarization, tag generation, glossary extraction, and grammar checking. Notes are stored locally in the browser using `localStorage`, and sensitive notes can be protected with AES-256 encryption. The app supports translating notes into multiple languages and exporting them in Markdown, PDF, or plain text formats.

The application is a **single-page app (SPA)** built with React 18, bundled with Vite, and styled with Tailwind CSS. It requires no backend server — all data stays on the user's device. AI features are powered by external LLM APIs (Groq, DeepSeek, Google Gemini, OpenRouter) called directly from the browser.

---

## 🚀 Features

| Category | Features |
|---|---|
| **Rich Text Editing** | Quill 2.0-based editor with full formatting (headings, bold, italic, lists, blockquotes, code blocks, links, images), auto-generated titles from first line of content, word/character counts |
| **AI Integration** | Summarize notes into 1–2 sentences, auto-generate relevant tags, extract glossary terms with definitions, check grammar and apply fixes inline |
| **Encryption** | AES-256-GCM encryption via the Web Crypto API, password-protected notes, encrypted notes are shown as locked and cannot use AI features |
| **Translation** | Translate note content to English, Hindi, or Gujarati using LLM-based translation with provider fallback |
| **Export** | Download notes as Markdown (`.md`), plain text (`.txt`), or print/save as PDF |
| **Dark Mode** | Toggle between light and dark themes; preference is persisted in `localStorage` |
| **Search** | Filter notes by title and content (encrypted notes are matched by title only) |
| **Sort** | Sort notes by last updated, date created, title (A–Z), or word count; sort preference is persisted |
| **Pin Notes** | Pin important notes to keep them at the top of the list |
| **Bulk Delete** | Select and delete multiple notes at once |
| **Responsive Design** | Mobile-first layout with a collapsible sidebar, resizable split pane for AI results on desktop |
| **Toast Notifications** | Non-blocking feedback messages for all user actions |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 18 | Component-based user interface |
| **Build Tool** | Vite 5 | Fast development server and production bundler |
| **Styling** | Tailwind CSS 3.3 | Utility-first CSS framework with dark mode support |
| **Rich Text Editor** | Quill 2.0 + react-quill | WYSIWYG editor for note content |
| **Icons** | Lucide React | Lightweight SVG icon library |
| **AI Providers** | Groq (llama-3.3-70b), DeepSeek, Google Gemini 1.5 Flash, OpenRouter (llama-3.1-8b) | LLM-powered summarization, tagging, glossary, grammar checking, and translation |
| **Encryption** | Web Crypto API (AES-256-GCM, SHA-256) | Client-side note encryption/decryption |
| **HTML Sanitization** | DOMPurify | Sanitize HTML content for security |
| **Storage** | Browser `localStorage` | Persistent client-side data storage |
| **Deployment** | Netlify | Static site hosting and CI/CD |

---

## 🏗 Architecture

The application follows a **layered architecture** with clear separation between the UI layer (React components), the state management layer (`App.jsx`), and the service layer (business logic).

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                          │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ NotesList│ │QuillEditor│ │ AIPanel  │ │  Modals          │  │
│  │ SearchBar│ │AIFloating │ │          │ │  (Encryption,    │  │
│  │ SortDrop │ │  Menu     │ │          │ │   Translation,   │  │
│  │          │ │           │ │          │ │   Export)         │  │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘  │
│         │              │           │              │             │
├─────────┴──────────────┴───────────┴──────────────┴─────────────┤
│                     App.jsx (State Management)                  │
│   - notes[], activeNoteId, searchQuery, sortBy/sortOrder        │
│   - UI states (sidebar, modals, loading)                        │
│   - AI states (aiPanel, glossaryTerms, grammarErrors)           │
│   - Event handlers (CRUD, AI, encryption, translation)          │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                            │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ aiService  │ │encryptionSvc │ │translationSvc│              │
│  │            │ │              │ │              │              │
│  │ summarize  │ │ encrypt()    │ │translateNote()│             │
│  │ suggestTags│ │ decrypt()    │ │              │              │
│  │ glossary   │ │              │ │              │              │
│  │ grammar    │ │              │ │              │              │
│  └─────┬──────┘ └──────┬───────┘ └──────┬───────┘              │
│        │               │                │                      │
│  ┌─────┴──────┐ ┌──────┴───────┐ ┌──────┴───────┐              │
│  │storageSvc  │ │ sortService  │ │ exportUtils  │              │
│  │            │ │              │ │              │              │
│  │ saveNotes  │ │ sortNotes()  │ │ toMarkdown() │              │
│  │ loadNotes  │ │ by title,    │ │ toText()     │              │
│  │ clearAll   │ │ date, words  │ │ toPDF()      │              │
│  └─────┬──────┘ └──────────────┘ └──────────────┘              │
│        │                                                        │
├────────┴────────────────────────────────────────────────────────┤
│              External Systems / Browser APIs                    │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │  LLM APIs      │  │ localStorage│  │ Web Crypto API       │  │
│  │  (Groq,Gemini, │  │             │  │ (AES-GCM, SHA-256)   │  │
│  │  DeepSeek,     │  │             │  │                      │  │
│  │  OpenRouter)   │  │             │  │                      │  │
│  └────────────────┘  └─────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

1. **No backend** — all data is stored in `localStorage` and AI APIs are called directly from the browser. This keeps the app simple and privacy-friendly.
2. **Multi-provider AI fallback** — the app tries AI providers in priority order (Groq → DeepSeek → Gemini → OpenRouter) so that if one provider fails, the next one is used automatically.
3. **Centralized state in `App.jsx`** — all application state (notes, active note, UI modals, AI results) is managed in the root `App` component using React `useState` hooks and passed down via props.
4. **Service layer separation** — business logic (AI calls, encryption, storage, sorting, translation) is encapsulated in service modules under `src/services/`, keeping components focused on rendering.

---

## 📊 Project Structure

```
Smart-Notes/
├── index.html                  # HTML entry point (Vite injects the React app here)
├── package.json                # Dependencies and npm scripts
├── package-lock.json           # Dependency lock file
├── vite.config.js              # Vite configuration (React plugin, dev server port 3000)
├── tailwind.config.js          # Tailwind CSS configuration (dark mode, custom theme)
├── postcss.config.js           # PostCSS configuration (Tailwind + Autoprefixer)
├── netlify.toml                # Netlify deployment settings (build command, redirects)
├── .env.example                # Template for environment variables (API keys)
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── Smart-Notes.txt             # Video demo and live demo links
│
└── src/
    ├── main.jsx                # React entry point — renders <App /> into the DOM
    ├── App.jsx                 # Root component — all state management and event handlers
    ├── index.css               # Global styles (Tailwind directives, custom animations)
    │
    ├── components/             # React UI components
    │   ├── AIFloatingMenu/     # Floating action menu for AI features (summary, tags, glossary, grammar)
    │   ├── AIPanel/            # Right-side panel displaying AI results in a split view
    │   ├── APIKeyChecker.jsx   # Developer utility to verify API key configuration
    │   ├── DarkMode/           # Dark/light theme toggle button
    │   ├── Encryption/         # Password input modal for encrypting/decrypting notes
    │   ├── ExportMenu/         # Export options modal (Markdown, PDF, Text)
    │   ├── FAB/                # Floating action button (mobile)
    │   ├── NotesList/          # Sidebar list of notes with selection, deletion, bulk delete
    │   ├── ResizableSplitPane/ # Draggable split pane — editor on left, AI panel on right
    │   ├── RichTextEditor/     # Quill editor wrapper with toolbar, metadata, stats display
    │   ├── Search/             # Search bar for filtering notes
    │   ├── SortDropdown/       # Dropdown for selecting sort criteria and order
    │   ├── Toast/              # Toast notification container and individual toast items
    │   └── Translation/        # Language selection modal for translating notes
    │
    ├── services/               # Business logic modules
    │   ├── aiService.js        # AI feature orchestration — calls LLM APIs with provider fallback
    │   ├── encryptionService.js# AES-256-GCM encryption/decryption using Web Crypto API
    │   ├── storageService.js   # LocalStorage abstraction for saving/loading notes
    │   ├── sortService.js      # Note sorting logic (by title, date, word count)
    │   └── translationService.js # Translation using LLM APIs with chunking and fallback
    │
    ├── hooks/                  # Custom React hooks
    │   └── useToast.js         # Hook for managing toast notification state
    │
    └── utils/                  # Utility functions
        └── exportUtils.js      # Export notes to Markdown, plain text, or PDF
```

---

## 🔄 How It Works

### 1. Note Lifecycle

```
Create Note → Edit Content → Auto-Save → (Optional: Encrypt/Translate/Export) → Delete
```

**Creating a note:**
- The user clicks "New Note" in the sidebar.
- `App.jsx` creates a new note object with a timestamp-based `id`, default title `"Untitled Note"`, default content `"<p>Start writing...</p>"`, and metadata fields (`createdAt`, `updatedAt`, `isPinned`, `isEncrypted`, `tags`).
- The new note is prepended to the `notes` state array and set as the active note.

**Editing a note:**
- The `QuillEditor` component renders the active note's HTML content in the Quill rich text editor.
- As the user types, Quill fires `onChange` events with the updated HTML content.
- `App.jsx` receives the new content via `handleContentChange()`, updates the note in state, and sets the `updatedAt` timestamp.
- **Auto-title generation:** If the note still has the default title (`"Untitled Note"`), the first line of the content (up to 50 characters) is extracted and used as the title automatically.

**Auto-saving:**
- A `useEffect` hook in `App.jsx` watches the `notes` state array. Whenever it changes, `storageService.saveNotes(notes)` is called, which serializes the entire notes array to JSON and writes it to `localStorage` under the key `smart-notes-data`.
- On page load, `storageService.loadNotes()` reads from `localStorage` and restores the notes. If no notes exist, a welcome note is created.

**Deleting a note:**
- The user can delete a single note or select multiple notes for bulk deletion.
- The note is removed from the `notes` state array, which triggers an auto-save.
- If the deleted note was the active note, the first remaining note becomes active.

### 2. AI Features

The app provides four AI-powered features, all handled through `aiService.js`:

```
User clicks AI action → getTextContent() extracts plain text → aiService calls LLM API → Result displayed in AIPanel
```

**Summary:**
- Extracts plain text from the note's HTML content (or uses the current text selection if any text is selected).
- Sends the text to the LLM with a system prompt requesting a concise 1–2 sentence summary.
- The summary is displayed in the `AIPanel` on the right side of the screen using a `ResizableSplitPane`.

**Tags:**
- Extracts text (with formatting preserved for context) and sends it to the LLM.
- The LLM returns comma-separated tags, which are parsed, cleaned (lowercased, de-duplicated, limited to 5), and saved to the note's `tags` field.
- Tags are displayed in the `AIPanel`.

**Glossary:**
- Sends the note text to the LLM with a prompt to identify 5–10 key terms and provide definitions.
- The response is parsed line-by-line, looking for `TERM: definition` patterns.
- Terms are displayed in the `AIPanel` and highlighted in the editor.

**Grammar Check:**
- Sends the note text to the LLM with a prompt to find grammar, spelling, and punctuation errors.
- The response is parsed line-by-line, looking for `ERROR | CORRECTION | EXPLANATION` patterns.
- Errors are displayed in the `AIPanel` with options to fix them individually or all at once.
- **Fix All:** Replaces all errors in the note content with their corrections using regex replacement.
- **Fix Single:** Replaces one error at a time and removes it from the error list.

**How `runAIFeature` works (in `App.jsx`):**
1. Checks that a note is selected and is not encrypted.
2. Extracts text from the note (or from the current selection).
3. Validates minimum text length.
4. Calls the corresponding `aiService` function with a 15-second timeout using `Promise.race`.
5. On success, updates the `aiPanel` state to display results.
6. On failure, shows a toast error message.

### 3. Encryption and Decryption

```
User sets password → SHA-256 hash → AES-256-GCM encrypt → Base64 encode → Stored in note.content
User enters password → SHA-256 hash → AES-256-GCM decrypt → Original HTML restored
```

**Encryption flow (in `encryptionService.js`):**
1. The user's password is converted to bytes and hashed using **SHA-256** via `crypto.subtle.digest()`.
2. The hash is imported as an **AES-GCM** key using `crypto.subtle.importKey()`.
3. A random 12-byte **initialization vector (IV)** is generated using `crypto.getRandomValues()`.
4. The note's HTML content is encrypted using `crypto.subtle.encrypt()` with AES-GCM.
5. The IV and encrypted data are concatenated into a single byte array.
6. The combined bytes are encoded as a **Base64 string** and stored in the note's `content` field.
7. The note's `isEncrypted` flag is set to `true`.

**Decryption flow:**
1. The Base64 string is decoded back to bytes.
2. The first 12 bytes are extracted as the IV; the rest is the encrypted data.
3. The password is hashed and imported as an AES-GCM key (same as encryption).
4. `crypto.subtle.decrypt()` decrypts the data using the key and IV.
5. The decrypted bytes are converted back to the original HTML string.
6. The note's `isEncrypted` flag is set to `false`.

**Important:** Encrypted notes cannot use AI features, translation, or content-based search. The UI shows them as locked.

### 4. Translation

```
User selects language → Extract plain text → Split into chunks → Translate each chunk via LLM → Combine → Replace note content
```

**Translation flow (in `translationService.js`):**
1. The user selects a target language from the `TranslationModal` (English, Hindi, or Gujarati).
2. The note's HTML content is converted to plain text.
3. If the text is longer than 3,000 characters, it is split into chunks at paragraph boundaries using `splitIntoChunks()`.
4. Each chunk is sent to the LLM translation provider with a prompt like `"Translate the following text to Hindi."`.
5. The translation uses the same multi-provider fallback strategy as AI features (Groq → DeepSeek → Gemini → OpenRouter).
6. Translated chunks are combined and wrapped in `<p>` HTML tags.
7. The translated HTML replaces the note's `content` field.

### 5. Export

**Markdown export (`exportToMarkdown`):**
- Strips HTML from the note content, prepends the title as a `# heading`, and triggers a file download as `.md`.

**Plain text export (`exportToText`):**
- Strips HTML from the note content, prepends the title, and triggers a file download as `.txt`.

**PDF export (`exportToPDF`):**
- Opens a new browser window with a styled HTML document containing the note's title and content.
- Calls `window.print()` after a short delay, which lets the user save as PDF using the browser's print dialog.

**File download mechanism (`downloadFile`):**
- Creates a `Blob` from the content, generates an object URL, creates a temporary `<a>` element, triggers a click to download, and then cleans up.

### 6. Search and Sort

**Search (in `App.jsx`):**
- The `SearchBar` component updates the `searchQuery` state.
- Notes are filtered in real-time: each note's title and content are checked against the query (case-insensitive).
- Encrypted notes are only matched by title (since their content is an encrypted blob).

**Sort (in `sortService.js`):**
- The `SortDropdown` component lets the user choose a sort field and order.
- Available sort options: **Last Updated** (default), **Date Created**, **Title (A–Z)**, **Word Count**.
- The `SortService` class sorts notes using JavaScript's `Array.sort()` with comparators specific to each field.
- Sort preferences (`sortBy` and `sortOrder`) are saved to `localStorage` and restored on page load.
- Pinned notes always appear at the top regardless of sort order.

### 7. Dark Mode

- The `DarkModeToggle` component toggles a `dark` class on the `<html>` element.
- Tailwind CSS's `darkMode: 'class'` configuration enables `dark:` variant utilities throughout the app.
- The user's theme preference is saved in `localStorage` and restored on page load.

---

## 🧩 Component Reference

| Component | Location | Description |
|---|---|---|
| **App** | `src/App.jsx` | Root component. Manages all application state (notes, active note, search, sort, modals, AI results). Contains event handlers for note CRUD, AI features, encryption, translation, and export. Renders the header, sidebar, main editor area, and modals. |
| **QuillEditor** | `src/components/RichTextEditor/` | Wraps the Quill 2.0 rich text editor. Displays the note title (editable), content editor with formatting toolbar, and metadata (created/updated timestamps, word count, character count). Includes the `AIFloatingMenu` for triggering AI actions. |
| **AIFloatingMenu** | `src/components/AIFloatingMenu/` | Floating button menu that expands to show AI action buttons (Summary, Tags, Glossary, Grammar Check). Also includes buttons for encryption, pinning, and translation. |
| **AIPanel** | `src/components/AIPanel/` | Right-side panel that displays AI results (summary text, tag list, glossary terms with definitions, grammar errors with fix buttons). Shown inside a `ResizableSplitPane` alongside the editor. |
| **ResizableSplitPane** | `src/components/ResizableSplitPane/` | A horizontally-split pane with a draggable divider. The left side shows the editor, and the right side shows the AI panel. The user can drag the divider to resize the panes (min 30%, max 70%). |
| **NotesList** | `src/components/NotesList/` | Sidebar component that renders the list of notes. Each note shows its title, a content preview, and the last updated timestamp. Supports note selection, individual deletion, and multi-select bulk deletion. |
| **SearchBar** | `src/components/Search/` | Text input for filtering notes by title and content. Updates the `searchQuery` state in real-time. |
| **SortDropdown** | `src/components/SortDropdown/` | Dropdown menu for selecting sort criteria (title, word count, date created, last updated) and sort order (ascending/descending). |
| **PasswordProtection** | `src/components/Encryption/` | Modal dialog for entering a password to encrypt or decrypt a note. Shows a password input with confirmation (for encryption) or a single input (for decryption). |
| **TranslationModal** | `src/components/Translation/` | Modal dialog for selecting a target language for translation. Shows a list of supported languages with flags. |
| **ExportMenu** | `src/components/ExportMenu/` | Modal or dropdown menu with three export options: Markdown, PDF, and Plain Text. Each option triggers the corresponding export function from `exportUtils.js`. |
| **DarkModeToggle** | `src/components/DarkMode/` | Button that toggles between light and dark themes. Uses sun/moon icons from Lucide React. |
| **ToastContainer** | `src/components/Toast/` | Fixed-position container that renders toast notifications. Toasts auto-dismiss after a configurable duration and can be manually dismissed. |
| **FAB** | `src/components/FAB/` | Floating action button for mobile devices. |
| **APIKeyChecker** | `src/components/APIKeyChecker.jsx` | Developer-only utility component that logs the status of configured API keys to the console. Currently commented out in production. |

---

## ⚙️ Service Layer Reference

### `aiService.js` — AI Feature Orchestration

| Export | Description |
|---|---|
| `aiService.summarizeNote(content)` | Generates a 1–2 sentence summary of the note content. Extracts text from HTML, truncates to 5,000 chars, and calls the LLM. |
| `aiService.suggestTags(content)` | Generates 3–5 lowercase tags. Parses the LLM response by splitting on commas, cleaning prefixes/suffixes, and limiting to 5 tags. |
| `aiService.identifyGlossaryTerms(content)` | Identifies 5–10 key terms with definitions. Parses `TERM: definition` format from the LLM response. Returns up to 10 terms. |
| `aiService.checkGrammar(content)` | Finds grammar/spelling/punctuation errors. Parses `ERROR \| CORRECTION \| EXPLANATION` format. Returns up to 15 errors, or an empty array if no errors. |
| `aiUtils.extractTextFromHTML(html)` | Strips HTML tags and returns plain text. |
| `aiUtils.extractFormattedText(html)` | Converts HTML to plain text with Markdown-like formatting (headings → `#`, list items → `- `). |
| `aiUtils.truncateText(text, maxLength)` | Truncates text at a word boundary. |
| `aiUtils.getWordCount(html)` | Returns the word count of HTML content. |

**Internal functions:**
- `callGroq(systemPrompt, userPrompt, maxTokens)` — Calls the Groq API (llama-3.3-70b-versatile). Rotates between primary and secondary API keys on 401 errors.
- `callGemini(prompt, maxTokens)` — Calls the Google Gemini 1.5 Flash API. Rotates between two API keys.
- `callDeepSeek(systemPrompt, userPrompt, maxTokens)` — Calls the DeepSeek API (deepseek-chat).
- `callOpenRouter(systemPrompt, userPrompt, maxTokens)` — Calls the OpenRouter API (llama-3.1-8b-instruct:free).
- `callAI(systemPrompt, userPrompt, maxTokens)` — Master caller that tries providers in order (Groq → DeepSeek → Gemini → OpenRouter) with 1-second delays between retries.

### `encryptionService.js` — AES-256 Encryption

| Method | Description |
|---|---|
| `encrypt(text, password)` | Encrypts text using AES-256-GCM. Returns a Base64-encoded string containing the 12-byte IV concatenated with the ciphertext. |
| `decrypt(encryptedText, password)` | Decrypts a Base64-encoded string back to the original text. Throws `"Incorrect password"` on failure. |

### `storageService.js` — LocalStorage Abstraction

| Method | Description |
|---|---|
| `saveNotes(notes)` | Serializes the notes array to JSON and writes it to `localStorage` under the key `smart-notes-data`. |
| `loadNotes()` | Reads and parses the notes array from `localStorage`. Returns an empty array if no data exists or on error. |
| `clearAll()` | Removes the notes data from `localStorage`. |
| `formatTimestamp(timestamp)` | Returns a human-readable relative time string (e.g., `"Just now"`, `"5 minutes ago"`, `"3 days ago"`, or a full date for older timestamps). |
| `getFullTimestamp(timestamp)` | Returns a full date/time string (e.g., `"February 11, 2026, 05:30:00 AM"`). |

### `translationService.js` — Translation

| Export | Description |
|---|---|
| `LANGUAGES` | Array of supported languages: English (`en`), Hindi (`hi`), Gujarati (`gu`). Each entry has `code`, `name`, and `flag` fields. |
| `translationService.translateNote(content, targetLanguage)` | Translates the note content to the target language. Extracts plain text from HTML, splits into 3,000-character chunks, translates each chunk via LLM, and combines the results into HTML paragraphs. |

### `sortService.js` — Note Sorting

| Method | Description |
|---|---|
| `sortNotes(notes, sortBy, order)` | Sorts a copy of the notes array by the specified field and order. Supported fields: `updated`, `created`, `title`, `wordCount`. |
| `getSortOptions()` | Returns the list of sort options for the UI dropdown, each with a `value`, `label`, and `icon`. |

### `exportUtils.js` — Export Functions

| Function | Description |
|---|---|
| `exportToMarkdown(note)` | Converts a note to Markdown format (title as `# heading` + plain text content). |
| `exportToText(note)` | Converts a note to plain text (title + content without HTML). |
| `exportToPDF(note)` | Opens a styled print window with the note's HTML content for saving as PDF. |
| `downloadFile(content, filename, type)` | Creates a Blob and triggers a file download in the browser. |

### `useToast.js` — Toast Hook

| Return Value | Description |
|---|---|
| `toasts` | Array of active toast objects (`{ id, message, type }`). |
| `addToast(message, type, duration)` | Adds a toast notification. Types: `success`, `error`, `warning`, `info`. Auto-dismisses after `duration` ms (default: 2000). |
| `removeToast(id)` | Manually removes a toast by ID. |

---

## 📋 Data Model

Each note is stored as a JavaScript object with the following schema:

```javascript
{
  id: string,           // Unique identifier (timestamp-based, e.g., "1707612345678")
  title: string,        // Note title (auto-generated from first line or user-edited)
  content: string,      // Note body as HTML (from Quill editor) or Base64 string (if encrypted)
  createdAt: number,    // Unix timestamp in milliseconds when the note was created
  updatedAt: number,    // Unix timestamp in milliseconds when the note was last modified
  createdBy: string,    // Author identifier (default: "pkanotara")
  isPinned: boolean,    // Whether the note is pinned to the top of the list
  isEncrypted: boolean, // Whether the note content is encrypted
  tags: string[],       // Array of AI-generated tags (e.g., ["react", "tutorial"])
  fontSize: string      // Font size preference (e.g., "normal")
}
```

**Storage format:** The entire notes array is serialized as JSON and stored in `localStorage` under the key `smart-notes-data`.

**Sort preferences** are stored separately:
- `localStorage['notes-sort-preference']` — Sort field (e.g., `"updated"`)
- `localStorage['notes-sort-order']` — Sort direction (e.g., `"desc"`)

---

## 🤖 AI Provider Fallback Strategy

The app uses a **multi-provider fallback system** to ensure AI features work reliably even if one provider is down or rate-limited:

```
Groq (fastest) → DeepSeek → Google Gemini → OpenRouter (free tier)
```

**How it works (in `callAI()`):**
1. The app builds an ordered list of available providers based on which API keys are configured.
2. It tries the first provider. If it succeeds, the result is returned immediately.
3. If the first provider fails (network error, 401 unauthorized, rate limit, empty response), the app waits 1 second and tries the next provider.
4. This continues until a provider succeeds or all providers have been tried.
5. If all providers fail, an error is thrown with the message `"All AI providers failed."`.

**Key rotation:** For Groq and Gemini, the app supports multiple API keys (primary and secondary). If a key returns a 401 error, the app rotates to the next key before retrying.

**Timeout:** In `App.jsx`, each AI operation is wrapped in a `Promise.race` with a 15-second timeout to prevent the UI from hanging.

---

## 🔐 Security Model

- **Encryption algorithm:** AES-256-GCM (authenticated encryption) via the Web Crypto API.
- **Key derivation:** The user's password is hashed with SHA-256 to produce a 256-bit key. (Note: This is a simple key derivation; production apps should use PBKDF2 or Argon2.)
- **Initialization vector:** A random 12-byte IV is generated for each encryption operation using `crypto.getRandomValues()`.
- **Storage format:** The IV and ciphertext are concatenated and Base64-encoded for storage as a string in `localStorage`.
- **No server-side storage:** All data remains in the user's browser. No notes or passwords are ever sent to a server (except note content sent to LLM APIs for AI features).
- **Encrypted note restrictions:** Encrypted notes cannot be searched by content, cannot use AI features, and cannot be translated. They must be decrypted first.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/pkanotara/Smart-Notes.git

# Navigate to the project directory
cd Smart-Notes

# Install dependencies
npm install

# Copy the environment variables template
cp .env.example .env

# Add your API keys to the .env file (see Environment Variables below)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Groq API Keys (primary AI provider — get from https://console.groq.com)
VITE_GROQ_API_KEY_PRIMARY=your_groq_api_key_here
VITE_GROQ_API_KEY_SECONDARY=your_backup_groq_key_here

# Google Gemini API Keys (fallback — get from https://makersuite.google.com/app/apikey)
VITE_GEMINI_1_API_KEY=your_gemini_api_key_here
VITE_GEMINI_2_API_KEY=your_backup_gemini_key_here

# DeepSeek API Key (fallback — get from https://platform.deepseek.com)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# OpenRouter API Key (free fallback — get from https://openrouter.ai)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Notes:**
- At least one API key is required for AI features and translation to work.
- The app works without any API keys — note creation, editing, encryption, search, sort, export, and dark mode all function offline. Only AI-powered features (summary, tags, glossary, grammar, translation) require API keys.
- All keys are prefixed with `VITE_` so that Vite exposes them to the client-side code via `import.meta.env`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server on `http://localhost:3000` with hot module replacement |
| `npm run build` | Build the production bundle to the `dist/` directory |
| `npm run preview` | Preview the production build locally |

---

## 🚀 Deployment

The app is deployed on **Netlify** as a static site.

**Netlify configuration (`netlify.toml`):**
- **Build command:** `npm run build`
- **Publish directory:** `dist/`
- **Node version:** 18
- **SPA redirect:** All routes redirect to `index.html` for client-side routing

**To deploy manually:**

```bash
# Build for production
npm run build

# Deploy to Netlify (requires netlify-cli)
netlify deploy --prod
```

**Live demo:** [https://smart-notex.netlify.app/](https://smart-notex.netlify.app/)

---

## 👤 Author

**Parth Kanotara** ([@pkanotara](https://github.com/pkanotara))

## 🙏 Acknowledgments

- AI powered by [Groq](https://groq.com), [DeepSeek](https://deepseek.com), [OpenRouter](https://openrouter.ai), and [Google Gemini](https://ai.google.dev)
- Rich text editing by [Quill](https://quilljs.com)
- Icons by [Lucide React](https://lucide.dev)
- Styling by [Tailwind CSS](https://tailwindcss.com)
- Built with [Vite](https://vitejs.dev) and [React](https://react.dev)

---

<div align="center">

**[⭐ Star this repo](https://github.com/pkanotara/Smart-Notes)** if you find it helpful!

Made with ❤️ by [@pkanotara](https://github.com/pkanotara)

</div>

const GROQ_API_KEY_PRIMARY = import.meta.env.VITE_GROQ_API_KEY_PRIMARY;
const GROQ_API_KEY_SECONDARY = import.meta.env.VITE_GROQ_API_KEY_SECONDARY;
const GEMINI_API_KEY_1 = import.meta.env.VITE_GEMINI_1_API_KEY;
const GEMINI_API_KEY_2 = import.meta.env.VITE_GEMINI_2_API_KEY;
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// ==================== SUPPORTED LANGUAGES ====================
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
];

// ==================== HELPER FUNCTIONS ====================
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const groqKeys = [GROQ_API_KEY_PRIMARY, GROQ_API_KEY_SECONDARY].filter(k => k?.length > 10);
const geminiKeys = [GEMINI_API_KEY_1, GEMINI_API_KEY_2].filter(k => k?.length > 10);
let groqIndex = 0;
let geminiIndex = 0;

// Split text into chunks for large content
const splitIntoChunks = (text, maxSize = 3000) => {
  if (text.length <= maxSize) return [text];

  const chunks = [];
  const paragraphs = text.split('\n');
  let current = '';

  for (const p of paragraphs) {
    if ((current + p).length > maxSize && current) {
      chunks.push(current.trim());
      current = p + '\n';
    } else {
      current += p + '\n';
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

// ==================== API CALLERS ====================

// Groq API
const callGroq = async (prompt) => {
  for (let i = 0; i < groqKeys.length; i++) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKeys[groqIndex]}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a professional translator. Return ONLY the translated text, nothing else.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      });

      if (response.status === 401) {
        groqIndex = (groqIndex + 1) % groqKeys.length;
        continue;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim();
    } catch (error) {
      if (i < groqKeys.length - 1) {
        groqIndex = (groqIndex + 1) % groqKeys.length;
        await wait(300);
      } else {
        throw error;
      }
    }
  }
};

// Gemini API
const callGemini = async (prompt) => {
  for (let i = 0; i < geminiKeys.length; i++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKeys[geminiIndex]}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
        }),
      });

      if (response.status === 401 || response.status === 403) {
        geminiIndex = (geminiIndex + 1) % geminiKeys.length;
        continue;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } catch (error) {
      if (i < geminiKeys.length - 1) {
        geminiIndex = (geminiIndex + 1) % geminiKeys.length;
        await wait(300);
      } else {
        throw error;
      }
    }
  }
};

// DeepSeek API
const callDeepSeek = async (prompt) => {
  if (!DEEPSEEK_API_KEY?.length > 10) throw new Error('No DeepSeek key');

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional translator. Return ONLY the translated text, nothing else.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
};

// OpenRouter API
const callOpenRouter = async (prompt) => {
  if (!OPENROUTER_API_KEY?.length > 10) throw new Error('No OpenRouter key');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        { role: 'system', content: 'You are a professional translator. Return ONLY the translated text, nothing else.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
};

// ==================== TRANSLATION LOGIC ====================

// Translate single text chunk with fallback
const translateText = async (text, targetLanguage) => {
  const languageName = LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
  const prompt = `Translate the following text to ${languageName}. Return ONLY the translated text:\n\n${text}`;

  const providers = [
    groqKeys.length > 0 && (() => callGroq(prompt)),
    DEEPSEEK_API_KEY?.length > 10 && (() => callDeepSeek(prompt)),
    geminiKeys.length > 0 && (() => callGemini(prompt)),
    OPENROUTER_API_KEY?.length > 10 && (() => callOpenRouter(prompt)),
  ].filter(Boolean);

  if (providers.length === 0) {
    throw new Error('No valid API keys found. Please add API keys to your .env file.');
  }

  for (let i = 0; i < providers.length; i++) {
    try {
      const result = await providers[i]();
      if (result) return result;
    } catch (error) {
      console.warn(`Translation provider ${i + 1} failed:`, error.message);
      if (i < providers.length - 1) {
        await wait(500);
      } else {
        throw new Error('All translation providers failed. Please try again.');
      }
    }
  }
};

// Main translation function
const translateNote = async (content, targetLanguage) => {
  // Extract plain text from HTML
  const div = document.createElement('div');
  div.innerHTML = content;
  const plainText = div.textContent || div.innerText || '';

  if (!plainText || plainText.trim().length < 5) {
    throw new Error('Content too short to translate (minimum 5 characters)');
  }

  // Split into chunks if needed
  const chunks = splitIntoChunks(plainText, 3000);
  const translated = [];

  // Translate each chunk
  for (let i = 0; i < chunks.length; i++) {
    const result = await translateText(chunks[i], targetLanguage);
    translated.push(result);
    if (i < chunks.length - 1) await wait(300); // Rate limiting
  }

  // Combine chunks and convert to HTML
  const fullText = translated.join('\n\n');
  const paragraphs = fullText
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('');

  return paragraphs || `<p>${fullText}</p>`;
};

// ==================== EXPORTS ====================
export const translationService = { translateNote };
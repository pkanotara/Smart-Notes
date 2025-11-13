const GROQ_API_KEY_PRIMARY = import.meta.env.VITE_GROQ_API_KEY_PRIMARY;
const GROQ_API_KEY_SECONDARY = import.meta.env.VITE_GROQ_API_KEY_SECONDARY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEEPSEEK_MODEL = 'deepseek-chat';
const OPENROUTER_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

// Popular languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
];

// Helper: Wait/delay
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TranslationService {
  constructor() {
    this.currentApiKeyIndex = 0;
    this.groqApiKeys = [GROQ_API_KEY_PRIMARY, GROQ_API_KEY_SECONDARY].filter(Boolean);
  }

  // Split text into chunks
  splitIntoChunks(text, maxChunkSize = 3000) {
    if (text.length <= maxChunkSize) {
      return [text];
    }

    const chunks = [];
    const paragraphs = text.split('\n');
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph + '\n';
      } else {
        currentChunk += paragraph + '\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Translate with all 4 providers (automatic fallback chain)
  async translateText(text, targetLanguage) {
    const languageObj = LANGUAGES.find(lang => lang.code === targetLanguage);
    const languageName = languageObj ? languageObj.name : targetLanguage;

    const prompt = `Translate ONLY this text to ${languageName}. Return ONLY the translation, nothing else.

${text}`;

    // Provider chain: Groq → DeepSeek → OpenRouter → Gemini
    const providers = [
      {
        name: 'Groq',
        call: async () => {
          const apiKey = this.groqApiKeys[this.currentApiKeyIndex];
          const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: [
                { role: 'system', content: 'You are a professional translator. Translate the ENTIRE text accurately. Return ONLY the translation.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.2,
              max_tokens: 4096,
            }),
          });

          if (response.status === 429 || response.status === 401) {
            throw new Error('Rate limited or unauthorized');
          }

          if (!response.ok) throw new Error(`Groq error: ${response.status}`);

          const data = await response.json();
          return data.choices[0]?.message?.content?.trim();
        }
      },
      {
        name: 'DeepSeek',
        call: async () => {
          const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: DEEPSEEK_MODEL,
              messages: [
                { role: 'system', content: 'You are a professional translator. Return ONLY the translation.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.2,
              max_tokens: 4096,
            }),
          });

          if (!response.ok) throw new Error(`DeepSeek error: ${response.status}`);

          const data = await response.json();
          return data.choices[0]?.message?.content?.trim();
        }
      },
      {
        name: 'OpenRouter',
        call: async () => {
          const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://smart-notes-pkanotara.netlify.app',
              'X-Title': 'Smart Notes',
            },
            body: JSON.stringify({
              model: OPENROUTER_MODEL,
              messages: [
                { role: 'system', content: 'You are a professional translator. Return ONLY the translation.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.2,
              max_tokens: 4096,
            }),
          });

          if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);

          const data = await response.json();
          return data.choices[0]?.message?.content?.trim();
        }
      },
      {
        name: 'Gemini',
        call: async () => {
          const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096,
              }
            }),
          });

          if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        }
      }
    ];

    // Try each provider in sequence
    for (const provider of providers) {
      try {
        console.log(`🔄 Trying ${provider.name} for translation...`);
        const result = await provider.call();
        
        if (result) {
          console.log(`✅ ${provider.name} translation successful`);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ ${provider.name} failed:`, error.message);
        await wait(500);
        continue;
      }
    }

    throw new Error('All translation providers failed');
  }

  async translateNote(content, targetLanguage) {
    try {
      console.log('🌐 Starting translation...');

      // Get plain text
      const div = document.createElement('div');
      div.innerHTML = content;
      const plainText = div.textContent || div.innerText || '';

      if (!plainText || plainText.trim().length < 5) {
        throw new Error('Content too short to translate');
      }

      console.log(`📝 Original: ${plainText.length} characters`);

      // Split into chunks
      const chunks = this.splitIntoChunks(plainText, 3000);
      console.log(`📦 Split into ${chunks.length} chunk(s)`);

      const translatedChunks = [];

      // Translate each chunk
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🔄 Translating chunk ${i + 1}/${chunks.length}...`);
        const translated = await this.translateText(chunks[i], targetLanguage);
        translatedChunks.push(translated);
        
        if (i < chunks.length - 1) {
          await wait(300); // Small delay between chunks
        }
      }

      // Combine translated chunks
      const fullTranslation = translatedChunks.join('\n\n');
      console.log(`📝 Translated: ${fullTranslation.length} characters`);

      // Convert to HTML
      const paragraphs = fullTranslation
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('');

      const finalHtml = paragraphs || `<p>${fullTranslation}</p>`;
      console.log('✅ Translation complete!');

      return finalHtml;

    } catch (error) {
      console.error('❌ Translation error:', error);
      throw error;
    }
  }
}

export const translationService = new TranslationService();
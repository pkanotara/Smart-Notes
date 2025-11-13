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

// Helper: Wait/delay
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AIService {
  constructor() {
    this.currentApiKeyIndex = 0;
    this.groqApiKeys = [GROQ_API_KEY_PRIMARY, GROQ_API_KEY_SECONDARY].filter(Boolean);
    this.providers = ['groq', 'deepseek', 'openrouter', 'gemini'];
    this.currentProviderIndex = 0;
  }

  // Call DeepSeek API
  async callDeepSeekAPI(systemPrompt, userPrompt, maxTokens = 2048) {
    try {
      console.log('🔵 Calling DeepSeek API...');
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim();

      if (!result) {
        throw new Error('Empty response from DeepSeek');
      }

      console.log('✅ DeepSeek response received');
      return result;

    } catch (error) {
      console.error('❌ DeepSeek failed:', error.message);
      throw error;
    }
  }

  // Call OpenRouter API
  async callOpenRouterAPI(systemPrompt, userPrompt, maxTokens = 2048) {
    try {
      console.log('🟢 Calling OpenRouter API...');
      
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim();

      if (!result) {
        throw new Error('Empty response from OpenRouter');
      }

      console.log('✅ OpenRouter response received');
      return result;

    } catch (error) {
      console.error('❌ OpenRouter failed:', error.message);
      throw error;
    }
  }

  // Call Groq API with retry logic
  async callGroqAPI(systemPrompt, userPrompt, maxTokens = 2048, retryCount = 0) {
    for (let attempt = 0; attempt < this.groqApiKeys.length; attempt++) {
      try {
        const apiKey = this.groqApiKeys[this.currentApiKeyIndex];
        console.log('🟣 Calling Groq API...');

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: maxTokens,
            top_p: 1,
          }),
        });

        // Handle 429 (Rate Limit) - switch provider instead of waiting
        if (response.status === 429) {
          console.warn('⚠️ Groq rate limited, switching provider...');
          throw new Error('Rate limited');
        }

        // Handle 401 (Unauthorized)
        if (response.status === 401) {
          console.warn(`⚠️ Groq API key ${this.currentApiKeyIndex + 1} unauthorized, trying next...`);
          this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.groqApiKeys.length;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const result = data.choices[0]?.message?.content?.trim();

        if (!result) {
          throw new Error('Empty response from Groq');
        }

        console.log('✅ Groq response received');
        return result;

      } catch (error) {
        console.error(`❌ Groq attempt ${attempt + 1} failed:`, error.message);
        if (attempt < this.groqApiKeys.length - 1) {
          this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.groqApiKeys.length;
          await wait(500);
          continue;
        }
        throw error;
      }
    }

    throw new Error('All Groq API keys failed');
  }

  // Call Gemini API
  async callGeminiAPI(prompt, maxTokens = 2048) {
    try {
      console.log('🔴 Calling Gemini API...');
      
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: maxTokens,
            topP: 1,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!result) {
        throw new Error('Empty response from Gemini');
      }

      console.log('✅ Gemini response received');
      return result;

    } catch (error) {
      console.error('❌ Gemini failed:', error.message);
      throw error;
    }
  }

  // Smart AI with 4 providers fallback chain
  async callAI(systemPrompt, userPrompt, maxTokens = 2048) {
    const providers = [
      { name: 'groq', call: () => this.callGroqAPI(systemPrompt, userPrompt, maxTokens) },
      { name: 'deepseek', call: () => this.callDeepSeekAPI(systemPrompt, userPrompt, maxTokens) },
      { name: 'openrouter', call: () => this.callOpenRouterAPI(systemPrompt, userPrompt, maxTokens) },
      { name: 'gemini', call: () => this.callGeminiAPI(`${systemPrompt}\n\n${userPrompt}`, maxTokens) },
    ];

    let lastError;

    for (const provider of providers) {
      try {
        console.log(`🔄 Trying ${provider.name}...`);
        const result = await provider.call();
        console.log(`✅ Success with ${provider.name}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ ${provider.name} failed, trying next provider...`);
        lastError = error;
        await wait(500); // Small delay between providers
        continue;
      }
    }

    // If all providers failed
    console.error('❌ All AI providers failed');
    throw new Error(lastError?.message || 'All AI providers failed. Please try again.');
  }

  // 1. SUMMARIZE NOTE
  async summarizeNote(text) {
    try {
      const textToSummarize = text.length > 5000 ? text.substring(0, 5000) + '...' : text;

      const systemPrompt = 'You are an AI that creates concise summaries. Generate a 1-2 sentence summary that captures the main idea.';
      
      const userPrompt = `Summarize this note in 1-2 sentences:

${textToSummarize}

Summary:`;

      const summary = await this.callAI(systemPrompt, userPrompt, 150);
      
      console.log('✅ Summary generated');
      return summary;

    } catch (error) {
      console.error('Summary error:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  // 2. SUGGEST TAGS
  async suggestTags(text) {
    try {
      const textForTags = text.length > 3000 ? text.substring(0, 3000) + '...' : text;

      const systemPrompt = 'You are an AI that generates relevant tags. Generate 3-5 short, relevant tags for the given text. Return ONLY the tags as a comma-separated list, nothing else.';
      
      const userPrompt = `Generate 3-5 relevant tags for this note:

${textForTags}

Tags (comma-separated):`;

      const response = await this.callAI(systemPrompt, userPrompt, 100);
      
      const tags = response
        .split(',')
        .map(tag => tag.trim().replace(/^["']|["']$/g, '').toLowerCase())
        .filter(tag => tag.length > 0 && tag.length < 30)
        .slice(0, 5);

      console.log('✅ Tags generated:', tags);
      return tags;

    } catch (error) {
      console.error('Tags error:', error);
      throw new Error('Failed to generate tags. Please try again.');
    }
  }

  // 3. IDENTIFY GLOSSARY TERMS
  async identifyGlossaryTerms(text) {
    try {
      const textForGlossary = text.length > 4000 ? text.substring(0, 4000) + '...' : text;

      const systemPrompt = 'You are an AI that identifies key terms and provides definitions. Identify 3-7 important terms from the text and provide brief definitions. Format each as: TERM: definition';
      
      const userPrompt = `Identify key terms and define them from this text:

${textForGlossary}

Format: TERM: definition (one per line)`;

      const response = await this.callAI(systemPrompt, userPrompt, 800);
      
      const terms = [];
      const lines = response.split('\n').filter(line => line.includes(':'));

      for (const line of lines) {
        const [term, ...defParts] = line.split(':');
        const definition = defParts.join(':').trim();
        
        if (term && definition) {
          const cleanTerm = term.trim().replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
          if (cleanTerm.length > 0 && cleanTerm.length < 50) {
            terms.push({
              term: cleanTerm,
              definition: definition
            });
          }
        }
      }

      console.log('✅ Glossary terms:', terms.length);
      return terms.slice(0, 10);

    } catch (error) {
      console.error('Glossary error:', error);
      throw new Error('Failed to identify terms. Please try again.');
    }
  }

  // 4. CHECK GRAMMAR
  async checkGrammar(text) {
    try {
      const textForGrammar = text.length > 3000 ? text.substring(0, 3000) + '...' : text;

      const systemPrompt = 'You are a grammar checker. Identify grammatical errors and suggest corrections. Format each as: ERROR_TEXT | CORRECTED_TEXT | EXPLANATION (one per line). If no errors, return "No errors found"';
      
      const userPrompt = `Check this text for grammar errors:

${textForGrammar}

Format: error | correction | explanation (one per line)`;

      const response = await this.callAI(systemPrompt, userPrompt, 1500);
      
      if (response.toLowerCase().includes('no errors') || response.toLowerCase().includes('no grammar')) {
        console.log('✅ No grammar errors found');
        return [];
      }

      const errors = [];
      const lines = response.split('\n').filter(line => line.includes('|'));

      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
          const [error, suggestion, explanation] = parts;
          
          if (error && suggestion && error !== suggestion) {
            errors.push({
              error: error.replace(/^["']|["']$/g, ''),
              suggestion: suggestion.replace(/^["']|["']$/g, ''),
              explanation: explanation || 'Grammar correction'
            });
          }
        }
      }

      console.log('✅ Grammar errors found:', errors.length);
      return errors.slice(0, 15);

    } catch (error) {
      console.error('Grammar check error:', error);
      throw new Error('Failed to check grammar. Please try again.');
    }
  }
}

export const aiService = new AIService();
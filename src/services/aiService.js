const GROQ_API_KEY_PRIMARY = import.meta.env.VITE_GROQ_API_KEY_PRIMARY;
const GROQ_API_KEY_SECONDARY = import.meta.env.VITE_GROQ_API_KEY_SECONDARY;
const GEMINI_API_KEY_1 = import.meta.env.VITE_GEMINI_1_API_KEY;
const GEMINI_API_KEY_2 = import.meta.env.VITE_GEMINI_2_API_KEY;
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize keys
const groqKeys = [GROQ_API_KEY_PRIMARY, GROQ_API_KEY_SECONDARY].filter(k => k?.length > 10);
const geminiKeys = [GEMINI_API_KEY_1, GEMINI_API_KEY_2].filter(k => k?.length > 10);
let groqIndex = 0;
let geminiIndex = 0;

// Groq API
const callGroq = async (systemPrompt, userPrompt, maxTokens = 2048) => {
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: maxTokens,
        }),
      });

      if (response.status === 401) {
        groqIndex = (groqIndex + 1) % groqKeys.length;
        continue;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim();

      if (result) return result;
      throw new Error('Empty response');

    } catch (error) {
      if (i < groqKeys.length - 1) {
        groqIndex = (groqIndex + 1) % groqKeys.length;
        await wait(500);
      } else {
        throw error;
      }
    }
  }
};

// Gemini API
const callGemini = async (prompt, maxTokens = 2048) => {
  for (let i = 0; i < geminiKeys.length; i++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKeys[geminiIndex]}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens }
        }),
      });

      if (response.status === 401 || response.status === 403) {
        geminiIndex = (geminiIndex + 1) % geminiKeys.length;
        continue;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (result) return result;
      throw new Error('Empty response');

    } catch (error) {
      if (i < geminiKeys.length - 1) {
        geminiIndex = (geminiIndex + 1) % geminiKeys.length;
        await wait(500);
      } else {
        throw error;
      }
    }
  }
};

// DeepSeek API
const callDeepSeek = async (systemPrompt, userPrompt, maxTokens = 2048) => {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content?.trim();

  if (result) return result;
  throw new Error('Empty response');
};

// OpenRouter API
const callOpenRouter = async (systemPrompt, userPrompt, maxTokens = 2048) => {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content?.trim();

  if (result) return result;
  throw new Error('Empty response');
};

// Main AI caller with fallback
const callAI = async (systemPrompt, userPrompt, maxTokens = 2048) => {
  const providers = [];

  if (groqKeys.length > 0) {
    providers.push(() => callGroq(systemPrompt, userPrompt, maxTokens));
  }
  if (DEEPSEEK_API_KEY?.length > 10) {
    providers.push(() => callDeepSeek(systemPrompt, userPrompt, maxTokens));
  }
  if (geminiKeys.length > 0) {
    providers.push(() => callGemini(`${systemPrompt}\n\n${userPrompt}`, maxTokens));
  }
  if (OPENROUTER_API_KEY?.length > 10) {
    providers.push(() => callOpenRouter(systemPrompt, userPrompt, maxTokens));
  }

  if (providers.length === 0) {
    throw new Error('No valid API keys found');
  }

  for (let i = 0; i < providers.length; i++) {
    try {
      return await providers[i]();
    } catch (error) {
      if (i < providers.length - 1) await wait(1000);
      else throw new Error('All AI providers failed');
    }
  }
};

// Summarize
const summarizeNote = async (text) => {
  if (!text || text.trim().length < 10) {
    throw new Error('Text too short to summarize');
  }

  const content = text.length > 5000 ? text.substring(0, 5000) : text;
  const system = 'You are a summarizer. Create a brief 1-2 sentence summary.';
  const user = `Summarize this:\n\n${content}\n\nSummary:`;

  return await callAI(system, user, 150);
};

// Tags
const suggestTags = async (text) => {
  if (!text || text.trim().length < 20) {
    throw new Error('Text too short for tags');
  }

  const content = text.length > 3000 ? text.substring(0, 3000) : text;
  const system = 'Generate 3-5 relevant tags. Return ONLY comma-separated tags.';
  const user = `Generate tags for:\n\n${content}`;

  const response = await callAI(system, user, 100);
  
  return response
    .split(',')
    .map(t => t.trim().replace(/^["'#]|["']$/g, '').toLowerCase())
    .filter(t => t.length > 0 && t.length < 30)
    .slice(0, 5);
};

// Glossary
const identifyGlossaryTerms = async (text) => {
  if (!text || text.trim().length < 30) {
    throw new Error('Text too short for glossary');
  }

  const content = text.length > 4000 ? text.substring(0, 4000) : text;
  const system = 'Identify key terms and define them. Format: TERM: definition (one per line)';
  const user = `Find key terms:\n\n${content}`;

  const response = await callAI(system, user, 800);
  
  const terms = [];
  response.split('\n')
    .filter(line => line.includes(':'))
    .forEach(line => {
      const [term, ...def] = line.split(':');
      const definition = def.join(':').trim();
      if (term && definition) {
        const clean = term.trim().replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
        if (clean.length > 0 && clean.length < 50) {
          terms.push({ term: clean, definition });
        }
      }
    });

  return terms.slice(0, 10);
};

// Grammar
const checkGrammar = async (text) => {
  if (!text || text.trim().length < 10) {
    throw new Error('Text too short for grammar check');
  }

  const content = text.length > 3000 ? text.substring(0, 3000) : text;
  const system = 'Find grammar errors. Format: ERROR | CORRECTION | EXPLANATION. If no errors: "No errors found"';
  const user = `Check grammar:\n\n${content}`;

  const response = await callAI(system, user, 1500);
  
  if (response.toLowerCase().includes('no errors')) return [];

  const errors = [];
  response.split('\n')
    .filter(line => line.includes('|'))
    .forEach(line => {
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
    });

  return errors.slice(0, 15);
};

// Export
export const aiService = {
  summarizeNote,
  suggestTags,
  identifyGlossaryTerms,
  checkGrammar,
};
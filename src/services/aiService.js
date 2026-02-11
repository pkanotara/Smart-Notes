const GROQ_API_KEY_PRIMARY = import.meta.env.VITE_GROQ_API_KEY_PRIMARY;
const GROQ_API_KEY_SECONDARY = import.meta.env.VITE_GROQ_API_KEY_SECONDARY;
const GEMINI_API_KEY_1 = import.meta.env.VITE_GEMINI_1_API_KEY;
const GEMINI_API_KEY_2 = import.meta.env.VITE_GEMINI_2_API_KEY;
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract plain text from Quill HTML content
 * Quill uses <p>, <strong>, <em>, <ol>, <ul>, etc.
 */
const extractTextFromHTML = (html) => {
  if (!html) return '';
  
  // Create temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract text content
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up extra whitespace
  text = text
    .replace(/\s+/g, ' ')           // Multiple spaces to single space
    .replace(/\n\s*\n/g, '\n')      // Multiple newlines to single newline
    .trim();
  
  return text;
};

/**
 * Extract text with better formatting preservation
 * Useful for maintaining structure in AI prompts
 */
const extractFormattedText = (html) => {
  if (!html) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Convert common elements to plain text equivalents
  tempDiv.querySelectorAll('h1').forEach(el => {
    el.textContent = `\n# ${el.textContent}\n`;
  });
  
  tempDiv.querySelectorAll('h2').forEach(el => {
    el.textContent = `\n## ${el.textContent}\n`;
  });
  
  tempDiv.querySelectorAll('h3').forEach(el => {
    el.textContent = `\n### ${el.textContent}\n`;
  });
  
  tempDiv.querySelectorAll('li').forEach(el => {
    el.textContent = `\n- ${el.textContent}`;
  });
  
  tempDiv.querySelectorAll('p').forEach(el => {
    el.textContent = `${el.textContent}\n`;
  });
  
  tempDiv.querySelectorAll('blockquote').forEach(el => {
    el.textContent = `\n> ${el.textContent}\n`;
  });
  
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up
  text = text
    .replace(/\n{3,}/g, '\n\n')     // Max 2 consecutive newlines
    .trim();
  
  return text;
};

/**
 * Truncate text to max length while preserving word boundaries
 */
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
};

/**
 * Get word count from HTML
 */
const getWordCount = (html) => {
  const text = extractTextFromHTML(html);
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
};

// ==================== API KEY MANAGEMENT ====================

// Initialize keys
const groqKeys = [GROQ_API_KEY_PRIMARY, GROQ_API_KEY_SECONDARY].filter(k => k?.length > 10);
const geminiKeys = [GEMINI_API_KEY_1, GEMINI_API_KEY_2].filter(k => k?.length > 10);
let groqIndex = 0;
let geminiIndex = 0;

// ==================== API CALLERS ====================

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

// ==================== MAIN AI CALLER WITH FALLBACK ====================

const callAI = async (systemPrompt, userPrompt, maxTokens = 2048) => {
  const providers = [];

  // Priority order: Groq (fastest) → DeepSeek → Gemini → OpenRouter
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
    throw new Error('No valid API keys found. Please add API keys to your .env file.');
  }

  for (let i = 0; i < providers.length; i++) {
    try {
      return await providers[i]();
    } catch (error) {
      console.warn(`Provider ${i + 1} failed:`, error.message);
      if (i < providers.length - 1) {
        await wait(1000);
      } else {
        throw new Error('All AI providers failed. Please check your API keys and internet connection.');
      }
    }
  }
};

// ==================== AI FEATURES ====================

/**
 * Summarize note content
 * Accepts both HTML (from Quill) and plain text
 */
const summarizeNote = async (content) => {
  // Extract text from HTML if needed
  const text = content.includes('<') && content.includes('>')
    ? extractTextFromHTML(content)
    : content;

  if (!text || text.trim().length < 10) {
    throw new Error('Text too short to summarize (minimum 10 characters)');
  }

  const truncated = truncateText(text, 5000);
  const system = 'You are a professional summarizer. Create a clear, concise 1-2 sentence summary that captures the main point.';
  const user = `Summarize this note:\n\n${truncated}\n\nProvide ONLY the summary, no extra text.`;

  return await callAI(system, user, 150);
};

/**
 * Generate relevant tags
 * Accepts both HTML (from Quill) and plain text
 */
const suggestTags = async (content) => {
  // Extract text from HTML if needed
  const text = content.includes('<') && content.includes('>')
    ? extractFormattedText(content)
    : content;

  if (!text || text.trim().length < 20) {
    throw new Error('Text too short for tag generation (minimum 20 characters)');
  }

  const truncated = truncateText(text, 3000);
  const system = 'Generate 3-5 relevant, concise tags. Return ONLY comma-separated tags without hashtags or quotes. Tags should be lowercase, single words or short phrases.';
  const user = `Generate tags for this note:\n\n${truncated}\n\nTags:`;

  const response = await callAI(system, user, 100);
  
  // Parse and clean tags
  const tags = response
    .split(/[,\n]/)
    .map(t => t.trim().replace(/^["'#]|["']$/g, '').toLowerCase())
    .filter(t => t.length > 0 && t.length < 30 && !t.includes('.'))
    .slice(0, 5);

  // Ensure we have at least one tag
  if (tags.length === 0) {
    throw new Error('Failed to generate tags');
  }

  return tags;
};

/**
 * Identify key terms and provide definitions
 * Accepts both HTML (from Quill) and plain text
 */
const identifyGlossaryTerms = async (content) => {
  // Extract text from HTML if needed
  const text = content.includes('<') && content.includes('>')
    ? extractFormattedText(content)
    : content;

  if (!text || text.trim().length < 30) {
    throw new Error('Text too short for glossary (minimum 30 characters)');
  }

  const truncated = truncateText(text, 4000);
  const system = 'You are a glossary expert. Identify 5-10 key terms and provide brief definitions. Format EXACTLY as: TERM: definition (one per line, no numbering).';
  const user = `Identify key terms and define them:\n\n${truncated}\n\nKey terms:`;

  const response = await callAI(system, user, 800);
  
  const terms = [];
  response.split('\n')
    .filter(line => line.includes(':'))
    .forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;
      
      const term = line.substring(0, colonIndex).trim();
      const definition = line.substring(colonIndex + 1).trim();
      
      if (term && definition) {
        // Clean term (remove numbers, bullets, etc.)
        const cleanTerm = term
          .replace(/^\d+\.\s*/, '')      // Remove "1. "
          .replace(/^[-*•]\s*/, '')      // Remove "- " or "* " or "• "
          .replace(/^["'`]|["'`]$/g, '') // Remove quotes
          .trim();
        
        if (cleanTerm.length > 0 && cleanTerm.length < 50 && definition.length > 0) {
          terms.push({ 
            term: cleanTerm, 
            definition: definition.substring(0, 200) // Limit definition length
          });
        }
      }
    });

  if (terms.length === 0) {
    throw new Error('No glossary terms found');
  }

  return terms.slice(0, 10);
};

/**
 * Check grammar and suggest corrections
 * Accepts both HTML (from Quill) and plain text
 */
const checkGrammar = async (content) => {
  // Extract text from HTML if needed
  const text = content.includes('<') && content.includes('>')
    ? extractTextFromHTML(content)
    : content;

  if (!text || text.trim().length < 10) {
    throw new Error('Text too short for grammar check (minimum 10 characters)');
  }

  const truncated = truncateText(text, 3000);
  const system = 'You are a grammar expert. Find grammar, spelling, and punctuation errors. Format EXACTLY as: ERROR | CORRECTION | EXPLANATION (one per line). If no errors found, respond with: "No errors found"';
  const user = `Check grammar:\n\n${truncated}\n\nErrors:`;

  const response = await callAI(system, user, 1500);
  
  // Check if no errors
  if (response.toLowerCase().includes('no errors') || 
      response.toLowerCase().includes('no grammar errors') ||
      response.toLowerCase().includes('looks good') ||
      response.toLowerCase().includes('perfect')) {
    return [];
  }

  const errors = [];
  response.split('\n')
    .filter(line => line.includes('|'))
    .forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const [error, suggestion, explanation] = parts;
        
        // Ensure error and suggestion are different and valid
        if (error && 
            suggestion && 
            error.toLowerCase() !== suggestion.toLowerCase() &&
            error.length < 100 &&
            suggestion.length < 100) {
          errors.push({
            error: error.replace(/^["'`]|["'`]$/g, ''),
            suggestion: suggestion.replace(/^["'`]|["'`]$/g, ''),
            explanation: explanation || 'Grammar correction',
            type: explanation?.toLowerCase().includes('spelling') ? 'spelling' :
                  explanation?.toLowerCase().includes('punctuation') ? 'punctuation' :
                  'grammar'
          });
        }
      }
    });

  return errors.slice(0, 15);
};

// ==================== EXPORTS ====================

export const aiService = {
  summarizeNote,
  suggestTags,
  identifyGlossaryTerms,
  checkGrammar,
};

// Export utility functions for use in other parts of the app
export const aiUtils = {
  extractTextFromHTML,
  extractFormattedText,
  truncateText,
  getWordCount,
};
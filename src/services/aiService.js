const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const aiService = {
  async callGroq(prompt, systemPrompt = 'You are a helpful assistant.') {
    if (!GROQ_API_KEY) {
      throw new Error('❌ Groq API key not found!\n\n1. Create .env file in project root\n2. Add: VITE_GROQ_API_KEY=your_key\n3. Restart dev server (npm run dev)');
    }

    console.log('🚀 Calling Groq API...');

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',  // ✅ UPDATED MODEL
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Groq API Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API key at console.groq.com');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorData.error?.message || 'Check your API setup'}`);
        } else {
          throw new Error(`API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      console.log('✅ API Success');
      
      const result = data.choices[0]?.message?.content || '';
      if (!result) {
        throw new Error('Empty response from API');
      }
      
      return result;
    } catch (error) {
      console.error('💥 Groq API error:', error);
      throw error;
    }
  },

  async identifyGlossaryTerms(text) {
    if (!text || text.trim().length < 20) {
      throw new Error('Text too short for glossary analysis (minimum 20 characters)');
    }

    const cleanText = text.substring(0, 1000);
    const prompt = `Identify 5-8 important terms from this text and provide brief definitions.

Text: "${cleanText}"

Return ONLY a JSON array with this exact format, no other text:
[{"term": "example", "definition": "brief explanation"}]`;

    try {
      const response = await this.callGroq(prompt, 'You return only valid JSON arrays. No explanations, just JSON.');
      
      console.log('Raw glossary response:', response);
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
      }
      
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
    } catch (error) {
      console.error('Glossary parsing error:', error);
      throw new Error('Failed to generate glossary terms. Try again with different content.');
    }
  },

  async summarizeNote(text) {
    if (!text || text.trim().length < 10) {
      throw new Error('Text too short to summarize (minimum 10 characters)');
    }

    const cleanText = text.substring(0, 2000);
    const prompt = `Summarize this text in exactly 1-2 clear, concise sentences:

"${cleanText}"

Summary:`;

    try {
      const summary = await this.callGroq(prompt, 'You create brief, accurate summaries in 1-2 sentences maximum.');
      return summary.trim();
    } catch (error) {
      console.error('Summary error:', error);
      throw error;
    }
  },

  async suggestTags(text) {
    if (!text || text.trim().length < 20) {
      throw new Error('Text too short for tag suggestions (minimum 20 characters)');
    }

    const cleanText = text.substring(0, 1000);
    const prompt = `Generate 3-5 relevant tags for this text.

Text: "${cleanText}"

Return ONLY a JSON array of strings, no other text:
["tag1", "tag2", "tag3"]`;

    try {
      const response = await this.callGroq(prompt, 'You return only valid JSON arrays of strings.');
      
      console.log('Raw tags response:', response);
      
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed.slice(0, 5).map(t => String(t)) : [];
      }

      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed.slice(0, 5).map(t => String(t)) : [];
    } catch (error) {
      console.error('Tags parsing error:', error);
      throw new Error('Failed to generate tags. Try again.');
    }
  },

  async checkGrammar(text) {
    if (!text || text.trim().length < 10) {
      throw new Error('Text too short for grammar check (minimum 10 characters)');
    }

    const cleanText = text.substring(0, 1500);
    const prompt = `Check this text for grammar errors.

Text: "${cleanText}"

Return ONLY a JSON array (max 5 errors). If no errors, return empty array [].
Format: [{"error": "wrong text", "suggestion": "correction", "position": 0}]`;

    try {
      const response = await this.callGroq(prompt, 'You return only valid JSON. Empty array [] if no errors.');
      
      console.log('Raw grammar response:', response);
      
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      }

      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
    } catch (error) {
      console.error('Grammar parsing error:', error);
      return [];
    }
  },

  async translateNote(text, targetLanguage) {
    if (!text || text.trim().length < 5) {
      throw new Error('Text is too short to translate.');
    }

    const cleanText = text.substring(0, 3000);
    const prompt = `Translate this text to ${targetLanguage}. Preserve formatting and meaning:

"${cleanText}"

Translation:`;

    try {
      const translation = await this.callGroq(
        prompt,
        `You are an expert translator. Translate accurately to ${targetLanguage}, maintaining the original tone and structure.`
      );
      return translation.trim();
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate. Please try again.');
    }
  },
};
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Configuration
const GROQ_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_PRIMARY,
  import.meta.env.VITE_GROQ_API_KEY_SECONDARY,
].filter(Boolean);

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let currentKeyIndex = 0;
let genAI = null;

if (GEMINI_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_KEY);
}

const getGroqClient = () => {
  if (GROQ_KEYS.length === 0) return null;
  return new Groq({
    apiKey: GROQ_KEYS[currentKeyIndex],
    dangerouslyAllowBrowser: true
  });
};

const makeFastRequest = async (systemPrompt, userPrompt) => {
  console.log(`🚀 Making request...`);
  
  // Try current Groq key first
  if (GROQ_KEYS.length > 0) {
    try {
      const groq = getGroqClient();
      console.log(`Trying Groq key ${currentKeyIndex + 1}/${GROQ_KEYS.length}`);
      
      const completion = await Promise.race([
        groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          max_tokens: 512,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);

      const result = completion.choices[0]?.message?.content || "";
      console.log('✅ Groq success');
      return result;
      
    } catch (error) {
      console.warn(`⚠️ Groq failed: ${error.message}`);
      
      // Try next Groq key if available
      if (GROQ_KEYS.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
        console.log(`🔄 Trying next Groq key...`);
        
        try {
          const groq = getGroqClient();
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 512,
          });

          const result = completion.choices[0]?.message?.content || "";
          console.log('✅ Groq success (key 2)');
          return result;
        } catch (error2) {
          console.warn(`⚠️ Second Groq key also failed`);
        }
      }
    }
  }
  
  // Fallback to Gemini
  if (genAI) {
    try {
      console.log('🔄 Trying Gemini...');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        }
      });
      
      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini success');
      return text;
    } catch (error) {
      console.error('❌ Gemini failed:', error.message);
    }
  }
  
  throw new Error('All API services are unavailable. Please try again.');
};

export const aiService = {
  async summarizeNote(content) {
    try {
      const limitedContent = content.substring(0, 3000);
      
      const result = await makeFastRequest(
        "Create a brief 2-3 sentence summary.",
        `Summarize: ${limitedContent}`
      );
      
      return result;
    } catch (error) {
      console.error('Summary Error:', error);
      throw new Error('Could not generate summary. Please try again.');
    }
  },

  async suggestTags(content) {
    try {
      const limitedContent = content.substring(0, 1000);
      
      const result = await makeFastRequest(
        "Return ONLY 3-5 tags as comma-separated values. No explanations.",
        `Generate tags for: ${limitedContent}`
      );
      
      const tags = result
        .split(',')
        .map(tag => tag.trim().replace(/^[#"'\s]+|[#"'\s]+$/g, ''))
        .filter(tag => tag.length > 0 && tag.length < 30)
        .slice(0, 5);
      
      return tags.length > 0 ? tags : ['general', 'note'];
    } catch (error) {
      console.error('Tags Error:', error);
      return ['general', 'note'];
    }
  },

  async identifyGlossaryTerms(content) {
    try {
      const limitedContent = content.substring(0, 1500);
      
      const result = await makeFastRequest(
        'Return ONLY a JSON array of 3-5 key terms: [{"term":"word","definition":"short meaning"}]. No markdown, no explanations.',
        `Find key terms in: ${limitedContent}`
      );
      
      try {
        let jsonStr = result.trim();
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
          const terms = JSON.parse(match[0]);
          return terms
            .filter(item => item.term && item.definition)
            .map(item => ({
              term: String(item.term).trim().slice(0, 50),
              definition: String(item.definition).trim().slice(0, 150)
            }))
            .slice(0, 5);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
      
      return [];
    } catch (error) {
      console.error('Glossary Error:', error);
      return [];
    }
  },

  async checkGrammar(content) {
    try {
      const limitedContent = content.substring(0, 2000);
      
      const result = await makeFastRequest(
        'Find grammar errors. Return ONLY JSON array: [{"error":"wrong","suggestion":"correct"}]. Max 10. If none: []',
        `Check grammar: ${limitedContent}`
      );
      
      try {
        let jsonStr = result.trim();
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
          const errors = JSON.parse(match[0]);
          return errors
            .filter(item => item.error && item.suggestion)
            .map(item => ({
              error: String(item.error).trim().slice(0, 100),
              suggestion: String(item.suggestion).trim().slice(0, 100)
            }))
            .slice(0, 10);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
      
      return [];
    } catch (error) {
      console.error('Grammar Error:', error);
      return [];
    }
  }
};
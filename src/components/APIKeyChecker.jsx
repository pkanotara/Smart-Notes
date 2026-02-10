// Create a new file: src/components/APIKeyChecker.jsx
import React, { useEffect } from 'react';

const APIKeyChecker = () => {
  useEffect(() => {
    console.log('=== API KEYS DEBUG ===');
    console.log('GROQ_PRIMARY:', import.meta.env.VITE_GROQ_API_KEY_PRIMARY?.substring(0, 10) + '...');
    console.log('GROQ_SECONDARY:', import.meta.env.VITE_GROQ_API_KEY_SECONDARY?.substring(0, 10) + '...');
    console.log('GEMINI_1:', import.meta.env.VITE_GEMINI_1_API_KEY?.substring(0, 10) + '...');
    console.log('GEMINI_2:', import.meta.env.VITE_GEMINI_2_API_KEY?.substring(0, 10) + '...');
    console.log('DEEPSEEK:', import.meta.env.VITE_DEEPSEEK_API_KEY?.substring(0, 10) + '...');
    console.log('OPENROUTER:', import.meta.env.VITE_OPENROUTER_API_KEY?.substring(0, 10) + '...');
    console.log('=====================');
  }, []);

  return null;
};

export default APIKeyChecker;
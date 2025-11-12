import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const APITest = () => {
  const [status, setStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    setStatus(null);
    
    try {
      const result = await aiService.testConnection();
      setStatus(result ? 'success' : 'failed');
    } catch (error) {
      setStatus('error');
      console.error('Test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <button
        onClick={testAPI}
        disabled={testing}
        className="flex items-center gap-2 btn-primary"
      >
        {testing && <Loader2 size={16} className="animate-spin" />}
        Test Groq API
      </button>
      
      {status && (
        <div className="mt-2 flex items-center gap-2">
          {status === 'success' && (
            <>
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm text-green-600">Connected!</span>
            </>
          )}
          {(status === 'failed' || status === 'error') && (
            <>
              <XCircle className="text-red-600" size={20} />
              <span className="text-sm text-red-600">Connection failed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default APITest;
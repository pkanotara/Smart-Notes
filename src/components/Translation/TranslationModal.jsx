import React, { useState } from 'react';
import { X, Languages, Loader2, Globe } from 'lucide-react';
import { LANGUAGES } from '../../services/translationService';

const TranslationModal = ({ onClose, onTranslate, isTranslating }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTranslate = () => {
    if (selectedLanguage) {
      onTranslate(selectedLanguage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl max-w-lg w-full border border-[#E5E5E5] dark:border-[#262626] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#171717] dark:text-[#FAFAFA]">Translate Note</h2>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">Select your target language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
            disabled={isTranslating}
          >
            <X size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] dark:text-[#525252]" size={18} />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] rounded-xl border border-[#E5E5E5] dark:border-[#262626] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#A3A3A3] dark:placeholder:text-[#525252] text-sm font-medium"
              disabled={isTranslating}
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                disabled={isTranslating}
                className={`
                  flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200
                  ${selectedLanguage === lang.code
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] hover:scale-[1.02]'
                  }
                  ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex-1">
                  <span className="font-bold text-sm block">{lang.name}</span>
                </div>
                {selectedLanguage === lang.code && (
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto mb-3 text-[#A3A3A3] dark:text-[#525252]" />
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3] font-medium">No languages found</p>
              <p className="text-xs text-[#A3A3A3] dark:text-[#525252] mt-1">Try a different search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626] flex gap-3">
          <button
            onClick={onClose}
            disabled={isTranslating}
            className="flex-1 px-4 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] rounded-xl font-bold hover:bg-[#E5E5E5] dark:hover:bg-[#262626] transition-all disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleTranslate}
            disabled={!selectedLanguage || isTranslating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
          >
            {isTranslating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages size={18} />
                <span>Translate Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;
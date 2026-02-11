import React, { useState } from "react";
import { X, Loader2, Globe, Languages } from "lucide-react";
import { LANGUAGES } from "../../services/translationService";

const TranslationModal = ({ onClose, onTranslate, isTranslating }) => {
  const [selectedLang, setSelectedLang] = useState("");

  const handleTranslate = () => {
    if (selectedLang) {
      onTranslate(selectedLang);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border border-[#E5E5E5] dark:border-[#262626]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#171717] dark:text-[#FAFAFA]">
                Translate Note
              </h2>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                Choose target language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isTranslating}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors disabled:opacity-40"
            title="Close"
          >
            <X size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="p-6">
          <div className="space-y-3">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  disabled={isTranslating}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl transition-all
                    ${isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-[1.02]'
                      : 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#FAFAFA] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]'
                    }
                    ${isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${isSelected ? 'text-white' : ''}`}>
                      {lang.name}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={isTranslating}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#FAFAFA] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleTranslate}
            disabled={!selectedLang || isTranslating}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTranslating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages size={18} />
                <span>Translate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;
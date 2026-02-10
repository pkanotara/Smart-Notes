import React, { useState } from "react";
import { X, Languages, Loader2, Globe } from "lucide-react";
import { LANGUAGES } from "../../services/translationService";

const TranslationModal = ({ onClose, onTranslate, isTranslating }) => {
  const [selectedLang, setSelectedLang] = useState("");
  const [search, setSearch] = useState("");

  const languagefilter = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Globe size={20} className="text-blue-500" />Let's Translate
          </h2>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language..."
            disabled={isTranslating}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Language List */}
        <div className="p-4 max-h-80 overflow-y-auto grid grid-cols-2 gap-3">
          {languagefilter.length > 0 ? (
            languagefilter.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                disabled={isTranslating}
                className={`flex items-center gap-2 p-3 rounded-xl transition
                  ${
                    selectedLang === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                  }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-sm">{lang.name}</span>
              </button>
            ))
          ) : (
            <p className="col-span-2 text-center text-sm text-gray-500 py-10">
              No languages found
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-3 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            disabled={isTranslating}
            className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-[#1a1a1a]"
          >
            Cancel
          </button>

          <button
            disabled={!selectedLang || isTranslating}
            onClick={() => onTranslate(selectedLang)}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isTranslating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages size={18} />
                Translate
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TranslationModal;

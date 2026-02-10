import React from 'react';
import { Sparkles, X, Wand2 } from 'lucide-react';

const AIPanel = ({ type, data, onClose, onFixAllGrammar }) => {
  const sections = {
    summary: { color: 'purple', label: 'Summary' },
    tags: { color: 'blue', label: 'Suggested Tags' },
    glossary: { color: 'amber', label: 'Key Terms' },
    grammar: { color: 'green', label: 'Grammar Check' }
  };

  const { color, label } = sections[type] || {};

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0A0A0A] border-l border-[#E5E5E5] dark:border-[#1F1F1F]">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#171717] dark:text-[#FAFAFA]">AI Insights</h3>
              <p className="text-xs text-[#A3A3A3] dark:text-[#525252] font-medium">Powered by AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all"
            aria-label="Close"
          >
            <X size={18} className="text-[#737373] dark:text-[#A3A3A3]" />
          </button>
        </div>

        {/* Fix All Button */}
        {type === 'grammar' && data?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E5E5E5] dark:border-[#1F1F1F]">
            <button
              onClick={() => onFixAllGrammar(data)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              <Wand2 size={16} />
              Fix All ({data.length})
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="animate-slide-up space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-1 h-6 bg-gradient-to-b from-${color}-500 to-${color}-600 rounded-full`} />
            <h4 className={`font-bold text-${color}-600 dark:text-${color}-400 text-xs uppercase tracking-wider`}>{label}</h4>
          </div>

          {/* Summary */}
          {type === 'summary' && (
            <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-2xl p-5 border border-[#E5E5E5] dark:border-[#262626]">
              <p className="text-sm text-[#171717] dark:text-[#E5E5E5] leading-relaxed font-medium">{data}</p>
            </div>
          )}

          {/* Tags */}
          {type === 'tags' && (
            <div className="flex flex-wrap gap-2">
              {data?.map((tag, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-xl border border-blue-200 dark:border-blue-800/30 hover:border-blue-400 transition-all cursor-default"
                >
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{tag}</span>
                </div>
              ))}
            </div>
          )}

          {/* Glossary */}
          {type === 'glossary' && (
            <div className="space-y-3">
              {data?.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-2xl p-4 border border-[#E5E5E5] dark:border-[#262626] hover:border-amber-300 dark:hover:border-amber-800/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#171717] dark:text-[#FAFAFA] mb-1.5">{item.term}</p>
                      <p className="text-xs text-[#737373] dark:text-[#A3A3A3] leading-relaxed font-medium">{item.definition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grammar */}
          {type === 'grammar' && (
            <>
              {!data?.length ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-2xl font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-bold text-green-800 dark:text-green-300 mb-1">Perfect Grammar!</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">No errors found.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.map((error, i) => (
                    <div
                      key={i}
                      className="bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-2xl p-4 border border-[#E5E5E5] dark:border-[#262626] hover:border-red-300 dark:hover:border-red-800/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-full bg-gradient-to-b from-red-400 to-red-500 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold text-sm">✕</span>
                            <p className="text-sm text-red-700 dark:text-red-400 font-semibold leading-relaxed">{error.error}</p>
                          </div>
                          <div className="flex items-start gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                            <span className="text-green-500 flex-shrink-0 mt-0.5 font-bold text-sm">✓</span>
                            <p className="text-sm text-green-700 dark:text-green-400 font-semibold leading-relaxed">{error.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
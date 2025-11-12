import React, { useState } from 'react';
import { Sparkles, X, FileText, Hash, BookOpen, CheckCircle } from 'lucide-react';

const AIFloatingMenu = ({ onAISummary, onAITags, onGlossary, onGrammarCheck, isEncrypted }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: <FileText size={20} />,
      label: 'Summary',
      action: onAISummary,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      position: -240,
    },
    {
      icon: <Hash size={20} />,
      label: 'Tags',
      action: onAITags,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      position: -160,
    },
    {
      icon: <BookOpen size={20} />,
      label: 'Terms',
      action: onGlossary,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      position: -80,
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Grammar',
      action: onGrammarCheck,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      position: 0,
    },
  ];

  if (isEncrypted) return null;

  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/5 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        {/* Menu Items - All 4 visible vertically */}
        <div className="relative">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="absolute right-0 bottom-20 transition-all duration-500 ease-out"
              style={{
                transform: isOpen 
                  ? `translateY(${item.position}px) scale(1)` 
                  : 'translateY(0px) scale(0)',
                opacity: isOpen ? 1 : 0,
                transitionDelay: isOpen ? `${index * 70}ms` : `${(menuItems.length - index - 1) * 40}ms`,
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              {/* Button */}
              <button
                onClick={() => handleAction(item.action)}
                className={`group relative w-14 h-14 rounded-full ${item.color} text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20`}
                title={item.label}
                style={{
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {item.icon}
                
                {/* Label on hover */}
                <div className="absolute right-full mr-3 bg-[#1F2937]/95 dark:bg-[#0F172A]/95 text-white px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-90 group-hover:scale-100">
                  {item.label}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-[#1F2937]/95 dark:border-l-[#0F172A]/95"></div>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md -z-10" 
                  style={{ 
                    background: 'inherit',
                  }} 
                />
              </button>
            </div>
          ))}
        </div>

        {/* Main AI Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-[#7B6EF6] to-[#9A8CFF] text-white shadow-2xl flex items-center justify-center transition-all duration-500 ease-out hover:scale-110 active:scale-95 border-2 border-white/20 ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
          aria-label="AI Tools"
          style={{
            boxShadow: isOpen 
              ? '0 0 50px rgba(123, 110, 246, 0.6), 0 20px 50px rgba(0, 0, 0, 0.4)' 
              : '0 10px 35px rgba(123, 110, 246, 0.4), 0 5px 18px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="relative z-10">
            {isOpen ? (
              <X size={28} className="transition-all duration-300" strokeWidth={2.5} />
            ) : (
              <Sparkles size={28} className="transition-all duration-300" strokeWidth={2.5} />
            )}
          </div>

          {/* Animated ring effect */}
          {isOpen && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping-slow" />
              <div className="absolute inset-0 rounded-full bg-[#7B6EF6]/40 blur-xl animate-pulse-glow" />
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default AIFloatingMenu;
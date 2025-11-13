import React, { useState } from 'react';
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Lock, Unlock, Pin, Trash2, Languages, ChevronDown, 
  FileText  // Better icon for font size
} from 'lucide-react';

const Toolbar = ({
  onBold, onItalic, onUnderline,
  onAlignLeft, onAlignCenter, onAlignRight,
  onFontSizeChange,
  onToggleEncryption, onTogglePin, onDelete,
  onTranslate,
  isEncrypted, isPinned,
  currentFontSize = 'normal'
}) => {
  const [currentAlign, setCurrentAlign] = useState('left');
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    onFontSizeChange(size);
  };

  const handleFontSizeSelect = (size) => {
    onFontSizeChange(size);
    setShowFontSizeMenu(false);
  };

  // Cycle through alignments on each click
  const handleCycleAlign = () => {
    if (isEncrypted) return;

    let nextAlign = 'left';
    
    if (currentAlign === 'left') {
      nextAlign = 'center';
      onAlignCenter();
    } else if (currentAlign === 'center') {
      nextAlign = 'right';
      onAlignRight();
    } else {
      nextAlign = 'left';
      onAlignLeft();
    }
    
    setCurrentAlign(nextAlign);
  };

  const AlignIcon = () => {
    switch(currentAlign) {
      case 'center':
        return <AlignCenter size={16} />;
      case 'right':
        return <AlignRight size={16} />;
      default:
        return <AlignLeft size={16} />;
    }
  };

  const getFontSizeIcon = () => {
    switch(currentFontSize) {
      case 'small':
        return '14';
      case 'large':
        return '18';
      case 'huge':
        return '24';
      default:
        return '16';
    }
  };

  return (
    <div className="border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/50 dark:bg-[#0F0F0F]/50 backdrop-blur-xl flex-shrink-0">
      {/* Mobile: Clean Single Row Layout */}
      <div className="md:hidden px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Left Group: Formatting */}
          <div className="flex items-center gap-1">
            <button
              onClick={onBold}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5] active:scale-95"
              title="Bold"
              disabled={isEncrypted}
            >
              <Bold size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>

            <button
              onClick={onItalic}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5] active:scale-95"
              title="Italic"
              disabled={isEncrypted}
            >
              <Italic size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>

            <button
              onClick={onUnderline}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5] active:scale-95"
              title="Underline"
              disabled={isEncrypted}
            >
              <Underline size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>

            <div className="w-px h-5 bg-[#E5E5E5] dark:bg-[#262626] mx-0.5"></div>

            <button
              onClick={handleCycleAlign}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isEncrypted 
                  ? 'opacity-40' 
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title="Align Text (Tap to cycle)"
              disabled={isEncrypted}
            >
              <AlignIcon />
            </button>

            <div className="w-px h-5 bg-[#E5E5E5] dark:bg-[#262626] mx-0.5"></div>

            {/* NEW: Better Font Size Button */}
            <div className="relative">
              <button
                onClick={() => !isEncrypted && setShowFontSizeMenu(!showFontSizeMenu)}
                className={`h-9 px-2 rounded-lg transition-all flex items-center gap-0.5 active:scale-95 ${
                  isEncrypted 
                    ? 'opacity-40 bg-[#F5F5F5] dark:bg-[#1A1A1A]' 
                    : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
                }`}
                title="Font Size"
                disabled={isEncrypted}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={isEncrypted ? 'opacity-40' : ''}
                >
                  <polyline points="4 7 4 4 20 4 20 7"></polyline>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
                <span className="text-[10px] font-bold min-w-[14px]">{getFontSizeIcon()}</span>
                <ChevronDown size={10} className={isEncrypted ? 'opacity-40' : ''} />
              </button>

              {showFontSizeMenu && !isEncrypted && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFontSizeMenu(false)}
                  />
                  
                  <div className="absolute left-0 top-full mt-1 bg-white dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
                    <button
                      onClick={() => handleFontSizeSelect('small')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-sm transition-colors ${
                        currentFontSize === 'small' ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6366F1] font-bold' : 'text-[#171717] dark:text-[#E5E5E5]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">A</span>
                        <span>Small</span>
                      </span>
                      {currentFontSize === 'small' && <span className="text-[#6366F1]">✓</span>}
                    </button>
                    <button
                      onClick={() => handleFontSizeSelect('normal')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-sm transition-colors ${
                        currentFontSize === 'normal' ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6366F1] font-bold' : 'text-[#171717] dark:text-[#E5E5E5]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">A</span>
                        <span>Normal</span>
                      </span>
                      {currentFontSize === 'normal' && <span className="text-[#6366F1]">✓</span>}
                    </button>
                    <button
                      onClick={() => handleFontSizeSelect('large')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-sm transition-colors ${
                        currentFontSize === 'large' ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6366F1] font-bold' : 'text-[#171717] dark:text-[#E5E5E5]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">A</span>
                        <span>Large</span>
                      </span>
                      {currentFontSize === 'large' && <span className="text-[#6366F1]">✓</span>}
                    </button>
                    <button
                      onClick={() => handleFontSizeSelect('huge')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-sm transition-colors ${
                        currentFontSize === 'huge' ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6366F1] font-bold' : 'text-[#171717] dark:text-[#E5E5E5]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">A</span>
                        <span>Huge</span>
                      </span>
                      {currentFontSize === 'huge' && <span className="text-[#6366F1]">✓</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Group: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTranslate}
              disabled={isEncrypted}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-bold text-xs active:scale-95
                ${isEncrypted 
                  ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#A3A3A3] cursor-not-allowed opacity-40' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/20'
                }
              `}
              title="Translate Note"
            >
              <Languages size={14} />
              <span className="hidden xs:inline">Translate</span>
            </button>

            <button
              onClick={onTogglePin}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isPinned
                  ? 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20 text-[#6366F1]'
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={15} fill={isPinned ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={onToggleEncryption}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isEncrypted
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title={isEncrypted ? 'Decrypt' : 'Encrypt'}
            >
              {isEncrypted ? <Lock size={15} /> : <Unlock size={15} />}
            </button>

            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all text-[#171717] dark:text-[#E5E5E5] active:scale-95"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Full Toolbar */}
      <div className="hidden md:block px-6 py-2.5">
        <div className="flex items-center gap-1">
          {/* Formatting buttons */}
          <div className="flex items-center gap-1 pr-3 border-r border-[#E5E5E5] dark:border-[#262626]">
            <button
              onClick={onBold}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
              title="Bold (Ctrl+B)"
              disabled={isEncrypted}
            >
              <Bold size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
            <button
              onClick={onItalic}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
              title="Italic (Ctrl+I)"
              disabled={isEncrypted}
            >
              <Italic size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
            <button
              onClick={onUnderline}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
              title="Underline (Ctrl+U)"
              disabled={isEncrypted}
            >
              <Underline size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
          </div>

          {/* Alignment buttons */}
          <div className="flex items-center gap-1 pr-3 border-r border-[#E5E5E5] dark:border-[#262626]">
            <button
              onClick={() => {
                onAlignLeft();
                setCurrentAlign('left');
              }}
              className={`p-2 rounded-lg transition-colors ${
                currentAlign === 'left' 
                  ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title="Align Left"
              disabled={isEncrypted}
            >
              <AlignLeft size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
            <button
              onClick={() => {
                onAlignCenter();
                setCurrentAlign('center');
              }}
              className={`p-2 rounded-lg transition-colors ${
                currentAlign === 'center' 
                  ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title="Align Center"
              disabled={isEncrypted}
            >
              <AlignCenter size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
            <button
              onClick={() => {
                onAlignRight();
                setCurrentAlign('right');
              }}
              className={`p-2 rounded-lg transition-colors ${
                currentAlign === 'right' 
                  ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title="Align Right"
              disabled={isEncrypted}
            >
              <AlignRight size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
          </div>

          {/* Font size */}
          <select
            value={currentFontSize}
            onChange={handleFontSizeChange}
            disabled={isEncrypted}
            className="px-3 py-1.5 text-sm bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#171717] transition-colors disabled:opacity-40 text-[#171717] dark:text-[#E5E5E5] font-medium cursor-pointer"
            title="Font Size"
          >
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="huge">Huge</option>
          </select>

          {/* Actions */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#E5E5E5] dark:border-[#262626]">
            {/* Translation Button */}
            <button
              onClick={onTranslate}
              disabled={isEncrypted}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm
                ${isEncrypted 
                  ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#A3A3A3] cursor-not-allowed opacity-40' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95'
                }
              `}
              title="Translate Note"
            >
              <Languages size={18} />
              <span>Translate</span>
            </button>

            <button
              onClick={onTogglePin}
              className={`p-2 rounded-lg transition-all ${
                isPinned
                  ? 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20 text-[#6366F1]'
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title={isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onToggleEncryption}
              className={`p-2 rounded-lg transition-all ${
                isEncrypted
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
              }`}
              title={isEncrypted ? 'Decrypt Note' : 'Encrypt Note'}
            >
              {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all text-[#171717] dark:text-[#E5E5E5]"
              title="Delete Note"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
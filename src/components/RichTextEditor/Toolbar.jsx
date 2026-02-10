import React, { useState, useEffect } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Lock, Unlock, Pin, Trash2, Languages, ChevronDown
} from 'lucide-react';

// Toolbar Button
const ToolbarButton = ({ onClick, icon: Icon, title, disabled, active, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all active:scale-95 ${
      disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
    } ${active ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'text-[#171717] dark:text-[#E5E5E5]'} ${className}`}
  >
    <Icon size={16} />
  </button>
);

const Toolbar = ({
  onBold, onItalic, onUnderline, onAlignLeft, onAlignCenter, onAlignRight,
  onFontSizeChange, onToggleEncryption, onTogglePin, onDelete, onTranslate,
  isEncrypted, isPinned, currentFontSize = 'normal', align = 'left'
}) => {
  const [currentAlign, setCurrentAlign] = useState(align);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  useEffect(() => setCurrentAlign(align), [align]);

  const handleCycleAlign = () => {
    if (isEncrypted) return;
    if (currentAlign === 'left') {
      setCurrentAlign('center');
      onAlignCenter();
    } else if (currentAlign === 'center') {
      setCurrentAlign('right');
      onAlignRight();
    } else {
      setCurrentAlign('left');
      onAlignLeft();
    }
  };

  const AlignIcon = () => {
    if (currentAlign === 'center') return <AlignCenter size={16} />;
    if (currentAlign === 'right') return <AlignRight size={16} />;
    return <AlignLeft size={16} />;
  };

  const fontSizes = { small: '14', normal: '16', large: '18', huge: '24' };

  return (
    <div className="border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/50 dark:bg-[#0F0F0F]/50 backdrop-blur-xl flex-shrink-0">
      
      {/* Mobile Toolbar */}
      <div className="md:hidden px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={onBold} icon={Bold} title="Bold" disabled={isEncrypted} />
            <ToolbarButton onClick={onItalic} icon={Italic} title="Italic" disabled={isEncrypted} />
            <ToolbarButton onClick={onUnderline} icon={Underline} title="Underline" disabled={isEncrypted} />
            <div className="w-px h-5 bg-[#E5E5E5] dark:bg-[#262626] mx-0.5" />
            <button
              onClick={handleCycleAlign}
              disabled={isEncrypted}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isEncrypted ? 'opacity-40' : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
              }`}
            >
              <AlignIcon />
            </button>
            <div className="w-px h-5 bg-[#E5E5E5] dark:bg-[#262626] mx-0.5" />
            <FontSizeDropdown
              currentFontSize={currentFontSize}
              showMenu={showFontSizeMenu}
              onToggle={() => setShowFontSizeMenu(!showFontSizeMenu)}
              onSelect={(size) => { onFontSizeChange(size); setShowFontSizeMenu(false); }}
              isEncrypted={isEncrypted}
              number={fontSizes[currentFontSize]}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onTranslate}
              disabled={isEncrypted}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs active:scale-95 ${
                isEncrypted ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#A3A3A3] opacity-40' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
              }`}
            >
              <Languages size={14} />
            </button>
            <button
              onClick={onTogglePin}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isPinned ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
              }`}
            >
              <Pin size={15} fill={isPinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onToggleEncryption}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isEncrypted ? 'bg-amber-500/10 text-amber-600' : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
              }`}
            >
              {isEncrypted ? <Lock size={15} /> : <Unlock size={15} />}
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg transition-all active:scale-95 hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Toolbar */}
      <div className="hidden md:block px-6 py-2.5">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 pr-3 border-r border-[#E5E5E5] dark:border-[#262626]">
            <ToolbarButton onClick={onBold} icon={Bold} title="Bold (Ctrl+B)" disabled={isEncrypted} />
            <ToolbarButton onClick={onItalic} icon={Italic} title="Italic (Ctrl+I)" disabled={isEncrypted} />
            <ToolbarButton onClick={onUnderline} icon={Underline} title="Underline (Ctrl+U)" disabled={isEncrypted} />
          </div>

          <div className="flex items-center gap-1 pr-3 border-r border-[#E5E5E5] dark:border-[#262626]">
            <ToolbarButton 
              onClick={() => { onAlignLeft(); setCurrentAlign('left'); }} 
              icon={AlignLeft} 
              title="Align Left" 
              disabled={isEncrypted}
              active={currentAlign === 'left'}
            />
            <ToolbarButton 
              onClick={() => { onAlignCenter(); setCurrentAlign('center'); }} 
              icon={AlignCenter} 
              title="Align Center" 
              disabled={isEncrypted}
              active={currentAlign === 'center'}
            />
            <ToolbarButton 
              onClick={() => { onAlignRight(); setCurrentAlign('right'); }} 
              icon={AlignRight} 
              title="Align Right" 
              disabled={isEncrypted}
              active={currentAlign === 'right'}
            />
          </div>

          <select
            value={currentFontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            disabled={isEncrypted}
            className="px-3 py-1.5 text-sm bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-lg hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 font-medium cursor-pointer"
          >
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="huge">Huge</option>
          </select>

          <div className="flex items-center gap-2 pl-3 border-l border-[#E5E5E5] dark:border-[#262626]">
            <button
              onClick={onTranslate}
              disabled={isEncrypted}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm active:scale-95 ${
                isEncrypted ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#A3A3A3] opacity-40' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              }`}
            >
              <Languages size={18} />
              <span>Translate</span>
            </button>
            <ToolbarButton onClick={onTogglePin} icon={Pin} title={isPinned ? 'Unpin' : 'Pin'} active={isPinned} />
            <ToolbarButton onClick={onToggleEncryption} icon={isEncrypted ? Lock : Unlock} title={isEncrypted ? 'Decrypt' : 'Encrypt'} className={isEncrypted ? 'bg-amber-500/10 text-amber-600' : ''} />
            <ToolbarButton onClick={onDelete} icon={Trash2} title="Delete" className="hover:bg-red-500/10 hover:text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Font Size Dropdown
const FontSizeDropdown = ({ currentFontSize, showMenu, onToggle, onSelect, isEncrypted, number }) => (
  <div className="relative">
    <button
      onClick={() => !isEncrypted && onToggle()}
      disabled={isEncrypted}
      className={`h-9 px-2 rounded-lg transition-all flex items-center gap-0.5 active:scale-95 ${
        isEncrypted ? 'opacity-40 bg-[#F5F5F5] dark:bg-[#1A1A1A]' : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
      <span className="text-[10px] font-bold min-w-[14px]">{number}</span>
      <ChevronDown size={10} />
    </button>

    {showMenu && !isEncrypted && (
      <>
        <div className="fixed inset-0 z-10" onClick={onToggle} />
        <div className="absolute left-0 top-full mt-1 bg-white dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
          {[
            { size: 'small', label: 'Small', icon: 'text-xs' },
            { size: 'normal', label: 'Normal', icon: 'text-sm' },
            { size: 'large', label: 'Large', icon: 'text-base' },
            { size: 'huge', label: 'Huge', icon: 'text-lg' }
          ].map(({ size, label, icon }) => {
            const isActive = currentFontSize === size;
            return (
              <button
                key={size}
                onClick={() => onSelect(size)}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-sm transition-colors ${
                  isActive ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6366F1] font-bold' : ''
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={icon}>A</span>
                  <span>{label}</span>
                </span>
                {isActive && <span className="text-[#6366F1]">✓</span>}
              </button>
            );
          })}
        </div>
      </>
    )}
  </div>
);

export default Toolbar;
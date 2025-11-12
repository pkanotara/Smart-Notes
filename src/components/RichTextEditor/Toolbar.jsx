import React from 'react';
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Lock, Unlock, Pin, Trash2
} from 'lucide-react';

const Toolbar = ({
  onBold, onItalic, onUnderline,
  onAlignLeft, onAlignCenter, onAlignRight,
  onFontSizeChange,
  onToggleEncryption, onTogglePin, onDelete,
  isEncrypted, isPinned,
  currentFontSize = 'normal'
}) => {
  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    onFontSizeChange(size);
  };

  return (
    <div className="border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/50 dark:bg-[#0F0F0F]/50 backdrop-blur-xl">
      {/* Mobile: Compact layout */}
      <div className="md:hidden px-3 py-2.5 space-y-2">
        {/* Row 1: Text formatting */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={onBold}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
            title="Bold"
            disabled={isEncrypted}
          >
            <Bold size={16} className={isEncrypted ? 'opacity-40' : ''} />
          </button>
          <button
            onClick={onItalic}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
            title="Italic"
            disabled={isEncrypted}
          >
            <Italic size={16} className={isEncrypted ? 'opacity-40' : ''} />
          </button>
          <button
            onClick={onUnderline}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
            title="Underline"
            disabled={isEncrypted}
          >
            <Underline size={16} className={isEncrypted ? 'opacity-40' : ''} />
          </button>

          <div className="w-px h-6 bg-[#E5E5E5] dark:bg-[#262626] mx-1"></div>

          <button
            onClick={onAlignLeft}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
            title="Align Left"
            disabled={isEncrypted}
          >
            <AlignLeft size={16} className={isEncrypted ? 'opacity-40' : ''} />
          </button>
          <button
            onClick={onAlignCenter}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
            title="Align Center"
            disabled={isEncrypted}
          >
            <AlignCenter size={16} className={isEncrypted ? 'opacity-40' : ''} />
          </button>
          <button
            onClick={onAlignRight}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
            title="Align Right"
            disabled={isEncrypted}
          >
            <AlignRight size={16} className={isEncrypted ? 'opacity-40' : ''} />
          </button>

          <select
            value={currentFontSize}
            onChange={handleFontSizeChange}
            disabled={isEncrypted}
            className="ml-auto px-2.5 py-1.5 text-xs bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#171717] transition-colors disabled:opacity-40 text-[#171717] dark:text-[#E5E5E5] font-medium cursor-pointer"
          >
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="huge">Huge</option>
          </select>
        </div>

        {/* Row 2: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`p-2 rounded-lg transition-all ${
              isPinned
                ? 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20 text-[#6366F1]'
                : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
            }`}
            title={isPinned ? 'Unpin' : 'Pin'}
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
            title={isEncrypted ? 'Decrypt' : 'Encrypt'}
          >
            {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all text-[#171717] dark:text-[#E5E5E5]"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Desktop: Original layout */}
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
              onClick={onAlignLeft}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
              title="Align Left"
              disabled={isEncrypted}
            >
              <AlignLeft size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
            <button
              onClick={onAlignCenter}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
              title="Align Center"
              disabled={isEncrypted}
            >
              <AlignCenter size={16} className={isEncrypted ? 'opacity-40' : ''} />
            </button>
            <button
              onClick={onAlignRight}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors text-[#171717] dark:text-[#E5E5E5]"
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
          <div className="flex items-center gap-1 pl-3 border-l border-[#E5E5E5] dark:border-[#262626]">
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
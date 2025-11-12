import React from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Type, Palette, Sparkles, Lock, Pin, Save, Trash2
} from 'lucide-react';

const Toolbar = ({
  onBold, onItalic, onUnderline,
  onAlignLeft, onAlignCenter, onAlignRight,
  onFontSizeChange, onColorChange,
  onAISummary, onAITags, onGlossary, onGrammarCheck, onTranslate,
  onToggleEncryption, onTogglePin, onSave, onDelete,
  isEncrypted, isPinned
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-2 items-center sticky top-0 z-10 shadow-sm">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r pr-2">
        <ToolbarButton onClick={onBold} title="Bold (Ctrl+B)">
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onItalic} title="Italic (Ctrl+I)">
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onUnderline} title="Underline (Ctrl+U)">
          <Underline size={18} />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r pr-2">
        <ToolbarButton onClick={onAlignLeft} title="Align Left">
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onAlignCenter} title="Align Center">
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onAlignRight} title="Align Right">
          <AlignRight size={18} />
        </ToolbarButton>
      </div>

      {/* Font Size */}
      <div className="border-r pr-2">
        <select
          onChange={(e) => onFontSizeChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          title="Font Size"
        >
          <option value="1">Small</option>
          <option value="3" defaultValue>Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
      </div>

      {/* AI Features */}
      <div className="flex gap-1 border-r pr-2">
        <ToolbarButton 
          onClick={onAISummary} 
          title="AI Summary (works on selection or full note)" 
          className="text-purple-600 hover:bg-purple-50"
        >
          <Sparkles size={18} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={onAITags} 
          title="Suggest Tags (works on selection or full note)" 
          className="text-purple-600 hover:bg-purple-50 font-bold"
        >
          #
        </ToolbarButton>
        <ToolbarButton 
          onClick={onGlossary} 
          title="Highlight Key Terms (works on selection or full note)" 
          className="text-purple-600 hover:bg-purple-50"
        >
          <Type size={18} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={onGrammarCheck} 
          title="Grammar Check (works on selection or full note)" 
          className="text-purple-600 hover:bg-purple-50 font-bold"
        >
          ✓
        </ToolbarButton>
      </div>

      {/* Note Actions */}
      <div className="flex gap-1 ml-auto">
        <ToolbarButton
          onClick={onTogglePin}
          title={isPinned ? "Unpin Note" : "Pin Note"}
          className={isPinned ? "text-primary-600 bg-primary-50" : "hover:bg-gray-100"}
        >
          <Pin size={18} fill={isPinned ? "currentColor" : "none"} />
        </ToolbarButton>
        <ToolbarButton
          onClick={onToggleEncryption}
          title={isEncrypted ? "Decrypt Note" : "Encrypt Note"}
          className={isEncrypted ? "text-green-600 bg-green-50" : "hover:bg-gray-100"}
        >
          <Lock size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onDelete} title="Delete Note" className="text-red-600 hover:bg-red-50">
          <Trash2 size={18} />
        </ToolbarButton>
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, title, children, className = "" }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded transition-colors ${className}`}
  >
    {children}
  </button>
);

export default Toolbar;
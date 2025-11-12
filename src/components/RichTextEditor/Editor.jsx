import React, { useRef, useEffect, useState } from 'react';
import Toolbar from './Toolbar';
import {
  formatBold, formatItalic, formatUnderline,
  alignLeft, alignCenter, alignRight, setFontSize
} from './EditorCommands';
import { Edit2 } from 'lucide-react';

const Editor = ({
  content, onChange, onSave, onDelete,
  onAISummary, onAITags, onGlossary, onGrammarCheck,
  onToggleEncryption, onTogglePin,
  isEncrypted, isPinned, glossaryTerms, noteId,
  title, onTitleChange
}) => {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const [selectionInfo, setSelectionInfo] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const isUpdatingRef = useRef(false);
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    setLocalTitle(title);
  }, [title, noteId]);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current && !isEncrypted && !isHighlighting) {
      const currentHTML = editorRef.current.innerHTML;
      
      if (currentHTML !== content) {
        console.log('📝 Updating editor content for note:', noteId);
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, noteId, isEncrypted, isHighlighting]);

  useEffect(() => {
    if (glossaryTerms && glossaryTerms.length > 0 && !isEncrypted) {
      highlightGlossaryTerms();
    }
  }, [glossaryTerms, isEncrypted]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (isEncrypted) {
        setSelectionInfo('');
        return;
      }
      
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && selectedText.length > 0) {
        setSelectionInfo(`${selectedText.length} characters selected`);
      } else {
        setSelectionInfo('');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isEncrypted]);

  const handleInput = (e) => {
    if (isEncrypted) return;
    
    isUpdatingRef.current = true;
    const newContent = e.target.innerHTML;
    onChange(newContent);
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
        titleRef.current.select();
      }
    }, 0);
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const newTitle = localTitle.trim() || 'Untitled Note';
    setLocalTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setLocalTitle(title);
      setIsEditingTitle(false);
    }
  };

  const highlightGlossaryTerms = () => {
    if (!editorRef.current || !glossaryTerms || isEncrypted) return;

    setIsHighlighting(true);
    
    try {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      let html = editorRef.current.innerHTML;
      
      glossaryTerms.forEach(({ term, definition }) => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![<>])\\b(${escapedTerm})\\b(?![^<]*>)`, 'gi');
        
        html = html.replace(regex, (match) => {
          if (html.includes(`glossary-highlight" data-definition="${definition}">${match}`)) {
            return match;
          }
          return `<span class="glossary-highlight" data-definition="${definition}" title="${definition}">${match}</span>`;
        });
      });

      editorRef.current.innerHTML = html;
      
      if (range) {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Ignore
        }
      }
    } catch (error) {
      console.error('Error highlighting glossary terms:', error);
    } finally {
      setTimeout(() => {
        setIsHighlighting(false);
      }, 100);
    }
  };

  const handleMouseOver = (e) => {
    if (e.target.classList.contains('glossary-highlight')) {
      const definition = e.target.getAttribute('data-definition');
      if (definition) {
        e.target.setAttribute('title', definition);
      }
    }
  };

  const getWordCount = () => {
    if (isEncrypted) {
      return '🔒 Encrypted content';
    }
    
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    return `${words} words, ${text.length} characters`;
  };

  // ✅ TITLE BAR COMPONENT
  const TitleBar = () => (
    <div className="border-b border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        {isEditingTitle ? (
          <input
            ref={titleRef}
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold text-gray-800 bg-white border-2 border-primary-500 rounded px-2 py-1 flex-1 mr-2 outline-none"
            placeholder="Note title..."
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-800 flex-1 cursor-pointer hover:text-primary-600 transition-colors" onClick={handleTitleEdit}>
            {localTitle}
          </h2>
        )}
        <button
          onClick={handleTitleEdit}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Edit title"
        >
          <Edit2 size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );

  // ✅ TOOLBAR COMPONENT
  const ToolbarComponent = () => (
    <Toolbar
      onBold={formatBold}
      onItalic={formatItalic}
      onUnderline={formatUnderline}
      onAlignLeft={alignLeft}
      onAlignCenter={alignCenter}
      onAlignRight={alignRight}
      onFontSizeChange={setFontSize}
      onAISummary={onAISummary}
      onAITags={onAITags}
      onGlossary={onGlossary}
      onGrammarCheck={onGrammarCheck}
      onToggleEncryption={onToggleEncryption}
      onTogglePin={onTogglePin}
      onSave={onSave}
      onDelete={onDelete}
      isEncrypted={isEncrypted}
      isPinned={isPinned}
    />
  );

  // ✅ ENCRYPTED VIEW - ABSOLUTELY NO EDITOR CONTENT
  if (isEncrypted) {
    console.log('🔒 Rendering ENCRYPTED view - no content should exist');
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
        <TitleBar />
        <ToolbarComponent />
        
        {/* FULL HEIGHT LOCK SCREEN */}
        <div 
          className="flex-1 flex items-center justify-center p-6"
          style={{
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            minHeight: '400px'
          }}
        >
          <div className="text-center text-gray-600 max-w-md w-full">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-all duration-300">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              This note is encrypted
            </h3>
            
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              Click the <span className="inline-flex items-center mx-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span> lock icon in the toolbar to decrypt and view the content
            </p>
            
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🔐</span>
                <p className="font-semibold text-gray-800">Your content is secure</p>
              </div>
              <p className="text-sm text-gray-500">Protected with AES-256 encryption</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
          <span>🔒 Encrypted content</span>
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Encrypted
          </span>
        </div>
      </div>
    );
  }

  // ✅ NORMAL VIEW - EDITOR ONLY WHEN NOT ENCRYPTED
  console.log('📝 Rendering NORMAL view - editor content exists');
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <TitleBar />
      <ToolbarComponent />
      
      {selectionInfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700">
          ✓ {selectionInfo} - AI features will analyze selected text
        </div>
      )}
      
      {/* EDITOR - ONLY RENDERED WHEN NOT ENCRYPTED */}
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onMouseOver={handleMouseOver}
        className="flex-1 p-6 outline-none overflow-auto prose max-w-none focus:ring-2 focus:ring-primary-200"
        style={{ minHeight: '400px' }}
        suppressContentEditableWarning
      />
      
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
        <span>{getWordCount()}</span>
        {isPinned && (
          <span className="flex items-center gap-1 text-primary-600 font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
            Pinned
          </span>
        )}
      </div>
    </div>
  );
};

export default Editor;
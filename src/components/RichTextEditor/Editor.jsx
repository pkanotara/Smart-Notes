import React, { useRef, useEffect, useState } from "react";
import Toolbar from "./Toolbar";
import AIFloatingMenu from "../AIFloatingMenu/AIFloatingMenu";
import {
  formatBold,
  formatItalic,
  formatUnderline,
  alignLeft,
  alignCenter,
  alignRight,
} from "./EditorCommands";
import { Edit2, CheckCircle, Clock, User, Unlock } from "lucide-react";
import { storageService } from "../../services/storageService";

const Editor = ({
  content,
  onChange,
  onDelete,
  onAISummary,
  onAITags,
  onGlossary,
  onGrammarCheck,
  onToggleEncryption,
  onTogglePin,
  onTranslate,
  isEncrypted,
  isPinned,
  glossaryTerms = [],
  noteId,
  title,
  onTitleChange,
  grammarErrors = [],
  onFixGrammarError,
  createdAt,
  updatedAt,
  createdBy,
  updateNote,
}) => {
  // References to DOM elements
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Component state
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("normal");
  const [selectionInfo, setSelectionInfo] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showTimestampTooltip, setShowTimestampTooltip] = useState(false);

  // Helper: Remove highlight spans from HTML
  const stripHighlights = (html = "") =>
    html
      .replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1")
      .replace(/<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi, "$1");

  // Helper: Escape special regex characters
  const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Helper: Calculate word count
  const getWordCount = () => {
    if (isEncrypted) return "🔒 Encrypted";
    const div = document.createElement("div");
    div.innerHTML = content || "";
    const text = div.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return `${words} words · ${text.length} characters`;
  };

  // Sync title when it changes from outside
  useEffect(() => {
    setLocalTitle(title);
  }, [title, noteId]);

  // Initialize editor with content
  useEffect(() => {
    if (!editorRef.current || isEncrypted) return;

    // Set initial content when note changes
    if (content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
      isInitializedRef.current = true;
    }
  }, [noteId, content, isEncrypted]);

  // Load saved font size
  useEffect(() => {
    const notes = storageService.loadNotes();
    const note = notes.find((n) => n.id === noteId);
    const size = note?.fontSize || "normal";
    setCurrentFontSize(size);
    
    if (editorRef.current) {
      editorRef.current.className = `px-4 sm:px-6 py-4 sm:py-6 outline-none prose min-h-[200px] sm:min-h-[300px] bg-white dark:bg-[#0A0A0A] font-size-${size}`;
    }
  }, [noteId]);

  // Highlight glossary terms
  useEffect(() => {
    if (!glossaryTerms?.length || isEncrypted || !editorRef.current) return;

    let html = editorRef.current.innerHTML;
    
    // Don't highlight if content is empty
    if (!html || html === '<br>' || html === '<p><br></p>') return;
    
    html = stripHighlights(html);

    glossaryTerms.forEach(({ term, definition }) => {
      if (!term) return;
      const regex = new RegExp(`\\b(${escapeRegex(term)})\\b(?![^<]*>)`, "gi");
      const safeDef = (definition || "").replace(/"/g, "&quot;");
      html = html.replace(regex, (match) => 
        `<span class="glossary-highlight" title="${safeDef}">${match}</span>`
      );
    });

    editorRef.current.innerHTML = html;
  }, [glossaryTerms, isEncrypted]);

  // Highlight grammar errors
  useEffect(() => {
    if (!grammarErrors.length || isEncrypted || !editorRef.current) return;

    let html = editorRef.current.innerHTML;
    
    // Don't highlight if content is empty
    if (!html || html === '<br>' || html === '<p><br></p>') return;
    
    html = stripHighlights(html);

    const sorted = [...grammarErrors]
      .filter(item => item?.error)
      .sort((a, b) => b.error.length - a.error.length);

    sorted.forEach(({ error, suggestion }) => {
      if (!error) return;
      const regex = new RegExp(`(${escapeRegex(error)})(?![^<]*>)`, "gi");
      const safeError = error.replace(/"/g, "&quot;");
      const safeSuggestion = (suggestion || "").replace(/"/g, "&quot;");
      html = html.replace(regex, (match) =>
        `<span class="grammar-error" data-error="${safeError}" data-suggestion="${safeSuggestion}">${match}</span>`
      );
    });

    editorRef.current.innerHTML = html;
  }, [grammarErrors, isEncrypted]);

  // Show grammar error tooltip on click
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !grammarErrors.length) return;

    const handleClick = (e) => {
      if (e.target?.classList?.contains("grammar-error")) {
        const error = e.target.getAttribute("data-error");
        const suggestion = e.target.getAttribute("data-suggestion");
        const rect = e.target.getBoundingClientRect();
        setActiveTooltip({
          error,
          suggestion,
          position: { x: rect.left + rect.width / 2, y: rect.top },
        });
      }
    };

    editor.addEventListener("click", handleClick);
    return () => editor.removeEventListener("click", handleClick);
  }, [grammarErrors]);

  // Track text selection
  useEffect(() => {
    const handleSelection = () => {
      if (isEncrypted) return;
      const text = window.getSelection()?.toString().trim();
      setSelectionInfo(text ? `${text.length} characters selected` : "");
    };
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [isEncrypted]);

  // Handlers
  const handleInput = (e) => {
    if (isEncrypted) return;
    const newContent = e.target.innerHTML;
    onChange(stripHighlights(newContent));
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    const newTitle = localTitle.trim() || "Untitled Note";
    setLocalTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === "Escape") {
      setLocalTitle(title);
      setIsEditingTitle(false);
    }
  };

  const handleFontSizeChange = (size) => {
    setCurrentFontSize(size);
    updateNote?.({ fontSize: size });
    if (editorRef.current) {
      editorRef.current.className = `px-4 sm:px-6 py-4 sm:py-6 outline-none prose min-h-[200px] sm:min-h-[300px] bg-white dark:bg-[#0A0A0A] font-size-${size}`;
    }
  };

  const handleFixError = () => {
    if (!activeTooltip) return;
    onFixGrammarError(activeTooltip.error, activeTooltip.suggestion);
    setActiveTooltip(null);
  };

  // If encrypted, show locked view
  if (isEncrypted) {
    return (
      <div className="flex flex-col h-full card">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] truncate">{localTitle}</h2>
        </div>

        <Toolbar
          onBold={() => {}}
          onItalic={() => {}}
          onUnderline={() => {}}
          onAlignLeft={() => {}}
          onAlignCenter={() => {}}
          onAlignRight={() => {}}
          onFontSizeChange={() => {}}
          onToggleEncryption={onToggleEncryption}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onTranslate={() => {}}
          isEncrypted={true}
          isPinned={isPinned}
          currentFontSize={currentFontSize}
        />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-11 h-11 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">This note is encrypted</h3>
            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mb-4 sm:mb-6">Enter your password to unlock</p>
            <button
              onClick={onToggleEncryption}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm sm:text-base font-bold rounded-2xl shadow-2xl"
            >
              <Unlock size={20} />
              Unlock Note
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs flex justify-between">
          <span>🔒 Encrypted</span>
          <span className="text-green-600 font-semibold">Protected</span>
        </div>
      </div>
    );
  }

  // Normal editor view
  return (
    <div className="flex flex-col h-full card relative">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F]">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          {isEditingTitle ? (
            <input
              ref={titleRef}
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 text-xl sm:text-2xl font-bold bg-transparent outline-none text-[#171717] dark:text-[#FAFAFA]"
              placeholder="Untitled"
            />
          ) : (
            <h2
              onClick={handleTitleEdit}
              className="flex-1 text-xl sm:text-2xl font-bold cursor-text hover:text-[#525252] dark:hover:text-[#D4D4D4] transition-colors truncate"
            >
              {localTitle}
            </h2>
          )}
          <button onClick={handleTitleEdit} className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors hidden sm:block">
            <Edit2 size={16} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#A3A3A3] dark:text-[#525252]">
          <div
            className="flex items-center gap-1.5 cursor-help relative"
            onMouseEnter={() => setShowTimestampTooltip(true)}
            onMouseLeave={() => setShowTimestampTooltip(false)}
          >
            <Clock size={12} />
            <span>{storageService.formatTimestamp(updatedAt)}</span>
            {showTimestampTooltip && (
              <div className="absolute bottom-full left-0 mb-2 bg-[#171717] dark:bg-[#FAFAFA] text-white dark:text-[#171717] px-3 py-2 rounded-lg shadow-xl z-10 whitespace-nowrap">
                <div className="space-y-1">
                  <div><strong>Created:</strong> {storageService.getFullTimestamp(createdAt)}</div>
                  <div><strong>Modified:</strong> {storageService.getFullTimestamp(updatedAt)}</div>
                </div>
              </div>
            )}
          </div>
          {createdBy && (
            <div className="flex items-center gap-1.5">
              <User size={12} />
              <span>@{createdBy}</span>
            </div>
          )}
        </div>
      </div>

      <Toolbar
        onBold={formatBold}
        onItalic={formatItalic}
        onUnderline={formatUnderline}
        onAlignLeft={alignLeft}
        onAlignCenter={alignCenter}
        onAlignRight={alignRight}
        onFontSizeChange={handleFontSizeChange}
        onToggleEncryption={onToggleEncryption}
        onTogglePin={onTogglePin}
        onDelete={onDelete}
        onTranslate={onTranslate}
        isEncrypted={false}
        isPinned={isPinned}
        currentFontSize={currentFontSize}
      />

      {selectionInfo && (
        <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#6366F1]/5 border-b border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#6366F1] font-semibold">
          ✓ {selectionInfo}
        </div>
      )}

      {grammarErrors.length > 0 && (
        <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/20 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={12} className="text-amber-600" />
          <span className="text-amber-800 dark:text-amber-400">
            {grammarErrors.length} {grammarErrors.length === 1 ? "error" : "errors"}
          </span>
          <span className="hidden sm:inline text-amber-600">• Click to fix</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable={true}
          onInput={handleInput}
          className={`px-4 sm:px-6 py-4 sm:py-6 outline-none prose min-h-[200px] sm:min-h-[300px] bg-white dark:bg-[#0A0A0A] font-size-${currentFontSize}`}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {activeTooltip && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setActiveTooltip(null)} />
          <div
            className="fixed z-50 bg-white dark:bg-[#171717] border-2 border-[#6366F1] rounded-xl shadow-2xl p-3 sm:p-4"
            style={{
              left: `${activeTooltip.position.x}px`,
              top: `${activeTooltip.position.y}px`,
              transform: "translate(-50%, calc(-100% - 10px))",
              maxWidth: "90vw",
              width: "280px",
            }}
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold text-sm">✕</span>
                <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{activeTooltip.error}</p>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <span className="text-green-500 font-bold text-sm">✓</span>
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold">{activeTooltip.suggestion}</p>
              </div>
              <button
                onClick={handleFixError}
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#6366F1] text-white text-xs font-bold rounded-lg shadow-lg"
              >
                <CheckCircle size={14} />
                Fix This Error
              </button>
            </div>
          </div>
        </>
      )}

      <div className="px-4 sm:px-6 py-2 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#A3A3A3] dark:text-[#525252] flex justify-between items-center">
        <span className="truncate">{getWordCount()}</span>
        {isPinned && (
          <span className="text-[#6366F1] font-semibold flex items-center gap-1 flex-shrink-0 ml-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
            <span className="hidden sm:inline">Pinned</span>
          </span>
        )}
      </div>

      {!isEncrypted && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 sm:z-40">
          <AIFloatingMenu
            onAISummary={onAISummary}
            onAITags={onAITags}
            onGlossary={onGlossary}
            onGrammarCheck={onGrammarCheck}
            isEncrypted={false}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
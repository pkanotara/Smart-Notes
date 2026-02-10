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
  // ==================== REFS ====================
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(content);
  const isUpdatingRef = useRef(false);
  const hideTimeoutRef = useRef(null);

  // ==================== STATE ====================
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("normal");
  const [selectionInfo, setSelectionInfo] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showTimestampTooltip, setShowTimestampTooltip] = useState(false);

  // ==================== HELPERS ====================
  const stripHighlights = (html = "") =>
    html
      .replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1")
      .replace(/<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi, "$1");

  const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const getWordCount = () => {
    if (isEncrypted) return "🔒 Encrypted";
    const div = document.createElement("div");
    div.innerHTML = content || "";
    const text = div.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return `${words} words · ${chars} characters`;
  };

  // ==================== EFFECTS ====================
  // Sync title
  useEffect(() => {
    setLocalTitle(title);
  }, [title, noteId]);

  // Load font size
  useEffect(() => {
    const notes = storageService.loadNotes();
    const activeNote = notes.find((n) => n.id === noteId);
    const savedFontSize = activeNote?.fontSize || "normal";
    setCurrentFontSize(savedFontSize);

    if (editorRef.current) {
      editorRef.current.className = editorRef.current.className.replace(/font-size-\w+/g, "");
      editorRef.current.classList.add(`font-size-${savedFontSize}`);
    }
  }, [noteId]);

  // Sync content
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current || isEncrypted) return;

    const currentHTML = editorRef.current.innerHTML;
    if (grammarErrors.length > 0 || glossaryTerms.length > 0) {
      if (!currentHTML || currentHTML === "<p><br></p>") {
        editorRef.current.innerHTML = content;
      }
      return;
    }

    const cleanCurrent = stripHighlights(currentHTML);
    const cleanContent = stripHighlights(content);

    if (cleanContent && cleanContent !== cleanCurrent) {
      editorRef.current.innerHTML = content;
    }
  }, [content, noteId, isEncrypted, grammarErrors.length, glossaryTerms.length]);

  // Glossary highlighting
  useEffect(() => {
    if (glossaryTerms?.length > 0 && !isEncrypted && editorRef.current) {
      highlightGlossary();
    } else if (glossaryTerms?.length === 0 && editorRef.current) {
      removeHighlights("glossary-highlight");
    }
  }, [glossaryTerms, isEncrypted]);

  // Grammar highlighting
  useEffect(() => {
    if (grammarErrors.length > 0 && !isEncrypted && editorRef.current) {
      highlightGrammar();
    } else if (grammarErrors.length === 0 && editorRef.current) {
      removeHighlights("grammar-error");
    }
  }, [grammarErrors, isEncrypted]);

  // Grammar tooltip interactions
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || grammarErrors.length === 0) return;

    const handleInteraction = (e) => {
      const target = e.target;
      if (target?.classList?.contains("grammar-error")) {
        e.stopPropagation();
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        
        const error = target.getAttribute("data-error");
        const suggestion = target.getAttribute("data-suggestion");
        if (error && suggestion) {
          const rect = target.getBoundingClientRect();
          setActiveTooltip({
            error,
            suggestion,
            position: { x: rect.left + rect.width / 2, y: rect.top },
          });
        }
      }
    };

    const handleMouseOut = (e) => {
      if (e.target?.classList?.contains("grammar-error") && window.innerWidth > 768) {
        hideTimeoutRef.current = setTimeout(() => setActiveTooltip(null), 300);
      }
    };

    editor.addEventListener("mouseover", handleInteraction);
    editor.addEventListener("click", handleInteraction);
    editor.addEventListener("mouseout", handleMouseOut);

    return () => {
      editor.removeEventListener("mouseover", handleInteraction);
      editor.removeEventListener("click", handleInteraction);
      editor.removeEventListener("mouseout", handleMouseOut);
    };
  }, [grammarErrors]);

  // Close tooltip on outside click
  useEffect(() => {
    if (!activeTooltip) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".grammar-error") && !e.target.closest(".fixed.z-50")) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeTooltip]);

  // Selection tracking
  useEffect(() => {
    const handleSelectionChange = () => {
      if (isEncrypted) {
        setSelectionInfo("");
        return;
      }
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && selectedText.length > 0) {
        setSelectionInfo(`${selectedText.length} characters selected`);
      } else {
        setSelectionInfo("");
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isEncrypted]);

  // ==================== HIGHLIGHTING ====================
  const highlightGlossary = () => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML || content || "";
    html = stripHighlights(html);

    glossaryTerms.forEach(({ term = "", definition = "" }) => {
      if (!term) return;
      const regex = new RegExp(`\\b(${escapeRegex(term)})\\b(?![^<]*>)`, "gi");
      html = html.replace(regex, (match) => {
        const safeDef = (definition || "").replace(/"/g, "&quot;");
        return `<span class="glossary-highlight" data-definition="${safeDef}" title="${safeDef}">${match}</span>`;
      });
    });

    editorRef.current.innerHTML = html;
    contentRef.current = html;
  };

  const highlightGrammar = () => {
    if (!editorRef.current || grammarErrors.length === 0) return;
    let html = editorRef.current.innerHTML || content || "";
    html = stripHighlights(html);

    const sorted = [...grammarErrors]
      .filter(item => item?.error?.length > 0)
      .sort((a, b) => b.error.length - a.error.length);

    sorted.forEach(({ error = "", suggestion = "" }) => {
      if (!error) return;
      const regex = new RegExp(`(${escapeRegex(error)})(?![^<]*>)`, "gi");
      html = html.replace(regex, (match) => {
        const safeError = error.replace(/"/g, "&quot;");
        const safeSuggestion = (suggestion || "").replace(/"/g, "&quot;");
        return `<span class="grammar-error" data-error="${safeError}" data-suggestion="${safeSuggestion}">${match}</span>`;
      });
    });

    editorRef.current.innerHTML = html;
    contentRef.current = html;
  };

  const removeHighlights = (className) => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;
    html = html.replace(new RegExp(`<span class="${className}"[^>]*>(.*?)<\\/span>`, "gi"), "$1");
    editorRef.current.innerHTML = html;
    contentRef.current = html;
  };

  // ==================== HANDLERS ====================
  const handleInput = (e) => {
    if (isEncrypted) return;
    isUpdatingRef.current = true;
    const newContent = e.target.innerHTML;
    contentRef.current = newContent;
    onChange(stripHighlights(newContent));
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
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

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const newTitle = (localTitle || "").trim() || "Untitled Note";
    setLocalTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setLocalTitle(title);
      setIsEditingTitle(false);
    }
  };

  const handleFontSizeChange = (size) => {
    setCurrentFontSize(size);
    if (updateNote) updateNote({ fontSize: size });
    if (editorRef.current) {
      editorRef.current.className = editorRef.current.className.replace(/font-size-\w+/g, "");
      editorRef.current.classList.add(`font-size-${size}`);
    }
  };

  const handleFixError = () => {
    if (!activeTooltip || !onFixGrammarError) return;
    onFixGrammarError(activeTooltip.error, activeTooltip.suggestion);
    removeHighlights("grammar-error");
    setActiveTooltip(null);
  };

  // ==================== ENCRYPTED VIEW ====================
  if (isEncrypted) {
    return (
      <div className="flex flex-col h-full min-h-0 card animate-fade-in">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] truncate" title={localTitle}>
            {localTitle}
          </h2>
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
          isEncrypted={isEncrypted}
          isPinned={isPinned}
          currentFontSize={currentFontSize}
        />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 min-h-0 overflow-auto">
          <div className="text-center max-w-md animate-slide-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-11 h-11 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] mb-2 sm:mb-3">
              This note is encrypted
            </h3>

            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mb-4 sm:mb-6 leading-relaxed px-4">
              Enter your password to unlock and view this note
            </p>

            <button
              onClick={onToggleEncryption}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm sm:text-base font-bold rounded-2xl transition-all shadow-2xl active:scale-[0.98] mb-4 sm:mb-6"
            >
              <Unlock size={20} />
              <span>Unlock Note</span>
            </button>

            <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-3 sm:p-4">
              <p className="text-xs font-bold text-[#171717] dark:text-[#FAFAFA] mb-1">🔒 Password Protected</p>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">Your content stays secure</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#A3A3A3] dark:text-[#525252] flex justify-between items-center font-medium flex-shrink-0">
          <span>🔒 Encrypted</span>
          <span className="text-green-600 dark:text-green-500 font-semibold">Protected</span>
        </div>
      </div>
    );
  }

  // ==================== NORMAL EDITOR VIEW ====================
  return (
    <div className="flex flex-col h-full min-h-0 card animate-fade-in relative">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F] flex-shrink-0">
        <div className="flex flex-col gap-2">
          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="flex-1 text-xl sm:text-2xl md:text-3xl font-bold bg-transparent border-none outline-none text-[#171717] dark:text-[#FAFAFA] min-w-0"
                placeholder="Untitled"
              />
            ) : (
              <h2
                onClick={handleTitleEdit}
                className="flex-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] cursor-text hover:text-[#525252] dark:hover:text-[#D4D4D4] transition-colors truncate min-w-0"
                title={localTitle}
              >
                {localTitle}
              </h2>
            )}

            <button onClick={handleTitleEdit} className="btn-icon flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity hidden sm:block" title="Edit title">
              <Edit2 size={16} />
            </button>
          </div>

          {/* Metadata */}
          <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs text-[#A3A3A3] dark:text-[#525252] font-medium">
            <div
              className="flex items-center gap-1.5 relative cursor-help"
              onMouseEnter={() => setShowTimestampTooltip(true)}
              onMouseLeave={() => setShowTimestampTooltip(false)}
            >
              <Clock size={12} />
              <span>{storageService.formatTimestamp(updatedAt)}</span>

              {showTimestampTooltip && (
                <div className="hidden md:block absolute bottom-full left-0 mb-2 bg-[#171717] dark:bg-[#FAFAFA] text-white dark:text-[#171717] px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl z-10">
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
      </div>

      {/* Toolbar */}
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
        isEncrypted={isEncrypted}
        isPinned={isPinned}
        currentFontSize={currentFontSize}
      />

      {/* Selection Info */}
      {selectionInfo && (
        <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#6366F1]/5 dark:bg-[#6366F1]/10 border-b border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#6366F1] font-semibold flex-shrink-0">
          ✓ {selectionInfo}
        </div>
      )}

      {/* Grammar Banner */}
      {grammarErrors.length > 0 && (
        <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/20 text-xs font-semibold flex items-center gap-2 flex-shrink-0">
          <CheckCircle size={12} className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <span className="text-amber-800 dark:text-amber-400">
            {grammarErrors.length} {grammarErrors.length === 1 ? "error" : "errors"}
          </span>
          <span className="hidden sm:inline text-amber-600 dark:text-amber-500">• Click to fix</span>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div
          ref={editorRef}
          contentEditable={true}
          onInput={handleInput}
          className={`px-4 sm:px-6 py-4 sm:py-6 outline-none prose min-h-[200px] sm:min-h-[300px] bg-white dark:bg-[#0A0A0A] font-size-${currentFontSize}`}
          suppressContentEditableWarning
        />
      </div>

      {/* Grammar Tooltip */}
      {activeTooltip && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setActiveTooltip(null)} />

          <div
            className="fixed z-50 bg-white dark:bg-[#171717] border-2 border-[#6366F1] rounded-xl shadow-2xl p-3 sm:p-4 pointer-events-auto"
            style={{
              left: `${activeTooltip.position.x}px`,
              top: `${activeTooltip.position.y}px`,
              transform: "translate(-50%, calc(-100% - 10px))",
              maxWidth: "90vw",
              width: "280px",
            }}
            onMouseEnter={() => hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current)}
            onMouseLeave={() => window.innerWidth > 768 && setActiveTooltip(null)}
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold text-sm">✕</span>
                <p className="text-xs text-red-700 dark:text-red-400 font-semibold leading-relaxed">{activeTooltip.error}</p>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <span className="text-green-500 flex-shrink-0 mt-0.5 font-bold text-sm">✓</span>
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold leading-relaxed">{activeTooltip.suggestion}</p>
              </div>
              <button
                onClick={handleFixError}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#6366F1] hover:bg-[#5558E3] text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg"
              >
                <CheckCircle size={14} />
                Fix This Error
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-4 sm:px-6 py-2 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#A3A3A3] dark:text-[#525252] flex justify-between items-center font-medium flex-shrink-0">
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

      {/* AI Floating Menu */}
      {!isEncrypted && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 sm:z-40">
          <AIFloatingMenu
            onAISummary={onAISummary}
            onAITags={onAITags}
            onGlossary={onGlossary}
            onGrammarCheck={onGrammarCheck}
            isEncrypted={isEncrypted}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
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
import { Edit2, CheckCircle, Clock, User, Unlock, History } from "lucide-react";
import { storageService } from "../../services/storageService";

const Editor = ({
  content,
  onChange,
  onSave,
  onDelete,
  onAISummary,
  onAITags,
  onGlossary,
  onGrammarCheck,
  onToggleEncryption,
  onTogglePin,
  onTranslate,
  onShowVersionHistory,
  isEncrypted,
  isPinned,
  glossaryTerms,
  noteId,
  title,
  onTitleChange,
  grammarErrors = [],
  onFixGrammarError,
  createdAt,
  updatedAt,
  createdBy,
  versionCount = 0,
  updateNote,
}) => {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const [selectionInfo, setSelectionInfo] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const isUpdatingRef = useRef(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const hideTimeoutRef = useRef(null);
  const lastGrammarErrorsRef = useRef([]);
  const lastGlossaryTermsRef = useRef([]);
  const contentRef = useRef(content);
  const isHighlightingRef = useRef(false);
  const [showTimestampTooltip, setShowTimestampTooltip] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("normal");

  useEffect(() => {
    setLocalTitle(title);
  }, [title, noteId]);

  useEffect(() => {
    const notes = storageService.loadNotes();
    const activeNote = notes.find((n) => n.id === noteId);
    const savedFontSize = activeNote?.fontSize || "normal";
    setCurrentFontSize(savedFontSize);

    if (editorRef.current) {
      editorRef.current.className = editorRef.current.className.replace(
        /font-size-\w+/g,
        ""
      );
      editorRef.current.classList.add(`font-size-${savedFontSize}`);
    }
  }, [noteId]);

  useEffect(() => {
    if (
      !editorRef.current ||
      isUpdatingRef.current ||
      isEncrypted ||
      isHighlightingRef.current
    )
      return;

    const currentHTML = editorRef.current.innerHTML;

    if (grammarErrors.length > 0 || glossaryTerms.length > 0) {
      if (!currentHTML || currentHTML === "<p><br></p>" || currentHTML === "") {
        editorRef.current.innerHTML = content;
        contentRef.current = content;
      }
      return;
    }

    const cleanCurrent = currentHTML
      .replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1")
      .replace(/<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi, "$1");

    const cleanContent = content
      .replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1")
      .replace(/<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi, "$1");

    if (cleanContent && cleanContent !== cleanCurrent) {
      editorRef.current.innerHTML = content;
      contentRef.current = content;
    }
  }, [content, noteId, isEncrypted]);

  useEffect(() => {
    const termsChanged =
      JSON.stringify(glossaryTerms) !==
      JSON.stringify(lastGlossaryTermsRef.current);

    if (
      glossaryTerms &&
      glossaryTerms.length > 0 &&
      termsChanged &&
      !isEncrypted &&
      editorRef.current
    ) {
      lastGlossaryTermsRef.current = [...glossaryTerms];
      if (grammarErrors.length > 0) {
        lastGrammarErrorsRef.current = [];
      }
      isHighlightingRef.current = true;
      requestAnimationFrame(() => {
        highlightGlossaryTerms();
        setTimeout(() => {
          isHighlightingRef.current = false;
        }, 200);
      });
    } else if (
      glossaryTerms.length === 0 &&
      lastGlossaryTermsRef.current.length > 0
    ) {
      lastGlossaryTermsRef.current = [];
      isHighlightingRef.current = true;
      removeAllGlossaryHighlights();
      setTimeout(() => {
        isHighlightingRef.current = false;
      }, 100);
    }
  }, [glossaryTerms, isEncrypted]);

  useEffect(() => {
    const errorsChanged =
      JSON.stringify(grammarErrors) !==
      JSON.stringify(lastGrammarErrorsRef.current);

    if (
      grammarErrors.length > 0 &&
      errorsChanged &&
      !isEncrypted &&
      editorRef.current
    ) {
      lastGrammarErrorsRef.current = [...grammarErrors];
      if (glossaryTerms.length > 0) {
        lastGlossaryTermsRef.current = [];
      }
      isHighlightingRef.current = true;
      requestAnimationFrame(() => {
        highlightGrammarErrors();
        setTimeout(() => {
          isHighlightingRef.current = false;
        }, 200);
      });
    } else if (
      grammarErrors.length === 0 &&
      lastGrammarErrorsRef.current.length > 0
    ) {
      lastGrammarErrorsRef.current = [];
      isHighlightingRef.current = true;
      removeAllGrammarHighlights();
      setTimeout(() => {
        isHighlightingRef.current = false;
      }, 100);
    }
  }, [grammarErrors, isEncrypted]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || grammarErrors.length === 0) return;

    const handleInteraction = (e) => {
      const target = e.target;
      if (target.classList && target.classList.contains("grammar-error")) {
        e.stopPropagation();
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
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
      const target = e.target;
      if (target.classList && target.classList.contains("grammar-error")) {
        if (window.innerWidth > 768) {
          hideTimeoutRef.current = setTimeout(() => {
            setActiveTooltip(null);
          }, 300);
        }
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

  useEffect(() => {
    if (!activeTooltip) return;
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".grammar-error") &&
        !e.target.closest(".fixed.z-50")
      ) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeTooltip]);

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
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isEncrypted]);

  const handleInput = (e) => {
    if (isEncrypted || isHighlightingRef.current) return;
    isUpdatingRef.current = true;
    const newContent = e.target.innerHTML;
    contentRef.current = newContent;
    const cleanContent = newContent
      .replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1")
      .replace(/<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi, "$1");
    onChange(cleanContent);
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

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const newTitle = localTitle.trim() || "Untitled Note";
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
    if (updateNote) {
      updateNote({ fontSize: size });
    }

    if (editorRef.current) {
      editorRef.current.className = editorRef.current.className.replace(
        /font-size-\w+/g,
        ""
      );
      editorRef.current.classList.add(`font-size-${size}`);
    }
  };

  const highlightGlossaryTerms = () => {
    if (!editorRef.current) return;
    try {
      let html = editorRef.current.innerHTML || contentRef.current || content;
      if (!html || html === "<p><br></p>") {
        html = content;
      }
      html = html.replace(
        /<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi,
        "$1"
      );
      html = html.replace(
        /<span class="grammar-error"[^>]*>(.*?)<\/span>/gi,
        "$1"
      );
      glossaryTerms.forEach(({ term, definition }) => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b(${escapedTerm})\\b(?![^<]*>)`, "gi");
        html = html.replace(regex, (match) => {
          return `<span class="glossary-highlight" data-definition="${definition.replace(
            /"/g,
            "&quot;"
          )}" title="${definition}">${match}</span>`;
        });
      });
      editorRef.current.innerHTML = html;
      contentRef.current = html;
    } catch (error) {
      console.error("Error highlighting glossary terms:", error);
      if (content) {
        editorRef.current.innerHTML = content;
      }
    }
  };

  const highlightGrammarErrors = () => {
    if (!editorRef.current || !grammarErrors || grammarErrors.length === 0)
      return;
    try {
      let html = editorRef.current.innerHTML || contentRef.current || content;
      if (!html || html === "<p><br></p>") {
        html = content;
      }
      html = html.replace(
        /<span class="grammar-error"[^>]*>(.*?)<\/span>/gi,
        "$1"
      );
      html = html.replace(
        /<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi,
        "$1"
      );
      const sortedErrors = [...grammarErrors].sort(
        (a, b) => b.error.length - a.error.length
      );
      sortedErrors.forEach(({ error, suggestion }) => {
        const escapedError = error.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const safeSuggestion = suggestion.replace(/"/g, "&quot;");
        const regex = new RegExp(
          `(?<!<[^>]*)(${escapedError})(?![^<]*>)`,
          "gi"
        );
        html = html.replace(regex, (match) => {
          return `<span class="grammar-error" data-error="${error.replace(
            /"/g,
            "&quot;"
          )}" data-suggestion="${safeSuggestion}">${match}</span>`;
        });
      });
      editorRef.current.innerHTML = html;
      contentRef.current = html;
    } catch (error) {
      console.error("Error highlighting grammar:", error);
      if (content) {
        editorRef.current.innerHTML = content;
      }
    }
  };

  const removeAllGrammarHighlights = () => {
    if (!editorRef.current) return;
    try {
      let html = editorRef.current.innerHTML || contentRef.current;
      html = html.replace(
        /<span class="grammar-error"[^>]*>(.*?)<\/span>/gi,
        "$1"
      );
      editorRef.current.innerHTML = html;
      contentRef.current = html;
    } catch (error) {
      console.error("Error removing grammar highlights:", error);
    }
  };

  const removeAllGlossaryHighlights = () => {
    if (!editorRef.current) return;
    try {
      let html = editorRef.current.innerHTML || contentRef.current;
      html = html.replace(
        /<span class="glossary-highlight"[^>]*>(.*?)<\/span>/gi,
        "$1"
      );
      editorRef.current.innerHTML = html;
      contentRef.current = html;
    } catch (error) {
      console.error("Error removing glossary highlights:", error);
    }
  };

  const removeSingleErrorHighlight = (errorText) => {
    if (!editorRef.current) return;
    try {
      const escapedError = errorText
        .replace(/"/g, "&quot;")
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      let html = editorRef.current.innerHTML;
      const regex = new RegExp(
        `<span class="grammar-error" data-error="${escapedError}"[^>]*>(.*?)<\\/span>`,
        "g"
      );
      html = html.replace(regex, "$1");
      editorRef.current.innerHTML = html;
      contentRef.current = html;
    } catch (error) {
      console.error("Error removing single highlight:", error);
    }
  };

  const handleFixError = () => {
    if (!activeTooltip || !onFixGrammarError) return;
    onFixGrammarError(activeTooltip.error, activeTooltip.suggestion);
    removeSingleErrorHighlight(activeTooltip.error);
    setActiveTooltip(null);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (window.innerWidth > 768) {
      setActiveTooltip(null);
    }
  };

  const getWordCount = () => {
    if (isEncrypted) {
      return "🔒 Encrypted";
    }
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.textContent || "";
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const chars = text.length;
    return `${words} words · ${chars} characters`;
  };

  if (isEncrypted) {
    return (
      <div className="flex flex-col h-full min-h-0 card animate-fade-in">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] truncate"
            style={{ letterSpacing: "-0.02em" }}
            title={localTitle}
          >
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
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <svg
                className="w-11 h-11 sm:w-14 sm:h-14 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h3
              className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] mb-2 sm:mb-3"
              style={{ letterSpacing: "-0.02em" }}
            >
              This note is encrypted
            </h3>

            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mb-4 sm:mb-6 leading-relaxed px-4">
              Enter your password to unlock and view this note
            </p>

            <button
              onClick={onToggleEncryption}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm sm:text-base font-bold rounded-2xl transition-all duration-200 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-[0.98] mb-4 sm:mb-6"
            >
              <Unlock size={20} />
              <span>Unlock Note</span>
            </button>

            <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-3 sm:p-4">
              <p className="text-xs font-bold text-[#171717] dark:text-[#FAFAFA] mb-1">
                🔐 AES-256 Encrypted
              </p>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                Military-grade security
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#A3A3A3] dark:text-[#525252] flex justify-between items-center font-medium flex-shrink-0">
          <span>🔒 Encrypted</span>
          <span className="text-green-600 dark:text-green-500 font-semibold">
            Protected
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 card animate-fade-in relative">
      {/* Header - Compact on Mobile */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F] flex-shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="flex-1 text-xl sm:text-2xl md:text-3xl font-bold bg-transparent border-none outline-none text-[#171717] dark:text-[#FAFAFA] min-w-0"
                placeholder="Untitled"
                style={{ letterSpacing: "-0.02em" }}
              />
            ) : (
              <h2
                onClick={handleTitleEdit}
                className="flex-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] cursor-text hover:text-[#525252] dark:hover:text-[#D4D4D4] transition-colors truncate min-w-0"
                style={{ letterSpacing: "-0.02em" }}
                title={localTitle}
              >
                {localTitle}
              </h2>
            )}
            <button
              onClick={handleTitleEdit}
              className="btn-icon flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity hidden sm:block"
              title="Edit title"
            >
              <Edit2 size={16} />
            </button>
          </div>

          {/* Metadata - Hidden on very small screens */}
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
                    <div>
                      <strong>Created:</strong>{" "}
                      {storageService.getFullTimestamp(createdAt)}
                    </div>
                    <div>
                      <strong>Modified:</strong>{" "}
                      {storageService.getFullTimestamp(updatedAt)}
                    </div>
                  </div>
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#171717] dark:border-t-[#FAFAFA]"></div>
                </div>
              )}
            </div>

            {createdBy && (
              <div className="flex items-center gap-1.5">
                <User size={12} />
                <span>@{createdBy}</span>
              </div>
            )}

            {/* Version History Button */}
            {versionCount > 0 && onShowVersionHistory && (
              <button
                onClick={onShowVersionHistory}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-md transition-colors text-[#6366F1] dark:text-[#818CF8]"
                title="View version history"
              >
                <History size={12} />
                <span>{versionCount} {versionCount === 1 ? 'version' : 'versions'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar - Compact */}
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

      {/* Grammar Errors Banner */}
      {grammarErrors.length > 0 && (
        <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/20 text-xs font-semibold flex items-center gap-2 flex-shrink-0">
          <CheckCircle
            size={12}
            className="text-amber-600 dark:text-amber-500 flex-shrink-0"
          />
          <span className="text-amber-800 dark:text-amber-400">
            {grammarErrors.length}{" "}
            {grammarErrors.length === 1 ? "error" : "errors"}
          </span>
          <span className="hidden sm:inline text-amber-600 dark:text-amber-500 text-xs">
            • Click to fix
          </span>
        </div>
      )}

      {/* Editor Content - Scrollable */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          ref={editorRef}
          contentEditable={true}
          onInput={handleInput}
          className={`px-4 sm:px-6 py-4 sm:py-6 outline-none prose min-h-[200px] sm:min-h-[300px] bg-white dark:bg-[#0A0A0A] font-size-${currentFontSize}`}
          style={{ caretColor: "currentColor", wordBreak: 'break-word', overflowWrap: 'break-word' }}
          suppressContentEditableWarning
        />
      </div>

      {/* Grammar Tooltip */}
      {activeTooltip && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setActiveTooltip(null)}
          />

          <div
            className="fixed z-50 bg-white dark:bg-[#171717] border-2 border-[#6366F1] rounded-xl shadow-2xl p-3 sm:p-4 pointer-events-auto"
            style={{
              left: `${activeTooltip.position.x}px`,
              top: `${activeTooltip.position.y}px`,
              transform: "translate(-50%, calc(-100% - 10px))",
              maxWidth: "90vw",
              width: "280px",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold text-sm">
                  ✕
                </span>
                <p className="text-xs text-red-700 dark:text-red-400 font-semibold leading-relaxed">
                  {activeTooltip.error}
                </p>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <span className="text-green-500 flex-shrink-0 mt-0.5 font-bold text-sm">
                  ✓
                </span>
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold leading-relaxed">
                  {activeTooltip.suggestion}
                </p>
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

      {/* Footer - Compact */}
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

      {/* AI Floating Menu - Lower z-index on mobile */}
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
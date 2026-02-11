import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { 
  Pin, 
  Trash2, 
  Lock, 
  Unlock, 
  Languages, 
  Edit3, 
  Clock,
  User,
  FileText,
  Check
} from "lucide-react";
import AIFloatingMenu from "../AIFloatingMenu/AIFloatingMenu";
import { storageService } from "../../services/storageService";

const QuillEditor = ({
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
  noteId,
  title,
  onTitleChange,
  createdAt,
  updatedAt,
  createdBy,
}) => {
  const quillRef = useRef(null);
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  // Sync title when it changes
  useEffect(() => {
    setLocalTitle(title);
  }, [title, noteId]);

  // Calculate statistics
  const getStats = () => {
    if (isEncrypted) return { words: 0, chars: 0, encrypted: true };
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content || "";
    const text = tempDiv.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return { words, chars: text.length, encrypted: false };
  };

  const stats = getStats();

  // Handle title change
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (localTitle.trim() && localTitle !== title) {
      onTitleChange(localTitle);
    } else {
      setLocalTitle(title);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleBlur();
    }
    if (e.key === "Escape") {
      setLocalTitle(title);
      setIsEditingTitle(false);
    }
  };

  // Quill configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "align", "blockquote", "code-block",
    "color", "background", "link",
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0A0A0A] rounded-2xl border border-[#E5E5E5] dark:border-[#1F1F1F] overflow-hidden shadow-sm">
      
      {/* ========== HEADER ========== */}
      <div className="flex-shrink-0 bg-gradient-to-b from-white to-[#FAFAFA] dark:from-[#0F0F0F] dark:to-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#1F1F1F]">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          
          {/* Title Section */}
          <div className="mb-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="w-full text-2xl sm:text-3xl font-bold bg-transparent outline-none border-b-2 border-[#6366F1] dark:border-[#8B5CF6] text-[#171717] dark:text-[#FAFAFA] pb-2 transition-all"
                placeholder="Untitled Note"
              />
            ) : (
              <div className="group flex items-start gap-3">
                <h1 className="flex-1 text-2xl sm:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] leading-tight">
                  {localTitle}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all"
                  title="Edit title"
                >
                  <Edit3 size={18} className="text-[#737373] dark:text-[#A3A3A3]" />
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            
            {/* Left: Primary Actions */}
            <div className="flex items-center gap-2">
              
              {/* Pin Button */}
              <button
                onClick={onTogglePin}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isPinned
                    ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md"
                    : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]"
                }`}
                title={isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin size={16} className={isPinned ? "fill-current" : ""} />
                <span className="hidden sm:inline">{isPinned ? "Pinned" : "Pin"}</span>
              </button>

              {/* Lock Button */}
              <button
                onClick={onToggleEncryption}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isEncrypted
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                    : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]"
                }`}
                title={isEncrypted ? "Unlock note" : "Lock note"}
              >
                {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
                <span className="hidden sm:inline">{isEncrypted ? "Locked" : "Lock"}</span>
              </button>

              {/* Translate Button */}
              {!isEncrypted && (
                <button
                  onClick={onTranslate}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  title="Translate note"
                >
                  <Languages size={16} />
                  <span className="hidden sm:inline">Translate</span>
                </button>
              )}
            </div>

            {/* Right: Secondary Actions */}
            <div className="flex items-center gap-2">
              
              {/* Stats */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg text-xs">
                {stats.encrypted ? (
                  <span className="flex items-center gap-1.5 text-[#737373] dark:text-[#A3A3A3]">
                    <Lock size={12} />
                    Encrypted
                  </span>
                ) : (
                  <>
                    <span className="text-[#737373] dark:text-[#A3A3A3]">
                      {stats.words} words
                    </span>
                    <div className="w-1 h-1 rounded-full bg-[#A3A3A3]" />
                    <span className="text-[#737373] dark:text-[#A3A3A3]">
                      {stats.chars} chars
                    </span>
                  </>
                )}
              </div>

              {/* Note Info Button */}
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showMetadata
                    ? "bg-[#6366F1]/10 text-[#6366F1]"
                    : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]"
                }`}
                title="Note information"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Info</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
                title="Delete note"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Metadata Panel */}
          {showMetadata && (
            <div className="mt-4 p-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl border border-[#E5E5E5] dark:border-[#262626] animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#737373] dark:text-[#A3A3A3]" />
                  <span className="text-[#737373] dark:text-[#A3A3A3]">Author:</span>
                  <span className="text-[#171717] dark:text-[#FAFAFA] font-medium">{createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#737373] dark:text-[#A3A3A3]" />
                  <span className="text-[#737373] dark:text-[#A3A3A3]">Created:</span>
                  <span className="text-[#171717] dark:text-[#FAFAFA] font-medium">
                    {new Date(createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#737373] dark:text-[#A3A3A3]" />
                  <span className="text-[#737373] dark:text-[#A3A3A3]">Updated:</span>
                  <span className="text-[#171717] dark:text-[#FAFAFA] font-medium">
                    {storageService.formatTimestamp(updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#737373] dark:text-[#A3A3A3]" />
                  <span className="text-[#737373] dark:text-[#A3A3A3]">Status:</span>
                  <span className={`font-medium ${
                    isEncrypted 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-blue-600 dark:text-blue-400"
                  }`}>
                    {isEncrypted ? "Encrypted" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== EDITOR AREA ========== */}
      {isEncrypted ? (
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-950/10">
          <div className="text-center max-w-md">
            <div className="relative inline-flex mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Lock className="text-white" size={48} />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-4 border-white dark:border-[#0A0A0A]">
                <Check size={16} className="text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] mb-3">
              Note is Secured
            </h3>
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mb-6 leading-relaxed">
              This note is protected with AES-256 encryption. <br />
              Click below to unlock and view the content.
            </p>
            
            <button
              onClick={onToggleEncryption}
              className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Unlock size={18} />
              Unlock Note
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your note..."
            className="h-full quill-editor-pro"
          />
        </div>
      )}

      {/* AI Floating Menu */}
      <AIFloatingMenu
        onAISummary={onAISummary}
        onAITags={onAITags}
        onGlossary={onGlossary}
        onGrammarCheck={onGrammarCheck}
        isEncrypted={isEncrypted}
      />
    </div>
  );
};

export default QuillEditor;
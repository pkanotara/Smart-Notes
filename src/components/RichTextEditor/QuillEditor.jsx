import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { 
  Pin, 
  Trash2, 
  Lock, 
  Unlock, 
  Languages, 
  Edit2, 
  Clock,
  User,
  CheckCircle
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
  const quillRef = useRef(null);
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showTimestampTooltip, setShowTimestampTooltip] = useState(false);

  // Sync title when it changes
  useEffect(() => {
    setLocalTitle(title);
  }, [title, noteId]);

  // Calculate word count
  const getWordCount = () => {
    if (isEncrypted) return "🔒 Encrypted";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content || "";
    const text = tempDiv.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return `${words} words · ${text.length} characters`;
  };

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

  // Quill modules configuration
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

  // Quill formats
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "color",
    "background",
    "link",
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-lg border border-[#E5E5E5] dark:border-[#1F1F1F] overflow-hidden">
      {/* Header with Title */}
      <div className="flex-shrink-0 border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl">
        <div className="px-4 sm:px-6 py-4 space-y-3">
          {/* Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="w-full text-2xl sm:text-3xl font-bold bg-transparent outline-none border-b-2 border-[#6366F1] dark:border-[#8B5CF6] text-[#171717] dark:text-[#FAFAFA] pb-1"
            />
          ) : (
            <div className="flex items-center gap-3 group">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] flex-1">
                {localTitle}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all"
                title="Edit title"
              >
                <Edit2 size={18} className="text-[#737373] dark:text-[#A3A3A3]" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTogglePin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isPinned
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]"
              }`}
            >
              <Pin size={16} />
              {isPinned ? "Pinned" : "Pin"}
            </button>

            <button
              onClick={onToggleEncryption}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isEncrypted
                  ? "bg-green-500 text-white"
                  : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]"
              }`}
            >
              {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
              {isEncrypted ? "Locked" : "Lock"}
            </button>

            {!isEncrypted && (
              <button
                onClick={onTranslate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] transition-all"
              >
                <Languages size={16} />
                Translate
              </button>
            )}

            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all ml-auto"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A3A3A3] dark:text-[#525252]">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>{createdBy}</span>
            </div>

            <div
              className="flex items-center gap-1.5 cursor-pointer relative"
              onMouseEnter={() => setShowTimestampTooltip(true)}
              onMouseLeave={() => setShowTimestampTooltip(false)}
            >
              <Clock size={14} />
              <span>{storageService.formatTimestamp(updatedAt)}</span>
              
              {showTimestampTooltip && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-[#171717] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#171717] rounded-lg shadow-xl text-xs whitespace-nowrap z-50">
                  <div>Created: {storageService.getFullTimestamp(createdAt)}</div>
                  <div>Updated: {storageService.getFullTimestamp(updatedAt)}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} />
              <span>{getWordCount()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quill Editor */}
      {isEncrypted ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
              <Lock className="text-green-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-[#171717] dark:text-[#FAFAFA] mb-2">
              Note is Encrypted
            </h3>
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mb-4">
              This note is password protected. Click "Unlock" to view and edit.
            </p>
            <button
              onClick={onToggleEncryption}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
            >
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
            className="h-full quill-editor-custom"
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
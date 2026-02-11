import React, { useState, useEffect, useCallback, useRef } from "react";
import QuillEditor from "./components/RichTextEditor/QuillEditor";
import APIKeyChecker from './components/APIKeyChecker';

import NotesList from "./components/NotesList/NotesList";
import SearchBar from "./components/Search/SearchBar";
import PasswordProtection from "./components/Encryption/PasswordProtection";
import ResizableSplitPane from "./components/ResizableSplitPane/ResizableSplitPane";
import AIPanel from "./components/AIPanel/AIPanel";
import ToastContainer from "./components/Toast/ToastContainer";
import DarkModeToggle from "./components/DarkMode/DarkModeToggle";
import ExportMenu from "./components/ExportMenu/ExportMenu";
import TranslationModal from "./components/Translation/TranslationModal";
import SortDropdown from "./components/SortDropdown/SortDropdown";
import { storageService } from "./services/storageService";
import { encryptionService } from "./services/encryptionService";
import { aiService } from "./services/aiService";
import { translationService } from "./services/translationService";
import { sortService } from "./services/sortService";
import { useToast } from "./hooks/useToast";
import { Loader2, Menu, X, Plus, Sparkles, Download } from "lucide-react";

function App() {
  // ==================== STATE ====================
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState('updated');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  
  // Encryption States
  const [passwordMode, setPasswordMode] = useState("set");
  const [pendingEncryptionNoteId, setPendingEncryptionNoteId] = useState(null);
  
  // AI States
  const [aiPanel, setAiPanel] = useState({ show: false, type: "", data: null });
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [grammarErrors, setGrammarErrors] = useState([]);
  
  const { toasts, addToast, removeToast } = useToast();

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const loadedNotes = storageService.loadNotes();
    const savedSort = localStorage.getItem('notes-sort-preference');
    const savedOrder = localStorage.getItem('notes-sort-order');
    
    if (savedSort) setSortBy(savedSort);
    if (savedOrder) setSortOrder(savedOrder);

    if (loadedNotes?.length > 0) {
      setNotes(loadedNotes);
      setActiveNoteId(loadedNotes[0].id);
    } else {
      const welcomeNote = createWelcomeNote();
      setNotes([welcomeNote]);
      setActiveNoteId(welcomeNote.id);
      storageService.saveNotes([welcomeNote]);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (notes.length > 0) storageService.saveNotes(notes);
  }, [notes]);

  // ==================== HELPERS ====================
  const createWelcomeNote = () => {
    const now = Date.now();
    return {
      id: now.toString(),
      title: "Welcome to Smart Notes ✨",
      content: "<h1>Welcome to Smart Notes! 👋</h1><p>Your intelligent note-taking companion with AI superpowers.</p><h2>✨ Features</h2><ul><li><strong>Rich Text Editing</strong> - Format your notes beautifully</li><li><strong>AI Integration</strong> - Get summaries, tags, glossary, and grammar checks</li><li><strong>Password Protection</strong> - Encrypt sensitive notes</li><li><strong>Dark Mode</strong> - Easy on the eyes</li><li><strong>Export Options</strong> - Download as Markdown, PDF, or Plain Text</li><li><strong>Version Control</strong> - Track changes</li><li><strong>Translation</strong> - Translate to 20+ languages</li></ul>",
      createdAt: now,
      updatedAt: now,
      createdBy: "pkanotara",
      isPinned: false,
      isEncrypted: false,
      tags: ["welcome", "tutorial"],
      fontSize: "normal",
    };
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const getTextContent = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) return selection;
    
    if (activeNote) {
      const div = document.createElement("div");
      div.innerHTML = activeNote.content;
      return (div.textContent || div.innerText || "").trim();
    }
    return "";
  };

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);
    if (note.isEncrypted) return titleMatch;

    const div = document.createElement("div");
    div.innerHTML = note.content;
    const text = div.textContent || "";
    return titleMatch || text.toLowerCase().includes(query);
  });

  const sortedNotes = sortService.sortNotes(filteredNotes, sortBy, sortOrder);

  // ==================== NOTE OPERATIONS ====================
  const createNote = () => {
    const now = Date.now();
    const newNote = {
      id: now.toString(),
      title: "Untitled Note",
      content: "<p>Start writing...</p>",
      createdAt: now,
      updatedAt: now,
      createdBy: "pkanotara",
      isPinned: false,
      isEncrypted: false,
      tags: [],
      fontSize: "normal",
    };

    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setGlossaryTerms([]);
    setGrammarErrors([]);
    setAiPanel({ show: false, type: "", data: null });
    setSidebarOpen(false);
    addToast("New note created!", "success", 2000);
  };

  const updateNote = useCallback((updates) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    );
  }, [activeNoteId]);

  const deleteNote = (id) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);

    if (activeNoteId === id) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      setGlossaryTerms([]);
      setGrammarErrors([]);
      setAiPanel({ show: false, type: "", data: null });
    }
    addToast("Note deleted", "info", 2000);
  };

  const handleBulkDelete = (ids) => {
    const remaining = notes.filter((n) => !ids.includes(n.id));
    setNotes(remaining);
    
    if (activeNoteId && ids.includes(activeNoteId)) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
      setGlossaryTerms([]);
      setGrammarErrors([]);
      setAiPanel({ show: false, type: "", data: null });
    }
    
    addToast(`${ids.length} notes deleted`, "info", 2000);
  };

  // ==================== EVENT HANDLERS ====================
  const handleContentChange = (newContent) => {
    if (!activeNote?.isEncrypted) {
      if (activeNote.title === "Untitled Note" || activeNote.title === "Start writing...") {
        const div = document.createElement("div");
        div.innerHTML = newContent;
        const text = div.textContent || "";
        const firstLine = text.split("\n")[0].trim().substring(0, 50);
        const title = firstLine || "Untitled Note";
        updateNote({ content: newContent, title });
      } else {
        updateNote({ content: newContent });
      }
    }
  };

  const handleTitleChange = (newTitle) => {
    updateNote({ title: newTitle });
    addToast("Title updated", "success", 1500);
  };

  const handleSelectNote = (id) => {
    setActiveNoteId(id);
    setGlossaryTerms([]);
    setGrammarErrors([]);
    setAiPanel({ show: false, type: "", data: null });
    setSidebarOpen(false);
  };

  const togglePin = () => {
    updateNote({ isPinned: !activeNote.isPinned });
    addToast(activeNote.isPinned ? "Note unpinned" : "Note pinned", "success", 2000);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    localStorage.setItem('notes-sort-preference', newSortBy);
    localStorage.setItem('notes-sort-order', newSortOrder);
    addToast(`Sorted by ${newSortBy}`, "info", 1500);
  };

  // ==================== ENCRYPTION ====================
  const toggleEncryption = () => {
    if (!activeNote) return;

    if (activeNote.isEncrypted) {
      setPasswordMode("unlock");
    } else {
      if (!activeNote.content || activeNote.content === "<p>Start writing...</p>") {
        addToast("Please add content before encrypting", "warning", 3000);
        return;
      }
      setPasswordMode("set");
    }
    setPendingEncryptionNoteId(activeNoteId);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password) => {
    try {
      setLoading(true);
      const note = notes.find((n) => n.id === pendingEncryptionNoteId);
      if (!note) throw new Error("Note not found");

      if (passwordMode === "set") {
        const encrypted = await encryptionService.encrypt(note.content, password);
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === pendingEncryptionNoteId
              ? { ...n, content: encrypted, isEncrypted: true, updatedAt: Date.now() }
              : n
          )
        );
        addToast("Note encrypted successfully!", "success");
      } else {
        const decrypted = await encryptionService.decrypt(note.content, password);
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === pendingEncryptionNoteId
              ? { ...n, content: decrypted, isEncrypted: false, updatedAt: Date.now() }
              : n
          )
        );
        addToast("Note decrypted successfully!", "success");
      }

      setShowPasswordModal(false);
      setPendingEncryptionNoteId(null);
    } catch (error) {
      addToast(passwordMode === "set" ? "Encryption failed" : "Incorrect password", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==================== AI FEATURES ====================
  const runAIFeature = async (featureName, aiFunction, minLength = 10) => {
    if (!activeNote) {
      addToast("No note selected", "warning");
      return;
    }
    if (activeNote.isEncrypted) {
      addToast("Cannot use AI on encrypted notes", "warning");
      return;
    }

    const text = getTextContent();
    if (!text || text.length < minLength) {
      addToast("Please add more content", "warning");
      return;
    }

    try {
      setLoading(true);
      setGlossaryTerms([]);
      setGrammarErrors([]);

      const result = await Promise.race([
        aiFunction(text),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000))
      ]);

      return result;
    } catch (error) {
      addToast(`Failed to ${featureName}`, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAISummary = async () => {
    const summary = await runAIFeature("generate summary", aiService.summarizeNote);
    if (summary) {
      setAiPanel({ show: true, type: "summary", data: summary });
      addToast("Summary generated!", "success");
    }
  };

  const handleAITags = async () => {
    const tags = await runAIFeature("generate tags", aiService.suggestTags, 20);
    if (tags?.length > 0) {
      updateNote({ tags });
      setAiPanel({ show: true, type: "tags", data: tags });
      addToast(`${tags.length} tags generated!`, "success");
    }
  };

  const handleGlossary = async () => {
    const terms = await runAIFeature("identify terms", aiService.identifyGlossaryTerms, 30);
    if (terms?.length > 0) {
      setGlossaryTerms(terms);
      setAiPanel({ show: true, type: "glossary", data: terms });
      addToast(`${terms.length} terms highlighted!`, "success");
    }
  };

  const handleGrammarCheck = async () => {
    const errors = await runAIFeature("check grammar", aiService.checkGrammar);
    if (errors) {
      setGrammarErrors(errors);
      setAiPanel({ show: true, type: "grammar", data: errors });
      addToast(errors.length === 0 ? "Perfect grammar!" : `${errors.length} issues found`, errors.length === 0 ? "success" : "info");
    }
  };

  const handleFixAllGrammar = (grammarErrorsList) => {
    if (!activeNote || !grammarErrorsList?.length) return;

    let correctedContent = activeNote.content.replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1");
    
    grammarErrorsList.forEach((error) => {
      const regex = new RegExp(error.error.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      correctedContent = correctedContent.replace(regex, error.suggestion);
    });

    updateNote({ content: correctedContent });
    setGrammarErrors([]);
    setAiPanel({ show: false, type: "", data: null });
    addToast(`Fixed ${grammarErrorsList.length} errors!`, "success", 3000);
  };

  const handleFixSingleError = (error, suggestion) => {
    if (!activeNote) return;
    
    let correctedContent = activeNote.content.replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, "$1");
    correctedContent = correctedContent.replace(error, suggestion);
    updateNote({ content: correctedContent });

    const updatedErrors = grammarErrors.filter((e) => e.error !== error);
    setGrammarErrors(updatedErrors);
    if (aiPanel.show && aiPanel.type === "grammar") {
      setAiPanel({ show: true, type: "grammar", data: updatedErrors });
    }
    addToast("Grammar error fixed!", "success", 2000);
  };

  // ==================== TRANSLATION ====================
  const handleShowTranslationModal = () => {
    if (!activeNote) {
      addToast("No note selected", "warning");
      return;
    }
    if (activeNote.isEncrypted) {
      addToast("Cannot translate encrypted notes", "warning");
      return;
    }

    const div = document.createElement("div");
    div.innerHTML = activeNote.content;
    const text = div.textContent || "";

    if (text.trim().length < 10) {
      addToast("Please add more content to translate", "warning");
      return;
    }
    setShowTranslationModal(true);
  };

  const handleTranslateNote = async (targetLanguage) => {
    if (!activeNote || activeNote.isEncrypted) {
      addToast("Cannot translate this note", "warning");
      setShowTranslationModal(false);
      return;
    }

    try {
      setLoading(true);
      const translatedContent = await translationService.translateNote(activeNote.content, targetLanguage);
      
      if (translatedContent) {
        updateNote({ content: translatedContent });
        addToast("Note translated successfully!", "success");
      }
    } catch (error) {
      addToast("Translation failed", "error");
    } finally {
      setLoading(false);
      setShowTranslationModal(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl flex-shrink-0 z-50">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-all">
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h1 className="text-lg font-bold text-[#171717] dark:text-[#FAFAFA]">Smart Notes</h1>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {activeNote && (
                <button onClick={() => setShowExportMenu(true)} className="p-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-xl transition-all">
                  <Download size={20} />
                </button>
              )}
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={16} />
              </div>
              <h1 className="text-base font-bold text-[#171717] dark:text-[#FAFAFA]">Smart Notes</h1>
            </div>
            <div className="flex items-center gap-2">
              {activeNote && (
                <button onClick={() => setShowExportMenu(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all">
                  <Download size={16} />
                  <span>Export</span>
                </button>
              )}
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 lg:w-72 xl:w-80 bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl border-r border-[#E5E5E5] dark:border-[#1F1F1F] shadow-2xl lg:shadow-none transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col top-[53px] lg:top-0`}>
          <div className="p-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F] space-y-2">
            <SearchBar onSearch={setSearchQuery} />
            <div className="flex items-center gap-2">
              <button onClick={createNote} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold rounded-lg transition-all text-sm">
                <Plus size={16} strokeWidth={2.5} />
                <span>New Note</span>
              </button>
              <SortDropdown currentSort={sortBy} currentOrder={sortOrder} onSortChange={handleSortChange} />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <NotesList notes={sortedNotes} activeNoteId={activeNoteId} onSelectNote={handleSelectNote} onCreateNote={createNote} onDeleteNote={deleteNote} onBulkDelete={handleBulkDelete} />
          </div>
        </div>

        {sidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden top-[53px]" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeNote ? (
            <div className="flex-1 p-3 lg:p-4 overflow-hidden">
              {aiPanel.show ? (
                <ResizableSplitPane
                  defaultSize={55}
                  minSize={30}
                  maxSize={70}
                  left={
                    <QuillEditor
                      key={`${activeNoteId}-${activeNote.isEncrypted}`}
                      noteId={activeNoteId}
                      title={activeNote.title}
                      content={activeNote.content}
                      onChange={handleContentChange}
                      onTitleChange={handleTitleChange}
                      onDelete={() => deleteNote(activeNote.id)}
                      onAISummary={handleAISummary}
                      onAITags={handleAITags}
                      onGlossary={handleGlossary}
                      onGrammarCheck={handleGrammarCheck}
                      onToggleEncryption={toggleEncryption}
                      onTogglePin={togglePin}
                      onTranslate={handleShowTranslationModal}
                      isEncrypted={activeNote.isEncrypted}
                      isPinned={activeNote.isPinned}
                      glossaryTerms={glossaryTerms}
                      grammarErrors={grammarErrors}
                      onFixGrammarError={handleFixSingleError}
                      createdAt={activeNote.createdAt}
                      updatedAt={activeNote.updatedAt}
                      createdBy={activeNote.createdBy}
                      updateNote={updateNote}
                    />
                  }
                  right={
                    <AIPanel
                      type={aiPanel.type}
                      data={aiPanel.data}
                      onClose={() => {
                        setAiPanel({ show: false, type: "", data: null });
                        if (aiPanel.type === "grammar") setGrammarErrors([]);
                        if (aiPanel.type === "glossary") setGlossaryTerms([]);
                      }}
                      onFixAllGrammar={handleFixAllGrammar}
                    />
                  }
                />
              ) : (
                <QuillEditor
                  key={`${activeNoteId}-${activeNote.isEncrypted}`}
                  noteId={activeNoteId}
                  title={activeNote.title}
                  content={activeNote.content}
                  onChange={handleContentChange}
                  onTitleChange={handleTitleChange}
                  onDelete={() => deleteNote(activeNote.id)}
                  onAISummary={handleAISummary}
                  onAITags={handleAITags}
                  onGlossary={handleGlossary}
                  onGrammarCheck={handleGrammarCheck}
                  onToggleEncryption={toggleEncryption}
                  onTogglePin={togglePin}
                  onTranslate={handleShowTranslationModal}
                  isEncrypted={activeNote.isEncrypted}
                  isPinned={activeNote.isPinned}
                  glossaryTerms={glossaryTerms}
                  grammarErrors={grammarErrors}
                  onFixGrammarError={handleFixSingleError}
                  createdAt={activeNote.createdAt}
                  updatedAt={activeNote.updatedAt}
                  createdBy={activeNote.createdBy}
                  updateNote={updateNote}
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center animate-fade-in max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="text-white" size={44} />
                </div>
                <h3 className="text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] mb-3">No note selected</h3>
                <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mb-8">Create or select a note to get started</p>
                <button onClick={createNote} className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-xl">
                  <Plus size={20} strokeWidth={2.5} />
                  <span>Create Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

             {/* <APIKeyChecker /> */}


      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#171717] px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4">
            <Loader2 className="animate-spin text-[#6366F1]" size={24} />
            <p className="font-semibold text-sm">Processing...</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPasswordModal && (
        <PasswordProtection
          mode={passwordMode}
          onSubmit={handlePasswordSubmit}
          onCancel={() => {
            setShowPasswordModal(false);
            setPendingEncryptionNoteId(null);
          }}
        />
      )}

      {showExportMenu && activeNote && <ExportMenu note={activeNote} onClose={() => setShowExportMenu(false)} />}

      {showTranslationModal && <TranslationModal onClose={() => setShowTranslationModal(false)} onTranslate={handleTranslateNote} isTranslating={loading} />}
    </div>
  );
}

export default App;
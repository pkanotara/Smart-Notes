import React, { useState, useEffect } from 'react';
import Editor from './components/RichTextEditor/Editor';
import NotesList from './components/NotesList/NotesList';
import SearchBar from './components/Search/SearchBar';
import PasswordProtection from './components/Encryption/PasswordProtection';
import ResizableSplitPane from './components/ResizableSplitPane/ResizableSplitPane';
import AIPanel from './components/AIPanel/AIPanel';
import ToastContainer from './components/Toast/ToastContainer';
import DarkModeToggle from './components/DarkMode/DarkModeToggle';
import ExportMenu from './components/ExportMenu/ExportMenu';
import TranslationModal from './components/Translation/TranslationModal';
import VersionHistory from './components/VersionHistory/VersionHistory';
import { storageService } from './services/storageService';
import { encryptionService } from './services/encryptionService';
import { aiService } from './services/aiService';
import { translationService } from './services/translationService';
import { sortService } from './utils/sortService';
import { versionService } from './utils/versionService';
import { useToast } from './hooks/useToast';
import { Loader2, Menu, X, Plus, Sparkles, Download } from 'lucide-react';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMode, setPasswordMode] = useState('set');
  const [pendingEncryptionNoteId, setPendingEncryptionNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiPanel, setAiPanel] = useState({ show: false, type: '', data: null });
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [sortOption, setSortOption] = useState(() => sortService.loadSortPreference());
  const { toasts, addToast, removeToast } = useToast();

  // Handle sort option change
  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
    sortService.saveSortPreference(newSortOption);
  };

  useEffect(() => {
    console.log('🔄 Loading notes from storage...');
    const loadedNotes = storageService.loadNotes();
    console.log('📦 Loaded notes:', loadedNotes);
    
    if (loadedNotes && loadedNotes.length > 0) {
      // Migrate existing notes to include versions array if missing
      const migratedNotes = loadedNotes.map(note => ({
        ...note,
        versions: note.versions || [],
      }));
      setNotes(migratedNotes);
      setActiveNoteId(migratedNotes[0].id);
    } else {
      const now = Date.now();
      const welcomeNote = {
        id: now.toString(),
        title: 'Welcome to Smart Notes ✨',
        content: '<h1>Welcome to Smart Notes! 👋</h1><p>Your intelligent note-taking companion with AI superpowers.</p><h2>✨ Features</h2><ul><li><strong>Rich Text Editing</strong> - Format your notes beautifully</li><li><strong>AI Integration</strong> - Get summaries, tags, glossary, and grammar checks</li><li><strong>End-to-End Encryption</strong> - Protect sensitive notes with passwords</li><li><strong>Dark Mode</strong> - Easy on the eyes, day or night</li><li><strong>Export Options</strong> - Download as Markdown, PDF, or Plain Text</li><li><strong>Timestamps</strong> - Track when notes are created and modified</li><li><strong>Translation</strong> - Translate notes to 20+ languages</li><li><strong>Sort Options</strong> - Sort notes by date, title, or last modified</li><li><strong>Version History</strong> - Roll back to any previous version of a note</li></ul><h2>🚀 Quick Start</h2><p>1. Click the <strong>+ New Note</strong> button to create a note</p><p>2. Use the toolbar to format your content</p><p>3. Try AI features by clicking the floating AI button</p><p>4. Pin important notes to keep them at the top</p><p>5. Lock sensitive notes with encryption</p><p>6. Translate notes to your preferred language</p><p>7. Use the Sort button to organize your notes</p><p>8. Click the History button to view and restore previous versions</p><p><em>Start writing and let AI help you organize your thoughts!</em></p>',
        createdAt: now,
        updatedAt: now,
        createdBy: 'pkanotara',
        isPinned: false,
        isEncrypted: false,
        tags: ['welcome', 'tutorial'],
        fontSize: 'normal',
        versions: [],
      };
      setNotes([welcomeNote]);
      setActiveNoteId(welcomeNote.id);
      storageService.saveNotes([welcomeNote]);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      console.log('💾 Saving notes to storage...', notes.length, 'notes');
      storageService.saveNotes(notes);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const getTextContent = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      return selectedText;
    }
    
    if (activeNote) {
      const div = document.createElement('div');
      div.innerHTML = activeNote.content;
      return (div.textContent || div.innerText || '').trim();
    }
    
    return '';
  };

  const createNote = () => {
    const now = Date.now();
    const newNote = {
      id: now.toString(),
      title: 'Untitled Note',
      content: '<p>Start writing...</p>',
      createdAt: now,
      updatedAt: now,
      createdBy: 'pkanotara',
      isPinned: false,
      isEncrypted: false,
      tags: [],
      fontSize: 'normal',
      versions: [],
    };
    
    console.log('➕ Creating new note:', newNote);
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    setGlossaryTerms([]);
    setGrammarErrors([]);
    setAiPanel({ show: false, type: '', data: null });
    setSidebarOpen(false);
    addToast('New note created!', 'success', 2000);
  };

  const updateNote = (updates) => {
    console.log('📝 Updating note:', activeNoteId, updates);
    setNotes(prevNotes => prevNotes.map((note) => {
      if (note.id !== activeNoteId) return note;
      
      // Check if this is a significant content or title change
      const hasContentChange = updates.content && versionService.hasSignificantChange(note.content, updates.content);
      const hasTitleChange = updates.title && updates.title !== note.title;
      
      // If significant change, save current state to version history
      let newVersions = note.versions || [];
      if (hasContentChange || hasTitleChange) {
        newVersions = versionService.addVersion(note, {
          title: note.title,
          content: note.content,
          tags: note.tags,
        });
      }
      
      return {
        ...note,
        ...updates,
        updatedAt: Date.now(),
        versions: newVersions,
      };
    }));
  };

  const deleteNote = (id) => {
    const noteToDelete = notes.find(n => n.id === id);
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    
    if (activeNoteId === id) {
      const newActiveId = updatedNotes.length > 0 ? updatedNotes[0].id : null;
      setActiveNoteId(newActiveId);
      setGlossaryTerms([]);
      setGrammarErrors([]);
      setAiPanel({ show: false, type: '', data: null });
    }
    
    addToast(`"${noteToDelete.title}" deleted`, 'info', 2000);
  };

  const handleContentChange = (newContent) => {
    if (!activeNote?.isEncrypted) {
      if (activeNote.title === 'Untitled Note' || activeNote.title === 'Start writing...') {
        const div = document.createElement('div');
        div.innerHTML = newContent;
        const text = div.textContent || div.innerText || '';
        const firstLine = text.split('\n')[0].trim().substring(0, 50);
        const title = firstLine || 'Untitled Note';
        
        updateNote({ content: newContent, title });
      } else {
        updateNote({ content: newContent });
      }
    }
  };

  const handleTitleChange = (newTitle) => {
    updateNote({ title: newTitle });
    addToast('Title updated', 'success', 1500);
  };

  const handleSelectNote = (id) => {
    setActiveNoteId(id);
    setGlossaryTerms([]);
    setGrammarErrors([]);
    setAiPanel({ show: false, type: '', data: null });
    setSidebarOpen(false);
  };

  const togglePin = () => {
    updateNote({ isPinned: !activeNote.isPinned });
    addToast(activeNote.isPinned ? 'Note unpinned' : 'Note pinned', 'success', 2000);
  };

  const toggleEncryption = () => {
    if (!activeNote) return;
    
    if (activeNote.isEncrypted) {
      setPasswordMode('unlock');
      setPendingEncryptionNoteId(activeNoteId);
      setShowPasswordModal(true);
    } else {
      const currentContent = activeNote.content;
      if (!currentContent || currentContent.trim().length === 0 || currentContent === '<p>Start writing...</p>') {
        addToast('Please add content before encrypting', 'warning', 3000);
        return;
      }
      
      setPasswordMode('set');
      setPendingEncryptionNoteId(activeNoteId);
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = async (password) => {
    try {
      setLoading(true);
      const note = notes.find((n) => n.id === pendingEncryptionNoteId);

      if (!note) {
        addToast('Note not found', 'error');
        setLoading(false);
        setShowPasswordModal(false);
        return;
      }

      if (passwordMode === 'set') {
        const encrypted = await encryptionService.encrypt(note.content, password);
        
        setNotes(prevNotes => prevNotes.map((n) =>
          n.id === pendingEncryptionNoteId
            ? { ...n, content: encrypted, isEncrypted: true, updatedAt: Date.now() }
            : n
        ));
        
        setShowPasswordModal(false);
        setPendingEncryptionNoteId(null);
        setLoading(false);
        addToast('Note encrypted successfully!', 'success');
        
      } else {
        try {
          const decrypted = await encryptionService.decrypt(note.content, password);
          
          setNotes(prevNotes => prevNotes.map((n) =>
            n.id === pendingEncryptionNoteId
              ? { ...n, content: decrypted, isEncrypted: false, updatedAt: Date.now() }
              : n
          ));
          
          setShowPasswordModal(false);
          setPendingEncryptionNoteId(null);
          setLoading(false);
          addToast('Note decrypted successfully!', 'success');
          
        } catch (decryptError) {
          console.error('❌ Decryption failed:', decryptError);
          setLoading(false);
          addToast('Incorrect password', 'error');
          return;
        }
      }
    } catch (error) {
      console.error('💥 Password operation error:', error);
      setLoading(false);
      addToast('Encryption error: ' + error.message, 'error');
      setShowPasswordModal(false);
      setPendingEncryptionNoteId(null);
    }
  };

  const handleAISummary = async () => {
    if (!activeNote) {
      addToast('No note selected', 'warning');
      return;
    }

    if (activeNote.isEncrypted) {
      addToast('Cannot use AI on encrypted notes', 'warning');
      return;
    }
    
    setGlossaryTerms([]);
    setGrammarErrors([]);
    
    try {
      setLoading(true);
      const text = getTextContent();
      
      if (!text || text.length < 10) {
        addToast('Please add more content', 'warning');
        setLoading(false);
        return;
      }
      
      const summaryPromise = aiService.summarizeNote(text);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const summary = await Promise.race([summaryPromise, timeoutPromise]);
      
      setAiPanel({ show: true, type: 'summary', data: summary });
      addToast('Summary generated!', 'success');
    } catch (error) {
      console.error('AI Summary Error:', error);
      addToast('Failed to generate summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAITags = async () => {
    if (!activeNote) {
      addToast('No note selected', 'warning');
      return;
    }

    if (activeNote.isEncrypted) {
      addToast('Cannot use AI on encrypted notes', 'warning');
      return;
    }
    
    setGlossaryTerms([]);
    setGrammarErrors([]);
    
    try {
      setLoading(true);
      const text = getTextContent();
      
      if (!text || text.length < 20) {
        addToast('Please add more content', 'warning');
        setLoading(false);
        return;
      }
      
      const tagsPromise = aiService.suggestTags(text);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const tags = await Promise.race([tagsPromise, timeoutPromise]);
      
      if (tags.length === 0) {
        addToast('No tags generated', 'info');
        setLoading(false);
        return;
      }
      
      updateNote({ tags });
      setAiPanel({ show: true, type: 'tags', data: tags });
      addToast(`${tags.length} tags generated!`, 'success');
    } catch (error) {
      console.error('AI Tags Error:', error);
      addToast('Failed to generate tags', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGlossary = async () => {
    if (!activeNote) {
      addToast('No note selected', 'warning');
      return;
    }

    if (activeNote.isEncrypted) {
      addToast('Cannot use AI on encrypted notes', 'warning');
      return;
    }
    
    setGrammarErrors([]);
    
    try {
      setLoading(true);
      const text = getTextContent();
      
      if (!text || text.length < 30) {
        addToast('Please add more content', 'warning');
        setLoading(false);
        return;
      }
      
      const glossaryPromise = aiService.identifyGlossaryTerms(text);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const terms = await Promise.race([glossaryPromise, timeoutPromise]);
      
      if (terms.length === 0) {
        addToast('No key terms found', 'info');
        setLoading(false);
        return;
      }
      
      setGlossaryTerms(terms);
      setAiPanel({ show: true, type: 'glossary', data: terms });
      addToast(`${terms.length} terms highlighted!`, 'success');
    } catch (error) {
      console.error('Glossary Error:', error);
      addToast('Failed to identify terms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!activeNote) {
      addToast('No note selected', 'warning');
      return;
    }

    if (activeNote.isEncrypted) {
      addToast('Cannot use AI on encrypted notes', 'warning');
      return;
    }
    
    setGlossaryTerms([]);
    
    try {
      setLoading(true);
      const text = getTextContent();
      
      if (!text || text.length < 10) {
        addToast('Please add more content', 'warning');
        setLoading(false);
        return;
      }
      
      const grammarPromise = aiService.checkGrammar(text);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const errors = await Promise.race([grammarPromise, timeoutPromise]);
      
      setGrammarErrors(errors || []);
      setAiPanel({ show: true, type: 'grammar', data: errors || [] });
      
      if (!errors || errors.length === 0) {
        addToast('Perfect grammar! No errors found', 'success');
      } else {
        addToast(`${errors.length} issues found`, 'info');
      }
    } catch (error) {
      console.error('Grammar Check Error:', error);
      addToast('Failed to check grammar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFixAllGrammar = (grammarErrorsList) => {
    if (!activeNote || !grammarErrorsList || grammarErrorsList.length === 0) return;

    let correctedContent = activeNote.content;
    correctedContent = correctedContent.replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, '$1');
    
    grammarErrorsList.forEach((error) => {
      const regex = new RegExp(error.error.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      correctedContent = correctedContent.replace(regex, error.suggestion);
    });

    if (!correctedContent || correctedContent.trim() === '') {
      addToast('Error: Could not apply fixes', 'error');
      return;
    }
    
    updateNote({ content: correctedContent });
    setGrammarErrors([]);
    setAiPanel({ show: false, type: '', data: null });
    
    addToast(`Fixed ${grammarErrorsList.length} grammar errors!`, 'success', 3000);
  };

  const handleFixSingleError = (error, suggestion) => {
    if (!activeNote) return;
    
    let correctedContent = activeNote.content;
    correctedContent = correctedContent.replace(/<span class="grammar-error"[^>]*>(.*?)<\/span>/gi, '$1');
    correctedContent = correctedContent.replace(error, suggestion);
    
    if (!correctedContent || correctedContent.trim() === '') {
      return;
    }
    
    updateNote({ content: correctedContent });
    
    const updatedErrors = grammarErrors.filter(e => e.error !== error);
    setGrammarErrors(updatedErrors);
    
    if (aiPanel.show && aiPanel.type === 'grammar') {
      setAiPanel({ 
        show: true, 
        type: 'grammar', 
        data: updatedErrors 
      });
    }
    
    addToast('Grammar error fixed!', 'success', 2000);
  };

  // Translation handlers
  const handleShowTranslationModal = () => {
    console.log('🌐 Translation button clicked');
    console.log('Active note:', activeNote);
    
    if (!activeNote) {
      addToast('No note selected', 'warning');
      return;
    }

    if (activeNote.isEncrypted) {
      addToast('Cannot translate encrypted notes', 'warning');
      return;
    }

    const div = document.createElement('div');
    div.innerHTML = activeNote.content;
    const text = div.textContent || div.innerText || '';

    if (!text || text.trim().length < 10) {
      addToast('Please add more content to translate', 'warning');
      return;
    }

    console.log('✅ Opening translation modal');
    setShowTranslationModal(true);
  };

  const handleTranslateNote = async (targetLanguage) => {
    console.log('🌐 Starting translation to:', targetLanguage);
    
    if (!activeNote) {
      addToast('No note selected', 'warning');
      setShowTranslationModal(false);
      return;
    }

    if (activeNote.isEncrypted) {
      addToast('Cannot translate encrypted notes', 'warning');
      setShowTranslationModal(false);
      return;
    }

    try {
      setLoading(true);
      const text = activeNote.content;

      if (!text || text.length < 10) {
        addToast('Please add more content to translate', 'warning');
        setLoading(false);
        setShowTranslationModal(false);
        return;
      }

      console.log('📝 Translating content...');
      const translatedContent = await translationService.translateNote(text, targetLanguage);

      if (!translatedContent) {
        throw new Error('Translation failed');
      }

      console.log('✅ Translation successful');
      
      // Update note with translated content
      updateNote({ content: translatedContent });

      setShowTranslationModal(false);
      setLoading(false);
      addToast('Note translated successfully!', 'success');
    } catch (error) {
      console.error('❌ Translation Error:', error);
      setLoading(false);
      setShowTranslationModal(false);
      addToast('Failed to translate: ' + error.message, 'error');
    }
  };

  // Version history handlers
  const handleShowVersionHistory = () => {
    if (!activeNote) {
      addToast('No note selected', 'warning');
      return;
    }
    
    if (activeNote.isEncrypted) {
      addToast('Cannot view history of encrypted notes', 'warning');
      return;
    }
    
    setShowVersionHistory(true);
  };

  const handleRestoreVersion = (version) => {
    if (!activeNote) return;
    
    // Restore the note to the selected version
    const restoredNote = versionService.restoreVersion(activeNote, version);
    
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === activeNoteId ? restoredNote : note
    ));
    
    addToast('Note restored to previous version!', 'success');
  };

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);
    
    if (note.isEncrypted) return titleMatch;
    
    const div = document.createElement('div');
    div.innerHTML = note.content;
    const text = div.textContent || div.innerText || '';
    const contentMatch = text.toLowerCase().includes(query);
    
    return titleMatch || contentMatch;
  });

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="border-b border-[#E5E5E5] dark:border-[#1F1F1F] bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl flex-shrink-0 relative z-50">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Menu + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-all active:scale-95"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X size={22} className="text-[#171717] dark:text-[#E5E5E5]" />
                ) : (
                  <Menu size={22} className="text-[#171717] dark:text-[#E5E5E5]" />
                )}
              </button>
              
              <div className="flex items-center gap-2.5">
                {/* Bigger Icon for Mobile */}
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight leading-tight">
                    Smart Notes
                  </h1>
                </div>
              </div>
            </div>

            {/* Right side - Export + Dark Mode */}
            <div className="flex items-center gap-1.5">
              {activeNote && (
                <button
                  onClick={() => setShowExportMenu(true)}
                  className="p-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-xl transition-all text-[#525252] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] active:scale-95"
                  title="Export note"
                >
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="text-white" size={16} />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
                    Smart Notes
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeNote && (
                <button
                  onClick={() => setShowExportMenu(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#525252] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all"
                  title="Export note"
                >
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
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-40
            w-72 lg:w-72 xl:w-80
            bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl border-r border-[#E5E5E5] dark:border-[#1F1F1F]
            shadow-2xl lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
            top-[53px] lg:top-0
          `}
        >
          <div className="p-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F]">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <NotesList
              notes={filteredNotes}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={createNote}
              onDeleteNote={deleteNote}
              sortOption={sortOption}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden top-[53px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeNote ? (
            <div className="flex-1 p-3 lg:p-4 overflow-hidden">
              {aiPanel.show ? (
                <ResizableSplitPane
                  defaultSize={55}
                  minSize={30}
                  maxSize={70}
                  left={
                    <Editor
                      key={`${activeNoteId}-${activeNote.isEncrypted ? 'encrypted' : 'normal'}`}
                      noteId={activeNoteId}
                      title={activeNote.title}
                      content={activeNote.content}
                      onChange={handleContentChange}
                      onTitleChange={handleTitleChange}
                      onSave={() => {}}
                      onDelete={() => deleteNote(activeNote.id)}
                      onAISummary={handleAISummary}
                      onAITags={handleAITags}
                      onGlossary={handleGlossary}
                      onGrammarCheck={handleGrammarCheck}
                      onToggleEncryption={toggleEncryption}
                      onTogglePin={togglePin}
                      onTranslate={handleShowTranslationModal}
                      onShowVersionHistory={handleShowVersionHistory}
                      isEncrypted={activeNote.isEncrypted}
                      isPinned={activeNote.isPinned}
                      glossaryTerms={glossaryTerms}
                      grammarErrors={grammarErrors}
                      onFixGrammarError={handleFixSingleError}
                      createdAt={activeNote.createdAt}
                      updatedAt={activeNote.updatedAt}
                      createdBy={activeNote.createdBy}
                      versionCount={(activeNote.versions || []).length}
                      updateNote={updateNote}
                    />
                  }
                  right={
                    <AIPanel
                      type={aiPanel.type}
                      data={aiPanel.data}
                      onClose={() => {
                        setAiPanel({ show: false, type: '', data: null });
                        if (aiPanel.type === 'grammar') {
                          setGrammarErrors([]);
                        }
                        if (aiPanel.type === 'glossary') {
                          setGlossaryTerms([]);
                        }
                      }}
                      onFixAllGrammar={handleFixAllGrammar}
                    />
                  }
                />
              ) : (
                <Editor
                  key={`${activeNoteId}-${activeNote.isEncrypted ? 'encrypted' : 'normal'}`}
                  noteId={activeNoteId}
                  title={activeNote.title}
                  content={activeNote.content}
                  onChange={handleContentChange}
                  onTitleChange={handleTitleChange}
                  onSave={() => {}}
                  onDelete={() => deleteNote(activeNote.id)}
                  onAISummary={handleAISummary}
                  onAITags={handleAITags}
                  onGlossary={handleGlossary}
                  onGrammarCheck={handleGrammarCheck}
                  onToggleEncryption={toggleEncryption}
                  onTogglePin={togglePin}
                  onTranslate={handleShowTranslationModal}
                  onShowVersionHistory={handleShowVersionHistory}
                  isEncrypted={activeNote.isEncrypted}
                  isPinned={activeNote.isPinned}
                  glossaryTerms={glossaryTerms}
                  grammarErrors={grammarErrors}
                  onFixGrammarError={handleFixSingleError}
                  createdAt={activeNote.createdAt}
                  updatedAt={activeNote.updatedAt}
                  createdBy={activeNote.createdBy}
                  versionCount={(activeNote.versions || []).length}
                  updateNote={updateNote}
                />
              )}
            </div>
          ) : (
            // FIXED: Perfectly Centered Empty State with Absolute Positioning
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
              <div className="text-center animate-fade-in max-w-md w-full">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-pulse-glow">
                  <Sparkles className="text-white" size={44} />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] mb-3" style={{ letterSpacing: '-0.02em' }}>
                  No note selected
                </h3>
                
                {/* Description */}
                <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mb-8 leading-relaxed max-w-sm mx-auto">
                  Create or select a note to get started with your smart note-taking experience
                </p>
                
                {/* Create Button */}
                <button 
                  onClick={createNote} 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-[0.98] text-base"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  <span>Create Note</span>
                </button>

                {/* Decorative Elements */}
                <div className="mt-12 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#6366F1]/30 animate-ping" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6]/30 animate-ping" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#6366F1]/30 animate-ping" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#171717] px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-[#E5E5E5] dark:border-[#262626]">
            <Loader2 className="animate-spin text-[#6366F1]" size={24} />
            <p className="font-semibold text-[#171717] dark:text-[#FAFAFA] text-sm">Processing...</p>
          </div>
        </div>
      )}

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

      {showExportMenu && activeNote && (
        <ExportMenu
          note={activeNote}
          onClose={() => setShowExportMenu(false)}
        />
      )}

      {showTranslationModal && (
        <TranslationModal
          onClose={() => {
            console.log('🔴 Closing translation modal');
            setShowTranslationModal(false);
          }}
          onTranslate={handleTranslateNote}
          isTranslating={loading}
        />
      )}

      {showVersionHistory && activeNote && (
        <VersionHistory
          note={activeNote}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}

export default App;
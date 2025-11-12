import React, { useState, useEffect } from "react";
import Editor from "./components/RichTextEditor/Editor";
import NotesList from "./components/NotesList/NotesList";
import SearchBar from "./components/Search/SearchBar";
import PasswordProtection from "./components/Encryption/PasswordProtection";
import { storageService } from "./services/storageService";
import { encryptionService } from "./services/encryptionService";
import { aiService } from "./services/aiService";
import { Loader2 } from "lucide-react";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMode, setPasswordMode] = useState("set");
  const [pendingEncryptionNoteId, setPendingEncryptionNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiPanel, setAiPanel] = useState({ show: false, type: "", data: null });
  const [glossaryTerms, setGlossaryTerms] = useState([]);

  // ✅ Load notes on mount
  useEffect(() => {
    console.log("🔄 Loading notes from storage...");
    const loadedNotes = storageService.loadNotes();
    console.log("📦 Loaded notes:", loadedNotes);

    if (loadedNotes && loadedNotes.length > 0) {
      setNotes(loadedNotes);
      setActiveNoteId(loadedNotes[0].id);
    } else {
      // Create a welcome note if no notes exist
      const welcomeNote = {
        id: Date.now().toString(),
        title: "Welcome to Smart Notes",
        content:
          "<h2>Welcome to Smart Notes! 👋</h2><p>This is your first note. You can:</p><ul><li><strong>Format text</strong> using the toolbar</li><li>Use <strong>AI features</strong> (Summary, Tags, Glossary, Grammar)</li><li><strong>Pin</strong> important notes to the top</li><li><strong>Encrypt</strong> sensitive notes with passwords</li><li><strong>Edit titles</strong> by clicking on them</li></ul><p>Start writing your own content or create a new note!</p>",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
        isEncrypted: false,
        tags: [],
      };
      setNotes([welcomeNote]);
      setActiveNoteId(welcomeNote.id);
      storageService.saveNotes([welcomeNote]);
    }
  }, []);

  // ✅ Save notes whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      console.log("💾 Saving notes to storage...", notes.length, "notes");
      storageService.saveNotes(notes);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Helper function to get text content (selected or full)
  const getTextContent = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      return selectedText;
    }

    if (activeNote) {
      const div = document.createElement("div");
      div.innerHTML = activeNote.content;
      return (div.textContent || div.innerText || "").trim();
    }

    return "";
  };

  const createNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "<p>Start writing...</p>",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      isEncrypted: false,
      tags: [],
    };

    console.log("➕ Creating new note:", newNote);
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    setGlossaryTerms([]);
    setAiPanel({ show: false, type: "", data: null });
  };

  const updateNote = (updates) => {
    console.log("📝 Updating note:", activeNoteId, updates);
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    );
  };

  const deleteNote = (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      console.log("🗑️ Deleting note:", id);
      const updatedNotes = notes.filter((n) => n.id !== id);
      setNotes(updatedNotes);

      if (activeNoteId === id) {
        const newActiveId = updatedNotes.length > 0 ? updatedNotes[0].id : null;
        setActiveNoteId(newActiveId);
        setGlossaryTerms([]);
        setAiPanel({ show: false, type: "", data: null });
      }
    }
  };

  const handleContentChange = (newContent) => {
    if (!activeNote?.isEncrypted) {
      console.log("✏️ Content changed for note:", activeNoteId);

      // ✅ Only auto-update title if it's still "Untitled Note" or "Start writing..."
      if (
        activeNote.title === "Untitled Note" ||
        activeNote.title === "Start writing..."
      ) {
        const div = document.createElement("div");
        div.innerHTML = newContent;
        const text = div.textContent || div.innerText || "";
        const firstLine = text.split("\n")[0].trim().substring(0, 50);
        const title = firstLine || "Untitled Note";

        updateNote({ content: newContent, title });
      } else {
        // Just update content, keep existing title
        updateNote({ content: newContent });
      }
    }
  };

  // ✅ Handle title changes
  const handleTitleChange = (newTitle) => {
    console.log("📝 Title changed for note:", activeNoteId, "to:", newTitle);
    updateNote({ title: newTitle });
  };

  const handleSelectNote = (id) => {
    console.log("🔄 Switching to note:", id);
    setActiveNoteId(id);
    setGlossaryTerms([]);
    setAiPanel({ show: false, type: "", data: null });
  };

  const togglePin = () => {
    updateNote({ isPinned: !activeNote.isPinned });
  };

  const toggleEncryption = () => {
    if (!activeNote) return;

    if (activeNote.isEncrypted) {
      // Decrypt
      setPasswordMode("unlock");
      setPendingEncryptionNoteId(activeNoteId);
      setShowPasswordModal(true);
    } else {
      // Encrypt - make sure content is saved first
      const currentContent = activeNote.content;
      if (
        !currentContent ||
        currentContent.trim().length === 0 ||
        currentContent === "<p>Start writing...</p>"
      ) {
        alert("⚠️ Please add some content to the note before encrypting it.");
        return;
      }

      setPasswordMode("set");
      setPendingEncryptionNoteId(activeNoteId);
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = async (password) => {
    try {
      setLoading(true);
      const note = notes.find((n) => n.id === pendingEncryptionNoteId);

      if (!note) {
        alert("Note not found");
        setLoading(false);
        setShowPasswordModal(false);
        return;
      }

      if (passwordMode === "set") {
        // ENCRYPTING
        console.log("🔐 Encrypting note...");
        const encrypted = await encryptionService.encrypt(
          note.content,
          password
        );

        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === pendingEncryptionNoteId
              ? {
                  ...n,
                  content: encrypted,
                  isEncrypted: true,
                  updatedAt: Date.now(),
                }
              : n
          )
        );

        setShowPasswordModal(false);
        setPendingEncryptionNoteId(null);
        setLoading(false);

        // Show success message after modal closes
        setTimeout(() => {
          alert("✅ Note encrypted successfully!");
        }, 200);
      } else {
        // DECRYPTING
        try {
          console.log("🔓 Decrypting note...");
          const decrypted = await encryptionService.decrypt(
            note.content,
            password
          );
          console.log(
            "✅ Decryption successful, content length:",
            decrypted.length
          );

          // Update notes with decrypted content
          setNotes((prevNotes) =>
            prevNotes.map((n) =>
              n.id === pendingEncryptionNoteId
                ? {
                    ...n,
                    content: decrypted,
                    isEncrypted: false,
                    updatedAt: Date.now(),
                  }
                : n
            )
          );

          setShowPasswordModal(false);
          setPendingEncryptionNoteId(null);
          setLoading(false);

          // Show success message
          setTimeout(() => {
            alert("✅ Note decrypted successfully!");
          }, 200);
        } catch (decryptError) {
          console.error("❌ Decryption failed:", decryptError);
          setLoading(false);
          alert("❌ Incorrect password. Please try again.");
          // Keep modal open for retry
          return;
        }
      }
    } catch (error) {
      console.error("💥 Password operation error:", error);
      setLoading(false);
      alert("Error: " + error.message);
      setShowPasswordModal(false);
      setPendingEncryptionNoteId(null);
    }
  };

  const handleAISummary = async () => {
    if (!activeNote) {
      alert("No note selected");
      return;
    }

    if (activeNote.isEncrypted) {
      alert("Cannot use AI features on encrypted notes. Please decrypt first.");
      return;
    }

    try {
      setLoading(true);
      const text = getTextContent();

      if (!text || text.length < 10) {
        alert(
          "Please select some text or write more content in your note (at least 10 characters)."
        );
        setLoading(false);
        return;
      }

      const summary = await aiService.summarizeNote(text);
      setAiPanel({ show: true, type: "summary", data: summary });
    } catch (error) {
      console.error("AI Summary Error:", error);
      alert("Failed to generate summary: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAITags = async () => {
    if (!activeNote) {
      alert("No note selected");
      return;
    }

    if (activeNote.isEncrypted) {
      alert("Cannot use AI features on encrypted notes. Please decrypt first.");
      return;
    }

    try {
      setLoading(true);
      const text = getTextContent();

      if (!text || text.length < 20) {
        alert(
          "Please select some text or write more content (at least 20 characters) for tag suggestions."
        );
        setLoading(false);
        return;
      }

      const tags = await aiService.suggestTags(text);

      if (tags.length === 0) {
        alert(
          "No tags could be generated. Try adding more descriptive content."
        );
        setLoading(false);
        return;
      }

      updateNote({ tags });
      setAiPanel({ show: true, type: "tags", data: tags });
    } catch (error) {
      console.error("AI Tags Error:", error);
      alert("Failed to generate tags: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGlossary = async () => {
    if (!activeNote) {
      alert("No note selected");
      return;
    }

    if (activeNote.isEncrypted) {
      alert("Cannot use AI features on encrypted notes. Please decrypt first.");
      return;
    }

    try {
      setLoading(true);
      const text = getTextContent();

      if (!text || text.length < 30) {
        alert(
          "Please select some text or write more content (at least 30 characters) with technical terms for glossary highlighting."
        );
        setLoading(false);
        return;
      }

      const terms = await aiService.identifyGlossaryTerms(text);

      if (terms.length === 0) {
        alert(
          "No key terms identified. Try adding more technical or specific content."
        );
        setLoading(false);
        return;
      }

      setGlossaryTerms(terms);
      setAiPanel({ show: true, type: "glossary", data: terms });
    } catch (error) {
      console.error("Glossary Error:", error);
      alert("Failed to identify glossary terms: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!activeNote) {
      alert("No note selected");
      return;
    }

    if (activeNote.isEncrypted) {
      alert("Cannot use AI features on encrypted notes. Please decrypt first.");
      return;
    }

    try {
      setLoading(true);
      const text = getTextContent();

      if (!text || text.length < 10) {
        alert(
          "Please select some text or write more content (at least 10 characters) for grammar checking."
        );
        setLoading(false);
        return;
      }

      const errors = await aiService.checkGrammar(text);
      setAiPanel({ show: true, type: "grammar", data: errors || [] });
    } catch (error) {
      console.error("Grammar Check Error:", error);
      alert("Failed to check grammar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);

    if (note.isEncrypted) return titleMatch;

    const div = document.createElement("div");
    div.innerHTML = note.content;
    const text = div.textContent || div.innerText || "";
    const contentMatch = text.toLowerCase().includes(query);

    return titleMatch || contentMatch;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white p-4 shadow-lg">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">📝 Smart Notes</h1>
          <p className="text-sm opacity-90">AI-Powered Note Taking</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <div className="flex-1 overflow-hidden">
            <NotesList
              notes={filteredNotes}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={createNote}
              onDeleteNote={deleteNote}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4 overflow-hidden">
          {activeNote ? (
            <Editor
              key={`${activeNoteId}-${
                activeNote.isEncrypted ? "encrypted" : "normal"
              }`} // ✅ FORCE REMOUNT
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
              isEncrypted={activeNote.isEncrypted}
              isPinned={activeNote.isPinned}
              glossaryTerms={glossaryTerms}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-xl mb-2">No note selected</p>
                <p className="text-sm">Create a new note to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Panel */}
        {aiPanel.show && (
          <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">AI Insights</h3>
              <button
                onClick={() =>
                  setAiPanel({ show: false, type: "", data: null })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {aiPanel.type === "summary" && (
              <div>
                <h4 className="font-medium mb-2 text-purple-600">Summary</h4>
                <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                  {aiPanel.data}
                </p>
              </div>
            )}

            {aiPanel.type === "tags" && (
              <div>
                <h4 className="font-medium mb-2 text-purple-600">
                  Suggested Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiPanel.data?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiPanel.type === "glossary" && (
              <div>
                <h4 className="font-medium mb-2 text-purple-600">Key Terms</h4>
                <div className="space-y-3">
                  {aiPanel.data?.map((item, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-yellow-400 pl-3 bg-yellow-50 p-2 rounded"
                    >
                      <p className="font-medium text-sm">{item.term}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiPanel.type === "grammar" && (
              <div>
                <h4 className="font-medium mb-2 text-purple-600">
                  Grammar Check
                </h4>
                {!aiPanel.data || aiPanel.data.length === 0 ? (
                  <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-sm text-green-600">
                      No errors found! Your grammar looks good.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiPanel.data.map((error, i) => (
                      <div
                        key={i}
                        className="border-l-4 border-red-400 pl-3 bg-red-50 p-2 rounded text-sm"
                      >
                        <p className="text-red-600 font-medium">
                          ❌ {error.error}
                        </p>
                        <p className="text-green-600 mt-1">
                          ✓ {error.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
            <Loader2 className="animate-spin text-primary-600" size={24} />
            <span className="font-medium">Processing with AI...</span>
          </div>
        </div>
      )}

      {/* Password Modal */}
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
    </div>
  );
}

export default App;

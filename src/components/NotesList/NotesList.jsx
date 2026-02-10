import React from 'react';
import { Trash2, Pin, Lock, Clock } from 'lucide-react';
import { storageService } from '../../services/storageService';

const NotesList = ({ notes, activeNoteId, onSelectNote, onCreateNote, onDeleteNote }) => {
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    return b.updatedAt - a.updatedAt;
  });

  const handleDelete = (e, noteId) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) onDeleteNote(noteId);
  };

  const getPreview = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || '';
    return text.substring(0, 80) + (text.length > 80 ? '...' : '');
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header with New Note Button */}
      <div className="p-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F]">
        <button
          onClick={onCreateNote}
          className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-[#A3A3A3] dark:text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-[#737373] dark:text-[#737373] mb-3 font-medium">No notes yet</p>
            <button onClick={onCreateNote} className="text-xs text-[#6366F1] hover:text-[#5558E3] font-semibold">
              Create your first note
            </button>
          </div>
        ) : (
          <div className="p-2">
            {sortedNotes.map((note, index) => {
              const isActive = activeNoteId === note.id;
              
              return (
                <React.Fragment key={note.id}>
                  <div
                    onClick={() => onSelectNote(note.id)}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#6366F1]/10 dark:bg-[#6366F1]/15 border-2 border-[#6366F1]/40'
                        : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] border-2 border-transparent'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {note.isPinned && (
                          <Pin size={11} className="text-[#6366F1] flex-shrink-0" fill="currentColor" />
                        )}
                        {note.isEncrypted && (
                          <Lock size={11} className="text-amber-500 flex-shrink-0" />
                        )}
                        <h3 className={`font-semibold text-sm truncate ${
                          isActive ? 'text-[#6366F1] dark:text-[#818CF8]' : 'text-[#171717] dark:text-[#FAFAFA]'
                        }`}>
                          {note.title}
                        </h3>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, note.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-red-500/10 rounded-lg text-red-500 hover:text-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Preview */}
                    {note.isEncrypted ? (
                      <p className="text-xs text-amber-600/80 dark:text-amber-400/80 italic mb-2 font-medium">
                        🔒 Encrypted content
                      </p>
                    ) : (
                      <p className="text-xs text-[#737373] dark:text-[#A3A3A3] line-clamp-2 mb-2 leading-relaxed">
                        {getPreview(note.content)}
                      </p>
                    )}

                    {/* Footer Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#A3A3A3] dark:text-[#525252] font-medium">
                        <Clock size={10} />
                        <span>{storageService.formatTimestamp(note.updatedAt)}</span>
                      </div>

                      {/* Tags */}
                      {note.tags?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 bg-[#6366F1]/10 text-[#6366F1] rounded text-[10px] font-bold">
                            {note.tags[0].substring(0, 8)}
                          </span>
                          {note.tags.length > 1 && (
                            <span className="px-1.5 py-0.5 bg-[#A3A3A3]/10 text-[#525252] rounded text-[10px] font-bold">
                              +{note.tags.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Separator Line - except after last item */}
                  {index < sortedNotes.length - 1 && (
                    <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5] dark:via-[#262626] to-transparent my-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Count */}
      {sortedNotes.length > 0 && (
        <div className="p-3 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#A3A3A3] dark:text-[#525252] text-center font-medium">
          {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
        </div>
      )}
    </div>
  );
};

export default NotesList;
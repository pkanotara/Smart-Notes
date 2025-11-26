import React from 'react';
import { Trash2, Pin, Lock, Calendar } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { sortService } from '../../utils/sortService';
import SortDropdown from '../SortDropdown/SortDropdown';

const NotesList = ({ notes, activeNoteId, onSelectNote, onCreateNote, onDeleteNote, sortOption, onSortChange }) => {
  const sortedNotes = sortService.sortNotes(notes, sortOption);

  const handleDelete = (e, noteId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(noteId);
    }
  };

  const getPreview = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* New Note Button */}
      <div className="p-3 border-b border-[#E5E5E5] dark:border-[#1F1F1F]">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onCreateNote}
            className="flex-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">New Note</span>
          </button>
          <SortDropdown currentSort={sortOption} onSortChange={onSortChange} />
        </div>
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
            <button onClick={onCreateNote} className="text-xs text-[#6366F1] hover:text-[#5558E3] font-semibold transition-colors">
              Create your first note
            </button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`
                  group relative p-3.5 rounded-xl cursor-pointer transition-all duration-200
                  ${activeNoteId === note.id
                    ? 'bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 dark:from-[#6366F1]/15 dark:to-[#8B5CF6]/15 ring-1 ring-[#6366F1]/30 dark:ring-[#6366F1]/40 shadow-sm'
                    : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
                  }
                `}
              >
                {/* Top right icons - Pin and Delete in a row */}
                <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                  {/* Pin icon - always visible if pinned */}
                  {note.isPinned && (
                    <div className="flex items-center justify-center w-6 h-6 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 rounded-lg">
                      <Pin size={12} className="text-[#6366F1]" fill="currentColor" />
                    </div>
                  )}
                  
                  {/* Delete button - shows on hover */}
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="
                      flex items-center justify-center w-6 h-6 rounded-lg
                      bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white
                      opacity-0 group-hover:opacity-100 transition-all duration-200
                    "
                    title="Delete note"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Title with lock icon */}
                <div className="flex items-start justify-between gap-2 mb-2 pr-14">
                  <h3 className={`
                    flex-1 font-semibold text-sm line-clamp-1
                    ${activeNoteId === note.id
                      ? 'text-[#6366F1] dark:text-[#818CF8]'
                      : 'text-[#171717] dark:text-[#FAFAFA]'
                    }
                  `}>
                    {note.title}
                  </h3>
                  
                  {/* Lock icon - only if encrypted */}
                  {note.isEncrypted && (
                    <div className="flex items-center justify-center w-5 h-5 bg-amber-500/10 dark:bg-amber-500/20 rounded-md flex-shrink-0">
                      <Lock size={12} className="text-amber-500 dark:text-amber-400" />
                    </div>
                  )}
                </div>

                {/* Preview */}
                {!note.isEncrypted && (
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] line-clamp-2 mb-2.5 leading-relaxed">
                    {getPreview(note.content)}
                  </p>
                )}

                {note.isEncrypted && (
                  <p className="text-xs text-amber-600 dark:text-amber-400/90 italic mb-2.5 font-medium">
                    🔒 Encrypted content
                  </p>
                )}

                {/* Metadata row */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#A3A3A3] dark:text-[#525252]">
                      <Calendar size={10} />
                      <span className="font-medium">
                        {storageService.formatTimestamp(note.updatedAt)}
                      </span>
                    </div>

                    {note.createdBy && (
                      <span className="text-[#A3A3A3] dark:text-[#525252] text-xs font-medium">
                        @{note.createdBy}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 text-[#6366F1] dark:text-[#818CF8] rounded-md text-xs font-semibold">
                        {note.tags[0].length > 8 ? note.tags[0].substring(0, 8) + '...' : note.tags[0]}
                      </span>
                      {note.tags.length > 1 && (
                        <span className="px-2 py-0.5 bg-[#A3A3A3]/10 dark:bg-[#525252]/20 text-[#525252] dark:text-[#A3A3A3] rounded-md text-xs font-semibold">
                          +{note.tags.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {sortedNotes.length > 0 && (
        <div className="p-3 border-t border-[#E5E5E5] dark:border-[#1F1F1F] text-xs text-[#A3A3A3] dark:text-[#525252] text-center font-medium">
          {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
        </div>
      )}
    </div>
  );
};

export default NotesList;
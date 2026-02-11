import React from 'react';
import { Trash2, Pin, Lock, Plus, Clock, Tag } from 'lucide-react';
import { storageService } from '../../services/storageService';

const NotesList = ({ notes, activeNoteId, onSelectNote, onCreateNote, onDeleteNote }) => {
  // Sort: Pinned first, then by update time
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    return b.updatedAt - a.updatedAt;
  });

  // Handle delete with confirmation
  const handleDelete = (e, noteId) => {
    e.stopPropagation();
    if (window.confirm('Delete this note? This action cannot be undone.')) {
      onDeleteNote(noteId);
    }
  };

  // Get preview text
  const getPreview = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || '';
    return text.substring(0, 85) + (text.length > 85 ? '...' : '');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#0F0F0F]">
      
      {/* ========== HEADER ========== */}
      <div className="flex-shrink-0 p-4 backdrop-blur-xl bg-white/60 dark:bg-black/40 border-b border-white/30 dark:border-white/10 shadow-sm">
        <button
          onClick={onCreateNote}
          className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Create New Note</span>
        </button>
      </div>

      {/* ========== NOTES LIST ========== */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sortedNotes.length === 0 ? (
          
          /* Empty State */
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 mx-auto mb-4 backdrop-blur-xl bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/10 shadow-lg">
                <svg className="w-10 h-10 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#FAFAFA] mb-2">
                No notes yet
              </h3>
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mb-4">
                Start creating your first note
              </p>
              <button 
                onClick={onCreateNote} 
                className="text-sm text-[#6366F1] hover:text-[#5558E3] font-semibold transition-colors"
              >
                Create your first note →
              </button>
            </div>
          </div>
          
        ) : (
          
          /* Notes Grid */
          <div className="space-y-3">
            {sortedNotes.map((note, index) => {
              const isActive = activeNoteId === note.id;
              
              return (
                <React.Fragment key={note.id}>
                  <div
                    onClick={() => onSelectNote(note.id)}
                    className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-[#6366F1]/15 to-[#8B5CF6]/15 backdrop-blur-xl border-2 border-[#6366F1]/40 shadow-lg shadow-[#6366F1]/10'
                        : 'backdrop-blur-xl bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border-2 border-white/30 dark:border-white/10 hover:border-white/50 dark:hover:border-white/20 hover:shadow-lg'
                    }`}
                  >
                    {/* Card Content */}
                    <div className="p-4">
                      
                      {/* Top: Badges */}
                      {(note.isPinned || note.isEncrypted) && (
                        <div className="flex items-center gap-2 mb-2.5">
                          {note.isPinned && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6366F1]/20 backdrop-blur-sm rounded-lg border border-[#6366F1]/30">
                              <Pin size={11} className="text-[#6366F1]" fill="currentColor" />
                              <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">Pinned</span>
                            </div>
                          )}
                          {note.isEncrypted && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30">
                              <Lock size={11} className="text-green-600 dark:text-green-400" />
                              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Locked</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Title & Delete */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <h3 className={`font-bold text-base leading-snug line-clamp-1 ${
                          isActive 
                            ? 'text-[#6366F1] dark:text-[#818CF8]' 
                            : 'text-[#171717] dark:text-[#FAFAFA]'
                        }`}>
                          {note.title}
                        </h3>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(e, note.id)}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 hover:bg-red-500/20 rounded-lg text-[#A3A3A3] hover:text-red-600 dark:hover:text-red-400 transition-all"
                          title="Delete note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Preview */}
                      {note.isEncrypted ? (
                        <div className="flex items-center gap-2 py-2.5 px-3 bg-green-500/10 backdrop-blur-sm rounded-lg mb-3 border border-green-500/20">
                          <Lock size={13} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium italic">
                            Content is encrypted and protected
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-[#737373] dark:text-[#A3A3A3] leading-relaxed line-clamp-2 mb-3">
                          {getPreview(note.content)}
                        </p>
                      )}

                      {/* Footer: Meta Info */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/30 dark:border-white/10">
                        
                        {/* Left: Timestamp */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3] dark:text-[#525252] font-medium">
                          <Clock size={12} className="flex-shrink-0" />
                          <span>{storageService.formatTimestamp(note.updatedAt)}</span>
                        </div>

                        {/* Right: Tags */}
                        {note.tags?.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Tag size={11} className="text-[#A3A3A3] flex-shrink-0" />
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 bg-[#6366F1]/15 backdrop-blur-sm text-[#6366F1] dark:text-[#818CF8] rounded-md text-[10px] font-bold border border-[#6366F1]/20">
                                {note.tags[0].length > 12 ? note.tags[0].substring(0, 12) + '...' : note.tags[0]}
                              </span>
                              {note.tags.length > 1 && (
                                <span className="px-2 py-0.5 bg-[#A3A3A3]/15 backdrop-blur-sm text-[#525252] dark:text-[#A3A3A3] rounded-md text-[10px] font-bold border border-[#A3A3A3]/20">
                                  +{note.tags.length - 1}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3]/50 dark:text-[#525252]/50 font-medium italic">
                            <Tag size={11} />
                            <span>No tags</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-gradient-to-b from-[#6366F1] to-[#8B5CF6] rounded-r-full shadow-lg" />
                    )}

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Elegant Separator */}
                  {index < sortedNotes.length - 1 && (
                    <div className="relative h-px">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5E5E5]/50 dark:via-[#262626]/50 to-transparent" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== FOOTER ========== */}
      {sortedNotes.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 backdrop-blur-xl bg-white/60 dark:bg-black/40 border-t border-white/30 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#6366F1]/10 backdrop-blur-sm rounded-lg border border-[#6366F1]/20">
              <div className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
              <span className="text-xs font-bold text-[#6366F1] dark:text-[#818CF8]">
                {sortedNotes.length} {sortedNotes.length === 1 ? 'Note' : 'Notes'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesList;
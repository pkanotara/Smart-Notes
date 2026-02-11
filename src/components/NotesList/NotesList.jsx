import React from 'react';
import { Trash2, Pin, Lock, Plus, Clock, Tag, FileText } from 'lucide-react';
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

  // Get preview text from HTML
  const getPreview = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || '';
    return text.substring(0, 90) + (text.length > 90 ? '...' : '');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#FAFAFA] via-[#FFFFFF] to-[#F5F5F5] dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A]">

      {/* ========== NOTES LIST ========== */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[#E5E5E5] dark:scrollbar-thumb-[#262626] scrollbar-track-transparent">

        {sortedNotes.length === 0 ? (
          
          /* Empty State */
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-xs">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-[#6366F1]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                  <Plus size={14} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#FAFAFA] mb-2">
                No notes yet
              </h3>
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mb-4 leading-relaxed">
                Create your first note and start organizing your thoughts
              </p>
              <button
                onClick={onCreateNote}
                className="inline-flex items-center gap-2 text-sm text-[#6366F1] hover:text-[#5558E3] font-semibold transition-colors"
              >
                <span>Get Started</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
          
        ) : (
          
          /* Notes Grid */
          <div className="space-y-1">
            {sortedNotes.map((note, index) => {
              const isActive = activeNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#6366F1]/10 via-[#8B5CF6]/5 to-transparent dark:from-[#6366F1]/20 dark:via-[#8B5CF6]/10 border-[#6366F1]/50 shadow-lg shadow-[#6366F1]/10'
                      : 'bg-white dark:bg-[#111111] border-[#E5E5E5] dark:border-[#262626] hover:border-[#6366F1]/30 hover:shadow-md'
                  }`}
                >
                  {/* Card Content */}
                  <div className="relative p-4">
                    
                    {/* Top Row: Badges */}
                    {(note.isPinned || note.isEncrypted) && (
                      <div className="flex items-center gap-2 mb-2.5">
                        {note.isPinned && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#6366F1]/15 to-[#8B5CF6]/15 backdrop-blur-sm rounded-lg border border-[#6366F1]/30 shadow-sm">
                            <Pin size={11} className="text-[#6366F1]" fill="currentColor" />
                            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">Pinned</span>
                          </div>
                        )}
                        {note.isEncrypted && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-green-500/15 to-emerald-500/15 backdrop-blur-sm rounded-lg border border-green-500/30 shadow-sm">
                            <Lock size={11} className="text-green-600 dark:text-green-400" />
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Locked</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h3 className={`font-bold text-[15px] leading-snug line-clamp-2 transition-colors ${
                        isActive
                          ? 'text-[#6366F1] dark:text-[#818CF8]'
                          : 'text-[#171717] dark:text-[#FAFAFA]'
                      }`}>
                        {note.title}
                      </h3>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, note.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 hover:bg-red-500/10 rounded-lg text-[#A3A3A3] hover:text-red-600 dark:hover:text-red-400 transition-all"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Preview - Hidden if encrypted */}
                    {note.isEncrypted ? (
                      <div className="flex items-center gap-2 py-2.5 px-3 bg-gradient-to-r from-green-500/10 to-emerald-500/5 backdrop-blur-sm rounded-lg mb-3 border border-green-500/20">
                        <Lock size={13} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Content is encrypted and protected
                        </p>
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#737373] dark:text-[#A3A3A3] leading-relaxed line-clamp-2 mb-3">
                        {getPreview(note.content)}
                      </p>
                    )}

                    {/* Footer - Only show if NOT encrypted */}
                    {!note.isEncrypted && (
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
                        
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
                              <span className="px-2.5 py-1 bg-gradient-to-r from-[#6366F1]/15 to-[#8B5CF6]/10 text-[#6366F1] dark:text-[#818CF8] rounded-md text-[10px] font-bold border border-[#6366F1]/20">
                                {note.tags[0].length > 12 ? note.tags[0].substring(0, 12) + '...' : note.tags[0]}
                              </span>
                              {note.tags.length > 1 && (
                                <span className="px-2 py-1 bg-[#A3A3A3]/10 text-[#525252] dark:text-[#A3A3A3] rounded-md text-[10px] font-bold border border-[#A3A3A3]/20">
                                  +{note.tags.length - 1}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#D1D5DB] dark:text-[#404040] italic">
                            <Tag size={11} />
                            <span>No tags</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Encrypted Note - Show only timestamp */}
                    {note.isEncrypted && (
                      <div className="flex items-center gap-1.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626] text-[11px] text-[#A3A3A3] dark:text-[#525252] font-medium">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>{storageService.formatTimestamp(note.updatedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#6366F1] to-[#8B5CF6] rounded-l-xl shadow-lg" />
                  )}

                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== FOOTER ========== */}
      {sortedNotes.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 backdrop-blur-xl bg-white/80 dark:bg-[#0F0F0F]/80 border-t border-[#E5E5E5] dark:border-[#1F1F1F] shadow-sm">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 backdrop-blur-sm rounded-xl border border-[#6366F1]/20 shadow-sm">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#6366F1] animate-ping" />
              </div>
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
import React from 'react';
import NoteItem from './NoteItem';
import { Plus } from 'lucide-react';

const NotesList = ({ notes, activeNoteId, onSelectNote, onCreateNote, onDeleteNote }) => {
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="bg-white h-full flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateNote}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notes yet</p>
            <p className="text-sm mt-2">Create your first note to get started</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onClick={() => onSelectNote(note.id)}
              onDelete={onDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;
import React from 'react';
import { Pin, Lock, Trash2 } from 'lucide-react';

const NoteItem = ({ note, isActive, onClick, onDelete }) => {
  const getPreview = (content) => {
    // ✅ Don't show content preview for encrypted notes
    if (note.isEncrypted) {
      return 'Encrypted content - click to unlock';
    }
    
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
        isActive ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 flex-1">
          {note.isPinned && <Pin size={16} className="text-primary-600" fill="currentColor" />}
          {note.title || 'Untitled Note'}
          {note.isEncrypted && <Lock size={14} className="text-green-600" />}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-2 italic">
        {getPreview(note.content)}
      </p>
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-400">{formatDate(note.updatedAt)}</p>
    </div>
  );
};

export default NoteItem;
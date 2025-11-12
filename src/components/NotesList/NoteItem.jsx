import React, { useState } from 'react';
import { Pin, Lock, Trash2, Clock, Tag, Calendar } from 'lucide-react';

const NoteItem = ({ note, isActive, onClick, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getPreview = (content) => {
    if (note.isEncrypted) {
      return 'Encrypted content - click to unlock';
    }
    
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 80) + (text.length > 80 ? '...' : '');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    }
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFullTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(note.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative px-4 py-3 cursor-pointer transition-all duration-150
        border-l-2 note-item-hover
        ${isActive 
          ? 'bg-[#3A82F7]/5 border-l-[#3A82F7] dark:bg-[#3A82F7]/10' 
          : 'border-l-transparent hover:bg-[#EDEDF0] dark:hover:bg-white/5'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && (
            <Pin size={12} className="text-[#3A82F7] flex-shrink-0" fill="currentColor" />
          )}
          <h3 
            className="font-medium text-sm text-[#2E2E2E] dark:text-[#EAEAEA] truncate"
            title={note.title || 'Untitled Note'}
          >
            {note.title || 'Untitled Note'}
          </h3>
          {note.isEncrypted && (
            <Lock size={11} className="text-green-600 dark:text-green-500 flex-shrink-0" />
          )}
        </div>
        
        <button
          onClick={handleDelete}
          className={`
            flex-shrink-0 p-1 rounded transition-all
            ${showDeleteConfirm 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
              : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600'
            }
          `}
          aria-label="Delete note"
        >
          <Trash2 size={13} />
        </button>
      </div>
      
      {/* Preview */}
      <p className="text-xs text-[#6E6E6E] dark:text-[#A9A9A9] line-clamp-2 mb-2 leading-relaxed">
        {getPreview(note.content)}
      </p>
      
      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F7F7F8] dark:bg-[#2C2D31] text-[#2E2E2E] dark:text-[#EAEAEA] rounded text-xs truncate max-w-[80px]"
              title={tag}
            >
              <Tag size={9} className="flex-shrink-0" />
              <span className="truncate">{tag}</span>
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-xs text-[#6E6E6E] dark:text-[#A9A9A9]">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
      )}
      
      {/* Footer with timestamps */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs text-[#6E6E6E] dark:text-[#A9A9A9]" title={`Last modified: ${getFullTimestamp(note.updatedAt)}`}>
          <Clock size={10} className="flex-shrink-0" />
          <span className="truncate">{formatDate(note.updatedAt)}</span>
        </div>
        {note.createdAt !== note.updatedAt && (
          <div className="flex items-center gap-1 text-xs text-[#6E6E6E] dark:text-[#A9A9A9] opacity-70" title={`Created: ${getFullTimestamp(note.createdAt)}`}>
            <Calendar size={10} className="flex-shrink-0" />
            <span className="truncate text-xs">Created {formatDate(note.createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteItem;
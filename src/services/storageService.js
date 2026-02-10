const STORAGE_KEY = 'smart-notes-data';

export const storageService = {
  saveNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  },

  loadNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  },

  formatTimestamp(timestamp) {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return `${m} ${m === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diff < 604800) {
      const d = Math.floor(diff / 86400);
      return `${d} ${d === 1 ? 'day' : 'days'} ago`;
    }
    
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getFullTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
};
const STORAGE_KEY = 'smart-notes-data';

export const storageService = {
  saveNotes(notes) {
    try {
      const data = JSON.stringify(notes);
      localStorage.setItem(STORAGE_KEY, data);
      console.log('💾 Notes saved to localStorage');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  },

  loadNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const notes = JSON.parse(data);
        console.log('📂 Notes loaded from localStorage');
        return notes;
      }
      return [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ All notes cleared');
  },

  // Format timestamp for display
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  },

  // Get full timestamp
  getFullTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
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
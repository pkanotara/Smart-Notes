const NOTES_KEY = 'notes-app-data';

export const storageService = {
  saveNotes(notes) {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  },

  loadNotes() {
    try {
      const data = localStorage.getItem(NOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  clearNotes() {
    localStorage.removeItem(NOTES_KEY);
  },

  savePreferences(preferences) {
    try {
      localStorage.setItem('notes-app-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  loadPreferences() {
    try {
      const data = localStorage.getItem('notes-app-preferences');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {};
    }
  },
};
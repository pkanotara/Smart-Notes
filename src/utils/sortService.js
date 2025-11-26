/**
 * Sort Service - Provides sorting functionality for notes
 */

// Sort options available to users
export const SORT_OPTIONS = {
  UPDATED_DESC: 'updated_desc',     // Last modified (newest first)
  UPDATED_ASC: 'updated_asc',       // Last modified (oldest first)
  CREATED_DESC: 'created_desc',     // Date created (newest first)
  CREATED_ASC: 'created_asc',       // Date created (oldest first)
  TITLE_ASC: 'title_asc',           // Title (A-Z)
  TITLE_DESC: 'title_desc',         // Title (Z-A)
};

// Human-readable labels for sort options
export const SORT_LABELS = {
  [SORT_OPTIONS.UPDATED_DESC]: 'Last Modified (Newest)',
  [SORT_OPTIONS.UPDATED_ASC]: 'Last Modified (Oldest)',
  [SORT_OPTIONS.CREATED_DESC]: 'Date Created (Newest)',
  [SORT_OPTIONS.CREATED_ASC]: 'Date Created (Oldest)',
  [SORT_OPTIONS.TITLE_ASC]: 'Title (A-Z)',
  [SORT_OPTIONS.TITLE_DESC]: 'Title (Z-A)',
};

// Default sort option
export const DEFAULT_SORT = SORT_OPTIONS.UPDATED_DESC;

// Storage key for persisting user's sort preference
const SORT_PREFERENCE_KEY = 'smart-notes-sort-preference';

/**
 * Sort notes based on the selected sort option
 * Pinned notes are always shown first
 * @param {Array} notes - Array of notes to sort
 * @param {string} sortOption - The sort option to use
 * @returns {Array} - Sorted array of notes
 */
export const sortNotes = (notes, sortOption = DEFAULT_SORT) => {
  if (!notes || notes.length === 0) return [];
  
  const sortedNotes = [...notes].sort((a, b) => {
    // Pinned notes always come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Apply the selected sort option
    switch (sortOption) {
      case SORT_OPTIONS.UPDATED_DESC:
        return b.updatedAt - a.updatedAt;
      
      case SORT_OPTIONS.UPDATED_ASC:
        return a.updatedAt - b.updatedAt;
      
      case SORT_OPTIONS.CREATED_DESC:
        return b.createdAt - a.createdAt;
      
      case SORT_OPTIONS.CREATED_ASC:
        return a.createdAt - b.createdAt;
      
      case SORT_OPTIONS.TITLE_ASC:
        return (a.title || '').localeCompare(b.title || '');
      
      case SORT_OPTIONS.TITLE_DESC:
        return (b.title || '').localeCompare(a.title || '');
      
      default:
        return b.updatedAt - a.updatedAt;
    }
  });
  
  return sortedNotes;
};

/**
 * Save sort preference to localStorage
 * @param {string} sortOption - The sort option to save
 */
export const saveSortPreference = (sortOption) => {
  try {
    localStorage.setItem(SORT_PREFERENCE_KEY, sortOption);
  } catch (error) {
    console.error('Error saving sort preference:', error);
  }
};

/**
 * Load sort preference from localStorage
 * @returns {string} - The saved sort option or default
 */
export const loadSortPreference = () => {
  try {
    const saved = localStorage.getItem(SORT_PREFERENCE_KEY);
    if (saved && Object.values(SORT_OPTIONS).includes(saved)) {
      return saved;
    }
    return DEFAULT_SORT;
  } catch (error) {
    console.error('Error loading sort preference:', error);
    return DEFAULT_SORT;
  }
};

export const sortService = {
  SORT_OPTIONS,
  SORT_LABELS,
  DEFAULT_SORT,
  sortNotes,
  saveSortPreference,
  loadSortPreference,
};

/**
 * Version Service - Manages version history for notes
 * Provides functionality to save, list, and restore previous versions
 */

const MAX_VERSIONS_PER_NOTE = 50; // Maximum number of versions to keep per note

/**
 * Create a version snapshot of a note
 * @param {Object} note - The note object
 * @returns {Object} - Version snapshot
 */
export const createVersionSnapshot = (note) => {
  return {
    versionId: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    title: note.title,
    content: note.content,
    tags: note.tags ? [...note.tags] : [],
  };
};

/**
 * Add a new version to the note's version history
 * @param {Object} note - The note object
 * @param {Object} previousState - The previous state before update
 * @returns {Array} - Updated versions array
 */
export const addVersion = (note, previousState) => {
  const versions = note.versions || [];
  
  // Create a snapshot of the previous state
  const snapshot = {
    versionId: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    title: previousState.title,
    content: previousState.content,
    tags: previousState.tags ? [...previousState.tags] : [],
  };
  
  // Add new version to the beginning
  const newVersions = [snapshot, ...versions];
  
  // Keep only the maximum allowed versions
  if (newVersions.length > MAX_VERSIONS_PER_NOTE) {
    return newVersions.slice(0, MAX_VERSIONS_PER_NOTE);
  }
  
  return newVersions;
};

/**
 * Get the version history for a note
 * @param {Object} note - The note object
 * @returns {Array} - Array of version snapshots
 */
export const getVersionHistory = (note) => {
  return note.versions || [];
};

/**
 * Get a specific version by ID
 * @param {Object} note - The note object
 * @param {string} versionId - The version ID to find
 * @returns {Object|null} - The version snapshot or null
 */
export const getVersionById = (note, versionId) => {
  const versions = note.versions || [];
  return versions.find(v => v.versionId === versionId) || null;
};

/**
 * Restore a note to a specific version
 * @param {Object} note - The current note object
 * @param {Object} version - The version to restore to
 * @returns {Object} - The restored note object
 */
export const restoreVersion = (note, version) => {
  // First, save the current state as a new version before restoring
  const currentSnapshot = createVersionSnapshot(note);
  const versions = note.versions || [];
  
  return {
    ...note,
    title: version.title,
    content: version.content,
    tags: version.tags ? [...version.tags] : [],
    updatedAt: Date.now(),
    versions: [currentSnapshot, ...versions].slice(0, MAX_VERSIONS_PER_NOTE),
  };
};

/**
 * Format version timestamp for display
 * @param {number} timestamp - The version timestamp
 * @returns {string} - Formatted date string
 */
export const formatVersionTimestamp = (timestamp) => {
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
  
  // Format as full date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get version preview text
 * @param {Object} version - The version object
 * @param {number} maxLength - Maximum preview length
 * @returns {string} - Preview text
 */
export const getVersionPreview = (version, maxLength = 100) => {
  if (!version.content) return 'Empty content';
  
  // Create a temporary element to extract text
  const div = typeof document !== 'undefined'
    ? document.createElement('div')
    : { textContent: version.content.replace(/<[^>]*>/g, ' ') };
  
  if (typeof document !== 'undefined') {
    div.innerHTML = version.content;
  }
  
  const text = (div.textContent || div.innerText || '').trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Check if content has changed significantly to warrant a new version
 * @param {string} oldContent - Previous content
 * @param {string} newContent - New content
 * @returns {boolean} - True if content changed significantly
 */
export const hasSignificantChange = (oldContent, newContent) => {
  if (!oldContent && newContent) return true;
  if (oldContent && !newContent) return true;
  if (oldContent === newContent) return false;
  
  // Strip HTML tags for comparison
  const stripHtml = (html) => {
    const div = typeof document !== 'undefined'
      ? document.createElement('div')
      : { textContent: html.replace(/<[^>]*>/g, ' ') };
    
    if (typeof document !== 'undefined') {
      div.innerHTML = html;
    }
    
    return (div.textContent || div.innerText || '').trim();
  };
  
  const oldText = stripHtml(oldContent || '');
  const newText = stripHtml(newContent || '');
  
  // If text content is the same, it's just formatting change
  if (oldText === newText) return false;
  
  // Calculate change percentage
  const lengthDiff = Math.abs(oldText.length - newText.length);
  const avgLength = (oldText.length + newText.length) / 2;
  
  // Consider significant if more than 5% change or more than 10 characters
  return lengthDiff > 10 || (avgLength > 0 && (lengthDiff / avgLength) > 0.05);
};

export const versionService = {
  createVersionSnapshot,
  addVersion,
  getVersionHistory,
  getVersionById,
  restoreVersion,
  formatVersionTimestamp,
  getVersionPreview,
  hasSignificantChange,
  MAX_VERSIONS_PER_NOTE,
};

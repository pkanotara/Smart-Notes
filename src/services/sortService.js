/**
 * Sort Service
 */

class SortService {
  sortNotes(notes, sortBy = "updated", order = "desc") {
    const sorted = [...notes];

    switch (sortBy) {
      case "updated":
        return this.sortByUpdated(sorted, order);
      case "created":
        return this.sortByCreated(sorted, order);
      case "title":
        return this.sortByTitle(sorted, order);
      case "wordCount":
        return this.sortByWordCount(sorted, order);
      default:
        return sorted;
    }
  }

  /**
   * Sort by last updated
   */
  sortByUpdated(notes, order) {
    return notes.sort((a, b) =>
      order === "desc"
        ? b.updatedAt - a.updatedAt
        : a.updatedAt - b.updatedAt
    );
  }

  /**
   * Sort by creation date
   */
  sortByCreated(notes, order) {
    return notes.sort((a, b) =>
      order === "desc"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt
    );
  }

  /**
   * Sort alphabetically by title
   */
  sortByTitle(notes, order) {
    return notes.sort((a, b) => {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      return order === "asc"
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    });
  }

  /**
   * Sort by word count
   */
  sortByWordCount(notes, order) {
    return notes.sort((a, b) => {
      const countA = this.getWordCount(a.content);
      const countB = this.getWordCount(b.content);
      return order === "desc" ? countB - countA : countA - countB;
    });
  }

  /**
   * Helper: Count words in content
   */
  getWordCount(content) {
    if (!content) return 0;
    // Strip HTML tags using regex
    const text = content.replace(/<[^>]+>/g, '');
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }

  /**
   * Sort options for UI dropdown
   */
  getSortOptions() {
    return [
      { value: "title", label: "Title (A–Z)", icon: "🔤" },
      { value: "wordCount", label: "Word Count", icon: "📊" },
      { value: "created", label: "Date Created", icon: "📅" },
      { value: "updated", label: "Last Updated", icon: "🕐" },
    ];
  }
}

export const sortService = new SortService();

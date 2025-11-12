export const execCommand = (command, value = null) => {
  document.execCommand(command, false, value);
};

export const formatBold = () => execCommand('bold');
export const formatItalic = () => execCommand('italic');
export const formatUnderline = () => execCommand('underline');

export const alignLeft = () => execCommand('justifyLeft');
export const alignCenter = () => execCommand('justifyCenter');
export const alignRight = () => execCommand('justifyRight');

export const setFontSize = (size) => execCommand('fontSize', size);

export const insertOrderedList = () => execCommand('insertOrderedList');
export const insertUnorderedList = () => execCommand('insertUnorderedList');

export const setForeColor = (color) => execCommand('foreColor', color);
export const setBackColor = (color) => execCommand('backColor', color);

export const getSelection = () => {
  return window.getSelection();
};

export const saveSelection = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
  return null;
};

export const restoreSelection = (range) => {
  if (range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
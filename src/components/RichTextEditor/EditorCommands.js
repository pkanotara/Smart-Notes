export const formatBold = () => document.execCommand('bold', false, null);
export const formatItalic = () => document.execCommand('italic', false, null);
export const formatUnderline = () => document.execCommand('underline', false, null);
export const alignLeft = () => document.execCommand('justifyLeft', false, null);
export const alignCenter = () => document.execCommand('justifyCenter', false, null);
export const alignRight = () => document.execCommand('justifyRight', false, null);

export const setFontSize = (size) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const fontSizes = {
    small: '14px',
    normal: '16px',
    large: '20px',
    huge: '28px'
  };

  const fontSize = fontSizes[size] || '16px';

  if (selection.toString().length > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = fontSize;

    try {
      range.surroundContents(span);
    } catch (e) {
      applyFontSizeWithExecCommand(fontSize);
    }
  } else {
    applyFontSizeWithExecCommand(fontSize);
  }
};

const applyFontSizeWithExecCommand = (fontSize) => {
  document.execCommand('fontSize', false, '7');
  const fontElements = document.getElementsByTagName('font');
  Array.from(fontElements).forEach(el => {
    if (el.size === '7') {
      el.removeAttribute('size');
      el.style.fontSize = fontSize;
    }
  });
};
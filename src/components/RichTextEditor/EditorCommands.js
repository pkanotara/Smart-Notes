export const formatBold = () => {
  document.execCommand('bold', false, null);
};

export const formatItalic = () => {
  document.execCommand('italic', false, null);
};

export const formatUnderline = () => {
  document.execCommand('underline', false, null);
};

export const alignLeft = () => {
  document.execCommand('justifyLeft', false, null);
};

export const alignCenter = () => {
  document.execCommand('justifyCenter', false, null);
};

export const alignRight = () => {
  document.execCommand('justifyRight', false, null);
};

export const setFontSize = (size) => {
  // First, select the current text or position
  const selection = window.getSelection();
  
  if (!selection.rangeCount) return;
  
  // Remove existing font size formatting
  document.execCommand('removeFormat', false, null);
  
  // Apply new font size based on selection
  let fontSize;
  switch (size) {
    case 'small':
      fontSize = '14px';
      break;
    case 'normal':
      fontSize = '16px';
      break;
    case 'large':
      fontSize = '20px';
      break;
    case 'huge':
      fontSize = '28px';
      break;
    default:
      fontSize = '16px';
  }
  
  // If there's selected text, wrap it in a span with the font size
  if (selection.toString().length > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = fontSize;
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If surroundContents fails, use execCommand as fallback
      document.execCommand('fontSize', false, '7');
      const fontElements = document.getElementsByTagName('font');
      for (let i = 0; i < fontElements.length; i++) {
        if (fontElements[i].size === '7') {
          fontElements[i].removeAttribute('size');
          fontElements[i].style.fontSize = fontSize;
        }
      }
    }
  } else {
    // If no text is selected, apply to the current position
    document.execCommand('fontSize', false, '7');
    const fontElements = document.getElementsByTagName('font');
    for (let i = 0; i < fontElements.length; i++) {
      if (fontElements[i].size === '7') {
        fontElements[i].removeAttribute('size');
        fontElements[i].style.fontSize = fontSize;
      }
    }
  }
};
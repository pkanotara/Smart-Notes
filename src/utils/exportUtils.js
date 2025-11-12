export const exportToMarkdown = (note) => {
  const div = document.createElement('div');
  div.innerHTML = note.content;
  
  let markdown = `# ${note.title}\n\n`;
  markdown += div.innerText || div.textContent;
  
  return markdown;
};

export const exportToText = (note) => {
  const div = document.createElement('div');
  div.innerHTML = note.content;
  
  let text = `${note.title}\n${'='.repeat(note.title.length)}\n\n`;
  text += div.innerText || div.textContent;
  
  return text;
};

export const exportToPDF = async (note) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${note.title}</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 10px;
            color: #0284c7;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${note.title}</h1>
        ${note.content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
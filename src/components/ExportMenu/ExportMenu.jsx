import React, { useRef, useEffect } from 'react';
import { Download, FileText, File, Printer, X } from 'lucide-react';
import { exportToMarkdown, exportToText, exportToPDF, downloadFile } from '../../utils/exportUtils';

const ExportMenu = ({ note, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleExport = (format) => {
    switch (format) {
      case 'markdown':
        const markdown = exportToMarkdown(note);
        downloadFile(markdown, `${note.title}.md`, 'text/markdown');
        break;
      case 'text':
        const text = exportToText(note);
        downloadFile(text, `${note.title}.txt`, 'text/plain');
        break;
      case 'pdf':
        exportToPDF(note);
        break;
      case 'html':
        downloadFile(note.content, `${note.title}.html`, 'text/html');
        break;
      default:
        break;
    }
    onClose();
  };

  const options = [
    { id: 'markdown', label: 'Markdown', icon: FileText, description: 'Export as .md file' },
    { id: 'text', label: 'Plain Text', icon: File, description: 'Export as .txt file' },
    { id: 'html', label: 'HTML', icon: FileText, description: 'Export as .html file' },
    { id: 'pdf', label: 'Print/PDF', icon: Printer, description: 'Print or save as PDF' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={menuRef}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-gray-200 dark:border-dark-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Download className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Export Note</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose export format</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-dark-600 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  <Icon size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{option.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button onClick={onClose} className="w-full btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportMenu;
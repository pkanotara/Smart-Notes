import React, { useRef } from 'react';
import { Download, FileText, File, Printer, X } from 'lucide-react';
import { exportToMarkdown, exportToText, exportToPDF, downloadFile } from '../../utils/exportUtils';

const ExportMenu = ({ note, onClose }) => {
  const menuRef = useRef(null);

  const handleExport = (format) => {
    const exports = {
      markdown: () => downloadFile(exportToMarkdown(note), `${note.title}.md`, 'text/markdown'),
      text: () => downloadFile(exportToText(note), `${note.title}.txt`, 'text/plain'),
      html: () => downloadFile(note.content, `${note.title}.html`, 'text/html'),
      pdf: () => exportToPDF(note)
    };
    
    exports[format]?.();
    onClose();
  };

  const options = [
    { id: 'markdown', label: 'Markdown', icon: FileText, desc: 'Export as .md file' },
    { id: 'text', label: 'Plain Text', icon: File, desc: 'Export as .txt file' },
    { id: 'html', label: 'HTML', icon: FileText, desc: 'Export as .html file' },
    { id: 'pdf', label: 'Print/PDF', icon: Printer, desc: 'Print or save as PDF' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={menuRef}
        className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-[#E5E5E5] dark:border-[#262626]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Download className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#171717] dark:text-[#FAFAFA]">Export Note</h3>
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">Choose export format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
            <X size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {options.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => handleExport(id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-all text-left group"
            >
              <div className="w-10 h-10 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                <Icon size={20} className="text-[#737373] dark:text-[#A3A3A3] group-hover:text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#171717] dark:text-[#FAFAFA]">{label}</p>
                <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <button 
            onClick={onClose} 
            className="w-full px-4 py-2.5 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] rounded-xl font-semibold hover:bg-[#E5E5E5] dark:hover:bg-[#262626] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportMenu;
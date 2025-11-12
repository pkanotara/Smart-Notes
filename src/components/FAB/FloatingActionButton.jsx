import React from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-[#3A82F7] hover:brightness-110
                 text-white rounded-full shadow-lg hover:shadow-xl 
                 flex items-center justify-center transition-all duration-200 
                 active:scale-95 z-50 lg:hidden group
                 ring-4 ring-[#3A82F7]/20"
      aria-label="Create new note"
      style={{
        boxShadow: '0 4px 20px rgba(58, 130, 247, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Plus size={28} className="group-hover:rotate-90 transition-transform duration-200" strokeWidth={2.5} />
    </button>
  );
};

export default FloatingActionButton;
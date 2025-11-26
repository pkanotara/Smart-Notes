import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { sortService } from '../../utils/sortService';

const SortDropdown = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sortOption) => {
    onSortChange(sortOption);
    setIsOpen(false);
  };

  const sortOptions = Object.entries(sortService.SORT_LABELS);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#525252] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all"
        title="Sort notes"
      >
        <ArrowUpDown size={14} />
        <span className="hidden sm:inline">Sort</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] rounded-xl shadow-xl z-50 py-1 animate-fade-in">
          <div className="px-3 py-2 text-xs font-semibold text-[#A3A3A3] dark:text-[#525252] uppercase tracking-wider">
            Sort by
          </div>
          {sortOptions.map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`
                w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                ${currentSort === value
                  ? 'bg-[#6366F1]/10 text-[#6366F1] dark:text-[#818CF8] font-medium'
                  : 'text-[#171717] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
                }
              `}
            >
              <span>{label}</span>
              {currentSort === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

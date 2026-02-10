import React, { useState } from 'react';
import { ArrowUpDown, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { sortService } from '../../services/sortService';

const SortDropdown = ({ currentSort, currentOrder, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortOptions = sortService.getSortOptions();

  const handleSortSelect = (sortValue) => {
    onSortChange(sortValue, currentOrder);
    setIsOpen(false);
  };

  const toggleOrder = () => {
    onSortChange(currentSort, currentOrder === 'desc' ? 'asc' : 'desc');
  };
  
  // Helper to get order label based on sort type
  const getOrderLabel = (sortKey, order) => {
    const dateSorts = ['created', 'updated', 'date'];
    if (dateSorts.includes(sortKey)) {
      return order === 'desc' ? 'Newest First' : 'Oldest First';
    }
    return order === 'desc' ? 'Z → A' : 'A → Z';
  };

  const currentOption = sortOptions.find(opt => opt.value === currentSort);

  return (
    <div className="relative">
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#171717] transition-colors text-sm font-medium text-[#171717] dark:text-[#FAFAFA]"
        title="Sort notes"
      >
        <ArrowUpDown size={16} />
        <span className="hidden sm:inline">{currentOption?.label || 'Sort'}</span>
        <span className="sm:hidden">{currentOption?.icon || '📊'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] rounded-lg shadow-xl z-20 py-2">
            {/* Sort Options */}
            <div className="px-2 pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] px-3 py-2">
                SORT BY
              </div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${currentSort === option.value
                      ? 'bg-[#6366F1]/10 text-[#6366F1] font-semibold'
                      : 'hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5]'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </span>
                  {currentSort === option.value && (
                    <Check size={16} className="text-[#6366F1]" />
                  )}
                </button>
              ))}
            </div>

            {/* Order Toggle */}
            <div className="px-2 pt-2">
              <div className="text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] px-3 py-2">
                ORDER
              </div>
              <button
                onClick={toggleOrder}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors text-[#171717] dark:text-[#E5E5E5]"
              >
                <span className="flex items-center gap-2">
                  {currentOrder === 'desc' ? (
                    <>
                      <ArrowDown size={16} className="text-[#6366F1]" />
                      <span>Descending</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp size={16} className="text-[#6366F1]" />
                      <span>Ascending</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-[#6366F1] font-semibold">
                  {getOrderLabel(currentSort, currentOrder)}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SortDropdown;
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] dark:text-[#525252]" size={16} />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search notes..."
        className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] text-sm rounded-xl border border-[#E5E5E5] dark:border-[#262626] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent placeholder:text-[#A3A3A3] dark:placeholder:text-[#525252] transition-all font-medium"
      />
    </div>
  );
};

export default SearchBar;
// client/src/components/GroupFilters.jsx
import React from 'react';
import { Search, BookOpen, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GroupFilters({ subjects, filters, onFilterChange }) {
  const { t, isRTL } = useLanguage();

  const handleSearchChange = (e) => {
    onFilterChange(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSubjectChange = (e) => {
    onFilterChange(prev => ({ ...prev, subject: e.target.value }));
  };

  const handleSortChange = (e) => {
    onFilterChange(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      subject: '',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.search !== '' || filters.subject !== '' || filters.sortBy !== 'newest';

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
            {t('searchPlaceholder') || 'Search'}
          </label>
          <div className="relative">
            <Search 
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500 ${isRTL ? 'right-4' : 'left-4'}`} 
              size={18} 
            />
            <input
              type="text"
              placeholder={t('searchPlaceholder') || 'Search by name or subject...'}
              className={`w-full py-3 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="w-full md:w-64 space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
            {t('subject') || 'Subject'}
          </label>
          <div className="relative">
            <BookOpen 
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} 
              size={18} 
            />
            <select
              className={`w-full py-3 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer ${isRTL ? 'pr-11 pl-10' : 'pl-11 pr-10'}`}
              value={filters.subject}
              onChange={handleSubjectChange}
            >
              <option value="">{t('allSubjects') || 'All Subjects'}</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${isRTL ? 'left-4' : 'right-4'}`}>
              <SlidersHorizontal size={14} />
            </div>
          </div>
        </div>

        {/* Sort Selector */}
        <div className="w-full md:w-60 space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
            {t('sortBy') || 'Sort By'}
          </label>
          <div className="relative">
            <ArrowUpDown 
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} 
              size={18} 
            />
            <select
              className={`w-full py-3 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer ${isRTL ? 'pr-11 pl-10' : 'pl-11 pr-10'}`}
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">{t('newest') || 'Newest'}</option>
              <option value="alphabetical">{t('alphabetical') || 'A-Z'}</option>
              <option value="popular">{t('popular') || 'Most Popular'}</option>
            </select>
            <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${isRTL ? 'left-4' : 'right-4'}`}>
              <SlidersHorizontal size={14} />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full md:w-auto px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-2xl transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            {t('clearFilters') || 'Clear'}
          </button>
        )}
      </div>
    </div>
  );
}

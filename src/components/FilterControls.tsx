import { Search, Clock, Calendar, Type } from 'lucide-react';
import { FilterType, SortType } from '../types/task';

interface FilterControlsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function FilterControls({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
}: FilterControlsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2" role="group" aria-label="Filter tasks">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={filter === 'all'}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={filter === 'active'}
          >
            Active
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={filter === 'completed'}
          >
            Completed
          </button>
        </div>

        <div className="flex gap-2 ml-auto" role="group" aria-label="Sort tasks">
          <button
            onClick={() => onSortChange('created')}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              sort === 'created'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={sort === 'created'}
            aria-label="Sort by created date"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSortChange('due')}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              sort === 'due'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={sort === 'due'}
            aria-label="Sort by due date"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSortChange('title')}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              sort === 'title'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={sort === 'title'}
            aria-label="Sort by title"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Search tasks"
        />
      </div>
    </div>
  );
}

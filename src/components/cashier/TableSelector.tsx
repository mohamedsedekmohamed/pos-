import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cashierApi } from '../../services/cashierService';
import { useLanguage } from '../../context/LanguageContext';
import { FiMonitor } from 'react-icons/fi';

interface TableSelectorProps {
  selectedTableId: number | '';
  onSelectTable: (tableId: number, tableName?: string) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ selectedTableId, onSelectTable }) => {
  const { language, renderLocalized } = useLanguage();
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);

  // Fetch Halls
  const { data: halls = [], isLoading: loadingHalls } = useQuery({
    queryKey: ['halls'],
    queryFn: cashierApi.getHalls,
  });

  // Automatically select the first hall when loaded
  useEffect(() => {
    if (halls.length > 0 && !selectedHallId) {
      setSelectedHallId(halls[0].id);
    }
  }, [halls, selectedHallId]);

  // Fetch Tables for the selected Hall
  const { data: tables = [], isLoading: loadingTables } = useQuery({
    queryKey: ['tables', selectedHallId],
    queryFn: () => cashierApi.getHallTables(selectedHallId!),
    enabled: !!selectedHallId,
  });

  if (loadingHalls) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (halls.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
        <p className="text-slate-500 dark:text-slate-400">
          {language === 'ar' ? 'لا توجد صالات متاحة حالياً.' : 'No halls available currently.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Halls Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        {halls.map((hall) => (
          <button
            key={hall.id}
            type="button"
            onClick={() => setSelectedHallId(hall.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              selectedHallId === hall.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {renderLocalized(hall.name)}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 min-h-[250px]">
        {loadingTables ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
            <FiMonitor className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'لا توجد طاولات في هذه الصالة.' : 'No tables in this hall.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tables.map((table) => {
              const isSelected = selectedTableId === table.id;
              // If status is false, table might be occupied or disabled. We can style it differently if needed.
              // We'll assume status true means available.
              const isAvailable = table.status;

              const tableNameDisplay = renderLocalized(table.name);

              return (
                <button
                  key={table.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectTable(table.id, tableNameDisplay)}
                  className={`
                    relative p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300
                    ${
                      isSelected
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 shadow-lg scale-105 z-10'
                        : isAvailable
                        ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 border border-red-200 dark:border-red-800 cursor-not-allowed opacity-75'
                    }
                  `}
                >
                  <FiMonitor
                    className={`w-8 h-8 ${
                      isSelected
                        ? 'text-indigo-200'
                        : isAvailable
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-red-300 dark:text-red-600'
                    }`}
                  />
                  <span className="font-bold text-sm text-center line-clamp-1 break-words w-full">
                    {renderLocalized(table.name)}
                  </span>
                  
                  {/* Status Indicator */}
                  {!isAvailable && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                  {isAvailable && isSelected && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSelector;

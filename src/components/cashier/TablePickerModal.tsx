import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cashierApi } from '../../services/cashierService';
import { useOrderType, type SelectedTable } from '../../context/OrderTypeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FiX, FiCheck, FiShoppingBag, FiLayers } from 'react-icons/fi';
import { MdTableBar } from 'react-icons/md';
import type { Hall, HallTable } from '../../types/cashier';

interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable?: (table: SelectedTable) => void;
}

const TablePickerModal: React.FC<TablePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTable,
}) => {
  const { selectedTable, setSelectedTable } = useOrderType();
  const { language, t, renderLocalized } = useLanguage();
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);

  // Fetch Halls
  const { data: halls = [], isLoading: loadingHalls } = useQuery<Hall[]>({
    queryKey: ['halls', language],
    queryFn: () => cashierApi.getHalls({ lang: language }),
    enabled: isOpen,
  });

  // Automatically select the hall of the selected table, or the first hall
  useEffect(() => {
    if (halls.length > 0) {
      if (selectedTable?.hall_id && halls.some((h) => h.id === selectedTable.hall_id)) {
        setSelectedHallId(selectedTable.hall_id);
      } else if (!selectedHallId || !halls.some((h) => h.id === selectedHallId)) {
        setSelectedHallId(halls[0].id);
      }
    }
  }, [halls, selectedTable?.hall_id]);

  // Fetch Tables for the selected Hall
  const { data: tables = [], isLoading: loadingTables } = useQuery<HallTable[]>({
    queryKey: ['tables', selectedHallId, language],
    queryFn: () => cashierApi.getHallTables(selectedHallId!, { lang: language }),
    enabled: isOpen && !!selectedHallId,
  });

  const activeHall = useMemo(
    () => halls.find((h) => h.id === selectedHallId),
    [halls, selectedHallId]
  );

  if (!isOpen) return null;

  const handleChooseTable = (table: HallTable) => {
    const tableName = renderLocalized(table.name) || (typeof table.name === 'string' ? table.name : `Table #${table.id}`);
    const hallName = activeHall ? renderLocalized(activeHall.name) || (typeof activeHall.name === 'string' ? activeHall.name : '') : undefined;

    const tableData: SelectedTable = {
      id: table.id,
      name: tableName,
      hall_id: table.hall_id,
      hall_name: hallName,
    };

    setSelectedTable(tableData);
    if (onSelectTable) {
      onSelectTable(tableData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <MdTableBar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                {t('halls_and_tables')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('choose_hall_and_table')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Halls Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800">
          {loadingHalls ? (
            <div className="flex items-center gap-2 py-2">
              <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500">{t('loading')}</span>
            </div>
          ) : halls.length === 0 ? (
            <div className="py-2 text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'لا توجد صالات مضافة حالياً.' : 'No halls configured.'}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {halls.map((hall) => {
                const isActive = selectedHallId === hall.id;
                const hallName = renderLocalized(hall.name);
                return (
                  <button
                    key={hall.id}
                    type="button"
                    onClick={() => setSelectedHallId(hall.id)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <FiLayers className="w-4 h-4 shrink-0" />
                    <span>{hallName}</span>
                    {typeof hall.tables_count === 'number' && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {hall.tables_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tables Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40 min-h-[300px]">
          {loadingTables ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <span className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('loading')}
              </span>
            </div>
          ) : tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <MdTableBar className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {language === 'ar' ? 'لا توجد طاولات في هذه الصالة' : 'No tables found in this hall'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar' ? 'يرجى اختيار صالة أخرى أو إضافة طاولات من لوحة التحكم.' : 'Choose another hall or configure tables in admin.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const tableName = renderLocalized(table.name);
                const isAvailable = table.status;
                const hasCart = table.has_active_cart;
                const cartCount = table.cart_items_count ?? 0;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleChooseTable(table)}
                    className={`group relative p-4 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-primary to-indigo-700 text-white shadow-xl shadow-primary/30 ring-4 ring-primary/20 scale-[1.03] z-10'
                        : hasCart
                        ? 'bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 text-slate-800 dark:text-slate-100 hover:shadow-lg hover:scale-[1.02]'
                        : isAvailable
                        ? 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary dark:hover:border-primary hover:shadow-md hover:scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {/* Top status indicator / badge */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                        #{table.id}
                      </span>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">
                          <FiCheck className="w-3 h-3" />
                          <span>{t('selected_table')}</span>
                        </span>
                      ) : hasCart ? (
                        <span className="flex items-center gap-1 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                          <FiShoppingBag className="w-2.5 h-2.5" />
                          <span>{cartCount > 0 ? `${cartCount} ${t('items_count') || 'عناصر'}` : t('active_cart_badge')}</span>
                        </span>
                      ) : isAvailable ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      )}
                    </div>

                    {/* Table Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center my-1 transition-transform group-hover:scale-110 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : hasCart
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <MdTableBar className="w-7 h-7" />
                    </div>

                    {/* Table Name */}
                    <div className="w-full mt-2">
                      <span
                        className={`block font-black text-xs sm:text-sm truncate ${
                          isSelected ? 'text-white' : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        {tableName}
                      </span>
                      <span
                        className={`block text-[11px] font-medium mt-0.5 ${
                          isSelected
                            ? 'text-white/80'
                            : hasCart
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {isSelected
                          ? t('selected_table')
                          : hasCart
                          ? t('active_cart_badge')
                          : t('empty_table_badge')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>{t('empty_table_badge')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>{t('active_cart_badge')}</span>
            </span>
          </div>

          {selectedTable && (
            <div className="font-bold text-slate-700 dark:text-slate-200">
              {t('current_table') || 'الطاولة الحالية'}: <span className="text-primary font-black">{selectedTable.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePickerModal;

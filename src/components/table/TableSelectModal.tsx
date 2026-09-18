import React, { useState } from 'react';
import { useTableContext } from '../../context/TableContext';
import { FiX, FiCoffee } from 'react-icons/fi';

interface TableSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSelectModal: React.FC<TableSelectModalProps> = ({ isOpen, onClose }) => {
  const { tableId, setTableId } = useTableContext();
  const [manualTableNumber, setManualTableNumber] = useState<string>(
    tableId ? tableId.toString() : ''
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(manualTableNumber.trim(), 10);
    if (!isNaN(id) && id > 0) {
      setTableId(id);
      onClose();
    }
  };

  const handleQuickSelect = (num: number) => {
    setTableId(num);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      dir="rtl"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-[#101014] border border-white/15 p-6 shadow-2xl shadow-black animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FiCoffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">تحديد رقم الطاولة</h3>
            <p className="text-xs text-neutral-400">اختر أو أدخل رقم طاولتك الحالية</p>
          </div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              رقم الطاولة
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={manualTableNumber}
                onChange={(e) => setManualTableNumber(e.target.value)}
                placeholder="مثال: 5"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-base font-bold focus:outline-none focus:border-emerald-500 transition-all text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            تأكيد الطاولة
          </button>
        </form>

        {/* Quick Selection Buttons */}
        <div>
          <span className="block text-[11px] font-bold text-neutral-400 mb-2">
            طاولات سريعة:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickSelect(num)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  tableId === num
                    ? 'bg-emerald-500 text-black border-emerald-500 font-black'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-white border-white/10'
                }`}
              >
                طاولة {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

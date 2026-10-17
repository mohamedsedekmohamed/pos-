import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiCheck, FiDollarSign, FiFileText, FiCreditCard } from 'react-icons/fi';
import { cashierApi } from '../../services/cashierService';
import { useLanguage } from '../../context/LanguageContext';
import type { CreateExpensePayload } from '../../types/cashier';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { dir, t, language } = useLanguage();

  const [expenseListId, setExpenseListId] = useState<number | ''>('');
  const [financialId, setFinancialId] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch expense categories
  const { data: expenseLists = [], isLoading: loadingLists } = useQuery({
    queryKey: ['cashier', 'expense-lists', language],
    queryFn: () => cashierApi.getExpenseLists({ lang: language }),
    enabled: isOpen,
  });

  // Fetch financial accounts
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['cashier', 'financial-accounts', language],
    queryFn: () => cashierApi.getFinancialAccounts({ lang: language }),
    enabled: isOpen,
  });

  // Auto-select first account if only 1 exists
  React.useEffect(() => {
    if (accounts.length > 0 && financialId === '') {
      setFinancialId(accounts[0].id);
    }
  }, [accounts, financialId]);

  // Auto-select first expense list and its financial account if available
  React.useEffect(() => {
    if (expenseLists.length > 0 && expenseListId === '') {
      const first = expenseLists[0];
      setExpenseListId(first.id);
      if (first.financial_id) {
        setFinancialId(first.financial_id);
      }
    }
  }, [expenseLists, expenseListId]);

  const handleExpenseListChange = (id: number | '') => {
    setExpenseListId(id);
    if (id) {
      const selected = expenseLists.find((item) => item.id === id);
      if (selected?.financial_id) {
        setFinancialId(selected.financial_id);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => cashierApi.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier', 'expenses'] });
      setSuccessMsg(t('expense_success'));
      setError(null);
      setTimeout(() => {
        setAmount('');
        setDescription('');
        setSuccessMsg(null);
        onClose();
      }, 900);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'فشل في حفظ المصروف';
      setError(msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!expenseListId) {
      setError(t('choose_expense_list'));
      return;
    }

    if (!financialId) {
      setError(t('choose_financial_account'));
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(t('expense_amount_placeholder'));
      return;
    }

    mutation.mutate({
      expense_list_id: Number(expenseListId),
      financial_id: Number(financialId),
      amount: numericAmount,
      description: description.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      dir={dir}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {t('record_expense')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تسجيل مصروفات نقدية أثناء الوردية الحالية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <FiCheck className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Expense Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
              {t('expense_list')} <span className="text-red-500">*</span>
            </label>
            {loadingLists ? (
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs text-slate-400">
                {t('loading')}
              </div>
            ) : (
              <select
                value={expenseListId}
                onChange={(e) => handleExpenseListChange(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">{t('choose_expense_list')}</option>
                {expenseLists.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.financial_account?.name ? `(${item.financial_account.name})` : ''}
                  </option>
                ))}
              </select>
            )}
            {expenseListId && (() => {
              const selected = expenseLists.find((el) => el.id === expenseListId);
              if (selected?.financial_account?.name) {
                return (
                  <div className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <FiCreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>الحساب المالي المرتبط بالبند:</span>
                    <span className="font-bold underline">{selected.financial_account.name}</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* 2. Financial Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
              {t('financial_account')} <span className="text-red-500">*</span>
            </label>
            {loadingAccounts ? (
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs text-slate-400">
                {t('loading')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.map((acc) => {
                  const isSelected = financialId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setFinancialId(acc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {acc.icon ? (
                          <img src={acc.icon} alt={acc.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <FiCreditCard className="w-5 h-5 text-slate-400" />
                        )}
                        <span className="text-xs truncate">{acc.name}</span>
                      </div>
                      {isSelected && <FiCheck className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
              {t('expense_amount')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('expense_amount_placeholder')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <span className="absolute left-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {t('currency')}
              </span>
            </div>

            {/* Quick Amount Additions */}
            <div className="flex items-center gap-1.5 mt-2">
              {[10, 20, 50, 100].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(amount) || 0;
                    setAmount((current + inc).toString());
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  +{inc}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Notes / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FiFileText className="w-3.5 h-3.5" />
                <span>{t('expense_desc')}</span>
              </span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب أي ملاحظات أو تفاصيل إضافية للمصروف..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !expenseListId || !financialId || !amount}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('saving_expense')}</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>{t('confirm_expense')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;

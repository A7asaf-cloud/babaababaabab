import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { Card, Button } from '../components/UI';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { useUI } from '../contexts/UIContext';
import { CATEGORIES, TransactionType } from '../types';
import { Plus, Trash2, Filter, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function CashModule() {
  const { data, addTransaction, deleteTransaction } = useFinanceData();
  const { dir } = useUI();
  
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<{ type: TransactionType | 'all', search: string }>({ type: 'all', search: '' });

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    category: 'Housing',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    addTransaction({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description || formData.category,
      date: new Date(formData.date).toISOString(),
      account: 'Cash'
    });
    
    setFormData({ ...formData, amount: '', description: '' });
    setShowAdd(false);
  };

  const filtered = data.transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(filter.search.toLowerCase()) || 
                          t.category.toLowerCase().includes(filter.search.toLowerCase());
    const matchesType = filter.type === 'all' || t.type === filter.type;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Manual Transactions</h2>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" />
          {showAdd ? 'Close Form' : 'Add Transaction'}
        </Button>
      </div>

      {showAdd && (
        <Card title="New Transaction" className="border-stone-900 border-2">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-60">Amount</label>
              <input 
                type="number" 
                required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2 font-mono"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-60">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-60">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
              >
                {CATEGORIES[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold uppercase mb-1 opacity-60">Description</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
                placeholder="Where did it go?"
              />
            </div>
            <Button type="submit" className="w-full">Save Transaction</Button>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              placeholder="Search transactions..."
              value={filter.search}
              onChange={e => setFilter({...filter, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-800 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 p-1 rounded-xl w-full md:w-auto">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter({...filter, type: t})}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all",
                  filter.type === t ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100" : "text-stone-400 hover:text-stone-600"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ direction: 'ltr' }}>
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em]">Date</th>
                <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em]">Description</th>
                <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em]">Category</th>
                <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em] text-right">Amount</th>
                <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-stone-500 italic">No transactions found</td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                    <td className="py-4 text-sm text-stone-600 dark:text-stone-400">{formatDate(t.date)}</td>
                    <td className="py-4 font-semibold text-sm flex items-center gap-2">
                      {t.type === 'income' ? <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> : <ArrowDownCircle className="w-4 h-4 text-red-500" />}
                      {t.description}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-md text-[10px] font-bold uppercase text-stone-500">
                        {t.category}
                      </span>
                    </td>
                    <td className={cn(
                      "py-4 text-sm font-bold text-right tabular-nums",
                      t.type === 'income' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { Card, Button } from '../components/UI';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { Plus, Trash2, TrendingUp, History, Briefcase, MinusCircle, ArrowRightCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';
import { COLORS } from '../types';

type StockView = 'portfolio' | 'history';

export default function StockModule() {
  const { data, addStock, sellStock, setData } = useFinanceData();
  const [activeTab, setActiveTab] = useState<StockView>('portfolio');
  const [showAdd, setShowAdd] = useState(false);
  const [sellStockData, setSellStockData] = useState<{ symbol: string; shares: number; price: string } | null>(null);

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    shares: '',
    avgBuyPrice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.shares) return;
    
    addStock({
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol.toUpperCase(),
      shares: parseFloat(formData.shares),
      avgBuyPrice: parseFloat(formData.avgBuyPrice),
      buyDate: new Date().toISOString()
    });
    
    setFormData({ symbol: '', name: '', shares: '', avgBuyPrice: '' });
    setShowAdd(false);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellStockData || !sellStockData.price) return;
    
    sellStock(sellStockData.symbol, sellStockData.shares, parseFloat(sellStockData.price));
    setSellStockData(null);
  };

  const totalValue = data.stocks.reduce((acc, s) => acc + (s.shares * s.currentPrice), 0);
  const totalGain = data.stocks.reduce((acc, s) => acc + (s.shares * (s.currentPrice - s.avgBuyPrice)), 0);

  const chartData = data.stocks.map(s => ({
    name: s.symbol,
    value: s.shares * s.currentPrice
  }));

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'portfolio' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-500 hover:text-stone-700"
            )}
          >
            <Briefcase className="w-4 h-4" />
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'history' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-500 hover:text-stone-700"
            )}
          >
            <History className="w-4 h-4" />
            Trade History
          </button>
        </div>
        
        {activeTab === 'portfolio' && (
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4" />
            Buy Asset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {showAdd && activeTab === 'portfolio' && (
            <Card title="Record Buy Transaction" className="border-blue-500 border-2">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-left">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-60">Symbol</label>
                  <input 
                    type="text" 
                    required
                    placeholder="AAPL"
                    value={formData.symbol}
                    onChange={e => setFormData({...formData, symbol: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-60">Buy Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.avgBuyPrice}
                    onChange={e => setFormData({...formData, avgBuyPrice: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-60">Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={formData.shares}
                    onChange={e => setFormData({...formData, shares: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
                  />
                </div>
                <Button type="submit" className="w-full">Record Buy</Button>
              </form>
            </Card>
          )}

          {sellStockData && activeTab === 'portfolio' && (
            <Card title={`Sell ${sellStockData.symbol}`} className="border-red-500 border-2">
               <form onSubmit={handleSellSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 opacity-60">Sell Price</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      autoFocus
                      value={sellStockData.price}
                      onChange={e => setSellStockData({...sellStockData, price: e.target.value})}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 opacity-60">Quantity</label>
                    <input 
                      type="number" 
                      required
                      max={data.stocks.find(s => s.symbol === sellStockData.symbol)?.shares || 0}
                      value={sellStockData.shares}
                      onChange={e => setSellStockData({...sellStockData, shares: parseFloat(e.target.value)})}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2"
                    />
                  </div>
                  <div className="lg:col-span-2 flex gap-2">
                    <Button type="submit" variant="danger" className="flex-1">Confirm Sell</Button>
                    <Button type="button" variant="secondary" onClick={() => setSellStockData(null)}>Cancel</Button>
                  </div>
               </form>
            </Card>
          )}

          {activeTab === 'portfolio' ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em]">Asset</th>
                      <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em]">Shares</th>
                      <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em] text-right">Avg Cost</th>
                      <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em] text-right">Profit/Loss</th>
                      <th className="pb-4 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 dark:divide-stone-900">
                    {data.stocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-stone-500 italic">Portfolio is empty</td>
                      </tr>
                    ) : (
                      data.stocks.map(s => {
                        const profit = (s.currentPrice - s.avgBuyPrice) * s.shares;
                        const profitPerc = ((s.currentPrice - s.avgBuyPrice) / s.avgBuyPrice) * 100;
                        return (
                          <tr key={s.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center font-bold text-blue-600 text-xs text-center leading-none">
                                  {s.symbol.slice(0, 2)}
                                </div>
                                <p className="font-bold text-sm tabular-nums">{s.symbol}</p>
                              </div>
                            </td>
                            <td className="py-4 font-medium text-sm tabular-nums">{s.shares}</td>
                            <td className="py-4 text-sm text-right tabular-nums">{formatCurrency(s.avgBuyPrice)}</td>
                            <td className="py-4 text-right">
                              <div className={cn(
                                "text-sm font-bold tabular-nums",
                                profit >= 0 ? "text-emerald-500" : "text-red-500"
                              )}>
                                {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                <span className="block text-[10px] opacity-80">({profit >= 0 ? '+' : ''}{profitPerc.toFixed(2)}%)</span>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                               <button 
                                onClick={() => setSellStockData({ symbol: s.symbol, shares: s.shares, price: s.currentPrice.toString() })}
                                className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-bold uppercase transition-all hover:bg-red-100 dark:hover:bg-red-900/40"
                               >
                                Sell
                               </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="Stock Transaction History">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-800">
                      <th className="pb-4 font-bold text-xs uppercase text-stone-400">Date</th>
                      <th className="pb-4 font-bold text-xs uppercase text-stone-400">Type</th>
                      <th className="pb-4 font-bold text-xs uppercase text-stone-400">Asset</th>
                      <th className="pb-4 font-bold text-xs uppercase text-stone-400 text-right">Shares</th>
                      <th className="pb-4 font-bold text-xs uppercase text-stone-400 text-right">Price</th>
                      <th className="pb-4 font-bold text-xs uppercase text-stone-400 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 dark:divide-stone-900">
                    {data.stockTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-stone-500 italic">No history recorded</td>
                      </tr>
                    ) : (
                      data.stockTransactions.map(t => (
                        <tr key={t.id} className="text-sm">
                          <td className="py-4 text-stone-500">{formatDate(t.date)}</td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                              t.type === 'buy' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-4 font-bold">{t.symbol}</td>
                          <td className="py-4 text-right tabular-nums">{t.shares}</td>
                          <td className="py-4 text-right tabular-nums">{formatCurrency(t.price)}</td>
                          <td className="py-4 text-right font-bold tabular-nums">
                            {formatCurrency(t.shares * t.price)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card title="Allocation" className="h-fit">
            <div className="h-[240px] w-full">
              {data.stocks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ 
                        backgroundColor: '#1c1917', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400 italic text-sm">
                  Add assets to see allocation
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Total Invested</span>
                  <span className="font-bold">{formatCurrency(data.stocks.reduce((acc, s) => acc + (s.shares * s.avgBuyPrice), 0))}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Market Value</span>
                  <span className="font-bold text-blue-600">{formatCurrency(totalValue)}</span>
               </div>
               <div className="flex justify-between text-sm pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500">Total Unrealized P/L</span>
                  <span className={cn("font-bold", totalGain >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                  </span>
               </div>
            </div>
          </Card>

          <div className="bg-stone-900 text-white rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Market Sentiment</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Stay updated with the latest trends. Diversify your holdings to mitigate sector-specific risks.
              </p>
            </div>
            <div className="absolute right-[-20%] bottom-[-20%] opacity-10 blur-xl">
               <div className="w-48 h-48 bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


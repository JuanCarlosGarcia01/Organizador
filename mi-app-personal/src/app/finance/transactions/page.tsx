'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/types/finance';

export default function TransactionsPage() {
  const { isAuthenticated } = useAuthStore();
  const { transactions, accounts, creditCards, loadAll, removeTransaction } = useFinanceStore();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddTx, setShowAddTx] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadAll();
  }, [isAuthenticated]);

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const grouped = filtered.reduce((acc: Record<string, Transaction[]>, tx) => {
    const key = tx.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const methodLabel = (method: string) => {
    if (method === 'cash') return 'Efectivo';
    if (method.startsWith('ac:')) {
      const a = accounts.find(a => a.id === parseInt(method.split(':')[1]));
      return a?.name || 'Cuenta';
    }
    if (method.startsWith('cc:')) {
      const c = creditCards.find(c => c.id === parseInt(method.split(':')[1]));
      return c?.name || 'Tarjeta';
    }
    return method;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/finance" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Movimientos</h1>
        <button onClick={() => setShowAddTx(true)} className="ml-auto bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
          + Agregar
        </button>
      </header>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex gap-2">
        {(['all', 'income', 'expense'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-blue-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {sortedDates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Sin movimientos</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">
                {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {grouped[date].map((tx, i) => (
                  <div key={tx.id} className={`flex items-center gap-3 px-4 py-3 ${i !== grouped[date].length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${tx.type === 'income' ? 'bg-green-50 dark:bg-green-950 text-green-600' : 'bg-red-50 dark:bg-red-950 text-red-500'}`}>
                      {tx.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{tx.category} · {methodLabel(tx.payment_method)}</p>
                    </div>
                    <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(Number(tx.amount))}
                    </p>
                    <button onClick={() => removeTransaction(tx.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg ml-1 transition-colors flex-shrink-0">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {showAddTx && (
        <AddTransactionModal
          onClose={() => { setShowAddTx(false); loadAll(); }}
          accounts={accounts}
          creditCards={creditCards}
        />
      )}
    </div>
  );
}

function AddTransactionModal({ onClose, accounts, creditCards }: any) {
  const { addTransaction } = useFinanceStore();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Hogar', 'Ropa', 'Educación', 'Otros'];

  const handleSave = async () => {
    if (!desc || !amount) return;
    setLoading(true);
    const accountId = method.startsWith('ac:') ? parseInt(method.split(':')[1]) : null;
    const ccId = method.startsWith('cc:') ? parseInt(method.split(':')[1]) : null;
    await addTransaction(desc, parseFloat(amount), type, category, method, accountId, ccId, date);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nuevo movimiento</h2>
        <div className="flex gap-2">
          <button onClick={() => setType('income')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${type === 'income' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>↑ Ingreso</button>
          <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>↓ Gasto</button>
        </div>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Descripción" value={desc} onChange={e => setDesc(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Monto" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="cash">Efectivo</option>
          {accounts.map((a: any) => <option key={a.id} value={`ac:${a.id}`}>{a.name}</option>)}
          {creditCards.map((c: any) => <option key={c.id} value={`cc:${c.id}`}>{c.name}</option>)}
        </select>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
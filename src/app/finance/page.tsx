'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';

const COLORS = ['#185FA5','#0F6E56','#854F0B','#A32D2D','#533AB7','#0C447C','#3B6D11'];

export default function FinancePage() {
  const { isAuthenticated } = useAuthStore();
  const { transactions, accounts, creditCards, installments, savingAssets, loadAll } = useFinanceStore();
  const router = useRouter();
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddCC, setShowAddCC] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadAll();
  }, [isAuthenticated]);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthIncome  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalAccounts = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const totalSavings  = savingAssets.reduce((s, a) => s + Number(a.current_value), 0);
  const totalDebt     = creditCards.reduce((s, c) => s + Number(c.debt), 0);
  const netWorth      = totalAccounts + totalSavings - totalDebt;

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });

  const catTotals: Record<string, number> = {};
  monthTx.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
  });
  const donutData = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const donutTotal = donutData.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Finanzas</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowAddTx(true)} className="bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
            + Movimiento
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-blue-700 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-75 mb-1">Patrimonio neto</p>
          <p className="text-4xl font-semibold tracking-tight">{fmt(netWorth)}</p>
          <div className="flex gap-6 mt-4">
            <div><p className="text-xs opacity-65">↑ Ingresos</p><p className="text-base font-medium">{fmt(monthIncome)}</p></div>
            <div><p className="text-xs opacity-65">↓ Gastos</p><p className="text-base font-medium">{fmt(monthExpense)}</p></div>
            <div><p className="text-xs opacity-65">Deuda TC</p><p className="text-base font-medium">{fmt(totalDebt)}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Link href="/finance/transactions" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Movimientos</p>
          </Link>
          <Link href="/finance/accounts" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">🏦</div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Cuentas</p>
          </Link>
          <Link href="/finance/savings" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📈</div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Ahorro</p>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Gastos por categoría</h2>
          {donutData.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin gastos este mes</p>
          ) : (
            <div className="space-y-3">
              {donutData.map(([cat, val], i) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{fmt(val)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(val / donutTotal) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Tarjetas de crédito</h2>
            <button onClick={() => setShowAddCC(true)} className="text-xs text-blue-700 hover:underline">+ Agregar</button>
          </div>
          {creditCards.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Sin tarjetas</p>
          ) : (
            <div className="space-y-3">
              {creditCards.map((cc, i) => {
                const pct = cc.limit_amount ? Math.min(100, Math.round((Number(cc.debt) / Number(cc.limit_amount)) * 100)) : 0;
                return (
                  <div key={cc.id} className={`rounded-xl p-4 text-white ${i % 2 === 0 ? 'bg-blue-800' : 'bg-gray-800'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm opacity-80">{cc.name}</p>
                      <p className="text-xs opacity-60">•••• {cc.last_digits}</p>
                    </div>
                    <p className="text-2xl font-semibold">{fmt(Number(cc.debt))}</p>
                    <p className="text-xs opacity-60 mt-1">Límite {fmt(Number(cc.limit_amount))} · Vence día {cc.due_day}</p>
                    <div className="mt-3 h-1 bg-white/20 rounded-full">
                      <div className="h-1 bg-white rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {installments.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Compras en cuotas</h2>
            <div className="space-y-4">
              {installments.map(inst => {
                const cc = creditCards.find(c => c.id === inst.credit_card_id);
                const pct = Math.round((inst.paid_quotas / inst.total_quotas) * 100);
                const monthly = Number(inst.total_amount) / inst.total_quotas;
                return (
                  <div key={inst.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{inst.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{inst.paid_quotas}/{inst.total_quotas} cuotas · {cc?.name || 'Sin tarjeta'}</p>
                      </div>
                      <p className="text-sm font-medium text-blue-700">{fmt(monthly)}/mes</p>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                      <span>{pct}% pagado</span>
                      <span>Resto: {fmt(Number(inst.total_amount) - (inst.paid_quotas / inst.total_quotas) * Number(inst.total_amount))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Últimos movimientos</h2>
            <Link href="/finance/transactions" className="text-xs text-blue-700 hover:underline">Ver todos</Link>
          </div>
          {transactions.slice(0, 5).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin movimientos aún</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${tx.type === 'income' ? 'bg-green-50 dark:bg-green-950 text-green-600' : 'bg-red-50 dark:bg-red-950 text-red-500'}`}>
                    {tx.type === 'income' ? '↓' : '↑'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{tx.category} · {tx.date}</p>
                  </div>
                  <p className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(Number(tx.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {showAddTx && <AddTransactionModal onClose={() => { setShowAddTx(false); loadAll(); }} accounts={accounts} creditCards={creditCards} />}
      {showAddCC && <AddCCModal onClose={() => { setShowAddCC(false); loadAll(); }} />}
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

  const CATEGORIES = ['Alimentación','Transporte','Salud','Entretenimiento','Hogar','Ropa','Educación','Otros'];

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

function AddCCModal({ onClose }: any) {
  const { addCreditCard } = useFinanceStore();
  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [limit, setLimit] = useState('');
  const [debt, setDebt] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    await addCreditCard(name, digits, parseFloat(limit) || 0, parseFloat(debt) || 0, parseInt(dueDay) || 1);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nueva tarjeta de crédito</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Nombre (ej: Visa Galicia)" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Últimos 4 dígitos" value={digits} onChange={e => setDigits(e.target.value)} maxLength={4} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Límite" type="number" value={limit} onChange={e => setLimit(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Deuda actual" type="number" value={debt} onChange={e => setDebt(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Día de vencimiento" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
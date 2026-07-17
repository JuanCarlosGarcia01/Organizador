'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useFitnessStore } from '@/store/useFitnessStore';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardPage() {
  const { profile, isAuthenticated, loading, logout } = useAuthStore();
  const { transactions, accounts, creditCards, savingAssets, loadAll } = useFinanceStore();
  const { goals, loadGoals } = useGoalsStore();
  const { routines, loadRoutines } = useFitnessStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
      loadGoals();
      loadRoutines();
    }
  }, [isAuthenticated]);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthIncome  = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalAccounts = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const totalSavings  = savingAssets.reduce((s, a) => s + Number(a.current_value), 0);
  const totalDebt     = creditCards.reduce((s, c) => s + Number(c.debt), 0);
  const netWorth      = totalAccounts + totalSavings - totalDebt;
  const pendingGoals  = goals.filter(g => !g.completed).length;
  const todayRoutines = routines.filter(r => r.date === now.toISOString().split('T')[0]);

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-5xl mb-4">💼</div>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Buen día,</p>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile?.name} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={async () => { await logout(); router.replace('/login'); }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-blue-700 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-75 mb-1">Patrimonio neto</p>
          <p className="text-4xl font-semibold tracking-tight">{fmt(netWorth)}</p>
          <div className="flex gap-6 mt-4">
            <div><p className="text-xs opacity-65">↑ Ingresos (mes)</p><p className="text-base font-medium">{fmt(monthIncome)}</p></div>
            <div><p className="text-xs opacity-65">↓ Gastos (mes)</p><p className="text-base font-medium">{fmt(monthExpense)}</p></div>
            <div><p className="text-xs opacity-65">Deuda TC</p><p className="text-base font-medium">{fmt(totalDebt)}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/finance" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-3">💰</div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 transition-colors">Finanzas</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{accounts.length} cuentas · {creditCards.length} tarjetas</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">{monthTransactions.length} movimientos este mes</p>
          </Link>

          <Link href="/fitness" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-3">🏋️</div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-700 transition-colors">Fitness</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{routines.length} rutinas registradas</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">{todayRoutines.length > 0 ? `${todayRoutines.length} rutina hoy` : 'Sin rutina hoy'}</p>
          </Link>

          <Link href="/goals" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 transition-colors">Metas</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{goals.length} metas totales</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">{pendingGoals} pendientes</p>
          </Link>
        </div>

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

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Metas activas</h2>
            <Link href="/goals" className="text-xs text-purple-700 hover:underline">Ver todas</Link>
          </div>
          {goals.filter(g => !g.completed).slice(0, 3).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin metas activas</p>
          ) : (
            <div className="space-y-3">
              {goals.filter(g => !g.completed).slice(0, 3).map(goal => (
                <Link key={goal.id} href={`/goals/${goal.id}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-2 -mx-2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-sm">🎯</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{goal.title}</p>
                    {goal.deadline && <p className="text-xs text-gray-400 dark:text-gray-500">Vence: {goal.deadline}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';

export default function AccountsPage() {
  const { isAuthenticated } = useAuthStore();
  const { accounts, creditCards, installments, loadAll, addAccount, removeAccount, addInstallment, removeInstallment, payQuota } = useFinanceStore();
  const router = useRouter();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddInstall, setShowAddInstall] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadAll();
  }, [isAuthenticated]);

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
  const typeLabel: Record<string, string> = { cash: 'Efectivo', debit: 'Débito', transfer: 'Transferencia' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/finance" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cuentas</h1>
        <button onClick={() => setShowAddAccount(true)} className="ml-auto bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
          + Cuenta
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Mis cuentas</h2>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin cuentas registradas</p>
          ) : (
            <div className="space-y-3">
              {accounts.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    a.type === 'cash' ? 'bg-green-50 dark:bg-green-950 text-green-700' :
                    a.type === 'debit' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700' :
                    'bg-amber-50 dark:bg-amber-950 text-amber-700'
                  }`}>
                    {a.type === 'cash' ? '💵' : a.type === 'debit' ? '💳' : '🔄'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{typeLabel[a.type]}</p>
                  </div>
                  <p className={`text-sm font-semibold ${Number(a.balance) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {fmt(Number(a.balance))}
                  </p>
                  <button onClick={() => removeAccount(a.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg ml-2 transition-colors">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total en cuentas</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {fmt(accounts.reduce((s, a) => s + Number(a.balance), 0))}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Compras en cuotas</h2>
            <button onClick={() => setShowAddInstall(true)} className="text-xs text-blue-700 hover:underline">+ Agregar</button>
          </div>
          {installments.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin cuotas registradas</p>
          ) : (
            <div className="space-y-4">
              {installments.map(inst => {
                const cc = creditCards.find(c => c.id === inst.credit_card_id);
                const pct = Math.round((inst.paid_quotas / inst.total_quotas) * 100);
                const monthly = Number(inst.total_amount) / inst.total_quotas;
                return (
                  <div key={inst.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{inst.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{inst.paid_quotas}/{inst.total_quotas} cuotas · {cc?.name || 'Sin tarjeta'}</p>
                      </div>
                      <p className="text-sm font-medium text-blue-700">{fmt(monthly)}/mes</p>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-1">
                      <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{pct}% pagado</span>
                      <div className="flex gap-2">
                        {inst.paid_quotas < inst.total_quotas && (
                          <button onClick={() => payQuota(inst.id, inst.paid_quotas)} className="text-xs text-blue-700 hover:underline">
                            Pagar cuota
                          </button>
                        )}
                        <button onClick={() => removeInstallment(inst.id)} className="text-xs text-red-400 hover:underline">Eliminar</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {showAddAccount && <AddAccountModal onClose={() => { setShowAddAccount(false); loadAll(); }} />}
      {showAddInstall && <AddInstallmentModal onClose={() => { setShowAddInstall(false); loadAll(); }} creditCards={creditCards} />}
    </div>
  );
}

function AddAccountModal({ onClose }: any) {
  const { addAccount } = useFinanceStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    await addAccount(name, type, parseFloat(balance) || 0);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nueva cuenta</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Nombre (ej: Cuenta Galicia)" value={name} onChange={e => setName(e.target.value)} />
        <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" value={type} onChange={e => setType(e.target.value)}>
          <option value="cash">Efectivo</option>
          <option value="debit">Débito</option>
          <option value="transfer">Transferencia</option>
        </select>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Saldo inicial" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}

function AddInstallmentModal({ onClose, creditCards }: any) {
  const { addInstallment } = useFinanceStore();
  const [desc, setDesc] = useState('');
  const [total, setTotal] = useState('');
  const [quotas, setQuotas] = useState('');
  const [ccId, setCcId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!desc || !total || !quotas || !ccId) return;
    setLoading(true);
    await addInstallment(parseInt(ccId), desc, parseFloat(total), parseInt(quotas));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nueva compra en cuotas</h2>
        {creditCards.length === 0 ? (
          <p className="text-sm text-red-400 text-center py-2">Primero agregá una tarjeta de crédito</p>
        ) : (
          <>
            <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Descripción (ej: Heladera)" value={desc} onChange={e => setDesc(e.target.value)} />
            <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Monto total" type="number" value={total} onChange={e => setTotal(e.target.value)} />
            <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Cantidad de cuotas" type="number" value={quotas} onChange={e => setQuotas(e.target.value)} />
            <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" value={ccId} onChange={e => setCcId(e.target.value)}>
              <option value="">Seleccioná una tarjeta</option>
              {creditCards.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleSave} disabled={loading} className="w-full bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        )}
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
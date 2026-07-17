'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';

const TYPE_LABELS: Record<string, string> = {
  savings: 'Cuenta de ahorro',
  stocks: 'Acciones',
  crypto: 'Crypto',
  term_deposit: 'Depósito a plazo',
};

const TYPE_ICONS: Record<string, string> = {
  savings: '🏦',
  stocks: '📈',
  crypto: '₿',
  term_deposit: '📅',
};

export default function SavingsPage() {
  const { isAuthenticated } = useAuthStore();
  const { savingAssets, loadAll, addSavingAsset, editSavingAsset, removeSavingAsset } = useFinanceStore();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadAll();
  }, [isAuthenticated]);

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
  const total = savingAssets.reduce((s, a) => s + Number(a.current_value), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/finance" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ahorro e Inversiones</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-green-800 transition-colors">
          + Agregar
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-green-700 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-75 mb-1">Total ahorros e inversiones</p>
          <p className="text-4xl font-semibold tracking-tight">{fmt(total)}</p>
          <div className="flex gap-4 mt-4 flex-wrap">
            {['savings', 'stocks', 'crypto', 'term_deposit'].map(type => {
              const subtotal = savingAssets.filter(a => a.type === type).reduce((s, a) => s + Number(a.current_value), 0);
              if (subtotal === 0) return null;
              return (
                <div key={type}>
                  <p className="text-xs opacity-65">{TYPE_ICONS[type]} {TYPE_LABELS[type]}</p>
                  <p className="text-sm font-medium">{fmt(subtotal)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Mis activos</h2>
          {savingAssets.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin activos registrados</p>
          ) : (
            <div className="space-y-2">
              {savingAssets.map(asset => (
                <div key={asset.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    asset.type === 'savings'      ? 'bg-green-50 dark:bg-green-950 text-green-700' :
                    asset.type === 'stocks'       ? 'bg-blue-50 dark:bg-blue-950 text-blue-700' :
                    asset.type === 'crypto'       ? 'bg-amber-50 dark:bg-amber-950 text-amber-700' :
                    'bg-purple-50 dark:bg-purple-950 text-purple-700'
                  }`}>
                    {TYPE_ICONS[asset.type] || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{asset.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{TYPE_LABELS[asset.type]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmt(Number(asset.current_value))}</p>
                    <p className={`text-xs font-medium ${Number(asset.change_percent) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {Number(asset.change_percent) >= 0 ? '+' : ''}{Number(asset.change_percent).toFixed(2)}%
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button onClick={() => setEditingId(asset.id)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => removeSavingAsset(asset.id)} className="text-xs text-red-400 hover:underline">Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {showAdd && <AddSavingModal onClose={() => { setShowAdd(false); loadAll(); }} />}
      {editingId !== null && (
        <EditSavingModal
          asset={savingAssets.find(a => a.id === editingId)!}
          onClose={() => { setEditingId(null); loadAll(); }}
        />
      )}
    </div>
  );
}

function AddSavingModal({ onClose }: any) {
  const { addSavingAsset } = useFinanceStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('savings');
  const [value, setValue] = useState('');
  const [change, setChange] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !value) return;
    setLoading(true);
    await addSavingAsset(name, type, parseFloat(value), parseFloat(change) || 0);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nuevo activo</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Nombre (ej: BTC, Plazo fijo...)" value={name} onChange={e => setName(e.target.value)} />
        <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" value={type} onChange={e => setType(e.target.value)}>
          <option value="savings">Cuenta de ahorro</option>
          <option value="stocks">Acciones</option>
          <option value="crypto">Crypto</option>
          <option value="term_deposit">Depósito a plazo</option>
        </select>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Valor actual" type="number" value={value} onChange={e => setValue(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Variación % (ej: 2.5)" type="number" step="0.01" value={change} onChange={e => setChange(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}

function EditSavingModal({ asset, onClose }: any) {
  const { editSavingAsset } = useFinanceStore();
  const [value, setValue] = useState(String(asset.current_value));
  const [change, setChange] = useState(String(asset.change_percent));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await editSavingAsset(asset.id, parseFloat(value), parseFloat(change) || 0);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Editar — {asset.name}</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Valor actual" type="number" value={value} onChange={e => setValue(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Variación %" type="number" step="0.01" value={change} onChange={e => setChange(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Actualizar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
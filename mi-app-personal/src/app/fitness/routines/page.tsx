'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFitnessStore } from '@/store/useFitnessStore';

export default function RoutinesPage() {
  const { isAuthenticated } = useAuthStore();
  const { routines, loadRoutines, addRoutine, removeRoutine } = useFitnessStore();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadRoutines();
  }, [isAuthenticated]);

  const filtered = filterDate ? routines.filter(r => r.date === filterDate) : routines;

  const grouped = filtered.reduce((acc: Record<string, typeof routines>, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/fitness" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rutinas</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-green-800 transition-colors">
          + Agregar
        </button>
      </header>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3">
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
        />
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="ml-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600">
            Limpiar filtro
          </button>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {sortedDates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Sin rutinas registradas</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">
                {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {grouped[date].map((r, i) => (
                  <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i !== grouped[date].length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${r.completed ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                      {r.completed ? '✓' : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                      {r.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{r.notes}</p>}
                    </div>
                    <Link href={`/fitness/routine-detail?id=${r.id}`} className="text-xs text-green-700 hover:underline flex-shrink-0">
                      Ver
                    </Link>
                    <button onClick={() => removeRoutine(r.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg ml-1 transition-colors flex-shrink-0">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {showAdd && (
        <AddRoutineModal onClose={() => { setShowAdd(false); loadRoutines(); }} />
      )}
    </div>
  );
}

function AddRoutineModal({ onClose }: any) {
  const { addRoutine } = useFitnessStore();
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    await addRoutine(name, date, notes || null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nueva rutina</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Nombre (ej: Pecho y tríceps)" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Notas (opcional)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
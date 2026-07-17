'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useGoalsStore } from '@/store/useGoalsStore';

export default function GoalsPage() {
  const { isAuthenticated } = useAuthStore();
  const { goals, loadGoals, addGoal, completeGoal, removeGoal } = useGoalsStore();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadGoals();
  }, [isAuthenticated]);

  const filtered = goals.filter(g => {
    if (filter === 'active') return !g.completed;
    if (filter === 'completed') return g.completed;
    return true;
  });

  const activeCount = goals.filter(g => !g.completed).length;
  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Metas</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto bg-purple-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-purple-800 transition-colors">
          + Nueva meta
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-purple-700 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-75 mb-2">Resumen de metas</p>
          <div className="flex gap-6">
            <div>
              <p className="text-xs opacity-65">🎯 Activas</p>
              <p className="text-3xl font-semibold">{activeCount}</p>
            </div>
            <div>
              <p className="text-xs opacity-65">✅ Completadas</p>
              <p className="text-3xl font-semibold">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {(['active', 'all', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-purple-700 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {f === 'active' ? 'Activas' : f === 'completed' ? 'Completadas' : 'Todas'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {filter === 'active' ? 'Sin metas activas' : filter === 'completed' ? 'Sin metas completadas' : 'Sin metas'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => completeGoal(goal.id, !goal.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${goal.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'}`}
                  >
                    {goal.completed && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${goal.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                      {goal.title}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{goal.description}</p>
                    )}
                    {goal.deadline && (
                      <p className="text-xs text-purple-600 mt-1">📅 Vence: {goal.deadline}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/goals/${goal.id}`} className="text-xs text-purple-700 hover:underline">Ver</Link>
                    <button onClick={() => removeGoal(goal.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg transition-colors">×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {showAdd && (
        <AddGoalModal onClose={() => { setShowAdd(false); loadGoals(); }} />
      )}
    </div>
  );
}

function AddGoalModal({ onClose }: any) {
  const { addGoal } = useGoalsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title) return;
    setLoading(true);
    await addGoal(title, description || null, deadline || null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nueva meta</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Título (ej: Correr 5km)" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 resize-none" placeholder="Descripción (opcional)" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        <div>
          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-2">Fecha límite (opcional)</label>
          <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={loading} className="w-full bg-purple-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useGoalsStore } from '@/store/useGoalsStore';

export default function GoalDetailPage() {
  const { isAuthenticated } = useAuthStore();
  const { goals, activities, loadGoals, loadActivities, completeGoal, addActivity, checkActivity, removeActivity } = useGoalsStore();
  const router = useRouter();
  const params = useParams();
  const goalId = parseInt(params.id as string);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else {
      loadGoals();
      loadActivities(goalId);
    }
  }, [isAuthenticated, goalId]);

  const goal = goals.find(g => g.id === goalId);
  const completedCount = activities.filter(a => a.completed).length;
  const progress = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

  if (!goal) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/goals" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{goal.title}</h1>
          {goal.deadline && <p className="text-xs text-purple-600">📅 Vence: {goal.deadline}</p>}
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-purple-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-purple-800 transition-colors flex-shrink-0">
          + Actividad
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* PROGRESO */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-purple-700">{progress}%</p>
              <p className="text-xs text-gray-400">{completedCount}/{activities.length} actividades completadas</p>
            </div>
            <button
              onClick={() => completeGoal(goal.id, !goal.completed)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${goal.completed ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-700'}`}
            >
              {goal.completed ? '✓ Completada' : 'Marcar completa'}
            </button>
          </div>
          <div className="h-3 bg-gray-100 rounded-full">
            <div className="h-3 bg-purple-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          {goal.description && (
            <p className="text-sm text-gray-500 mt-3">{goal.description}</p>
          )}
        </div>

        {/* ACTIVIDADES */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Actividades</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin actividades. Agregá la primera.</p>
          ) : (
            <div className="space-y-2">
              {activities.map(activity => (
                <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${activity.completed ? 'bg-purple-50' : 'bg-gray-50'}`}>
                  <button
                    onClick={() => checkActivity(activity.id, !activity.completed, goalId)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${activity.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 hover:border-purple-400'}`}
                  >
                    {activity.completed && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${activity.completed ? 'text-purple-700 line-through' : 'text-gray-900'}`}>
                      {activity.title}
                    </p>
                    {activity.reminder_time && (
                      <p className="text-xs text-gray-400">⏰ {activity.reminder_time}</p>
                    )}
                  </div>
                  <button onClick={() => removeActivity(activity.id, goalId)} className="text-gray-300 hover:text-red-400 text-lg transition-colors flex-shrink-0">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {showAdd && (
        <AddActivityModal goalId={goalId} orderIndex={activities.length} onClose={() => { setShowAdd(false); loadActivities(goalId); }} />
      )}
    </div>
  );
}

function AddActivityModal({ goalId, orderIndex, onClose }: any) {
  const { addActivity } = useGoalsStore();
  const [title, setTitle] = useState('');
  const [reminder, setReminder] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title) return;
    setLoading(true);
    await addActivity(goalId, title, reminder || null, orderIndex);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900">Nueva actividad</h2>
        <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900" placeholder="Título (ej: Salir a correr)" value={title} onChange={e => setTitle(e.target.value)} />
        <div>
          <label className="block text-xs text-gray-400 mb-2">Horario de recordatorio (opcional)</label>
          <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900" type="time" value={reminder} onChange={e => setReminder(e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={loading} className="w-full bg-purple-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
} 
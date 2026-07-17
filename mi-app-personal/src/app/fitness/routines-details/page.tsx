'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFitnessStore } from '@/store/useFitnessStore';

function RoutineDetailContent() {
  const { isAuthenticated } = useAuthStore();
  const { routines, exercises, loadRoutines, loadExercises, completeRoutine, addExercise, checkExercise, editExerciseNotes, removeExercise } = useFitnessStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = parseInt(searchParams.get('id') || '0');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else {
      loadRoutines();
      loadExercises(routineId);
    }
  }, [isAuthenticated, routineId, router, loadRoutines, loadExercises]);

  const routine = routines.find(r => r.id === routineId);
  const completedCount = exercises.filter(e => e.completed).length;

  if (!routine) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-400 dark:text-gray-500">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/fitness/routines" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{routine.name}</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(routine.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-green-800 transition-colors">
          + Ejercicio
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{completedCount}/{exercises.length} ejercicios completados</p>
              {routine.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{routine.notes}</p>}
            </div>
            <button
              onClick={() => completeRoutine(routineId, !routine.completed)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${routine.completed ? 'bg-green-100 dark:bg-green-950 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700'}`}
            >
              {routine.completed ? '✓ Completada' : 'Marcar completa'}
            </button>
          </div>
          {exercises.length > 0 && (
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <div className="h-2 bg-green-600 rounded-full transition-all" style={{ width: `${(completedCount / exercises.length) * 100}%` }} />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Ejercicios</h2>
          {exercises.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin ejercicios. Agregá el primero.</p>
          ) : (
            <div className="space-y-3">
              {exercises.map(ex => (
                <div key={ex.id} className={`p-4 rounded-xl border transition-colors ${ex.completed ? 'bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => checkExercise(ex.id, !ex.completed, routineId)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${ex.completed ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}
                    >
                      {ex.completed && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${ex.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>{ex.name}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        {ex.sets && <span className="text-xs text-gray-500 dark:text-gray-400">{ex.sets} series</span>}
                        {ex.reps && <span className="text-xs text-gray-500 dark:text-gray-400">{ex.reps} reps</span>}
                        {ex.weight && <span className="text-xs text-gray-500 dark:text-gray-400">{ex.weight} kg</span>}
                      </div>
                      {ex.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{ex.notes}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setEditingId(ex.id)} className="text-xs text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => removeExercise(ex.id, routineId)} className="text-xs text-red-400 hover:underline">×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {showAdd && (
        <AddExerciseModal routineId={routineId} orderIndex={exercises.length} onClose={() => { setShowAdd(false); loadExercises(routineId); }} />
      )}
      {editingId !== null && (
        <EditExerciseModal exercise={exercises.find(e => e.id === editingId)!} routineId={routineId} onClose={() => { setEditingId(null); loadExercises(routineId); }} />
      )}
    </div>
  );
}

// Este es el nuevo componente principal exportado que envuelve tu contenido en Suspense
export default function RoutineDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-400 dark:text-gray-500">Cargando datos...</p>
      </div>
    }>
      <RoutineDetailContent />
    </Suspense>
  );
}

function AddExerciseModal({ routineId, orderIndex, onClose }: any) {
  const { addExercise } = useFitnessStore();
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    await addExercise(routineId, name, parseInt(sets) || null, parseInt(reps) || null, parseFloat(weight) || null, notes || null, orderIndex);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nuevo ejercicio</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Nombre (ej: Press banca)" value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-3 gap-2">
          <input className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Series" type="number" value={sets} onChange={e => setSets(e.target.value)} />
          <input className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Reps" type="number" value={reps} onChange={e => setReps(e.target.value)} />
          <input className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Kg" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Notas (opcional)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}

function EditExerciseModal({ exercise, routineId, onClose }: any) {
  const { editExerciseNotes } = useFitnessStore();
  const [weight, setWeight] = useState(String(exercise.weight || ''));
  const [notes, setNotes] = useState(exercise.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await editExerciseNotes(exercise.id, parseFloat(weight) || null, notes || null, routineId);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Editar — {exercise.name}</h2>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Peso (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Notas" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Actualizar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
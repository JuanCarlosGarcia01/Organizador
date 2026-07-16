'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFitnessStore } from '@/store/useFitnessStore';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Desayuno',
  lunch: '☀️ Almuerzo',
  dinner: '🌙 Cena',
  snack: '🍎 Snack',
};

export default function FoodLogPage() {
  const { isAuthenticated } = useAuthStore();
  const { foodEntries, loadFoodEntries, removeFoodEntry } = useFitnessStore();
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else loadFoodEntries(date);
  }, [isAuthenticated, date]);

  const totalCalories = foodEntries.reduce((s, f) => s + (f.calories || 0), 0);

  const grouped = foodEntries.reduce((acc: Record<string, typeof foodEntries>, entry) => {
    if (!acc[entry.meal]) acc[entry.meal] = [];
    acc[entry.meal].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/fitness" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registro de comidas</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-green-800 transition-colors">
          + Agregar
        </button>
      </header>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center gap-4">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
        />
        {totalCalories > 0 && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🔥 {totalCalories} kcal</span>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🥗</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Sin comidas registradas este día</p>
          </div>
        ) : (
          ['breakfast', 'lunch', 'dinner', 'snack'].filter(m => grouped[m]).map(meal => (
            <div key={meal} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{MEAL_LABELS[meal]}</h2>
              <div className="space-y-2">
                {grouped[meal].map(entry => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 flex-1">{entry.description}</p>
                    {entry.calories && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{entry.calories} kcal</span>
                    )}
                    <button onClick={() => removeFoodEntry(entry.id, date)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg transition-colors flex-shrink-0">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {showAdd && (
        <AddFoodModal date={date} onClose={() => { setShowAdd(false); loadFoodEntries(date); }} />
      )}
    </div>
  );
}

function AddFoodModal({ date, onClose }: any) {
  const { addFoodEntry } = useFitnessStore();
  const [meal, setMeal] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description) return;
    setLoading(true);
    await addFoodEntry(date, meal, description, parseInt(calories) || null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg p-6 space-y-4">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Registrar comida</h2>
        <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" value={meal} onChange={e => setMeal(e.target.value)}>
          <option value="breakfast">🌅 Desayuno</option>
          <option value="lunch">☀️ Almuerzo</option>
          <option value="dinner">🌙 Cena</option>
          <option value="snack">🍎 Snack</option>
        </select>
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Descripción (ej: Avena con frutas)" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100" placeholder="Calorías (opcional)" type="number" value={calories} onChange={e => setCalories(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 dark:text-gray-500 text-sm py-2">Cancelar</button>
      </div>
    </div>
  );
}
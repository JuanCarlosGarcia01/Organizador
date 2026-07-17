'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFitnessStore } from '@/store/useFitnessStore';

export default function FitnessPage() {
  const { isAuthenticated } = useAuthStore();
  const { routines, foodEntries, loadRoutines, loadFoodEntries } = useFitnessStore();
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else {
      loadRoutines();
      loadFoodEntries(today);
    }
  }, [isAuthenticated]);

  const todayRoutines = routines.filter(r => r.date === today);
  const completedToday = todayRoutines.filter(r => r.completed).length;
  const totalCalories = foodEntries.reduce((s, f) => s + (f.calories || 0), 0);

  const mealLabels: Record<string, string> = {
    breakfast: '🌅 Desayuno',
    lunch: '☀️ Almuerzo',
    dinner: '🌙 Cena',
    snack: '🍎 Snack',
  };

  const groupedFood = foodEntries.reduce((acc: Record<string, typeof foodEntries>, entry) => {
    if (!acc[entry.meal]) acc[entry.meal] = [];
    acc[entry.meal].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fitness</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-green-700 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-75 mb-1">Hoy — {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <div className="flex gap-6 mt-2">
            <div>
              <p className="text-xs opacity-65">🏋️ Rutinas</p>
              <p className="text-2xl font-semibold">{completedToday}/{todayRoutines.length}</p>
            </div>
            <div>
              <p className="text-xs opacity-65">🔥 Calorías</p>
              <p className="text-2xl font-semibold">{totalCalories} kcal</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/fitness/routines" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🏋️</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rutinas</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{routines.length} registradas</p>
          </Link>
          <Link href="/fitness/food-log" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🥗</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Comidas</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{foodEntries.length} entradas hoy</p>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Rutinas de hoy</h2>
            <Link href="/fitness/routines" className="text-xs text-green-700 hover:underline">Ver todas</Link>
          </div>
          {todayRoutines.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin rutinas para hoy</p>
          ) : (
            <div className="space-y-2">
              {todayRoutines.map(r => (
                <Link key={r.id} href={`/fitness/routine-detail?id=${r.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${r.completed ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {r.completed ? '✓' : '○'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                    {r.notes && <p className="text-xs text-gray-400 dark:text-gray-500">{r.notes}</p>}
                  </div>
                  <span className="text-gray-300 dark:text-gray-600 text-lg">›</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Comidas de hoy</h2>
            <Link href="/fitness/food-log" className="text-xs text-green-700 hover:underline">Ver todo</Link>
          </div>
          {foodEntries.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Sin comidas registradas hoy</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedFood).map(([meal, entries]) => (
                <div key={meal}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{mealLabels[meal] || meal}</p>
                  <div className="space-y-1">
                    {entries.map(entry => (
                      <div key={entry.id} className="flex justify-between items-center text-sm px-2">
                        <p className="text-gray-700 dark:text-gray-300">{entry.description}</p>
                        {entry.calories && <p className="text-xs text-gray-400 dark:text-gray-500">{entry.calories} kcal</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total calorías</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{totalCalories} kcal</p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
} 
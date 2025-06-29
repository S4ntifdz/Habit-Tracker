import React from 'react';
import { useHabits } from '../context/HabitsContext';
import { calculateStreak, formatDate } from '../utils/dateUtils';
import { getStreakMessage } from '../utils/motivationalMessages';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';

export const StatsView: React.FC = () => {
  const { state } = useHabits();

  const calculateStats = () => {
    const today = formatDate(new Date());
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    const completedToday = state.completions.filter(c => c.date === today).length;
    const activeHabits = state.habits.filter(h => h.isActive).length;
    
    // Calcular progreso semanal
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(thisWeekStart);
      date.setDate(thisWeekStart.getDate() + i);
      weekDates.push(formatDate(date));
    }
    
    const totalPossibleCompletions = activeHabits * 7;
    const actualCompletions = state.completions.filter(c => 
      weekDates.includes(c.date)
    ).length;
    
    const weeklyProgress = totalPossibleCompletions > 0 ? 
      Math.round((actualCompletions / totalPossibleCompletions) * 100) : 0;

    // Calcular racha más larga
    const habitStreaks = state.habits.map(habit => 
      calculateStreak(state.completions, habit.id)
    );
    const longestStreak = Math.max(0, ...habitStreaks);
    const averageStreak = habitStreaks.length > 0 ? 
      Math.round(habitStreaks.reduce((a, b) => a + b, 0) / habitStreaks.length) : 0;

    return {
      completedToday,
      activeHabits,
      weeklyProgress,
      longestStreak,
      averageStreak
    };
  };

  const stats = calculateStats();
  const motivationalMessage = getStreakMessage(stats.longestStreak);

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 text-center border border-blue-100">
        <div className="text-4xl mb-2">{motivationalMessage.emoji}</div>
        <p className="text-lg font-semibold text-gray-800 mb-1">
          {motivationalMessage.message}
        </p>
        <p className="text-sm text-gray-600">
          La consistencia es la clave del éxito
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <Target className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-800">
              {stats.completedToday}/{stats.activeHabits}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">Completados hoy</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-800">
              {stats.weeklyProgress}%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">Progreso semanal</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <Award className="text-orange-500" size={24} />
            <span className="text-2xl font-bold text-gray-800">
              {stats.longestStreak}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">Racha más larga</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-800">
              {stats.averageStreak}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">Racha promedio</p>
        </div>
      </div>

      {/* Hábitos individuales con sus rachas */}
      {state.habits.filter(h => h.isActive).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Rachas por hábito
          </h3>
          <div className="space-y-3">
            {state.habits.filter(h => h.isActive).map(habit => {
              const streak = calculateStreak(state.completions, habit.id);
              return (
                <div key={habit.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    ></div>
                    <span className="font-medium text-gray-700">{habit.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-800">{streak}</span>
                    {streak > 0 && <span className="text-orange-500">🔥</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips de hábitos atómicos */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          💡 Tip de Hábitos Atómicos
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          "No se trata de ser perfecto, se trata de ser mejor que ayer. 
          Una mejora del 1% cada día resulta en ser 37 veces mejor al final del año."
        </p>
        <p className="text-xs text-gray-500 mt-2 italic">
          - James Clear, Atomic Habits
        </p>
      </div>
    </div>
  );
};
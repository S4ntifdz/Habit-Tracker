import React from 'react';
import { useHabits } from '../context/HabitsContext';
import { getWeekDates, formatDate, getDayName, isToday } from '../utils/dateUtils';
import { Check, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeekViewProps {
  onAddHabit: () => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ onAddHabit }) => {
  const { state, toggleHabitCompletion, isHabitCompletedOnDate } = useHabits();
  const weekDates = getWeekDates();

  const handleHabitToggle = async (habitId: string, date: string) => {
    const wasCompleted = isHabitCompletedOnDate(habitId, date);
    
    await toggleHabitCompletion(habitId, date);
    
    // Celebración con confeti si se completa
    if (!wasCompleted) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.habits.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Comienza tu viaje de hábitos!
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Los pequeños pasos consistentes crean transformaciones extraordinarias.
            Agrega tu primer hábito y empieza a construir la versión de ti que deseas ser.
          </p>
        </div>
        <button
          onClick={onAddHabit}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center mx-auto gap-2"
        >
          <Plus size={20} />
          Crear mi primer hábito
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de la semana */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <div className="text-sm font-medium text-gray-500 p-2">Hábitos</div>
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`text-center p-2 rounded-lg ${
              isToday(date) 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'text-gray-600'
            }`}
          >
            <div className="text-xs font-medium">{getDayName(date)}</div>
            <div className={`font-bold ${isToday(date) ? 'text-white' : 'text-gray-800'}`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Grid de hábitos */}
      <div className="space-y-3">
        {state.habits.filter(h => h.isActive).map((habit) => (
          <div key={habit.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="grid grid-cols-8 gap-2 items-center">
              {/* Nombre del hábito */}
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                ></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-xs text-gray-500 truncate">{habit.description}</p>
                  )}
                </div>
              </div>

              {/* Checkboxes para cada día */}
              {weekDates.map((date, index) => {
                const dateStr = formatDate(date);
                const isCompleted = isHabitCompletedOnDate(habit.id, dateStr);
                
                return (
                  <div key={index} className="flex justify-center">
                    <button
                      onClick={() => handleHabitToggle(habit.id, dateStr)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {isCompleted && <Check size={16} className="text-white" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar hábito */}
      <button
        onClick={onAddHabit}
        className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 flex items-center justify-center gap-2 text-blue-600 font-semibold"
      >
        <Plus size={20} />
        Agregar nuevo hábito
      </button>
    </div>
  );
};
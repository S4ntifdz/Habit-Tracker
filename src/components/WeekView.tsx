import React, { useState } from 'react';
import { useHabits } from '../context/HabitsContext';
import { getWeekDates, formatDate, getDayName, isToday, getWeekNumber, getWeekRange } from '../utils/dateUtils';
import { Check, Plus, Info, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeekViewProps {
  onAddHabit: () => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ onAddHabit }) => {
  const { state, toggleHabitCompletion, isHabitCompletedOnDate } = useHabits();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = semana actual, -1 = anterior, +1 = siguiente
  
  const currentDate = new Date();
  const weekStartDate = new Date(currentDate);
  weekStartDate.setDate(currentDate.getDate() - currentDate.getDay() + (currentWeekOffset * 7));
  
  const weekDates = getWeekDates(weekStartDate);
  const weekRange = getWeekRange(weekStartDate);
  const isCurrentWeek = currentWeekOffset === 0;

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

  const calculateWeeklyBalance = () => {
    const weekDateStrings = weekDates.map(date => formatDate(date));
    
    return state.habits.filter(h => h.isActive).map(habit => {
      const completedDays = weekDateStrings.filter(dateStr => 
        isHabitCompletedOnDate(habit.id, dateStr)
      ).length;
      
      const targetDays = habit.frequency === 'daily' ? 7 : 
                        habit.frequency === 'custom' ? habit.customFrequency || 3 : 7;
      
      const percentage = Math.round((completedDays / targetDays) * 100);
      
      return {
        habit,
        completed: completedDays,
        target: targetDays,
        percentage: Math.min(percentage, 100) // Cap at 100%
      };
    });
  };

  const weeklyBalance = calculateWeeklyBalance();
  const overallWeeklyProgress = weeklyBalance.length > 0 
    ? Math.round(weeklyBalance.reduce((sum, item) => sum + item.percentage, 0) / weeklyBalance.length)
    : 0;

  const shouldShowCheckbox = (habit: any, dateIndex: number) => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'custom') {
      // Para hábitos personalizados, mostramos todos los checkboxes pero destacamos los necesarios
      return true;
    }
    return true;
  };

  const getCheckboxStyle = (habit: any, dateIndex: number, isCompleted: boolean, todayDate: boolean) => {
    const baseStyle = "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-110";
    
    if (isCompleted) {
      return `${baseStyle} bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg transform scale-105`;
    }
    
    if (todayDate && isCurrentWeek) {
      return `${baseStyle} border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100`;
    }
    
    // Para hábitos no diarios, usar un estilo más sutil en días "extra"
    if (habit.frequency === 'custom') {
      const completedThisWeek = weekDates.filter((_, i) => i <= dateIndex && 
        isHabitCompletedOnDate(habit.id, formatDate(weekDates[i]))
      ).length;
      
      if (completedThisWeek >= (habit.customFrequency || 3)) {
        return `${baseStyle} border-gray-200 bg-gray-50 text-gray-400`;
      }
    }
    
    return `${baseStyle} border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50`;
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
      {/* Navegador de semanas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800">
              <Calendar size={18} />
              {weekRange}
            </div>
            {isCurrentWeek && (
              <span className="text-xs text-blue-600 font-medium">Semana actual</span>
            )}
          </div>
          
          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Header de días */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-xl transition-all ${
                isToday(date) && isCurrentWeek
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium mb-1">{getDayName(date)}</div>
              <div className={`text-lg font-bold ${isToday(date) && isCurrentWeek ? 'text-white' : 'text-gray-800'}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance semanal */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Balance Semanal</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{overallWeeklyProgress}%</div>
            <div className="text-xs text-gray-600">Progreso general</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {weeklyBalance.map(({ habit, completed, target, percentage }) => (
            <div key={habit.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: habit.color }}
                ></div>
                <span className="font-medium text-gray-700">{habit.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{completed}/{target}</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-10 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de hábitos */}
      <div className="space-y-4">
        {state.habits.filter(h => h.isActive).map((habit) => (
          <div key={habit.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            {/* Header del hábito */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                <div 
                  className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: habit.color }}
                ></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                    {habit.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">
                      {habit.frequency === 'daily' ? 'Diario' : 
                       habit.frequency === 'custom' ? `${habit.customFrequency}x por semana` : 
                       'Semanal'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botón de información */}
              {habit.description && (
                <div className="relative">
                  <button
                    onClick={() => setShowTooltip(showTooltip === habit.id ? null : habit.id)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
                  >
                    <Info size={18} />
                  </button>
                  
                  {/* Tooltip */}
                  {showTooltip === habit.id && (
                    <div className="absolute right-0 top-12 z-10 w-64 bg-gray-800 text-white text-sm rounded-xl p-3 shadow-lg">
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-gray-800 transform rotate-45"></div>
                      {habit.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grid de checkboxes */}
            <div className="grid grid-cols-7 gap-3">
              {weekDates.map((date, index) => {
                const dateStr = formatDate(date);
                const isCompleted = isHabitCompletedOnDate(habit.id, dateStr);
                const todayDate = isToday(date);
                
                if (!shouldShowCheckbox(habit, index)) return <div key={index}></div>;
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => handleHabitToggle(habit.id, dateStr)}
                      className={getCheckboxStyle(habit, index, isCompleted, todayDate)}
                    >
                      {isCompleted && <Check size={20} className="text-white" />}
                    </button>
                    
                    {/* Indicador del día actual */}
                    {todayDate && isCurrentWeek && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
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
        className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl p-8 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 flex items-center justify-center gap-3 text-blue-600 font-semibold group"
      >
        <Plus size={24} className="group-hover:scale-110 transition-transform" />
        <span className="text-lg">Agregar nuevo hábito</span>
      </button>

      {/* Overlay para cerrar tooltip */}
      {showTooltip && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowTooltip(null)}
        ></div>
      )}
    </div>
  );
};
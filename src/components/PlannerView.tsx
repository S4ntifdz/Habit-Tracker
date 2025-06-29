import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { useHabits } from '../context/HabitsContext';
import { PlannerActivity, TodayTask } from '../types/habit';
import { getDayName, getWeekDates, formatDate, getWeekRange } from '../utils/dateUtils';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, Edit3, Trash2, CheckCircle2, Circle, Eye, CalendarDays } from 'lucide-react';
import { PlannerForm } from './PlannerForm';

interface PlannerViewProps {
  onAddActivity: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onAddActivity }) => {
  const { state: plannerState, addActivity, deleteActivity, updateActivity } = usePlanner();
  const { state: habitsState, toggleHabitCompletion, isHabitCompletedOnDate } = useHabits();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [editingActivity, setEditingActivity] = useState<PlannerActivity | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set()); // Estado local para tareas completadas

  const currentDate = new Date();
  const weekStartDate = new Date(currentDate);
  weekStartDate.setDate(currentDate.getDate() - currentDate.getDay() + (currentWeekOffset * 7));
  
  const weekDates = getWeekDates(weekStartDate);
  const weekRange = getWeekRange(weekStartDate);
  const isCurrentWeek = currentWeekOffset === 0;
  const today = formatDate(new Date());
  const todayDayIndex = new Date().getDay();

  // Generar horarios dinámicamente basado en las actividades
  const generateDynamicTimeSlots = (): number[] => {
    if (plannerState.activities.length === 0) {
      return Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM a 7 PM por defecto
    }

    const allHours = new Set<number>();
    
    plannerState.activities.forEach(activity => {
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const endHour = parseInt(activity.endTime.split(':')[0]);
      
      for (let hour = startHour; hour <= endHour; hour++) {
        allHours.add(hour);
      }
    });

    // Agregar una hora antes y después para contexto
    const sortedHours = Array.from(allHours).sort((a, b) => a - b);
    if (sortedHours.length > 0) {
      const minHour = Math.max(6, sortedHours[0] - 1);
      const maxHour = Math.min(23, sortedHours[sortedHours.length - 1] + 1);
      
      const result = [];
      for (let hour = minHour; hour <= maxHour; hour++) {
        result.push(hour);
      }
      return result;
    }

    return Array.from({ length: 12 }, (_, i) => i + 8);
  };

  const timeSlots = generateDynamicTimeSlots();

  // Obtener tareas de hoy - CORREGIDO
  const getTodayTasks = (): TodayTask[] => {
    console.log('Getting today tasks for day index:', todayDayIndex);
    console.log('Available activities:', plannerState.activities);
    
    const todayActivities = plannerState.activities.filter(activity => {
      const isActive = activity.isActive;
      const includesDay = activity.days.includes(todayDayIndex);
      console.log(`Activity ${activity.title}: active=${isActive}, includesDay=${includesDay}, days=${activity.days}`);
      return isActive && includesDay;
    });

    console.log('Filtered today activities:', todayActivities);

    return todayActivities.map(activity => {
      const linkedHabit = activity.linkedHabitId 
        ? habitsState.habits.find(h => h.id === activity.linkedHabitId)
        : undefined;

      const isCompleted = linkedHabit 
        ? isHabitCompletedOnDate(linkedHabit.id, today)
        : completedTasks.has(activity.id); // Usar estado local para tareas sin hábito vinculado

      return {
        id: activity.id,
        activity,
        startTime: activity.startTime,
        endTime: activity.endTime,
        isCompleted,
        linkedHabit
      };
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const todayTasks = getTodayTasks();

  const getActivitiesForTimeAndDay = (hour: number, dayIndex: number): PlannerActivity[] => {
    return plannerState.activities.filter(activity => {
      if (!activity.isActive) return false;
      if (!activity.days.includes(dayIndex)) return false;
      
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const endHour = parseInt(activity.endTime.split(':')[0]);
      
      return hour >= startHour && hour < endHour;
    });
  };

  const formatTime = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const handleAddActivity = async (activityData: Omit<PlannerActivity, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding new activity:', activityData);
      await addActivity(activityData);
      setShowActivityForm(false);
      console.log('Activity added successfully');
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleEditActivity = async (activityData: Omit<PlannerActivity, 'id' | 'createdAt'>) => {
    if (editingActivity) {
      try {
        console.log('Updating activity:', activityData);
        await updateActivity({
          ...editingActivity,
          ...activityData
        });
        setEditingActivity(null);
        setShowActivityForm(false);
        console.log('Activity updated successfully');
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      setShowDeleteConfirm(null);
      console.log('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleTaskToggle = async (task: TodayTask) => {
    if (task.linkedHabit) {
      // Si está vinculado a un hábito, usar el sistema de hábitos
      try {
        await toggleHabitCompletion(task.linkedHabit.id, today);
        console.log('Habit completion toggled');
      } catch (error) {
        console.error('Error toggling habit completion:', error);
      }
    } else {
      // Si no está vinculado, usar estado local
      setCompletedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(task.activity.id)) {
          newSet.delete(task.activity.id);
        } else {
          newSet.add(task.activity.id);
        }
        return newSet;
      });
    }
  };

  const formatTimeRange = (startTime: string, endTime: string): string => {
    const formatTime12 = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    
    return `${formatTime12(startTime)} - ${formatTime12(endTime)}`;
  };

  if (plannerState.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarDays size={18} />
            Hoy
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'week'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} />
            Vista Semanal
          </button>
        </div>
      </div>

      {/* Vista de Hoy */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Header de hoy unificado */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  📅 Hoy, {getDayName(new Date())} {new Date().getDate()}
                </h2>
                <p className="text-gray-600">
                  {todayTasks.length} {todayTasks.length === 1 ? 'actividad planeada' : 'actividades planeadas'}
                </p>
              </div>
              <button
                onClick={() => setShowActivityForm(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Lista de tareas de hoy */}
          {todayTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">🌅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ¡Día libre!
              </h3>
              <p className="text-gray-600 mb-6">
                No tienes actividades planeadas para hoy.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task)}
                  className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                    task.isCompleted 
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-green-100' 
                      : 'border-gray-100 hover:shadow-lg hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox/Indicador mejorado */}
                    <div className="flex-shrink-0 mt-1">
                      {task.isCompleted ? (
                        <div className="relative">
                          <CheckCircle2 size={28} className="text-green-500 drop-shadow-sm" />
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <Circle size={28} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                          <div className="absolute inset-0 bg-purple-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </div>
                      )}
                    </div>

                    {/* Contenido mejorado */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold transition-all duration-300 ${
                            task.isCompleted 
                              ? 'text-green-700 line-through opacity-75' 
                              : 'text-gray-800'
                          }`}>
                            {task.activity.title}
                          </h3>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                              task.isCompleted 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              <Clock size={14} />
                              <span className="font-medium">{formatTimeRange(task.startTime, task.endTime)}</span>
                            </div>
                            
                            {task.linkedHabit && (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-xs">🔗 {task.linkedHabit.name}</span>
                              </div>
                            )}
                          </div>

                          {task.activity.description && (
                            <p className={`mt-3 text-sm transition-all duration-300 ${
                              task.isCompleted 
                                ? 'text-green-600 opacity-75' 
                                : 'text-gray-600'
                            }`}>
                              {task.activity.description}
                            </p>
                          )}

                          {/* Indicador visual de progreso */}
                          <div className="mt-3 flex items-center space-x-2">
                            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              task.isCompleted 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                : 'bg-gray-200'
                            }`}></div>
                            <span className={`text-xs font-medium transition-all ${
                              task.isCompleted 
                                ? 'text-green-600' 
                                : 'text-gray-400'
                            }`}>
                              {task.isCompleted ? '✓ Completado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingActivity(task.activity);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(task.activity.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Efecto de brillo para tareas completadas */}
                  {task.isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-2xl pointer-events-none"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista Semanal */}
      {activeTab === 'week' && (
        <div className="space-y-6">
          {/* Header con navegación de semanas */}
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

            {/* Botón para agregar actividad */}
            <button
              onClick={() => setShowActivityForm(true)}
              className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-xl p-4 hover:from-purple-100 hover:to-blue-100 transition-all duration-200 flex items-center justify-center gap-2 text-purple-600 font-semibold group"
            >
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              <span>Agregar actividad al planner</span>
            </button>
          </div>

          {/* Tabla del planner - Optimizada para móvil */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                {/* Header con días */}
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                      <Clock size={14} className="inline mr-1" />
                      <span className="text-xs">Hora</span>
                    </th>
                    {weekDates.map((date, index) => (
                      <th key={index} className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[90px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs">{getDayName(date)}</span>
                          <span className={`text-sm font-bold mt-1 ${
                            formatDate(date) === formatDate(new Date()) && isCurrentWeek
                              ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center'
                              : 'text-gray-800'
                          }`}>
                            {date.getDate()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body con horarios */}
                <tbody>
                  {timeSlots.map((hour) => (
                    <tr key={hour} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-medium text-gray-600 border-r border-gray-200 bg-gray-50/50">
                        <div className="text-xs">
                          {formatTime(hour)}
                        </div>
                      </td>
                      {weekDates.map((date, dayIndex) => {
                        const activities = getActivitiesForTimeAndDay(hour, dayIndex);
                        return (
                          <td key={dayIndex} className="p-2 border-r border-gray-200 last:border-r-0 align-top">
                            <div className="space-y-1 min-h-[50px]">
                              {activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="group relative p-2 rounded-lg text-xs font-medium text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                                  style={{ backgroundColor: activity.color }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold truncate text-xs">{activity.title}</div>
                                      <div className="text-xs opacity-90">
                                        {activity.startTime} - {activity.endTime}
                                      </div>
                                    </div>
                                    
                                    {/* Botones de acción (aparecen en hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 ml-1">
                                      <button
                                        onClick={() => setEditingActivity(activity)}
                                        className="p-1 hover:bg-white/20 rounded"
                                      >
                                        <Edit3 size={10} />
                                      </button>
                                      <button
                                        onClick={() => setShowDeleteConfirm(activity.id)}
                                        className="p-1 hover:bg-white/20 rounded"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {activity.linkedHabitId && (
                                    <div className="text-xs opacity-80 mt-1">
                                      🔗 Vinculado
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de actividades */}
          {plannerState.activities.filter(a => a.isActive).length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📅 Resumen de actividades
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {plannerState.activities.filter(a => a.isActive).map((activity) => {
                  const linkedHabit = activity.linkedHabitId 
                    ? habitsState.habits.find(h => h.id === activity.linkedHabitId)
                    : null;
                  
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 bg-white/60 rounded-xl p-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{activity.title}</div>
                        <div className="text-sm text-gray-600">
                          {activity.startTime} - {activity.endTime} • {activity.days.length} días
                          {linkedHabit && (
                            <span className="text-blue-600 ml-2">🔗 {linkedHabit.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      {(showActivityForm || editingActivity) && (
        <PlannerForm
          activity={editingActivity}
          onSave={editingActivity ? handleEditActivity : handleAddActivity}
          onCancel={() => {
            setShowActivityForm(false);
            setEditingActivity(null);
          }}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¿Eliminar actividad?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción eliminará la actividad del planner. No se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteActivity(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
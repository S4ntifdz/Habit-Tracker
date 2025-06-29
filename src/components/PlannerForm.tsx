import React, { useState } from 'react';
import { PlannerActivity } from '../types/habit';
import { useHabits } from '../context/HabitsContext';
import { X, Palette, Clock, Calendar, Link } from 'lucide-react';

interface PlannerFormProps {
  activity?: PlannerActivity | null;
  onSave: (activityData: Omit<PlannerActivity, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const activityColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const PlannerForm: React.FC<PlannerFormProps> = ({ activity, onSave, onCancel }) => {
  const { state: habitsState } = useHabits();
  
  const [formData, setFormData] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    color: activity?.color || activityColors[0],
    startTime: activity?.startTime || '09:00',
    endTime: activity?.endTime || '10:00',
    days: activity?.days || [],
    isActive: activity?.isActive ?? true,
    linkedHabitId: activity?.linkedHabitId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.days.length === 0) return;
    
    // Validar que la hora de fin sea posterior a la de inicio
    if (formData.startTime >= formData.endTime) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }
    
    const dataToSave = {
      ...formData,
      linkedHabitId: formData.linkedHabitId || undefined
    };
    
    console.log('Saving activity data:', dataToSave);
    onSave(dataToSave);
  };

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayIndex)
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex].sort()
    }));
  };

  // Generar opciones de tiempo con picker más intuitivo y intervalos de 15 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 5; hour <= 23; hour++) { // Desde 5 AM hasta 11 PM
      for (let minute = 0; minute < 60; minute += 15) { // Intervalos de 15 minutos
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(hour, minute);
        options.push({ value: timeString, display: displayTime });
      }
    }
    return options;
  };

  const formatTimeDisplay = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const timeOptions = generateTimeOptions();
  const activeHabits = habitsState.habits.filter(h => h.isActive);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {activity ? 'Editar actividad' : 'Nueva actividad'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la actividad *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ej: Ejercicio, Trabajo, Estudio..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              maxLength={50}
            />
          </div>

          {/* Descripción opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ej: Rutina de cardio en el gimnasio"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              rows={2}
              maxLength={100}
            />
          </div>

          {/* Horarios con picker mejorado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Hora de inicio *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                required
              >
                {timeOptions.map(time => (
                  <option key={time.value} value={time.value}>{time.display}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Hora de fin *
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                required
              >
                {timeOptions.map(time => (
                  <option key={time.value} value={time.value}>{time.display}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar size={16} className="inline mr-1" />
              Días de la semana *
            </label>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.days.includes(index)
                      ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {formData.days.length === 0 && (
              <p className="text-red-500 text-xs mt-2">Selecciona al menos un día</p>
            )}
          </div>

          {/* Vincular con hábito */}
          {activeHabits.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Link size={16} className="inline mr-1" />
                Vincular con hábito (opcional)
              </label>
              <select
                value={formData.linkedHabitId}
                onChange={(e) => setFormData({ ...formData, linkedHabitId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Sin vincular</option>
                {activeHabits.map(habit => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Al vincular con un hábito, podrás marcarlo como completado desde la vista de "Hoy"
              </p>
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Palette size={16} className="inline mr-2" />
              Color de la actividad
            </label>
            <div className="grid grid-cols-5 gap-3">
              {activityColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    formData.color === color 
                      ? 'ring-4 ring-gray-300 ring-offset-2 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              {activity ? 'Actualizar' : 'Crear actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
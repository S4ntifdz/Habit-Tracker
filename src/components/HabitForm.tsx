import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { X, Palette } from 'lucide-react';

interface HabitFormProps {
  habit?: Habit;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const habitColors = [
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

export const HabitForm: React.FC<HabitFormProps> = ({ habit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    color: habit?.color || habitColors[0],
    frequency: habit?.frequency || 'daily' as 'daily' | 'weekly' | 'custom',
    customFrequency: habit?.customFrequency || 3,
    isActive: habit?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {habit ? 'Editar hábito' : 'Nuevo hábito'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del hábito *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: Meditar, Ejercicio, Leer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              placeholder="ej: 10 minutos de meditación matutina"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={2}
              maxLength={100}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Palette size={16} className="inline mr-2" />
              Color del hábito
            </label>
            <div className="grid grid-cols-5 gap-3">
              {habitColors.map((color) => (
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

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frecuencia
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={formData.frequency === 'daily'}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="mr-3 text-blue-500"
                />
                <span className="text-gray-700">Todos los días</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="custom"
                  checked={formData.frequency === 'custom'}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="mr-3 text-blue-500"
                />
                <span className="text-gray-700">
                  <input
                    type="number"
                    value={formData.customFrequency}
                    onChange={(e) => setFormData({ ...formData, customFrequency: parseInt(e.target.value) })}
                    min="1"
                    max="7"
                    className="w-16 px-2 py-1 border border-gray-300 rounded mx-2 text-center"
                    disabled={formData.frequency !== 'custom'}
                  />
                  veces por semana
                </span>
              </label>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              {habit ? 'Actualizar' : 'Crear hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
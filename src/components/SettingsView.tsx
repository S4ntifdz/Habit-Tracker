import React, { useState } from 'react';
import { useHabits } from '../context/HabitsContext';
import { usePlanner } from '../context/PlannerContext';
import { Trash2, Edit3, Download, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import { HabitForm } from './HabitForm';
import { Habit } from '../types/habit';

export const SettingsView: React.FC = () => {
  const { state: habitsState, updateHabit, deleteHabit } = useHabits();
  const { state: plannerState } = usePlanner();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleToggleActive = async (habit: Habit) => {
    await updateHabit({ ...habit, isActive: !habit.isActive });
  };

  const handleEditHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      updateHabit({
        ...editingHabit,
        ...habitData
      });
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId);
    setShowDeleteConfirm(null);
  };

  const exportData = () => {
    const data = {
      habits: habitsState.habits,
      completions: habitsState.completions,
      plannerActivities: plannerState.activities,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atomic-habits-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Aquí podrías implementar la lógica de importación
        console.log('Import data:', data);
        alert('Función de importación en desarrollo');
      } catch (error) {
        alert('Error al leer el archivo');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuración</h2>
        <p className="text-gray-600">
          Administra tus hábitos, planner y preferencias de la aplicación
        </p>
      </div>

      {/* Gestión de hábitos */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Gestión de hábitos
        </h3>
        
        {habitsState.habits.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tienes hábitos creados aún
          </p>
        ) : (
          <div className="space-y-3">
            {habitsState.habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <div>
                    <h4 className="font-medium text-gray-800">{habit.name}</h4>
                    {habit.description && (
                      <p className="text-sm text-gray-500">{habit.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {habit.frequency === 'daily' ? 'Diario' : 
                       habit.frequency === 'custom' ? `${habit.customFrequency}x por semana` : 
                       'Semanal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Toggle activo/inactivo */}
                  <button
                    onClick={() => handleToggleActive(habit)}
                    className={`transition-colors ${
                      habit.isActive ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {habit.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => setShowDeleteConfirm(habit.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup y restore */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Backup y restauración
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            Exportar datos completos
          </button>
          
          <label className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload size={18} />
            Importar datos
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Los datos incluyen hábitos, completaciones y actividades del planner. 
          Exporta regularmente para no perder tu progreso.
        </p>
      </div>

      {/* Resumen de datos */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Resumen de datos
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">{habitsState.habits.length}</div>
            <div className="text-sm text-gray-600">Hábitos creados</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">{habitsState.completions.length}</div>
            <div className="text-sm text-gray-600">Completaciones</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-600">{plannerState.activities.length}</div>
            <div className="text-sm text-gray-600">Actividades planner</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-600">
              {habitsState.habits.filter(h => h.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Hábitos activos</div>
          </div>
        </div>
      </div>

      {/* Información de la app */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Acerca de la app
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Versión:</strong> 1.0.0</p>
          <p><strong>Basado en:</strong> "Hábitos Atómicos" de James Clear</p>
          <p><strong>Desarrollado con:</strong> Los 4 pilares del cambio de comportamiento</p>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>💡 Recuerda:</strong> Los hábitos se forman con consistencia, no con perfección. 
            Pequeños pasos diarios crean transformaciones extraordinarias.
          </p>
        </div>
      </div>

      {/* Modal de edición */}
      {editingHabit && (
        <HabitForm
          habit={editingHabit}
          onSave={handleEditHabit}
          onCancel={() => setEditingHabit(null)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¿Eliminar hábito?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción eliminará el hábito y todo su historial. No se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteHabit(showDeleteConfirm)}
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
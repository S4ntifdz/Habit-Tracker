import React from 'react';
import { Calendar, BarChart3, Settings, Plus } from 'lucide-react';

interface NavigationProps {
  activeView: 'week' | 'stats' | 'settings';
  onViewChange: (view: 'week' | 'stats' | 'settings') => void;
  onAddHabit: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  onAddHabit 
}) => {
  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={() => onViewChange('week')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
            activeView === 'week'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={20} />
          <span className="text-xs font-medium mt-1">Semana</span>
        </button>

        <button
          onClick={() => onViewChange('stats')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
            activeView === 'stats'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-xs font-medium mt-1">Estadísticas</span>
        </button>

        {/* FAB - Floating Action Button */}
        <button
          onClick={onAddHabit}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => onViewChange('settings')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
            activeView === 'settings'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={20} />
          <span className="text-xs font-medium mt-1">Ajustes</span>
        </button>
      </div>
    </nav>
  );
};
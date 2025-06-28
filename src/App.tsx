import React, { useState } from 'react';
import { HabitsProvider } from './context/HabitsContext';
import { WeekView } from './components/WeekView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { Navigation } from './components/Navigation';
import { HabitForm } from './components/HabitForm';
import { useHabits } from './context/HabitsContext';
import { getMonthName } from './utils/dateUtils';

type ViewType = 'week' | 'stats' | 'settings';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('week');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const { addHabit } = useHabits();

  const currentDate = new Date();
  const currentMonth = getMonthName(currentDate);
  const currentYear = currentDate.getFullYear();

  const handleAddHabit = (habitData: any) => {
    addHabit(habitData);
    setShowHabitForm(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'week':
        return <WeekView onAddHabit={() => setShowHabitForm(true)} />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <WeekView onAddHabit={() => setShowHabitForm(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hábitos Atómicos
              </h1>
              <p className="text-sm text-gray-600">
                {currentMonth} {currentYear}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl">🎯</div>
              <p className="text-xs text-gray-500 mt-1">
                Construye tu mejor versión
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {renderView()}
      </main>

      {/* Navigation */}
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        onAddHabit={() => setShowHabitForm(true)}
      />

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          onSave={handleAddHabit}
          onCancel={() => setShowHabitForm(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <HabitsProvider>
      <AppContent />
    </HabitsProvider>
  );
}

export default App;
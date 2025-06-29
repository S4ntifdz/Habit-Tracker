import React, { useState } from 'react';
import { HabitsProvider } from './context/HabitsContext';
import { PlannerProvider } from './context/PlannerContext';
import { WeekView } from './components/WeekView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { PlannerView } from './components/PlannerView';
import { Navigation } from './components/Navigation';
import { HabitForm } from './components/HabitForm';
import { useHabits } from './context/HabitsContext';
import { usePlanner } from './context/PlannerContext';
import { getMonthName } from './utils/dateUtils';
import { Github } from 'lucide-react';

type ViewType = 'week' | 'stats' | 'settings' | 'planner';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('week');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const { addHabit } = useHabits();
  const { addActivity } = usePlanner();

  const currentDate = new Date();
  const currentMonth = getMonthName(currentDate);
  const currentYear = currentDate.getFullYear();

  const handleAddHabit = (habitData: any) => {
    addHabit(habitData);
    setShowHabitForm(false);
  };

  const handleAddActivity = () => {
    // Esta función se maneja directamente en PlannerView
    setActiveView('planner');
  };

  const handleFABClick = () => {
    if (activeView === 'planner') {
      handleAddActivity();
    } else {
      setShowHabitForm(true);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'week':
        return <WeekView onAddHabit={() => setShowHabitForm(true)} />;
      case 'planner':
        return <PlannerView onAddActivity={handleAddActivity} />;
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
              <div className="text-2xl">
                {activeView === 'planner' ? '📅' : '🎯'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activeView === 'planner' ? 'Organiza tu tiempo' : 'Construye tu mejor versión'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {renderView()}
      </main>

      {/* Footer con crédito */}
      <footer className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>By</span>
            <a
              href="https://github.com/S4ntifdz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            >
              <Github size={16} />
              <span>S4ntifdz</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Navigation */}
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        onAddHabit={handleFABClick}
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
      <PlannerProvider>
        <AppContent />
      </PlannerProvider>
    </HabitsProvider>
  );
}

export default App;
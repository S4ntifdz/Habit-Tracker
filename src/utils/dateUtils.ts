export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getWeekDates = (startDate?: Date): Date[] => {
  const start = startDate || getStartOfWeek(new Date());
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Domingo como primer día
  return new Date(d.setDate(diff));
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

export const getDayName = (date: Date): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

export const getMonthName = (date: Date): string => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[date.getMonth()];
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getWeekRange = (startDate: Date): string => {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = getMonthName(startDate);
  const endMonth = getMonthName(endDate);
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDay} - ${endDay} ${startMonth}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
};

export const calculateStreak = (completions: Array<{ date: string }>, habitId: string): number => {
  const relevantCompletions = completions
    .filter(c => (c as any).habitId === habitId)
    .map(c => c.date)
    .sort()
    .reverse(); // Más reciente primero

  if (relevantCompletions.length === 0) return 0;

  let streak = 0;
  const today = formatDate(new Date());
  let currentDate = today;

  for (const completionDate of relevantCompletions) {
    if (completionDate === currentDate) {
      streak++;
      // Mover al día anterior
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      currentDate = formatDate(date);
    } else {
      break;
    }
  }

  return streak;
};
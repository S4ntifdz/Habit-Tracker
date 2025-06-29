import { MotivationalMessage } from '../types/habit';

export const getMotivationalMessage = (
  type: 'encouragement' | 'celebration' | 'gentle-reminder',
  streak?: number
): MotivationalMessage => {
  const messages = {
    encouragement: [
      { message: "¡Los pequeños pasos crean grandes cambios!", emoji: "🌱" },
      { message: "Cada día es una nueva oportunidad", emoji: "🌅" },
      { message: "La consistencia vence a la perfección", emoji: "💪" },
      { message: "¡Tú puedes con esto!", emoji: "⚡" },
      { message: "Un hábito a la vez, un día a la vez", emoji: "📈" }
    ],
    celebration: [
      { message: `¡Increíble! ${streak} días seguidos`, emoji: "🎉" },
      { message: "¡Estás en racha! Sigue así", emoji: "🔥" },
      { message: "¡Excelente trabajo hoy!", emoji: "✨" },
      { message: "¡Otra victoria más!", emoji: "🏆" },
      { message: "¡Estás construyendo algo grande!", emoji: "🚀" }
    ],
    'gentle-reminder': [
      { message: "No hay prisa, solo progreso", emoji: "🐢" },
      { message: "Mañana es otro día para brillar", emoji: "🌟" },
      { message: "Los héroes también descansan", emoji: "😌" },
      { message: "La perfección no existe, solo el progreso", emoji: "🎯" },
      { message: "¡Sigues siendo increíble!", emoji: "💙" }
    ]
  };

  const typeMessages = messages[type];
  const randomMessage = typeMessages[Math.floor(Math.random() * typeMessages.length)];
  
  return {
    type,
    message: randomMessage.message,
    emoji: randomMessage.emoji
  };
};

export const getStreakMessage = (streak: number): MotivationalMessage => {
  if (streak === 0) {
    return getMotivationalMessage('encouragement');
  } else if (streak >= 7) {
    return getMotivationalMessage('celebration', streak);
  } else {
    return getMotivationalMessage('celebration', streak);
  }
};
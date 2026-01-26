/**
 * Utilitaires pour le calcul des rappels d'enrôlement
 */

/**
 * Calcule la date de rappel d'enrôlement (4 jours ouvrables avant la date d'audience)
 * Les jours ouvrables sont du lundi au vendredi
 * 
 * @param hearingDate - Date de l'audience
 * @returns Date du rappel d'enrôlement
 */
export function calculateEnrollmentReminderDate(hearingDate: Date): Date {
  const reminderDate = new Date(hearingDate);
  let businessDaysToSubtract = 4;
  
  while (businessDaysToSubtract > 0) {
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    // 0 = Dimanche, 6 = Samedi
    const dayOfWeek = reminderDate.getDay();
    
    // Si c'est un jour ouvrable (lundi à vendredi)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysToSubtract--;
    }
  }
  
  // Mettre l'heure à 00:00:00 pour la comparaison
  reminderDate.setHours(0, 0, 0, 0);
  
  return reminderDate;
}

/**
 * Vérifie si une audience nécessite un rappel d'enrôlement aujourd'hui
 * 
 * @param hearingDate - Date de l'audience
 * @param enrollmentReminderDate - Date du rappel calculée
 * @returns true si le rappel doit être affiché aujourd'hui
 */
export function shouldShowEnrollmentReminder(
  hearingDate: Date,
  enrollmentReminderDate: Date | null
): boolean {
  if (!enrollmentReminderDate) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reminderDate = new Date(enrollmentReminderDate);
  reminderDate.setHours(0, 0, 0, 0);
  
  const hearing = new Date(hearingDate);
  hearing.setHours(0, 0, 0, 0);
  
  // Afficher le rappel si:
  // 1. Aujourd'hui >= date du rappel
  // 2. Aujourd'hui < date de l'audience
  return today >= reminderDate && today < hearing;
}

/**
 * Calcule le nombre de jours restants avant l'audience
 * 
 * @param hearingDate - Date de l'audience
 * @returns Nombre de jours restants
 */
export function getDaysUntilHearing(hearingDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const hearing = new Date(hearingDate);
  hearing.setHours(0, 0, 0, 0);
  
  const diffTime = hearing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

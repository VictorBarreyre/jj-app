/**
 * Calcule les dates par défaut pour la prise et la remise des locations
 * basées sur la date de l'événement
 */

/**
 * Trouve le jeudi précédent une date donnée
 * @param eventDate Date de l'événement
 * @returns Date du jeudi précédent
 */
export function getThursdayBefore(eventDate: Date): Date {
  const date = new Date(eventDate);
  
  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = date.getDay();
  
  // Calculer combien de jours en arrière pour atteindre jeudi (4)
  let daysToSubtract: number;
  
  if (dayOfWeek === 0) { // Dimanche
    daysToSubtract = 3; // Jeudi précédent
  } else if (dayOfWeek === 1) { // Lundi
    daysToSubtract = 4; // Jeudi précédent
  } else if (dayOfWeek === 2) { // Mardi
    daysToSubtract = 5; // Jeudi précédent
  } else if (dayOfWeek === 3) { // Mercredi
    daysToSubtract = 6; // Jeudi précédent
  } else if (dayOfWeek === 4) { // Jeudi
    daysToSubtract = 7; // Jeudi précédent (pas le même jour)
  } else if (dayOfWeek === 5) { // Vendredi
    daysToSubtract = 1; // Jeudi précédent
  } else { // Samedi (6)
    daysToSubtract = 2; // Jeudi précédent
  }
  
  date.setDate(date.getDate() - daysToSubtract);
  return date;
}

/**
 * Trouve le mardi suivant une date donnée
 * @param eventDate Date de l'événement
 * @returns Date du mardi suivant
 */
export function getTuesdayAfter(eventDate: Date): Date {
  const date = new Date(eventDate);
  
  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = date.getDay();
  
  // Calculer combien de jours en avant pour atteindre mardi (2)
  let daysToAdd: number;
  
  if (dayOfWeek === 0) { // Dimanche
    daysToAdd = 2; // Mardi suivant
  } else if (dayOfWeek === 1) { // Lundi
    daysToAdd = 1; // Mardi suivant
  } else if (dayOfWeek === 2) { // Mardi
    daysToAdd = 7; // Mardi suivant (pas le même jour)
  } else if (dayOfWeek === 3) { // Mercredi
    daysToAdd = 6; // Mardi suivant
  } else if (dayOfWeek === 4) { // Jeudi
    daysToAdd = 5; // Mardi suivant
  } else if (dayOfWeek === 5) { // Vendredi
    daysToAdd = 4; // Mardi suivant
  } else { // Samedi (6)
    daysToAdd = 3; // Mardi suivant
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

/**
 * Calcule les dates par défaut de retrait et retour basées sur la date d'événement
 * @param eventDate Date de l'événement
 * @returns Objet contenant dateRetrait (jeudi avant) et dateRetour (mardi après)
 */
export function calculateDefaultDates(eventDate: Date | string) {
  const event = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  
  return {
    dateRetrait: getThursdayBefore(event),
    dateRetour: getTuesdayAfter(event)
  };
}
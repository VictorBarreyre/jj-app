/**
 * Formate une référence d'article en remplaçant les tirets par des espaces
 * Exemple: "jaquette-bleue" devient "Jaquette Bleue"
 */
export function formatReference(reference: string): string {
  if (!reference) return '';

  return reference
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

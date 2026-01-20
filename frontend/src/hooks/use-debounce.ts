import { useEffect, useState } from 'react';

/**
 * Hook pour debouncer une valeur
 * Utile pour les champs de recherche pour éviter trop de re-renders
 * 
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes (défaut: 500ms)
 * @returns La valeur debouncée
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedSearch = useDebouncedValue(searchQuery, 300);
 * 
 * // Utiliser debouncedSearch pour le filtrage
 * const filteredItems = items.filter(item => 
 *   item.name.includes(debouncedSearch)
 * );
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Créer un timer qui met à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour debouncer une fonction callback
 * 
 * @param callback - La fonction à debouncer
 * @param delay - Le délai en millisecondes (défaut: 500ms)
 * @returns La fonction debouncée
 * 
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   // Effectuer la recherche
 *   searchAPI(query);
 * }, 300);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

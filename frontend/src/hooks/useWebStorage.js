import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gestionar WebStorage (localStorage y sessionStorage)
 * 
 * @param {string} key - Clave para almacenar el valor
 * @param {*} initialValue - Valor inicial si no existe en storage
 * @param {string} storageType - 'local' o 'session' (default: 'local')
 * @returns {[value, setValue, removeValue]} - Estado, setter y función para remover
 */
export const useWebStorage = (key, initialValue, storageType = 'local') => {
  // Seleccionar el tipo de storage
  const storage = storageType === 'session' ? sessionStorage : localStorage;

  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Obtener del storage
      const item = storage.getItem(key);
      
      // Parsear JSON almacenado o devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${storageType}Storage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = useCallback((value) => {
    try {
      // Permitir que value sea una función como en useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar estado
      setStoredValue(valueToStore);
      
      // Guardar en storage
      storage.setItem(key, JSON.stringify(valueToStore));
      
      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new CustomEvent('webStorageChange', {
        detail: { key, value: valueToStore, storageType }
      }));
    } catch (error) {
      console.error(`Error setting ${storageType}Storage key "${key}":`, error);
    }
  }, [key, storedValue, storage, storageType]);

  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
      
      window.dispatchEvent(new CustomEvent('webStorageChange', {
        detail: { key, value: null, storageType }
      }));
    } catch (error) {
      console.error(`Error removing ${storageType}Storage key "${key}":`, error);
    }
  }, [key, initialValue, storage, storageType]);

  // Sincronizar entre pestañas/ventanas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === storage) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key && e.detail.storageType === storageType) {
        setStoredValue(e.detail.value || initialValue);
      }
    };

    // Escuchar cambios nativos del storage (entre pestañas)
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar cambios personalizados (misma pestaña)
    window.addEventListener('webStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('webStorageChange', handleCustomStorageChange);
    };
  }, [key, initialValue, storage, storageType]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook para gestionar preferencias del usuario en localStorage
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useWebStorage('userPreferences', {
    theme: 'light',
    language: 'es',
    notifications: true,
    compactView: false,
    sidebarCollapsed: false
  }, 'local');

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  return { preferences, updatePreference, removePreferences };
};

/**
 * Hook para gestionar datos de sesión en sessionStorage
 */
export const useSessionData = (key, initialValue) => {
  return useWebStorage(key, initialValue, 'session');
};

/**
 * Hook para gestionar historial de acciones
 */
export const useActionHistory = (maxItems = 10) => {
  const [history, setHistory] = useWebStorage('actionHistory', [], 'session');

  const addAction = useCallback((action) => {
    setHistory(prev => {
      const newHistory = [
        {
          ...action,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9)
        },
        ...prev
      ].slice(0, maxItems);
      
      return newHistory;
    });
  }, [setHistory, maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return { history, addAction, clearHistory };
};

/**
 * Hook para gestionar filtros y búsquedas
 */
export const useFilters = (filterKey) => {
  const [filters, setFilters, clearFilters] = useWebStorage(`filters_${filterKey}`, {
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    status: 'all',
    dateRange: null
  }, 'local');

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  return { filters, updateFilter, resetFilters };
};

/**
 * Utilidad para limpiar storage antiguo
 */
export const cleanOldStorage = (daysOld = 30, storageType = 'local') => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  const now = new Date().getTime();
  const maxAge = daysOld * 24 * 60 * 60 * 1000;

  Object.keys(storage).forEach(key => {
    try {
      const item = JSON.parse(storage.getItem(key));
      
      if (item && item.timestamp) {
        const itemAge = now - new Date(item.timestamp).getTime();
        
        if (itemAge > maxAge) {
          storage.removeItem(key);
          console.log(`Removed old storage item: ${key}`);
        }
      }
    } catch (e) {
      // Ignorar items que no son JSON
    }
  });
};

/**
 * Utilidad para obtener el tamaño del storage
 */
export const getStorageSize = (storageType = 'local') => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  let totalSize = 0;

  Object.keys(storage).forEach(key => {
    const item = storage.getItem(key);
    totalSize += key.length + (item?.length || 0);
  });

  return {
    bytes: totalSize,
    kilobytes: (totalSize / 1024).toFixed(2),
    megabytes: (totalSize / (1024 * 1024)).toFixed(2),
    itemCount: storage.length
  };
};

export default useWebStorage;

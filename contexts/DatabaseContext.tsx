import React, { createContext, useContext, useEffect, useState } from 'react';
import { databaseService } from '@/services/database';

interface DatabaseContextType {
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  error: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initDatabase() {
      try {
        await databaseService.init();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }

    initDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}


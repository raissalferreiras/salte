import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface OfflineSyncItem {
  id?: number;
  action: 'insert' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  created_at: string;
}

interface OfflineContextType {
  isOnline: boolean;
  pendingSync: number;
  syncNow: () => Promise<void>;
  queueAction: (item: Omit<OfflineSyncItem, 'id' | 'created_at'>) => Promise<void>;
  getOfflineData: <T>(table: string) => Promise<T[]>;
  saveOfflineData: <T extends { id: string }>(table: string, data: T[]) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const DB_NAME = 'ventosa-offline';
const DB_VERSION = 1;

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const { user } = useAuth();

  // Initialize IndexedDB
  useEffect(() => {
    const initDb = async () => {
      const database = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Sync queue store
          if (!db.objectStoreNames.contains('sync_queue')) {
            db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          }
          // Offline data cache stores
          const tables = ['pessoas', 'familias', 'criancas', 'eventos', 'frentes', 'visitas', 'presencas'];
          tables.forEach((table) => {
            if (!db.objectStoreNames.contains(table)) {
              db.createObjectStore(table, { keyPath: 'id' });
            }
          });
        },
      });
      setDb(database);
    };

    initDb();
  }, []);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    if (!db) return;
    const count = await db.count('sync_queue');
    setPendingSync(count);
  }, [db]);

  useEffect(() => {
    if (db) {
      updatePendingCount();
    }
  }, [db, updatePendingCount]);

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sem conexão. Modo offline ativado.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue action for offline sync
  const queueAction = async (item: Omit<OfflineSyncItem, 'id' | 'created_at'>) => {
    if (!db) return;

    await db.add('sync_queue', {
      ...item,
      created_at: new Date().toISOString(),
    });

    await updatePendingCount();
  };

  // Sync all pending actions
  const syncNow = async () => {
    if (!db || !isOnline || !user) return;

    const items = await db.getAll('sync_queue');

    for (const item of items) {
      try {
        const typedItem = item as OfflineSyncItem & { id: number };
        const { action, table, data } = typedItem;

        // Type assertion for dynamic table access
        const tableRef = supabase.from(table as 'pessoas');

        if (action === 'insert') {
          await tableRef.insert(data as never);
        } else if (action === 'update') {
          const { id, ...updateData } = data;
          await tableRef.update(updateData as never).eq('id', id as string);
        } else if (action === 'delete') {
          await tableRef.delete().eq('id', data.id as string);
        }

        await db.delete('sync_queue', typedItem.id);
      } catch (error) {
        console.error('Sync error for item:', item, error);
      }
    }

    await updatePendingCount();
    toast.success('Sincronização concluída');
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingSync > 0 && user) {
      syncNow();
    }
  }, [isOnline, user]);

  // Get offline data cache
  const getOfflineData = async <T,>(table: string): Promise<T[]> => {
    if (!db) return [];
    return db.getAll(table);
  };

  // Save offline data cache
  const saveOfflineData = async <T extends { id: string }>(table: string, data: T[]) => {
    if (!db) return;
    const tx = db.transaction(table, 'readwrite');
    const store = tx.objectStore(table);
    await store.clear();
    for (const item of data) {
      await store.put(item);
    }
    await tx.done;
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingSync,
        syncNow,
        queueAction,
        getOfflineData,
        saveOfflineData,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

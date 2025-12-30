
import { SiteInstance } from '../types';

const DB_NAME = 'PrimeHubAI_DB';
const STORE_NAME = 'sites';
const VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

export const saveSiteInstance = async (site: SiteInstance): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(site);

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
    throw error;
  }
};

export const getSiteInstance = async (id: string): Promise<SiteInstance | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (event: any) => resolve(event.target.result || null);
      request.onerror = (event: any) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Failed to get from IndexedDB:', error);
    return null;
  }
};

export const getAllSites = async (): Promise<SiteInstance[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event: any) => resolve(event.target.result || []);
      request.onerror = (event: any) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Failed to get all from IndexedDB:', error);
    return [];
  }
};

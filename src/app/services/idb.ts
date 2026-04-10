import { Injectable } from '@angular/core';

const DB_NAME = 'tn_db';
const STORE = 'blobs';
const VIDEO_KEY = 'bg_video';

@Injectable({ providedIn: 'root' })
export class IdbService {
  private db: IDBDatabase | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => { this.db = req.result; resolve(req.result); };
      req.onerror = () => reject(req.error);
    });
  }

  async saveVideo(blob: Blob): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(blob, VIDEO_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadVideo(): Promise<string | null> {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(VIDEO_KEY);
        req.onsuccess = () => {
          const blob = req.result as Blob | undefined;
          resolve(blob ? URL.createObjectURL(blob) : null);
        };
        req.onerror = () => resolve(null);
      });
    } catch { return null; }
  }

  async clearVideo(): Promise<void> {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(VIDEO_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch { /* ignore */ }
  }
}

import { Injectable } from '@angular/core';
import { User, Todo, ArchiveEntry, CatppuccinFlavor } from '../models';

const KEYS = {
  USER: 'tn_user',
  TODOS: 'tn_todos',
  DATE: 'tn_date',
  ARCHIVE: 'tn_archive',
  FLAVOR: 'tn_flavor',
  WALLPAPER: 'tn_wallpaper',
  SEARCH_ENGINE: 'tn_search_engine',
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  }

  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  getUser(): User | null { return this.get<User>(KEYS.USER); }
  setUser(u: User): void { this.set(KEYS.USER, u); }

  getTodos(): Todo[] { return this.get<Todo[]>(KEYS.TODOS) ?? []; }
  setTodos(todos: Todo[]): void { this.set(KEYS.TODOS, todos); }

  getDate(): string | null { return this.get<string>(KEYS.DATE); }
  setDate(d: string): void { this.set(KEYS.DATE, d); }

  getArchive(): ArchiveEntry[] { return this.get<ArchiveEntry[]>(KEYS.ARCHIVE) ?? []; }
  setArchive(a: ArchiveEntry[]): void { this.set(KEYS.ARCHIVE, a); }

  getFlavor(): CatppuccinFlavor { return this.get<CatppuccinFlavor>(KEYS.FLAVOR) ?? 'mocha'; }
  setFlavor(f: CatppuccinFlavor): void { this.set(KEYS.FLAVOR, f); }

  getWallpaper(): string | null { return this.get<string>(KEYS.WALLPAPER); }
  setWallpaper(w: string | null): void {
    w ? this.set(KEYS.WALLPAPER, w) : this.remove(KEYS.WALLPAPER);
  }

  getSearchEngine(): string { return this.get<string>(KEYS.SEARCH_ENGINE) ?? 'google'; }
  setSearchEngine(e: string): void { this.set(KEYS.SEARCH_ENGINE, e); }
}

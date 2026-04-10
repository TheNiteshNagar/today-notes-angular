import { Injectable, signal } from '@angular/core';
import { Todo, ArchiveEntry } from '../models';
import { StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class TodoService {
  todos = signal<Todo[]>([]);
  archive = signal<ArchiveEntry[]>([]);

  constructor(private storage: StorageService) {
    this.archive.set(this.storage.getArchive());
    this.checkDayRollover();
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private checkDayRollover(): void {
    const saved = this.storage.getDate();
    const today = this.today();
    if (saved && saved !== today) {
      const old = this.storage.getTodos();
      if (old.length) this.archiveDate(saved, old);
      this.storage.setTodos([]);
    }
    this.storage.setDate(today);
    this.todos.set(this.storage.getTodos());
  }

  private archiveDate(date: string, todos: Todo[]): void {
    const archive = this.storage.getArchive();
    const idx = archive.findIndex(a => a.date === date);
    if (idx >= 0) archive[idx].todos = todos;
    else archive.unshift({ date, todos });
    this.storage.setArchive(archive);
    this.archive.set(archive);
  }

  private save(): void {
    this.storage.setTodos(this.todos());
  }

  add(text: string): void {
    const todo: Todo = { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() };
    this.todos.update(t => [...t, todo]);
    this.save();
  }

  toggle(id: string): void {
    this.todos.update(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));
    this.save();
  }

  edit(id: string, text: string): void {
    this.todos.update(t => t.map(x => x.id === id ? { ...x, text } : x));
    this.save();
  }

  delete(id: string): void {
    this.todos.update(t => t.filter(x => x.id !== id));
    this.save();
  }

  archiveNow(): void {
    const todos = this.todos();
    if (!todos.length) return;
    this.archiveDate(this.today(), todos);
    this.todos.set([]);
    this.save();
  }

  deleteArchiveEntry(date: string): void {
    const archive = this.archive().filter(a => a.date !== date);
    this.storage.setArchive(archive);
    this.archive.set(archive);
  }
}

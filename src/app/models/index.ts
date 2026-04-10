export interface User {
  name: string;
  role: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface ArchiveEntry {
  date: string; // YYYY-MM-DD
  todos: Todo[];
}

export type CatppuccinFlavor = 'latte' | 'frappe' | 'macchiato' | 'mocha';

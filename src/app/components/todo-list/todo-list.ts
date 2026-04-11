import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo';
import { LucideAngularModule, Plus, Pencil, Trash2, Check, X, Sparkles } from 'lucide-angular';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss'
})
export class TodoListComponent {
  todoService = inject(TodoService);
  newText = '';
  editingId = signal<string | null>(null);
  editText = signal('');
  confirmDeleteId = signal<string | null>(null);

  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly SparklesIcon = Sparkles;

  add(): void {
    if (this.newText.trim()) {
      this.todoService.add(this.newText.trim());
      this.newText = '';
    }
  }

  startEdit(id: string, text: string): void {
    this.editingId.set(id);
    this.editText.set(text);
  }

  saveEdit(id: string): void {
    if (this.editText().trim()) this.todoService.edit(id, this.editText().trim());
    this.editingId.set(null);
  }

  cancelEdit(): void { this.editingId.set(null); }

  requestDelete(id: string): void { this.confirmDeleteId.set(id); }
  cancelDelete(): void { this.confirmDeleteId.set(null); }
  doDelete(): void {
    const id = this.confirmDeleteId();
    if (id) { this.todoService.delete(id); this.confirmDeleteId.set(null); }
  }
}

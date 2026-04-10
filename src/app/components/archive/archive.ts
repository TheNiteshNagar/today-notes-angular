import { Component, inject, signal } from '@angular/core';
import { TodoService } from '../../services/todo';
import { DoneCountPipe } from '../../pipes/done-count.pipe';
import {
  LucideAngularModule,
  Archive, X, Trash2, ChevronDown, ChevronUp, Check, Circle
} from 'lucide-angular';

@Component({
  selector: 'app-archive',
  imports: [DoneCountPipe, LucideAngularModule],
  templateUrl: './archive.html',
  styleUrl: './archive.scss'
})
export class ArchiveComponent {
  todoService = inject(TodoService);
  open = signal(false);
  expandedDate = signal<string | null>(null);

  readonly ArchiveIcon = Archive;
  readonly XIcon = X;
  readonly TrashIcon = Trash2;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly CheckIcon = Check;
  readonly CircleIcon = Circle;

  toggle(): void {
    this.open.update(v => !v);
    if (!this.open()) this.expandedDate.set(null);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.toggle();
    }
  }

  formatDate(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getDayNum(d: string): string {
    return new Date(d + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMonth(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  toggleExpand(date: string): void {
    this.expandedDate.set(this.expandedDate() === date ? null : date);
  }
}

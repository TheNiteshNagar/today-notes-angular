import { Component, inject, signal } from '@angular/core';
import { TodoService } from '../../services/todo';
import { DoneCountPipe } from '../../pipes/done-count.pipe';
import {
  LucideAngularModule,
  Archive, X, Trash2, ChevronDown, ChevronUp, Check, Circle
} from 'lucide-angular';

@Component({
  selector: 'app-archive-modal',
  imports: [DoneCountPipe, LucideAngularModule],
  templateUrl: './archive-modal.html',
  styleUrl: './archive-modal.scss'
})
export class ArchiveModalComponent {
  svc = inject(TodoService);

  archiveOpen = signal(false);
  archiveExpandedDate = signal<string | null>(null);
  archiveConfirmDelete = signal<string | null>(null);

  readonly ArchiveIcon = Archive;
  readonly XIcon = X;
  readonly TrashIcon = Trash2;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly CheckIcon = Check;
  readonly CircleIcon = Circle;

  close(): void {
    this.archiveOpen.set(false);
    this.archiveExpandedDate.set(null);
    this.archiveConfirmDelete.set(null);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.close();
  }

  requestDelete(date: string): void { this.archiveConfirmDelete.set(date); }
  cancelDelete(): void { this.archiveConfirmDelete.set(null); }
  doDelete(): void {
    const d = this.archiveConfirmDelete();
    if (d) { this.svc.deleteArchiveEntry(d); this.archiveConfirmDelete.set(null); }
  }

  toggleExpand(date: string): void {
    this.archiveExpandedDate.set(this.archiveExpandedDate() === date ? null : date);
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
}

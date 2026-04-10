import { Component, computed, inject, signal, output } from '@angular/core';
import { StorageService } from '../../services/storage';
import { LucideAngularModule, Maximize2, Minimize2, EyeOff, Eye, Search, CheckSquare, LayoutDashboard } from 'lucide-angular';

export type FocusMode = 'none' | 'search' | 'todos' | 'both';
const FOCUS_KEY = 'tn_focus';

@Component({
  selector: 'app-top-bar',
  imports: [LucideAngularModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss'
})
export class TopBarComponent {
  storage = inject(StorageService);
  isFullscreen = signal(false);
  showFocusMenu = signal(false);
  focusMode = signal<FocusMode>((localStorage.getItem(FOCUS_KEY) as FocusMode) || 'none');

  focusChanged = output<FocusMode>();

  readonly MaximizeIcon = Maximize2;
  readonly MinimizeIcon = Minimize2;
  readonly EyeOffIcon = EyeOff;
  readonly EyeIcon = Eye;
  readonly SearchIcon = Search;
  readonly TodoIcon = CheckSquare;
  readonly BothIcon = LayoutDashboard;

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 21) return 'Good Evening';
    return 'Good Night';
  });

  user = computed(() => this.storage.getUser());

  setFocus(mode: FocusMode): void {
    const next = this.focusMode() === mode ? 'none' : mode;
    this.focusMode.set(next);
    localStorage.setItem(FOCUS_KEY, next);
    this.focusChanged.emit(next);
    this.showFocusMenu.set(false);
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullscreen.set(true);
    } else {
      document.exitFullscreen();
      this.isFullscreen.set(false);
    }
  }

  get isFocused(): boolean { return this.focusMode() !== 'none'; }
}

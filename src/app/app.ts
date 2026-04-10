import { Component, inject, OnInit, signal } from '@angular/core';
import { StorageService } from './services/storage';
import { ThemeService } from './services/theme';
import { TodoService } from './services/todo';
import { User } from './models';
import { LoginModalComponent } from './components/login-modal/login-modal';
import { TopBarComponent, FocusMode } from './components/top-bar/top-bar';
import { HeaderComponent } from './components/header/header';
import { TodoListComponent } from './components/todo-list/todo-list';
import { ArchiveComponent } from './components/archive/archive';
import { MusicPlayerComponent } from './components/music-player/music-player';
import { WallpaperComponent } from './components/wallpaper/wallpaper';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher';

const FOCUS_KEY = 'tn_focus';

@Component({
  selector: 'app-root',
  imports: [
    LoginModalComponent, TopBarComponent, HeaderComponent,
    TodoListComponent, ArchiveComponent, MusicPlayerComponent,
    WallpaperComponent, ThemeSwitcherComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  storage = inject(StorageService);
  theme = inject(ThemeService);
  todoService = inject(TodoService);
  user = signal<User | null>(null);
  focusMode = signal<FocusMode>((localStorage.getItem(FOCUS_KEY) as FocusMode) || 'none');

  get hideSearch(): boolean { return this.focusMode() === 'search' || this.focusMode() === 'both'; }
  get hideTodos(): boolean  { return this.focusMode() === 'todos'  || this.focusMode() === 'both'; }

  ngOnInit(): void {
    this.user.set(this.storage.getUser());
    this.capturePwaInstall();
  }

  onLogin(user: User): void {
    this.storage.setUser(user);
    this.user.set(user);
  }

  onFocusChanged(mode: FocusMode): void {
    this.focusMode.set(mode);
  }

  private capturePwaInstall(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      (window as any).__pwaInstallEvent = e;
    });
  }
}

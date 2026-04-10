import { Component, inject, signal } from '@angular/core';
import { ThemeService, FLAVORS } from '../../services/theme';
import { CatppuccinFlavor } from '../../models';
import { LucideAngularModule, Palette } from 'lucide-angular';

@Component({
  selector: 'app-theme-switcher',
  imports: [LucideAngularModule],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss'
})
export class ThemeSwitcherComponent {
  theme = inject(ThemeService);
  flavors = FLAVORS;
  open = signal(false);
  readonly PaletteIcon = Palette;

  set(f: CatppuccinFlavor): void {
    this.theme.apply(f);
    this.open.set(false);
  }
}

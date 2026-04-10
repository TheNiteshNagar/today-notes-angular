import { Injectable, signal } from '@angular/core';
import { CatppuccinFlavor } from '../models';
import { StorageService } from './storage';

export const FLAVORS: { id: CatppuccinFlavor; label: string }[] = [
  { id: 'latte', label: 'Latte' },
  { id: 'frappe', label: 'Frappé' },
  { id: 'macchiato', label: 'Macchiato' },
  { id: 'mocha', label: 'Mocha' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  flavor = signal<CatppuccinFlavor>('mocha');

  constructor(private storage: StorageService) {
    this.apply(this.storage.getFlavor());
  }

  apply(flavor: CatppuccinFlavor): void {
    this.flavor.set(flavor);
    this.storage.setFlavor(flavor);
    document.body.className = document.body.className
      .replace(/\bctp-\S+/g, '')
      .trim();
    document.body.classList.add(`ctp-${flavor}`);
  }
}

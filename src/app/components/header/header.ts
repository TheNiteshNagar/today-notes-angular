import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StorageService } from '../../services/storage';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';

interface Engine { url: string; label: string; icon: SafeHtml; }

const RAW: Record<string, { url: string; label: string; svg: string }> = {
  google: {
    url: 'https://www.google.com/search?q=',
    label: 'Google',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>`
  },
  bing: {
    url: 'https://www.bing.com/search?q=',
    label: 'Bing',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#05A6F0"/>
          <stop offset="100%" stop-color="#0078D4"/>
        </linearGradient>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFB900"/>
          <stop offset="100%" stop-color="#F7630C"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="4" fill="url(#bg)"/>
      <path d="M7 4v12.5l3.2 1.8 5.5-3.2-2.2-1.3 2.2-4L10.2 8V4H7z" fill="url(#fg)"/>
      <path d="M10.2 8v4.8l5.5 3.2-5.5 3.2L7 17.5V20l3.2 1.8 8-4.6v-1.8L10.2 8z" fill="white" opacity="0.9"/>
    </svg>`
  },
  duckduckgo: {
    url: 'https://duckduckgo.com/?q=',
    label: 'DuckDuckGo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#DE5833"/>
      <circle cx="24" cy="20" r="10" fill="white"/>
      <circle cx="27" cy="17" r="3.5" fill="#3D3D3D"/>
      <circle cx="28" cy="16.5" r="1.2" fill="white"/>
      <path d="M18 28 Q24 34 30 28" stroke="#3D3D3D" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="30" r="2" fill="#DE5833" stroke="white" stroke-width="1"/>
      <circle cx="29" cy="30" r="2" fill="#DE5833" stroke="white" stroke-width="1"/>
    </svg>`
  },
  brave: {
    url: 'https://search.brave.com/search?q=',
    label: 'Brave',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <defs>
        <linearGradient id="braveBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF6000"/>
          <stop offset="100%" stop-color="#FF2000"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#braveBg)"/>
      <path d="M24 8 L36 13 L34 28 Q30 38 24 42 Q18 38 14 28 L12 13 Z" fill="white" opacity="0.95"/>
      <path d="M24 14 L20 26 L24 24 L28 26 Z" fill="#FF4500"/>
      <path d="M19 20 L17 28 Q20 34 24 36 Q28 34 31 28 L29 20 L26 22 L24 20 L22 22 Z" fill="#FF6000" opacity="0.3"/>
    </svg>`
  },
};

@Component({
  selector: 'app-header',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private sanitizer = inject(DomSanitizer);
  storage = inject(StorageService);

  engines: Record<string, Engine>;
  engineKeys: string[];
  searchQuery = '';
  searchEngine = signal(this.storage.getSearchEngine());
  showEngineMenu = signal(false);
  dropdownTop = 0;
  dropdownLeft = 0;

  readonly ArrowRightIcon = ArrowRight;

  constructor() {
    this.engines = Object.fromEntries(
      Object.entries(RAW).map(([k, v]) => [k, {
        url: v.url,
        label: v.label,
        icon: this.sanitizer.bypassSecurityTrustHtml(v.svg)
      }])
    );
    this.engineKeys = Object.keys(this.engines);
  }

  toggleEngineMenu(event: MouseEvent): void {
    if (this.showEngineMenu()) { this.showEngineMenu.set(false); return; }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownTop = rect.bottom + 8;
    this.dropdownLeft = rect.left;
    this.showEngineMenu.set(true);
  }

  search(): void {
    if (!this.searchQuery.trim()) return;
    window.open(this.engines[this.searchEngine()].url + encodeURIComponent(this.searchQuery.trim()), '_blank');
    this.searchQuery = '';
  }

  setEngine(e: string): void {
    this.searchEngine.set(e);
    this.storage.setSearchEngine(e);
    this.showEngineMenu.set(false);
  }
}

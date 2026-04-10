import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';

interface Engine { url: string; label: string; favicon: string; }

const ENGINES: Record<string, Engine> = {
  google:     { url: 'https://www.google.com/search?q=',            label: 'Google',     favicon: 'https://www.google.com/favicon.ico' },
  bing:       { url: 'https://www.bing.com/search?q=',              label: 'Bing',        favicon: 'https://www.bing.com/favicon.ico' },
  duckduckgo: { url: 'https://duckduckgo.com/?q=',                  label: 'DuckDuckGo', favicon: 'https://duckduckgo.com/favicon.ico' },
  brave:      { url: 'https://search.brave.com/search?q=',          label: 'Brave',      favicon: 'https://brave.com/favicon.ico' },
  youtube:    { url: 'https://www.youtube.com/results?search_query=', label: 'YouTube',   favicon: 'https://www.youtube.com/favicon.ico' },
  chatgpt:    { url: 'https://chatgpt.com/?q=',                     label: 'ChatGPT',    favicon: 'https://chatgpt.com/favicon.ico' },
  wikipedia:  { url: 'https://en.wikipedia.org/w/index.php?search=', label: 'Wikipedia',  favicon: 'https://en.wikipedia.org/favicon.ico' },
};

@Component({
  selector: 'app-header',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  storage = inject(StorageService);

  engines = ENGINES;
  engineKeys = Object.keys(ENGINES);
  searchQuery = '';
  searchEngine = signal(this.storage.getSearchEngine());
  showEngineMenu = signal(false);
  dropdownTop = 0;
  dropdownLeft = 0;

  readonly ArrowRightIcon = ArrowRight;

  toggleEngineMenu(event: MouseEvent): void {
    if (this.showEngineMenu()) { this.showEngineMenu.set(false); return; }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownTop = rect.bottom + 8;
    this.dropdownLeft = rect.left;
    this.showEngineMenu.set(true);
  }

  search(): void {
    if (!this.searchQuery.trim()) return;
    window.open(ENGINES[this.searchEngine()].url + encodeURIComponent(this.searchQuery.trim()), '_blank');
    this.searchQuery = '';
  }

  setEngine(e: string): void {
    this.searchEngine.set(e);
    this.storage.setSearchEngine(e);
    this.showEngineMenu.set(false);
  }
}

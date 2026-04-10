import { Component, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ImagePlus, FolderOpen, Link2, X, Loader, RefreshCw, Sparkles } from 'lucide-angular';
import { IdbService } from '../../services/idb';

export type WpType = 'image' | 'video';
export type WpTab = 'local' | 'auto' | 'url';

const LS_KEY   = 'tn_wallpaper';
const LS_VIDEO = 'tn_wp_video';

const ANIME_APIS = [
  { label: 'Waifu',   fetch: () => fetch('https://api.waifu.pics/sfw/waifu').then(r => r.json()).then((d: any) => d.url as string) },
  { label: 'Neko',    fetch: () => fetch('https://api.waifu.pics/sfw/neko').then(r => r.json()).then((d: any) => d.url as string) },
  { label: 'Shinobu', fetch: () => fetch('https://api.waifu.pics/sfw/shinobu').then(r => r.json()).then((d: any) => d.url as string) },
  { label: 'Megumin', fetch: () => fetch('https://api.waifu.pics/sfw/megumin').then(r => r.json()).then((d: any) => d.url as string) },
];

@Component({
  selector: 'app-wallpaper',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './wallpaper.html',
  styleUrl: './wallpaper.scss'
})
export class WallpaperComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private idb = inject(IdbService);

  showMenu = signal(false);
  activeTab = signal<WpTab>('local');
  urlInput = '';
  loading = signal(false);
  hasWp = signal(false);
  autoApiIndex = signal(0);
  animeApis = ANIME_APIS;

  // Bound handlers so we can remove them on destroy
  private onVisibility = () => {
    if (document.visibilityState === 'visible') this.ensureVideoPlaying();
  };
  private onWindowFocus = () => this.ensureVideoPlaying();

  readonly ImagePlusIcon = ImagePlus;
  readonly FolderIcon = FolderOpen;
  readonly LinkIcon = Link2;
  readonly XIcon = X;
  readonly LoaderIcon = Loader;
  readonly RefreshIcon = RefreshCw;
  readonly SparklesIcon = Sparkles;

  async ngOnInit(): Promise<void> {
    // Register global keep-alive handlers outside Angular zone (no CD overhead)
    this.zone.runOutsideAngular(() => {
      document.addEventListener('visibilitychange', this.onVisibility);
      window.addEventListener('focus', this.onWindowFocus);
    });

    // Restore video from IndexedDB
    if (localStorage.getItem(LS_VIDEO)) {
      const storedVal = localStorage.getItem(LS_VIDEO)!;
      // Could be '1' (blob in IDB) or a URL string
      if (storedVal === '1') {
        const url = await this.idb.loadVideo();
        if (url) {
          this.zone.run(() => { this.applyVideoToDOM(url); this.hasWp.set(true); });
          return;
        }
        localStorage.removeItem(LS_VIDEO);
      } else {
        // It's a direct URL
        this.zone.run(() => { this.applyVideoToDOM(storedVal); this.hasWp.set(true); });
        return;
      }
    }

    // Restore image from localStorage
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { src: string; type: WpType };
      if (data.src) { this.applyImageToDOM(data.src); this.hasWp.set(true); }
    } catch {
      const src = raw.replace(/^"|"$/g, '');
      if (src) { this.applyImageToDOM(src); this.hasWp.set(true); }
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('focus', this.onWindowFocus);
  }

  /** Ensure video keeps playing — called on visibility/focus restore */
  private ensureVideoPlaying(): void {
    const v = document.getElementById('bg-video') as HTMLVideoElement | null;
    if (v && v.paused) v.play().catch(() => {});
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    this.loading.set(true);

    if (isVideo) {
      this.idb.saveVideo(file)
        .then(() => this.idb.loadVideo())
        .then((url) => {
          this.zone.run(() => {
            if (url) {
              localStorage.setItem(LS_VIDEO, '1');
              localStorage.removeItem(LS_KEY);
              this.applyVideoToDOM(url);
              this.hasWp.set(true);
            }
            this.loading.set(false);
            this.showMenu.set(false);
          });
        })
        .catch(() => this.zone.run(() => this.loading.set(false)));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target!.result as string;
      this.zone.run(() => {
        this.persistImage(src);
        this.loading.set(false);
        this.showMenu.set(false);
      });
    };
    reader.onerror = () => this.zone.run(() => this.loading.set(false));
    reader.readAsDataURL(file);
  }

  applyUrl(): void {
    const url = this.urlInput.trim();
    if (!url) return;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
    if (isVideo) {
      localStorage.setItem(LS_VIDEO, url);
      localStorage.removeItem(LS_KEY);
      this.applyVideoToDOM(url);
      this.hasWp.set(true);
    } else {
      this.persistImage(url);
    }
    this.urlInput = '';
    this.showMenu.set(false);
  }

  async fetchAnime(): Promise<void> {
    this.loading.set(true);
    try {
      const url = await ANIME_APIS[this.autoApiIndex()].fetch();
      this.zone.run(() => { this.persistImage(url); this.loading.set(false); });
    } catch {
      this.zone.run(() => this.loading.set(false));
    }
  }

  remove(): void {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_VIDEO);
    this.idb.clearVideo();
    this.removeFromDOM();
    this.hasWp.set(false);
    this.showMenu.set(false);
  }

  private persistImage(src: string): void {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ src, type: 'image' })); } catch { /* quota */ }
    localStorage.removeItem(LS_VIDEO);
    this.applyImageToDOM(src);
    this.hasWp.set(true);
  }

  private applyVideoToDOM(src: string): void {
    this.removeFromDOM();
    const v = document.createElement('video');
    v.id = 'bg-video';
    v.src = src;
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('disablepictureinpicture', '');

    // Auto-resume on any pause (browser-initiated or tab switch)
    v.addEventListener('pause', () => {
      // Small delay to avoid fighting with intentional pauses during seek
      setTimeout(() => { if (v.paused && !v.ended) v.play().catch(() => {}); }, 300);
    });

    // Recover from stall/suspend
    v.addEventListener('stalled', () => { v.load(); v.play().catch(() => {}); });
    v.addEventListener('suspend', () => { if (v.paused) v.play().catch(() => {}); });

    // Start playing as soon as enough data is available
    v.addEventListener('loadeddata', () => v.play().catch(() => {}));

    document.body.prepend(v);
    v.play().catch(() => {});
  }

  private applyImageToDOM(src: string): void {
    this.removeFromDOM();
    document.body.style.backgroundImage = `url("${src}")`;
    // GIF loops automatically as background-image — no extra handling needed
  }

  private removeFromDOM(): void {
    const old = document.getElementById('bg-video') as HTMLVideoElement | null;
    if (old) { old.pause(); old.src = ''; old.remove(); }
    document.body.style.backgroundImage = '';
  }
}

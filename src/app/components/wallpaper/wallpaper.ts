import { Component, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ImagePlus, FolderOpen, Link2, X, Loader, RefreshCw, Sparkles } from 'lucide-angular';
import { IdbService } from '../../services/idb';

export type WpType     = 'image' | 'video';
export type WpTab      = 'local' | 'auto' | 'url';
export type WpPosition = 'top' | 'center' | 'bottom';

const LS_KEY      = 'tn_wallpaper';
const LS_VIDEO    = 'tn_wp_video';
const LS_POSITION = 'tn_wp_position';

const POSITIONS: { label: string; value: WpPosition }[] = [
  { label: 'Top',    value: 'top'    },
  { label: 'Center', value: 'center' },
  { label: 'Bottom', value: 'bottom' },
];

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
  styleUrl:    './wallpaper.scss'
})
export class WallpaperComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private idb  = inject(IdbService);

  showMenu     = signal(false);
  activeTab    = signal<WpTab>('local');
  urlInput     = '';
  loading      = signal(false);
  hasWp        = signal(false);
  autoApiIndex = signal(0);
  animeApis    = ANIME_APIS;
  positions    = POSITIONS;
  wpPosition   = signal<WpPosition>('center');
  isVideo      = signal(false);

  private onVisible    = () => { if (document.visibilityState === 'visible') this.resumeVideo(); };
  private onFocus      = () => this.resumeVideo();
  private onPageShow   = () => this.resumeVideo();
  private onInteract   = () => { this.resumeVideo(); this.removeInteractListeners(); };

  readonly ImagePlusIcon = ImagePlus;
  readonly FolderIcon    = FolderOpen;
  readonly LinkIcon      = Link2;
  readonly XIcon         = X;
  readonly LoaderIcon    = Loader;
  readonly RefreshIcon   = RefreshCw;
  readonly SparklesIcon  = Sparkles;

  async ngOnInit(): Promise<void> {
    const savedPos = localStorage.getItem(LS_POSITION) as WpPosition | null;
    if (savedPos) this.wpPosition.set(savedPos);

    this.zone.runOutsideAngular(() => {
      document.addEventListener('visibilitychange', this.onVisible);
      window.addEventListener('focus',    this.onFocus);
      window.addEventListener('pageshow', this.onPageShow);
      document.addEventListener('click',   this.onInteract, { once: true });
      document.addEventListener('keydown', this.onInteract, { once: true });
    });

    const lsVideo = localStorage.getItem(LS_VIDEO);

    if (lsVideo === '1') {
      // Blob stored in IDB — load it and set src on the pre-boot element or create one
      const url = await this.idb.loadVideo();
      if (url) {
        this.zone.run(() => { this.setVideoSrc(url); this.hasWp.set(true); this.isVideo.set(true); });
      } else {
        localStorage.removeItem(LS_VIDEO);
      }
      return;
    }

    if (lsVideo) {
      // Direct URL — pre-boot script already created the element; just sync state
      this.zone.run(() => {
        this.ensureVideoElement(lsVideo);
        this.hasWp.set(true);
        this.isVideo.set(true);
      });
      return;
    }

    // Image wallpaper
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { src: string };
      if (data.src) { this.applyImage(data.src); this.hasWp.set(true); }
    } catch {
      const src = raw.replace(/^"|"$/g, '');
      if (src) { this.applyImage(src); this.hasWp.set(true); }
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisible);
    window.removeEventListener('focus',    this.onFocus);
    window.removeEventListener('pageshow', this.onPageShow);
    this.removeInteractListeners();
  }

  private removeInteractListeners(): void {
    document.removeEventListener('click',   this.onInteract);
    document.removeEventListener('keydown', this.onInteract);
  }

  private getVideo(): HTMLVideoElement | null {
    return document.getElementById('bg-video') as HTMLVideoElement | null;
  }

  private resumeVideo(): void {
    const v = this.getVideo();
    if (v && v.src && v.paused) v.play().catch(() => {});
  }

  /** Ensure a video element exists with the right src — reuse pre-boot element if present */
  private ensureVideoElement(src: string): HTMLVideoElement {
    let v = this.getVideo();
    if (!v) {
      v = document.createElement('video');
      v.id = 'bg-video';
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('disablepictureinpicture', '');
      v.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;z-index:-1;pointer-events:none;';
      document.documentElement.appendChild(v);
    }
    v.style.display        = 'block';
    v.style.objectPosition = `center ${this.wpPosition()}`;
    v.autoplay = true;
    if (v.src !== src) { v.src = src; v.load(); }
    v.play().catch(() => {});
    document.body.style.backgroundImage = '';
    return v;
  }

  private setVideoSrc(src: string): void {
    this.ensureVideoElement(src);
  }

  private applyImage(src: string): void {
    const v = this.getVideo();
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.style.display = 'none'; }
    document.body.style.backgroundImage    = `url("${src}")`;
    document.body.style.backgroundPosition = `center ${this.wpPosition()}`;
  }

  setPosition(pos: WpPosition): void {
    this.wpPosition.set(pos);
    localStorage.setItem(LS_POSITION, pos);
    document.body.style.backgroundPosition = `center ${pos}`;
    const v = this.getVideo();
    if (v) v.style.objectPosition = `center ${pos}`;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    input.value = '';
    if (!file) return;

    const isVid = file.type.startsWith('video');
    this.loading.set(true);

    if (isVid) {
      this.idb.saveVideo(file)
        .then(() => this.idb.loadVideo())
        .then(url => {
          this.zone.run(() => {
            if (url) {
              localStorage.setItem(LS_VIDEO, '1');
              localStorage.removeItem(LS_KEY);
              this.setVideoSrc(url);
              this.hasWp.set(true);
              this.isVideo.set(true);
            }
            this.loading.set(false);
            this.showMenu.set(false);
          });
        })
        .catch(() => this.zone.run(() => this.loading.set(false)));
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target!.result as string;
      this.zone.run(() => { this.persistImage(src); this.loading.set(false); this.showMenu.set(false); });
    };
    reader.onerror = () => this.zone.run(() => this.loading.set(false));
    reader.readAsDataURL(file);
  }

  applyUrl(): void {
    const url = this.urlInput.trim();
    if (!url) return;
    const isVid = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
    if (isVid) {
      localStorage.setItem(LS_VIDEO, url);
      localStorage.removeItem(LS_KEY);
      this.setVideoSrc(url);
      this.hasWp.set(true);
      this.isVideo.set(true);
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
    const v = this.getVideo();
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.style.display = 'none'; }
    document.body.style.backgroundImage = '';
    this.hasWp.set(false);
    this.isVideo.set(false);
    this.showMenu.set(false);
  }

  private persistImage(src: string): void {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ src, type: 'image' })); } catch { /* quota */ }
    localStorage.removeItem(LS_VIDEO);
    this.applyImage(src);
    this.hasWp.set(true);
    this.isVideo.set(false);
  }
}

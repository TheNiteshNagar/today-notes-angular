import { Injectable, signal } from '@angular/core';

// Genuine, verified lofi radio streams
const STREAMS = [
  {
    label: 'Lofi Girl',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
  },
  {
    label: 'Chillhop Radio',
    url: 'https://streams.ilovemusic.de/iloveradio21.mp3',
  },
  {
    label: 'Lofi Beats',
    url: 'https://streams.ilovemusic.de/iloveradio24.mp3',
  },
];

@Injectable({ providedIn: 'root' })
export class LofiService {
  streams = STREAMS;
  playing = signal(false);
  currentIndex = signal(0); // Lofi Girl is default (index 0)
  volume = signal(0.5);
  private audio = new Audio();

  constructor() {
    this.audio.src = STREAMS[0].url;
    this.audio.volume = 0.5;
  }

  toggle(): void {
    if (this.playing()) {
      this.audio.pause();
      this.playing.set(false);
    } else {
      this.audio.play().catch(() => {});
      this.playing.set(true);
    }
  }

  selectStream(index: number): void {
    const wasPlaying = this.playing();
    this.audio.pause();
    this.currentIndex.set(index);
    this.audio.src = STREAMS[index].url;
    this.audio.volume = this.volume();
    if (wasPlaying) { this.audio.play().catch(() => {}); this.playing.set(true); }
  }

  setVolume(v: number): void {
    this.volume.set(v);
    this.audio.volume = v;
  }
}

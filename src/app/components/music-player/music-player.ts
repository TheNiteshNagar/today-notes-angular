import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LofiService } from '../../services/lofi';
import { LucideAngularModule, Play, Pause, Volume2 } from 'lucide-angular';

@Component({
  selector: 'app-music-player',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './music-player.html',
  styleUrl: './music-player.scss'
})
export class MusicPlayerComponent {
  lofi = inject(LofiService);

  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;
  readonly VolumeIcon = Volume2;
}

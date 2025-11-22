import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SoundService {
    private audio: HTMLAudioElement | null = null;

    playRingtone() {
        this.stopRingtone(); // 🔇 evitar sonidos duplicados

        this.audio = new Audio('assets/sounds/ringtone.mp3');
        this.audio.loop = true;
        this.audio.play().catch(err => console.error('Error al reproducir audio', err));
    }

    stopRingtone() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
    }
}

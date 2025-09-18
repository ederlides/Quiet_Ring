import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { WebrtcService } from '../services/webrtc.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-pip',
  templateUrl: './pip.component.html',
  styleUrls: ['./pip.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PipComponent implements AfterViewInit, OnDestroy {
  @ViewChild('local') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remote') remoteVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteAudio') remoteAudioRef!: ElementRef<HTMLAudioElement>;

  private isDragging = false;
  private offset = { x: 0, y: 0 };

  cameraOn = true;
  isSpeakerOn = true;
  isMuted = false;
  currentVolume = 1.0;

  constructor(public webrtc: WebrtcService, private router: Router) {}

  ngAfterViewInit() {
    this.webrtc.setVideoElements(this.localVideoRef.nativeElement, this.remoteVideoRef.nativeElement);
    
    // Configurar audio optimizado
    this.setupAudioOptimization();
    
    if (this.webrtc.isIncomingCall && this.webrtc.incomingOffer) {
      this.acceptCall();
    }
    
    const video = this.localVideoRef.nativeElement as HTMLElement;

    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.onDragEnd());
    document.addEventListener('touchmove', (e) => this.onDrag(e));
    document.addEventListener('touchend', () => this.onDragEnd());
  }

  /**
   * Configura optimizaciones de audio para videollamadas
   */
  private setupAudioOptimization() {
    // Configurar video remoto para audio
    if (this.remoteVideoRef?.nativeElement) {
      const remoteVideo = this.remoteVideoRef.nativeElement;
      remoteVideo.volume = 1.0;
      remoteVideo.muted = false;
      remoteVideo.setAttribute('webkit-playsinline', 'true');
      remoteVideo.setAttribute('playsinline', 'true');
    }

    // Configurar audio separado
    if (this.remoteAudioRef?.nativeElement) {
      const remoteAudio = this.remoteAudioRef.nativeElement;
      remoteAudio.volume = 1.0;
      remoteAudio.muted = false;
      remoteAudio.setAttribute('webkit-playsinline', 'true');
      remoteAudio.setAttribute('playsinline', 'true');
    }

    console.log('🔊 Configuración de audio optimizada aplicada');
  }

  onDragStart(event: MouseEvent | TouchEvent) {
  this.isDragging = true;

  const video = this.localVideoRef.nativeElement as HTMLElement;
  const rect = video.getBoundingClientRect();

  const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
  const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;

  this.offset.x = clientX - rect.left;
  this.offset.y = clientY - rect.top;
}

onDrag(event: MouseEvent | TouchEvent) {
  if (!this.isDragging) return;

  event.preventDefault(); // Previene scroll en mobile

  const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
  const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;

  const video = this.localVideoRef.nativeElement as HTMLElement;

  video.style.left = `${clientX - this.offset.x}px`;
  video.style.top = `${clientY - this.offset.y}px`;
}

onDragEnd() {
  this.isDragging = false;
}

  async acceptCall() {
    await this.webrtc.acceptCall();
  }

  async startCall() {
    await this.webrtc.callPeer();
  }

  endCall() {
    this.webrtc.endCall();
    this.router.navigate(['/menu']);
  }

  toggleCamera() {
    this.cameraOn = !this.cameraOn;
    const videoTracks = this.webrtc['localStream']?.getVideoTracks();
    if (videoTracks && videoTracks.length) {
      videoTracks[0].enabled = this.cameraOn;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const audioTracks = this.webrtc['localStream']?.getAudioTracks();
    if (audioTracks && audioTracks.length) {
      audioTracks[0].enabled = !this.isMuted;
    }
    console.log(`🎤 Micrófono ${this.isMuted ? 'silenciado' : 'activado'}`);
  }

  toggleSpeaker() {
    this.isSpeakerOn = !this.isSpeakerOn;
    
    // Controlar volumen del video remoto
    if (this.remoteVideoRef?.nativeElement) {
      this.remoteVideoRef.nativeElement.muted = !this.isSpeakerOn;
      this.remoteVideoRef.nativeElement.volume = this.isSpeakerOn ? this.currentVolume : 0;
    }
    
    // Controlar volumen del audio separado
    if (this.remoteAudioRef?.nativeElement) {
      this.remoteAudioRef.nativeElement.muted = !this.isSpeakerOn;
      this.remoteAudioRef.nativeElement.volume = this.isSpeakerOn ? this.currentVolume : 0;
    }
    
    console.log(`🔊 Altavoz ${this.isSpeakerOn ? 'activado' : 'desactivado'}`);
  }

  /**
   * Ajusta el volumen de la llamada
   */
  adjustVolume() {
    // Ciclar entre diferentes niveles de volumen
    const volumeLevels = [0.3, 0.6, 0.8, 1.0];
    const currentIndex = volumeLevels.indexOf(this.currentVolume);
    const nextIndex = (currentIndex + 1) % volumeLevels.length;
    this.currentVolume = volumeLevels[nextIndex];
    
    // Aplicar volumen a video remoto
    if (this.remoteVideoRef?.nativeElement) {
      this.remoteVideoRef.nativeElement.volume = this.currentVolume;
    }
    
    // Aplicar volumen a audio separado
    if (this.remoteAudioRef?.nativeElement) {
      this.remoteAudioRef.nativeElement.volume = this.currentVolume;
    }
    
    console.log(`🔊 Volumen ajustado a: ${Math.round(this.currentVolume * 100)}%`);
  }

  /**
   * Diagnóstica problemas de audio
   */
  async diagnoseAudio() {
    console.log('🔍 Iniciando diagnóstico de audio...');
    
    try {
      const diagnosis = await this.webrtc.diagnoseAudioIssues();
      
      // Mostrar resultados en consola
      console.log('📊 Resultados del diagnóstico:');
      console.log('================================');
      
      if (diagnosis.issues.length === 0) {
        console.log('✅ ¡Audio funcionando correctamente!');
        alert('✅ Audio funcionando correctamente');
      } else {
        console.log('🚨 Problemas encontrados:');
        diagnosis.issues.forEach(issue => console.log(`   ${issue}`));
        
        // Mostrar alerta con problemas
        const issuesText = diagnosis.issues.join('\n');
        alert(`🚨 Problemas de audio encontrados:\n\n${issuesText}`);
      }
      
      // Información adicional
      console.log('\n📋 Información detallada:');
      console.log(`   - Permisos de audio: ${diagnosis.hasPermissions ? '✅' : '❌'}`);
      console.log(`   - Audio tracks disponibles: ${diagnosis.hasAudioTracks ? '✅' : '❌'}`);
      console.log(`   - Tracks habilitados: ${diagnosis.audioTracksEnabled ? '✅' : '❌'}`);
      console.log(`   - Tracks en vivo: ${diagnosis.audioTracksLive ? '✅' : '❌'}`);
      console.log(`   - PeerConnection listo: ${diagnosis.peerConnectionReady ? '✅' : '❌'}`);
      console.log(`   - Audio remoto configurado: ${diagnosis.remoteAudioConfigured ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      alert(`❌ Error en diagnóstico: ${error}`);
    }
  }

  ngOnDestroy() {
    this.endCall();
  }
}

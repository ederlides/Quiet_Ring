import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { WebrtcImprovedService, CallState } from '../services/webrtc-improved.service';

@Component({
  selector: 'app-video-call',
  template: `
    <div class="video-call-container">
      <!-- Estado de la conexión -->
      <div class="connection-status">
        <ion-chip [color]="callState.isConnected ? 'success' : 'danger'">
          <ion-icon name="{{ callState.isConnected ? 'checkmark-circle' : 'close-circle' }}"></ion-icon>
          <ion-label>{{ callState.isConnected ? 'Conectado' : 'Desconectado' }}</ion-label>
        </ion-chip>
      </div>

      <!-- Videos -->
      <div class="video-container">
        <!-- Video remoto -->
        <div class="remote-video-container">
          <video #remoteVideo autoplay playsinline></video>
          <div *ngIf="!callState.hasRemoteStream" class="no-stream">
            <ion-icon name="person-outline"></ion-icon>
            <p>Esperando video remoto...</p>
          </div>
        </div>

        <!-- Video local (picture-in-picture) -->
        <div class="local-video-container">
          <video #localVideo autoplay playsinline muted></video>
        </div>
      </div>

      <!-- Controles -->
      <div class="controls">
        <ion-button 
          (click)="connectToServer()" 
          [disabled]="callState.isConnected"
          color="primary">
          <ion-icon name="call"></ion-icon>
          Conectar
        </ion-button>

        <ion-button 
          (click)="startCall()" 
          [disabled]="!callState.isConnected || callState.isCalling"
          color="success">
          <ion-icon name="videocam"></ion-icon>
          Iniciar Llamada
        </ion-button>

        <ion-button 
          (click)="toggleAudio()" 
          [color]="audioEnabled ? 'primary' : 'danger'"
          fill="outline">
          <ion-icon name="{{ audioEnabled ? 'mic' : 'mic-off' }}"></ion-icon>
        </ion-button>

        <ion-button 
          (click)="toggleVideo()" 
          [color]="videoEnabled ? 'primary' : 'danger'"
          fill="outline">
          <ion-icon name="{{ videoEnabled ? 'videocam' : 'videocam-off' }}"></ion-icon>
        </ion-button>

        <ion-button 
          (click)="endCall()" 
          [disabled]="!callState.isCalling"
          color="danger">
          <ion-icon name="call"></ion-icon>
          Finalizar
        </ion-button>
      </div>

      <!-- Mensajes de error -->
      <div *ngIf="errorMessage" class="error-message">
        <ion-chip color="danger">
          <ion-icon name="warning"></ion-icon>
          <ion-label>{{ errorMessage }}</ion-label>
        </ion-chip>
      </div>
    </div>
  `,
  styles: [`
    .video-call-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #000;
    }

    .connection-status {
      padding: 10px;
      text-align: center;
    }

    .video-container {
      flex: 1;
      position: relative;
      background: #000;
    }

    .remote-video-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .remote-video-container video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .local-video-container {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 120px;
      height: 90px;
      border: 2px solid #fff;
      border-radius: 8px;
      overflow: hidden;
    }

    .local-video-container video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-stream {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #fff;
    }

    .no-stream ion-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.8);
    }

    .error-message {
      padding: 10px;
      text-align: center;
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;

  callState: CallState = {
    isConnected: false,
    isCalling: false,
    hasLocalStream: false,
    hasRemoteStream: false
  };

  audioEnabled = true;
  videoEnabled = true;
  errorMessage = '';

  constructor(private webrtcService: WebrtcImprovedService) {}

  ngOnInit() {
    // Suscribirse a cambios de estado
    this.webrtcService.onCallStateChange.subscribe((state) => {
      this.callState = state;
    });

    // Suscribirse a errores
    this.webrtcService.onError.subscribe((error) => {
      this.errorMessage = error;
      setTimeout(() => this.errorMessage = '', 5000);
    });
  }

  ngOnDestroy() {
    this.webrtcService.destroy();
  }

  async connectToServer() {
    try {
      const connected = await this.webrtcService.connectToServer();
      if (connected) {
        // Iniciar stream local después de conectar
        await this.webrtcService.startLocalStream(this.localVideo);
      }
    } catch (error) {
      console.error('Error conectando:', error);
    }
  }

  async startCall() {
    try {
      await this.webrtcService.startCall();
    } catch (error) {
      console.error('Error iniciando llamada:', error);
    }
  }

  toggleAudio() {
    this.audioEnabled = this.webrtcService.toggleAudio();
  }

  toggleVideo() {
    this.videoEnabled = this.webrtcService.toggleVideo();
  }

  async endCall() {
    await this.webrtcService.endCall();
  }
}

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

  private isDragging = false;
private offset = { x: 0, y: 0 };

  cameraOn = true;
  speakerOn = true;
  muted = false;

  constructor(public webrtc: WebrtcService, private router: Router) {}

  ngAfterViewInit() {
    this.webrtc.setVideoElements(this.localVideoRef.nativeElement, this.remoteVideoRef.nativeElement);
    if (this.webrtc.isIncomingCall && this.webrtc.incomingOffer) {
      this.acceptCall();
    }
      const video = this.localVideoRef.nativeElement as HTMLElement;

  document.addEventListener('mousemove', (e) => this.onDrag(e));
  document.addEventListener('mouseup', () => this.onDragEnd());
  document.addEventListener('touchmove', (e) => this.onDrag(e));
  document.addEventListener('touchend', () => this.onDragEnd());
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
    this.muted = !this.muted;
    const audioTracks = this.webrtc['localStream']?.getAudioTracks();
    if (audioTracks && audioTracks.length) {
      audioTracks[0].enabled = !this.muted;
    }
  }

  toggleSpeaker() {
    this.speakerOn = !this.speakerOn;
  }

  ngOnDestroy() {
    this.endCall();
  }
}

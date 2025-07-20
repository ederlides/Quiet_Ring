import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WebrtcService } from '../services/webrtc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calling',
  templateUrl: './calling.component.html',
  styleUrls: ['./calling.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CallingComponent implements OnInit {


  constructor(private webrtc: WebrtcService, private router: Router) { }
  calling: boolean = true;
  @ViewChild('slider', { static: false }) slider: ElementRef;
  @ViewChild('slideContainer', { static: false }) slideContainer: ElementRef;
  @ViewChild('local') local: ElementRef;
  @ViewChild('remote') remote: ElementRef;

  isIncomingCall = false;
  incomingOffer: RTCSessionDescriptionInit;
  audio = new Audio();

  isPeerConnectionReady = false;
  pendingCandidates: RTCIceCandidate[] = [];


  private sliding = false;


  ngOnInit() {

    this.audio.src = 'assets/Quiet Ring Tone.mp3';
    this.audio.loop = true;
    this.audio.play();
  }

  startSlide(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.sliding = true;

    const moveListener = (e: any) => this.moveSlide(e);
    const upListener = () => this.endSlide(moveListener, upListener);

    document.addEventListener('mousemove', moveListener);
    document.addEventListener('mouseup', upListener);
    document.addEventListener('touchmove', moveListener);
    document.addEventListener('touchend', upListener);
  }

  moveSlide(event: MouseEvent | TouchEvent) {
    if (!this.sliding) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const container = this.slideContainer.nativeElement;
    const slider = this.slider.nativeElement;

    const containerRect = container.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - containerRect.left - slider.offsetWidth / 2), containerRect.width - slider.offsetWidth);

    slider.style.left = `${x}px`;
  }

  endSlide(moveListener, upListener) {
    const container = this.slideContainer.nativeElement;
    const slider = this.slider.nativeElement;
    const containerRect = container.getBoundingClientRect();

    const finalLeft = parseInt(slider.style.left || '0', 10);
    if (finalLeft + slider.offsetWidth >= containerRect.width - 10) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.router.navigate(['/pip']);
    }

    // Reset slider
    slider.style.left = '0px';
    this.sliding = false;

    document.removeEventListener('mousemove', moveListener);
    document.removeEventListener('mouseup', upListener);
    document.removeEventListener('touchmove', moveListener);
    document.removeEventListener('touchend', upListener);
  }




}

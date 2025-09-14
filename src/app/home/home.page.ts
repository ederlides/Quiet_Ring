import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { WebrtcImprovedService } from '../services/webrtc-improved.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private router: Router) { }
  jwt: Boolean = false;
  arraySplas = [
    {
      title: "Private Calls with QR Code",
      description: "Easily communicate with your visitors securely, quickly, and directly, without the need for intermediaries.",
      img: "../../assets/splas1.svg",
      view: true
    },
    {
      title: "Say Goodbye to Traditional Doorbells",
      description: "Modernize your home’s entrance with an innovative solution that combines technology and style.",
      img: "../../assets/splas2.svg",
      view: false
    },
    {
      title: "Fast and Secure Access",
      description: "QR codes provide a seamless and reliable experience, ensuring your home’s safety.",
      img: "../../assets/splas3.svg",
      view: false
    },
    {
      title: "Full Control from Your Smartphone",
      description: "Answer, monitor, and manage your visitors from anywhere with just a tap.",
      img: "../../assets/splas4.svg",
      view: false
    }
  ];

  currentIndex = 0; // Índice del elemento actual

  nextSlide() {
    this.arraySplas[this.currentIndex].view = false;
    if (this.currentIndex === this.arraySplas.length - 1) {
      this.router.navigate(['/login']); 
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.arraySplas.length;
    this.arraySplas[this.currentIndex].view = true;
  }

  isActive(index: number): boolean {
    return index === this.currentIndex; // Devuelve true si el punto es el actual
  }

  ngOnInit() {
    setTimeout(() => {
      this.jwt = true;

    }, 5000);

  }

}

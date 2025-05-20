import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { WebrtcService } from '../services/webrtc.service';
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
      title: "Llamadas privadas con código QR",
      description: "Facilita la comunicación con tus visitantes de manera segura, rápida y directa, sin necesidad de intermediarios.",
      img: "../../assets/splas1.svg",
      view: true
    },
    {
      title: "Adiós a los timbres tradicionales",
      description: "Moderniza la entrada de tu hogar con una solución innovadora que combina tecnología y estilo.",
      img: "../../assets/splas2.svg",
      view: false
    },
    {
      title: "Acceso rápido y seguro",
      description: "Los códigos QR ofrecen una experiencia ágil y confiable, garantizando la seguridad de tu hogar.",
      img: "../../assets/splas3.svg",
      view: false
    },
    {
      title: "Control total desde tu smartphone",
      description: "Responde, visualiza y gestiona a tus visitantes desde cualquier lugar con solo un toque.",
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

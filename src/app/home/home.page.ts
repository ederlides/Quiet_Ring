import { Component, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { WebrtcService } from '../services/webrtc.service';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage {
  private navCtrl = inject(NavController);
  phase: number = 0;
  showButton = false;
  activeIndex: number = -1;

  arraySplas = [
    {
      title: "Llamadas privadas con código QR",
      description: "Facilita la comunicación con tus visitantes de manera segura, rápida y directa, sin necesidad de intermediarios.",
      img: "../../assets/splas1_2.svg",
    },
    {
      title: "Adiós a los timbres tradicionales",
      description: "Moderniza la entrada de tu hogar con una solución innovadora que combina tecnología y estilo.",
      img: "../../assets/splas2_2.svg",
    },
    {
      title: "Acceso rápido y seguro",
      description: "Los códigos QR ofrecen una experiencia ágil y confiable, garantizando la seguridad de tu hogar.",
      img: "../../assets/splas3_2.svg",
    },
    {
      title: "Control total desde tu smartphone",
      description: "Responde, visualiza y gestiona a tus visitantes desde cualquier lugar con solo un toque.",
      img: "../../assets/splas4_2.svg",
    }
  ];

  @ViewChild('swiperEl', { static: false }) swiperRef!: ElementRef;

  constructor(private router: Router) { }

  ngOnInit() {
    this.validLoadData();
    setTimeout(() => {
      this.phase = 1;
      setTimeout(() => {
        this.phase = 2;
        this.activeIndex = 0;
        setTimeout(() => {
          const swiperEl = this.swiperRef.nativeElement;

          const paginationEl = swiperEl.shadowRoot?.querySelector('.swiper-pagination');

          if (paginationEl) {
            Object.assign(paginationEl.style, {
              background: '#FEF6F4',
              padding: '7px 15px',
              width: 'max-content',
              marginLeft: 'auto',
              marginRight: 'auto',
              right: '0',
              borderRadius: '6px',
            });
          }
        }, 0);
      }, 3000);
    }, 3000);
  }

  onSlideChange() {
    const swiper = this.swiperRef.nativeElement.swiper;
    if (swiper) {
      this.activeIndex = swiper.activeIndex;
      this.checkIfLastSlide();
    }
  }

  // onSlideChange(a:any = 0) {
  //   console.log(a);
  //   this.checkIfLastSlide();
  // }

  checkIfLastSlide() {
    const swiper = this.swiperRef.nativeElement.swiper;
    if (swiper) {
      this.showButton = swiper.isEnd;
    }
  }

  slideNext() {
    const swiperEl = document.querySelector('swiper-container') as any;
    swiperEl.swiper.slideNext();
  }

  slidePrev() {
    const swiperEl = document.querySelector('swiper-container') as any;
    swiperEl.swiper.slidePrev();
  }

  validLoadData() {
    if (localStorage.getItem("token") &&
      localStorage.getItem("indicative") &&
      localStorage.getItem("cellPhoneNumber") &&
      localStorage.getItem("room")) {
      this.navCtrl.navigateForward('/menu')
    }
  }

}

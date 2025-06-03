import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-order-qr-code',
  templateUrl: './order-qr-code.component.html',
  styleUrls: ['./order-qr-code.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderQrCodeComponent implements OnInit {
  
  constructor() {}

  ngOnInit() {
  }

  slideNext() {
    const swiperEl = document.querySelector('swiper-container') as any;
    swiperEl.swiper.slideNext();
  }
  
  slidePrev() {
    const swiperEl = document.querySelector('swiper-container') as any;
    swiperEl.swiper.slidePrev();
  }

}

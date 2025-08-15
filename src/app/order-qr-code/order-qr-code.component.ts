import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OtpService } from '../core/services/otp-service/otp.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-order-qr-code',
  templateUrl: './order-qr-code.component.html',
  styleUrls: ['./order-qr-code.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderQrCodeComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  private otpService = inject(OtpService);
  img;
  ngOnInit() {
    this.img = this.route.snapshot.paramMap.get('id');
  }

  slideNext() {
    const swiperEl = document.querySelector('swiper-container') as any;
    swiperEl.swiper.slideNext();
  }

  slidePrev() {
    const swiperEl = document.querySelector('swiper-container') as any;
    swiperEl.swiper.slidePrev();
  }

  getQr() {
    let payload = {
      idProcess: this.generateUUID(),
      qr:this.img,
      template: 1,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };
   const reader = new FileReader();
    this.otpService.getQr(payload).subscribe({
      next: (response) => {
        this.downloadPDF(response.processResponse);
      },
      error: (error) => {
        console.error('Error en verificación Timbres:', error);
        // Aquí manejas el error, muestra alert o mensaje
      }
    });
  }

  downloadPDF(base64: string): void {
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,' + base64;
    link.download = 'resultado.pdf';
    link.click();
  }


  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}

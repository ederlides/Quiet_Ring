import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OtpService } from '../core/services/otp.service';
import { ActivatedRoute } from '@angular/router';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-order-qr-code',
  templateUrl: './order-qr-code.component.html',
  styleUrls: ['./order-qr-code.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderQrCodeComponent implements OnInit {

  private otpService = inject(OtpService);
  img: any;

  constructor(private route: ActivatedRoute) { }

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

  async getQr() {
    const payload = {
      idProcess: this.generateUUID(),
      qr: this.img,
      template: 1,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.getQr(payload).subscribe({
      next: async (response) => {
        await this.downloadPDF(response.processResponse);
      },
      error: (error) => {
        console.error('Error en verificación Timbres:', error);
      }
    });
  }

  async downloadPDF(base64: string): Promise<void> {
    console.log('Inicio downloadPDF');

    const fileName = `resultado_${Date.now()}.pdf`;

    try {
      console.log('Intentando guardar archivo...');
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache // ✅ temporal
      });
      console.log('Archivo guardado:', savedFile);

      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache, // ✅ temporal
        path: fileName,
      });
      console.log('URI del archivo:', uriResult.uri);

      // Abrir el PDF con la app nativa
      await FileOpener.open({
        filePath: uriResult.uri,
        contentType: 'application/pdf'
      });
      console.log('PDF abierto con FileOpener');
      
    } catch (error) {
      console.error('Error al guardar/abrir PDF:', error);
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}

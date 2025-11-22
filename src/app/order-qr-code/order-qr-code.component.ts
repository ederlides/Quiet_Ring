import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OtpService } from '../core/services/otp.service';
import { ActivatedRoute } from '@angular/router';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { Share } from '@capacitor/share'; // 👈 importar Share API
import { QrService } from '../core/services/qr.service';

@Component({
  selector: 'app-order-qr-code',
  templateUrl: './order-qr-code.component.html',
  styleUrls: ['./order-qr-code.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderQrCodeComponent implements OnInit {

  private qrService = inject(QrService);
  img: any;
  private lastSavedPdfUri: string | null = null; // 👈 guardamos el último PDF generado
  activeIndex: number = -1;

  @ViewChild('swiperQrEl', { static: false }) swiperRef!: ElementRef;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.img = this.route.snapshot.paramMap.get('id');
    this.activeIndex = 0;
  }

  onSlideChange() {
    const swiper = this.swiperRef?.nativeElement.swiper;
    if (swiper) {
      this.activeIndex = swiper.activeIndex;
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

  async getQr(activeIndex: number) {
    console.log(activeIndex);
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

    this.qrService.getQr(payload).subscribe({
      next: async (response) => {
        await this.downloadPDF(response.processResponse);
      },
      error: (error) => {
        console.error('Error en verificación Timbres:', error);
      }
    });
  }

  async downloadPDF(base64: string): Promise<void> {

    const fileName = `resultado_${Date.now()}.pdf`;

    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache // ✅ temporal
      });

      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache, // ✅ temporal
        path: fileName,
      });

      this.lastSavedPdfUri = uriResult.uri; // 👈 guardamos el archivo para compartir o imprimir luego

      // Abrir el PDF con la app nativa
      await FileOpener.open({
        filePath: uriResult.uri,
        contentType: 'application/pdf'
      });
      
    } catch (error) {
      console.error('Error al guardar/abrir PDF:', error);
    }
  }

  async sharePDF(activeIndex: number) {
    if (!this.lastSavedPdfUri) {
      console.warn('⚠️ No hay PDF para compartir');
      return;
    }

    try {
      await Share.share({
        title: 'Compartir código QR',
        text: 'Te envío el PDF del código QR.',
        url: this.lastSavedPdfUri,
        dialogTitle: 'Compartir archivo PDF',
      });
    } catch (error) {
      console.error('Error al compartir PDF:', error);
    }
  }

  async printPDF(activeIndex: number) {
    if (!this.lastSavedPdfUri) {
      console.warn('⚠️ No hay PDF para imprimir');
      return;
    }

    try {
      // 🔹 En Android e iOS, abrir el PDF permite imprimirlo nativamente desde el visor.
      await FileOpener.open({
        filePath: this.lastSavedPdfUri,
        contentType: 'application/pdf'
      });
    } catch (error) {
      console.error('Error al imprimir PDF:', error);
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

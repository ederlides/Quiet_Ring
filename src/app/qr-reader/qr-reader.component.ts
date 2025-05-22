import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';

@Component({
  selector: 'app-qr-reader',
  templateUrl: './qr-reader.component.html',
  styleUrls: ['./qr-reader.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QrReaderComponent implements OnInit, OnDestroy {
  isTorchOn = false;
  isScanning = false;
  scanResult: string | null = null;
  backButtonHandler: any;

  constructor(private router: Router, private platform: Platform) {}

  ngOnInit() {
    this.startScan();

    // Suscribirse al botón físico de retroceso
    this.backButtonHandler = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackNavigation();
    });
  }

  ionViewWillEnter() {
    this.isTorchOn = false;
    this.scanResult = null;
    this.startScan();
  }

  ionViewWillLeave() {
    this.stopScan();
  }

  ngOnDestroy() {
    this.stopScan();

    // Eliminar la suscripción del botón físico
    if (this.backButtonHandler) {
      this.backButtonHandler.unsubscribe();
    }
  }

  async startScan() {
    this.isScanning = true;
    document.body.classList.add('barcode-scanner-active');

    const permission = await BarcodeScanner.requestPermissions();
    if (permission.camera !== 'granted') {
      alert('Permiso de cámara denegado');
      this.handleBackNavigation();
      return;
    }

    const listener = await BarcodeScanner.addListener('barcodesScanned', async (result) => {
      if (result.barcodes.length > 0) {
        await listener.remove();
        this.handleScanSuccess(result.barcodes[0].rawValue);
      }
    });

    await BarcodeScanner.startScan();
  }

  async stopScan() {
    this.isScanning = false;
    document.body.classList.remove('barcode-scanner-active');
    await BarcodeScanner.stopScan();
    await BarcodeScanner.removeAllListeners();
  }

  async toggleTorch() {
    this.isTorchOn = !this.isTorchOn;
    if (this.isTorchOn) {
      // await Torch.turnOn();
    } else {
      // await Torch.turnOff();
    }
  }

  handleScanSuccess(result: string) {
    this.scanResult = result;
    this.isScanning = false;
    console.log('QR escaneado con éxito:', result);
    this.handleBackNavigation();
  }

  handleBackNavigation() {
    this.stopScan();
    this.router.navigate(['/activate-qr']);
  }
}

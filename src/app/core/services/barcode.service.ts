// src/app/services/barcode.service.ts
import { Injectable } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';

@Injectable({
  providedIn: 'root',
})
export class BarcodeService {
  async startScan() {
    document.body.classList.add('barcode-scanner-active');

    const listener = await BarcodeScanner.addListener('barcodesScanned', async result => {
      console.log(result.barcodes[0]?.rawValue);
    });

    await BarcodeScanner.startScan();
  }

  async stopScan() {
    document.body.classList.remove('barcode-scanner-active');
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  }


   async scanSingleBarcode(): Promise<string> {
    return new Promise(async (resolve) => {
      document.body.classList.add('barcode-scanner-active');

      const listener = await BarcodeScanner.addListener('barcodesScanned', async result => {
        await listener.remove();
        document.body.classList.remove('barcode-scanner-active');
        await BarcodeScanner.stopScan();
        resolve(result.barcodes[0]?.rawValue);
      });

      await BarcodeScanner.startScan();
    });
  }

async cancelScan() {
  document.body.classList.remove('barcode-scanner-active');
  await BarcodeScanner.removeAllListeners();
  await BarcodeScanner.stopScan();
}

  // Torch controls
  async toggleTorch() {
    await Torch.toggle();
  }

  async isTorchAvailable(): Promise<boolean> {
    const { available } = await Torch.isAvailable();
    return available;
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted';
  }
}
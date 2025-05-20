import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-qr-reader',
  templateUrl: './qr-reader.component.html',
  styleUrls: ['./qr-reader.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QrReaderComponent implements OnInit {
  isTorchOn: boolean = false;
  isScanning: boolean = true;
  scanResult: string | null = null;
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Iniciar el escaneo automáticamente al cargar la vista
    this.startScan();
  }

  ionViewWillEnter() {
    // Reiniciar el estado al entrar en la vista
    this.isScanning = true;
    this.isTorchOn = false;
    this.scanResult = null;
    this.startScan();
  }

  ionViewWillLeave() {
    // Detener el escaneo al salir de la vista
    this.stopScan();
  }

  startScan() {
    this.isScanning = true;
    console.log('Iniciando escaneo de QR');
    
    // Aquí iría la implementación real con un plugin como @capacitor-community/barcode-scanner
    // Para simular un escaneo exitoso después de unos segundos:
    /*
    setTimeout(() => {
      this.handleScanSuccess('QR123456789');
    }, 3000);
    */
  }

  stopScan() {
    this.isScanning = false;
    console.log('Deteniendo escaneo de QR');
    
    // Aquí iría la implementación real para detener el escáner
  }

  handleScanSuccess(result: string) {
    this.scanResult = result;
    this.isScanning = false;
    console.log('QR escaneado con éxito:', result);
    
    // Aquí se manejaría el resultado del escaneo
    // Por ejemplo, navegar a una vista de confirmación o activar el timbre
  }

  toggleTorch() {
    this.isTorchOn = !this.isTorchOn;
    console.log('Linterna:', this.isTorchOn ? 'encendida' : 'apagada');
    
    // Aquí iría la implementación real para controlar la linterna
    // Utilizando un plugin como @capacitor/camera
  }

  goBack() {
    this.router.navigate(['/activate-qr']);
  }
} 
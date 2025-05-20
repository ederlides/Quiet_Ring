import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scan-qr',
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ScanQrComponent implements OnInit {
  scanActive = false;
  isTorchOn = false;
  qrScanned = false;
  scanResult: string = '';
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Iniciar la cámara automáticamente
    this.startScanner();
  }

  ionViewWillEnter() {
    // Reiniciar cuando la vista se carga nuevamente
    this.scanActive = false;
    this.isTorchOn = false;
    this.qrScanned = false;
    this.scanResult = '';
    // Iniciar la cámara
    this.startScanner();
  }

  ionViewWillLeave() {
    // Detener la cámara al salir
    this.stopScanner();
  }

  startScanner() {
    this.scanActive = true;
    // Aquí iría el código para activar la cámara
    // Idealmente utilizaríamos un plugin como @capacitor-community/barcode-scanner
    console.log('Escáner activado');
    
    // Simulación de escaneo (en una aplicación real, esto vendría del plugin)
    // setTimeout(() => {
    //   this.scanComplete('https://quietring.com/activate?code=123456');
    // }, 3000);
  }

  stopScanner() {
    this.scanActive = false;
    if (this.isTorchOn) {
      this.toggleTorch(); // Apagar la linterna si está encendida
    }
    console.log('Escáner desactivado');
  }

  toggleTorch() {
    this.isTorchOn = !this.isTorchOn;
    // Aquí iría el código para encender/apagar la linterna
    // Utilizando algún plugin como @capacitor/camera
    console.log('Linterna: ' + (this.isTorchOn ? 'Encendida' : 'Apagada'));
  }

  scanComplete(result: string) {
    this.scanResult = result;
    this.qrScanned = true;
    this.scanActive = false;
    
    // Aquí procesaríamos el resultado del escaneo
    console.log('QR escaneado:', result);
    
    // Navegar a otra vista o mostrar un modal con el resultado
    // this.router.navigate(['/confirmation'], { queryParams: { result } });
  }

  goBack() {
    this.router.navigate(['/activate-qr']);
  }
} 
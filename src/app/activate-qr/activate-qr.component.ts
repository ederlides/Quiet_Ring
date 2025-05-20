import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activate-qr',
  templateUrl: './activate-qr.component.html',
  styleUrls: ['./activate-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ActivateQrComponent implements OnInit {
  activationCode: string = '';
  showQrScanner: boolean = false;
  isTorchOn: boolean = false;
  isScanning: boolean = false;
  scanResult: string | null = null;
  
  // Variables para la vista de entrada de código
  showCodeInput: boolean = false;
  codeDigits: string[] = ['', '', '', '', '', ''];
  
  constructor(private router: Router) {}

  ngOnInit() {}
  
  // Método para ir a la vista de escaneo QR
  goToQrScanner() {
    console.log('Navegando a la vista de escaneo QR...');
    this.router.navigate(['/qr-reader']);
  }
  
  // Método para mostrar la vista de entrada de código
  goToCodeInput() {
    console.log('Mostrando vista de entrada de código...');
    this.showCodeInput = true;
  }
  
  // Método para volver a la vista principal desde la entrada de código
  goBackFromCodeInput() {
    this.showCodeInput = false;
  }
  
  // Método para combinar los dígitos en un solo código
  getFullCode(): string {
    return this.codeDigits.join('');
  }
  
  // Método para validar y enviar el código
  submitCode() {
    const fullCode = this.getFullCode();
    if (fullCode.length === 6) {
      console.log('Código enviado:', fullCode);
      // Aquí iría la lógica para validar el código con el backend
      this.showCodeInput = false; // Volvemos a la vista principal
    } else {
      // Mostrar mensaje de error (código incompleto)
      console.log('El código debe tener 6 dígitos');
    }
  }
  
  // Método para volver a la vista principal
  goBackFromScanner() {
    this.stopScan();
    this.showQrScanner = false;
  }
  
  // Método para iniciar el escaneo
  startScan() {
    this.isScanning = true;
    console.log('Iniciando escaneo de QR...');
  }
  
  // Método para detener el escaneo
  stopScan() {
    this.isScanning = false;
    console.log('Deteniendo escaneo de QR...');
  }
  
  // Método para manejar un escaneo exitoso
  handleScanSuccess(result: string) {
    this.scanResult = result;
    this.isScanning = false;
    console.log('QR escaneado con éxito:', result);
  }
  
  // Método para encender/apagar la linterna
  toggleTorch() {
    this.isTorchOn = !this.isTorchOn;
    console.log('Linterna:', this.isTorchOn ? 'encendida' : 'apagada');
  }
  
  // Método para manejar la activación manual por código
  activateByCode() {
    if (this.activationCode.trim() === '') {
      // Mostrar alerta o mensaje de error
      return;
    }
    
    // Lógica para verificar el código de activación
    console.log('Activando con código:', this.activationCode);
    // Aquí iría el código para activar mediante el código ingresado
  }
  
  // Método para volver a la pantalla anterior
  goBack() {
    this.router.navigate(['/login']);
  }
} 
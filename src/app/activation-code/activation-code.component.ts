import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activation-code',
  templateUrl: './activation-code.component.html',
  styleUrls: ['./activation-code.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ActivationCodeComponent implements OnInit {
  codeDigits: string[] = ['', '', '', '', '', ''];
  
  constructor(private router: Router) {}

  ngOnInit() {}
  
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
      // Por ahora, solo volvemos a la pantalla anterior
      this.router.navigate(['/activate-qr']);
    } else {
      // Mostrar mensaje de error (código incompleto)
      console.log('El código debe tener 6 dígitos');
    }
  }
  
  // Método para volver atrás
  goBack() {
    this.router.navigate(['/activate-qr']);
  }
} 
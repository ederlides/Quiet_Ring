import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonContent, IonicModule, IonItem, IonLabel, IonList, IonModal, NavController, IonInput } from '@ionic/angular';
import { TypeaheadComponent } from '../typeahead/typeahead.component';
import { ApiService } from '../service/api.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, TypeaheadComponent, NgIf, FormsModule]
})
export class LoginComponent implements OnInit {
  viewLogin=false;
  viewOtp=false;

  constructor(private navCtrl: NavController,public apiService: ApiService) { }
  @ViewChild('modal', { static: true }) modal!: IonModal;

  selectedFruitsText = '';
  selectedFruits: string[] = [];
  mobile: string = '';
  
  // OTP properties
  otpValues: string[] = ['', '', '', '', '', ''];
  @ViewChild('otp1', { static: false }) otp1!: IonInput;
  @ViewChild('otp2', { static: false }) otp2!: IonInput;
  @ViewChild('otp3', { static: false }) otp3!: IonInput;
  @ViewChild('otp4', { static: false }) otp4!: IonInput;
  @ViewChild('otp5', { static: false }) otp5!: IonInput;
  @ViewChild('otp6', { static: false }) otp6!: IonInput;

  fruits: any[] = [
    { text: 'Colombia', value: '+57' },
    { text: 'Perú', value: '+58' },

  ];
  
  ngOnInit() {
    
  }

  condition(){
    this.viewLogin=true;
    this.fruitSelectionChanged(['+57']);
  }

  callOtp() {
    console.log('🔍 Valor de mobile:', this.mobile);
    console.log('🔍 Tipo de mobile:', typeof this.mobile);
    
    // Validar que se haya ingresado un número
    if (!this.mobile || this.mobile.trim() === '') {
      console.error('❌ Número de teléfono requerido');
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    this.viewOtp=true;
    this.viewLogin=false;
    
    // Obtener código de país (sin el +)
    const countryCode = this.selectedFruits.length > 0 ? this.selectedFruits[0].replace('+', '') : '57';
    
    let request = {
      "idProcess": "pruebasIdProcess",
      "cellPhoneNumber": this.mobile,
      "indicative": `+${countryCode}`,
      "deviceInfo": {
        "ip": "10.10.10.2",
        "mobile": "Nokia1100",
        "mac": "00:11:22:33:44:55"
      }
    }
    
    console.log('📱 Enviando solicitud OTP (nuevo formato):', request);
    this.apiService.getOtp(this, request, this.handlerSuccessGetOtp, this.handlerError)
  }


  onOtpInput(event: any, position: number) {
    const value = event.target.value;
    
    // Solo permitir números
    if (!/^\d*$/.test(value)) {
      event.target.value = '';
      return;
    }
    
    // Actualizar el valor en el array
    this.otpValues[position - 1] = value;
    
    // Si se ingresó un dígito, mover al siguiente campo
    if (value.length === 1 && position < 6) {
      this.focusNextInput(position + 1);
    }
    
    // Si se borró un dígito, mover al campo anterior
    if (value.length === 0 && position > 1) {
      this.focusPreviousInput(position - 1);
    }
    
    // Verificar si se completó el OTP
    if (this.isOtpComplete()) {
      this.validateOtp();
    }
  }
  
  focusNextInput(nextPosition: number) {
    setTimeout(() => {
      switch (nextPosition) {
        case 2: this.otp2.setFocus(); break;
        case 3: this.otp3.setFocus(); break;
        case 4: this.otp4.setFocus(); break;
        case 5: this.otp5.setFocus(); break;
        case 6: this.otp6.setFocus(); break;
      }
    }, 50);
  }
  
  focusPreviousInput(prevPosition: number) {
    setTimeout(() => {
      switch (prevPosition) {
        case 1: this.otp1.setFocus(); break;
        case 2: this.otp2.setFocus(); break;
        case 3: this.otp3.setFocus(); break;
        case 4: this.otp4.setFocus(); break;
        case 5: this.otp5.setFocus(); break;
      }
    }, 50);
  }
  
  isOtpComplete(): boolean {
    return this.otpValues.every(value => value !== '');
  }
  
  validateOtp() {
    const otpCode = this.otpValues.join('');
    console.log('🔐 OTP completo:', otpCode);
    
    // Llamar al método de validación
    this.callValidOtp(otpCode);
  }















//************************************************************************************************************* */


  /**
   * Formats the display text based on the selected fruits.
   * @param data - Array of selected fruit values
   * @returns A formatted string for display
   */
  private formatData(data: string[]): string {
    if (data.length === 1) {
      const fruit = this.fruits.find((fruit) => fruit.value === data[0]);
      return fruit ? fruit.text : '';
    }
    return `${data.length} items`;
  }

  /**
   * Handles fruit selection changes and updates the selected fruits and text.
   * @param fruits - Array of selected fruit values
   */
  fruitSelectionChanged(fruits: string[]) {
    this.selectedFruits = fruits;
    this.selectedFruitsText = this.formatData(this.selectedFruits);
    this.modal.dismiss();
  }

  navigateToNextPage() {
    this.navCtrl.navigateForward('/menu'); // Cambia 'next-page' por la ruta de tu nueva página
  }

  openRegister() {
    this.navCtrl.navigateForward('/menu'); // Cambia 'next-page' por la ruta de tu nueva página
  }


  handlerSuccessGetOtp(_this, data) {
    if (data.status == 200) {
      console.log(data.processResponse)
      _this.callValidOtp(data.processResponse);
    }
  }

  handlerError(_this, result) {
    if (result.status != 200) {

    }
  }

  callValidOtp(otp){
    // Obtener código de país (sin el +)
    const countryCode = this.selectedFruits.length > 0 ? this.selectedFruits[0].replace('+', '') : '57';
    
    let request = {
      "idProcess": "pruebasIdProcess",
      "cellPhoneNumber": this.mobile,
      "indicative": `+${countryCode}`,
      "otp": otp,
      "deviceInfo": {
        "ip": "10.10.10.2",
        "mobile": "Nokia1100",
        "mac": "00:11:22:33:44:55"
      }
    }
    
    console.log('📱 Enviando validación OTP (nuevo formato):', request);
    this.apiService.validOtp(this, request,this.handlerSuccessValidOtp, this.handlerError )
  }

  handlerSuccessValidOtp(_this, data){
    if (data.status == 200) {
      console.log('✅ OTP validado exitosamente:', data.processResponse);
      // Navegar al menú cuando la validación sea exitosa
      _this.navCtrl.navigateForward('/menu');
    }
  }


}

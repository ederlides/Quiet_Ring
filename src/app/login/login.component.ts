import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { IonContent, IonItem, IonLabel, IonList, IonModal, NavController, IonSelect, IonicModule } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from '../typeahead/typeahead.component';

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TypeaheadComponent]
})
export class LoginComponent implements OnInit {
  viewLogin = false;
  viewOtp = false;

  inputs = Array(5);
  
  selectedCountry: Country | null = null;
  countryName: string = '';
  dialCode: string = '';
  phoneNumber: string = '';

  @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;
  
  constructor(
    private navCtrl: NavController,
    public apiService: ApiService,
    private router: Router
  ) { }
  
  @ViewChild('modal', { static: true }) modal!: IonModal;

  selectedFruitsText = '';
  selectedFruits: string[] = [];
  mobile: string = '';

  fruits: any[] = [
    { text: 'Colombia', value: '+57' },
    { text: 'Perú', value: '+58' },
  ];
  
  ngOnInit() {
    console.log('Inicializando componente login');
    
    // Verificar el estado de login
    const loginState = localStorage.getItem('loginState');
    if (loginState === 'phoneInput') {
      // Si venimos de seleccionar un país, mostrar la vista de ingreso de teléfono
      this.viewLogin = true;
    }
    
    // Verificar si hay un país seleccionado en localStorage
    const savedCountry = localStorage.getItem('selectedCountry');
    console.log('País guardado:', savedCountry);
    
    if (savedCountry) {
      try {
        this.selectedCountry = JSON.parse(savedCountry);
        if (this.selectedCountry) {
          console.log('País seleccionado:', this.selectedCountry);
          // Actualizar el nombre del país y el indicativo
          this.countryName = this.selectedCountry.name;
          this.dialCode = this.selectedCountry.dialCode;
          console.log('Indicativo establecido:', this.dialCode);
        }
      } catch (error) {
        console.error('Error al parsear el país seleccionado:', error);
        localStorage.removeItem('selectedCountry');
      }
    }
  }

  ionViewDidEnter() {
    console.log('Vista de login activada');
    
    // Verificar el estado de login
    const loginState = localStorage.getItem('loginState');
    if (loginState === 'phoneInput') {
      // Si venimos de seleccionar un país, mostrar la vista de ingreso de teléfono
      this.viewLogin = true;
    }
    
    // Verificar nuevamente por si se actualizó el país
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      try {
        this.selectedCountry = JSON.parse(savedCountry);
        if (this.selectedCountry) {
          this.countryName = this.selectedCountry.name;
          this.dialCode = this.selectedCountry.dialCode;
          console.log('Indicativo actualizado:', this.dialCode);
        }
      } catch (error) {
        console.error('Error al parsear el país seleccionado:', error);
      }
    }
  }

  goToCountrySelector() {
    console.log('Navegando a la selección de países');
    this.router.navigate(['/country-selector']);
  }

  condition() {
    this.viewLogin = true;
    localStorage.setItem('loginState', 'phoneInput');
  }

  callOtp() {
    if (!this.phoneNumber) {
      console.log('Por favor ingrese un número de teléfono');
      return;
    }
    
    this.viewOtp = true;
    this.viewLogin = false;
    // Limpiar el estado de login ya que pasamos a la siguiente fase
    localStorage.removeItem('loginState');
    
    // Importante: No concatenamos el indicativo con el número de teléfono
    // Solo usamos el número de teléfono ingresado por el usuario
    this.mobile = this.phoneNumber;
    
    let request = {
      "idProcess": "pruebasIdProcess",
      "device": "Nokia1100",
      "ip": "10.10.10.2",
      "mobile": this.mobile,
      "dialCode": this.dialCode // Enviamos el indicativo como un campo separado
    }
    this.apiService.getOtp(this, request, this.handlerSuccessGetOtp, this.handlerError);
  }

  // onInputChange(event: any) {
  //   this.navCtrl.navigateForward('/menu');
  // }
    onInputChange(event: any, index: number) {
    const value = event.target.value;
    if (value && index < this.otpInputs.length - 1) {
      const inputsArray = this.otpInputs.toArray();
      inputsArray[index + 1].setFocus(); // Mueve al siguiente input
    }
  }

  private formatData(data: string[]): string {
    if (data.length === 1) {
      const fruit = this.fruits.find((fruit) => fruit.value === data[0]);
      return fruit ? fruit.text : '';
    }
    return `${data.length} items`;
  }

  fruitSelectionChanged(fruits: string[]) {
    this.selectedFruits = fruits;
    this.selectedFruitsText = this.formatData(this.selectedFruits);
    this.modal.dismiss();
  }

  navigateToNextPage() {
    this.navCtrl.navigateForward('/menu');
  }

  openRegister() {
    this.navCtrl.navigateForward('/menu');
  }

  handlerSuccessGetOtp(_this, data) {
    if (data.status == 200) {
      console.log(data.processResponse)
      _this.callValidOtp(data.processResponse);
    }
  }

  handlerError(_this, result) {
    if (result.status != 200) {
      // Manejar error
    }
  }

  callValidOtp(otp) {
    let request = {
      "idProcess": "pruebasIdProcess",
      "device": "Nokia1100",
      "ip": "10.10.10.2",
      "otp": otp
    }
    this.apiService.validOtp(this, request, this.handlerSuccessValidOtp, this.handlerError);
  }

  handlerSuccessValidOtp(_this, data) {
    if (data.status == 200) {
      console.log(data.processResponse);
    }
  }
}

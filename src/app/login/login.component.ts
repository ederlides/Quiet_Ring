import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { IonInput, IonModal, NavController, IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CountrySelectorComponent } from '../country-selector/country-selector.component';
import { OtpRequest, OtpService } from '../core/services/otp.service';
import { ICountry } from '../core/interfaces/interface-country';

import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  private builder = inject(UntypedFormBuilder);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private otpService = inject(OtpService);

  form: UntypedFormGroup;

  viewLogin = false;
  viewOtp = false;

  inputs = Array(6);
  
  selectedCountry: ICountry ;
  mobile: string = '';

  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;
    // Variables para control del temporizador
  tiempo: string = '';
  private tiempoRestante: number = 0;
  private temporizador: any;
  puedeReenviar: boolean = true;

  constructor(
    // private navCtrl: NavController,
    // private router: Router,
    // private modalCtrl: ModalController,
    // private otpService: OtpService,
  ) { }
  
  ngOnInit() {
    this.createFormCro()
    const loginState = localStorage.getItem('loginState');
    if (loginState === 'phoneInput') {
      this.viewLogin = true;
    }
    
    const savedCountry = localStorage.getItem('selectedCountry');
    
    if (savedCountry) {
      try {
        this.selectedCountry = JSON.parse(savedCountry);
        if (this.selectedCountry) {
          // this.countryName = this.selectedCountry.name;
          this.form.get('dialCode')?.setValue(this.selectedCountry.dialCode);
        }
      } catch (error) {
        localStorage.removeItem('selectedCountry');
      }
    }
  }

  createFormCro(): void {
    this.form = this.builder.group({
        dialCode: [null],
        cellPhoneNumber: [null, Validators.required],
    });
  }

  ionViewDidEnter() {
    const loginState = localStorage.getItem('loginState');
    if (loginState === 'phoneInput') {
      this.viewLogin = true;
    }
    
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      try {
        this.selectedCountry = JSON.parse(savedCountry);
        if (this.selectedCountry) {
          // this.countryName = this.selectedCountry.name;
          this.form.get('dialCode')?.setValue(this.selectedCountry.dialCode);
        }
      } catch (error) {
      }
    }
  }

  goToCountrySelector() {
    this.router.navigate(['/country-selector']);
  }

  async openModalBack(item?: any) {
    const modal = await this.modalCtrl.create({
      component: ModalConfirmDeleteComponent,
      componentProps: {
        title: 'Regresar',
        message: `¿Esta seguro que quiere volver?"`
      },
      cssClass: 'modal-confirm-delete',
      showBackdrop: true,
      // backdropDismiss: false,
      // mode: 'ios'
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm') {
      this.condition();
    }
  }

  condition() {
    this.viewLogin = true;
    this.viewOtp = false;
    localStorage.setItem('loginState', 'phoneInput');
  }

  callOtp() {
    const cellPhoneNumber = this.form.get('cellPhoneNumber')?.value.toString()
    const dialCode = this.form.get('dialCode')?.getRawValue();

    if (dialCode == undefined || dialCode == null || dialCode == '') {
      alert('debe seleccionar un país')
    } else if (cellPhoneNumber && cellPhoneNumber.length >= 5) {
      this.viewOtp = true;
      this.viewLogin = false;
      localStorage.removeItem('loginState');
      
      this.mobile = `${dialCode} ${cellPhoneNumber}`;
      this.sendOtp()
    } else {
      alert('Debe ingresar un numero valido')
    }
  }

  // onInputChange(event: any) {
  //   this.navCtrl.navigateForward('/menu');
  // }
  // onInputChange(event: any, index: number) {
  //   const value = event.target.value;
  //   if (value && index < this.otpInputs.length - 1) {
  //     const inputsArray = this.otpInputs.toArray();
  //     inputsArray[index + 1].setFocus(); // Mueve al siguiente input
  //   }
  //   if (index == this.otpInputs.length - 1) {
  //     const otpCode = this.otpInputs.toArray().map(input => input.value ? input.value.toString() : '').join('');
  //     this.verifyOtp(otpCode);
  //   }
  // }

onInputChange(event: any, index: number) {
    const value = event.target.value;

    if (value && index < this.otpInputs.length - 1) {
      const inputsArray = this.otpInputs.toArray();
      inputsArray[index + 1].setFocus();
    }

    if (this.isAllFilled()) {
      const otpCode = this.otpInputs.toArray()
        .map(input => input.value ? input.value.toString() : '')
        .join('');
      this.verifyOtp(otpCode);
    }
  }

  async onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key !== 'Backspace') return;

    const inputsArray = this.otpInputs.toArray();
    const currentInput = inputsArray[index];
    const currentEl = await currentInput.getInputElement();

    if (currentEl.value === '') {
      if (index > 0) {
        const prevInput = inputsArray[index - 1];
        const prevEl = await prevInput.getInputElement();

        prevEl.value = '';
        prevInput.value = '';
        prevInput.setFocus();
      }
    } else {
      currentEl.value = '';
      currentInput.value = '';
    }

    event.preventDefault();
  }

  private isAllFilled(): boolean {
    return this.otpInputs.toArray().every(input => input.value && input.value.toString().trim() !== '');
  }

  async openCountryModal() {
    const modal = await this.modalCtrl.create({
      component: CountrySelectorComponent,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.country) {
      this.selectedCountry = data.country;
    }
    this.form.get('dialCode')?.setValue(this.selectedCountry?.dialCode || '')
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  otpCode?: string;
  idProcess: string = '123e4567-e89b-12d3-a456-426655440000';

  sendOtp() {
    if (!this.puedeReenviar) return;

    const payload: OtpRequest = {
      idProcess: this.generateUUID(),
      cellPhoneNumber: this.form.get('cellPhoneNumber')?.value,
      indicative: this.selectedCountry?.dialCode,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.getOtp(payload).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.otpInputs.first.setFocus();
        }, 300);
        this.iniciarTemporizador(60); // 60 segundos
        console.log('OTP verificado:', response);
      },
      error: (error) => {
        console.log("Error en verificación OTP:", JSON.stringify(error));
      }
    });
  }

  iniciarTemporizador(segundos: number) {
    this.puedeReenviar = false;
    this.tiempoRestante = segundos;
    this.actualizarTiempo();

    this.temporizador = setInterval(() => {
      this.tiempoRestante--;
      this.actualizarTiempo();

      if (this.tiempoRestante <= 0) {
        clearInterval(this.temporizador);
        this.tiempo = '';
        this.puedeReenviar = true;
      }
    }, 1000);
  }

  actualizarTiempo() {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    this.tiempo = `${this.formatoDosDigitos(minutos)}:${this.formatoDosDigitos(segundos)}`;
  }

  formatoDosDigitos(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  verifyOtp(otpCode: string) {
    const payload: OtpRequest = {
      idProcess: this.generateUUID(),
      cellPhoneNumber: this.form.get('cellPhoneNumber')?.value,
      indicative: this.selectedCountry?.dialCode,
      otp: otpCode,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.verifyOtp(payload).subscribe({
      next: (response) => {
        localStorage.setItem("token",response.processResponse.token)
        localStorage.setItem("indicative",response.processResponse.indicative)
        localStorage.setItem("cellPhoneNumber",response.processResponse.cellPhoneNumber)
        localStorage.setItem("room",response.processResponse.room)
         this.router.navigateByUrl('/menu', { replaceUrl: true });
      },
      error: (error) => {
        console.error('Error en verificación OTP:', error);
        alert('Error, intente nuevamente')
      }
    });
  }
}

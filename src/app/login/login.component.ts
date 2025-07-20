import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { IonInput, ModalController } from '@ionic/angular';
import { IonModal, NavController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CountrySelectorComponent } from '../country-selector/country-selector.component';
import { OtpRequest, OtpService } from '../core/services/otp-service/otp.service';
import { ICountry } from '../core/interfaces/country';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  private builder = inject(UntypedFormBuilder);
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private otpService = inject(OtpService);

  form: UntypedFormGroup;

  viewLogin = false;
  viewOtp = false;

  inputs = Array(6);
  
  selectedCountry: ICountry ;
  // countryName: string = '';
  // dialCode: string = '';
  // cellPhoneNumber: string = '';

  mobile: string = '';

  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;
  
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

  condition() {
    this.viewLogin = true;
    localStorage.setItem('loginState', 'phoneInput');
  }

  callOtp() {
    const cellPhoneNumber = this.form.get('cellPhoneNumber')?.value.toString()

    if (cellPhoneNumber && cellPhoneNumber.length >= 6) {
      this.viewOtp = true;
      this.viewLogin = false;
      // Limpiar el estado de login ya que pasamos a la siguiente fase
      localStorage.removeItem('loginState');
      
      // this.mobile = this.cellPhoneNumber;
      
      // let request = {
      //   "idProcess": "pruebasIdProcess",
      //   "device": "Nokia1100",
      //   "ip": "10.10.10.2",
      //   "mobile": this.mobile,
      //   "dialCode": this.dialCode // Enviamos el indicativo como un campo separado
      // }
      this.sendOtp()
    } else {
      alert('Debe ingresar un numero valido')
    }
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
    if (index == this.otpInputs.length - 1) {
      const otpCode = this.otpInputs.toArray().map(input => input.value ? input.value.toString() : '').join('');
      this.verifyOtp(otpCode);
    }
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
        console.log('OTP verificado:', response);
        // Aquí manejas la respuesta exitosa
      },
      error: (error) => {
        console.error('Error en verificación OTP:', error);
        // Aquí manejas el error, muestra alert o mensaje
      }
    });
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
         this.navCtrl.navigateForward('/menu');
        // Aquí manejas la respuesta exitosa
      },
      error: (error) => {
        console.error('Error en verificación OTP:', error);
        // Aquí manejas el error, muestra alert o mensaje
      }
    });
  }
}

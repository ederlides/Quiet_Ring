import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CountrySelectorComponent } from '../country-selector/country-selector.component';

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RegisterComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  country: string = '';
  dialCode: string = '';
  phoneNumber: string = '';
  selectedCountry: Country | null = null;

  constructor(
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Verificar si hay un país seleccionado en localStorage
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      try {
        this.selectedCountry = JSON.parse(savedCountry);
        if (this.selectedCountry) {
          this.country = this.selectedCountry.name;
          this.dialCode = this.selectedCountry.dialCode;
        }
      } catch (error) {
        console.error('Error al parsear el país seleccionado:', error);
        localStorage.removeItem('selectedCountry');
      }
    }
  }

  async openCountrySelector() {
    // Usar un enfoque basado en modal
    try {
      const modal = await this.modalController.create({
        component: CountrySelectorComponent,
        componentProps: {
          selectedCountry: this.selectedCountry
        }
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        this.selectedCountry = data;
        this.country = data.name;
        this.dialCode = data.dialCode;
        localStorage.setItem('selectedCountry', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error al abrir el selector de países:', error);
      // Como alternativa, usa la navegación tradicional
      this.router.navigate(['/country-selector']);
    }
  }

  // Mantener el método original como respaldo
  goToCountrySelector() {
    this.router.navigate(['/country-selector']);
  }

  onSubmit() {
    // Validar datos mínimos
    if (this.firstName && this.lastName && this.email && this.password && this.country && this.phoneNumber) {
      const formData = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        country: this.country,
        mobileNumber: this.dialCode + this.phoneNumber
      };
      console.log('Form data:', formData);
    } else {
      console.log('Por favor completa todos los campos.');
    }
  }
}

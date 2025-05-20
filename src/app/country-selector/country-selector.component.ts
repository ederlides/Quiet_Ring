import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { allCountries } from 'country-telephone-data';

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CountrySelectorComponent implements OnInit {
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  searchTerm: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('Inicializando componente de selección de países');
    
    // Transformar los datos del paquete country-telephone-data
    this.countries = allCountries.map(c => ({
      name: c.name,
      code: c.iso2,
      flag: `https://flagcdn.com/w40/${c.iso2.toLowerCase()}.png`,
      dialCode: `+${c.dialCode}`
    }));
    
    // Ordenar alfabéticamente por nombre
    this.countries.sort((a, b) => a.name.localeCompare(b.name));
    
    this.filteredCountries = [...this.countries];
    console.log(`Se cargaron ${this.countries.length} países`);
  }

  filterCountries() {
    console.log('Filtrando países con término:', this.searchTerm);
    
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Si la búsqueda está vacía, mostrar todos los países
      this.filteredCountries = [...this.countries];
      return;
    }
    
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    this.filteredCountries = this.countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm) || 
      country.dialCode.toLowerCase().includes(searchTerm)
    );
    
    console.log('Países filtrados:', this.filteredCountries.length);
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredCountries = [...this.countries];
  }

  selectCountry(country: Country) {
    console.log('País seleccionado:', country);
    localStorage.setItem('selectedCountry', JSON.stringify(country));
    localStorage.setItem('loginState', 'phoneInput');
    this.router.navigate(['/login']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

// Interfaz para el tipo de objeto de llamada
interface Call {
  name: string;
  call: string;
  date: string;
  src: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class MenuComponent implements OnInit {
  // Control de la vista de llamada
  showCallView: boolean = false;
  selectedCall: Call | null = null;

  items = [
    { id:1, name: 'Home', active: true },
    { id:2, name: 'Dog', active: true },
    { id:3, name: 'Passport', active: false },
    { id:4, name: 'Mami Beach Apartment', active: true },
    { id:5, name: 'Alameda del Rio', active: false }
  ];

  options = [
    { id:1, name:'Descargar Código QR',src:'../../assets/icon/qr.svg'},
    { id:2, name:'Agregar Miembro',src:'../../assets/icon/person.svg'},
    { id:3, name:'Verificar Miembro',src:'../../assets/icon/person-check.svg'},
    { id:4, name:'Editar Nombre de Timbre',src:'../../assets/icon/note-pack.svg'},
    { id:5, name:'Eliminar Timbre',src:'../../assets/icon/trash.svg'},
    { id:6, name:'Editar Miembro',src:'../../assets/icon/person-edit.svg'},
  ]

  calls: Call[] = [
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Juan Pérez',call:'Missed',date:'2/12/2024',src:'../../assets/avatar.svg'},
    { name:'María López',call:'Answered',date:'1/12/2024',src:'../../assets/avatar.svg'},
    { name:'Carlos Gómez',call:'Missed',date:'30/11/2024',src:'../../assets/avatar.svg'},
    { name:'Ana Martínez',call:'Answered',date:'29/11/2024',src:'../../assets/avatar.svg'},
    { name:'Pablo Torres',call:'Missed',date:'28/11/2024',src:'../../assets/avatar.svg'},
    { name:'Laura Silva',call:'Answered',date:'27/11/2024',src:'../../assets/avatar.svg'},
    { name:'Roberto Díaz',call:'Missed',date:'26/11/2024',src:'../../assets/avatar.svg'},
    { name:'Sofía Castro',call:'Answered',date:'25/11/2024',src:'../../assets/avatar.svg'},
    { name:'Miguel Ríos',call:'Missed',date:'24/11/2024',src:'../../assets/avatar.svg'},
    { name:'Elena Vargas',call:'Answered',date:'23/11/2024',src:'../../assets/avatar.svg'},
    { name:'Diego Mendoza',call:'Missed',date:'22/11/2024',src:'../../assets/avatar.svg'},
    { name:'Carla Ortiz',call:'Answered',date:'21/11/2024',src:'../../assets/avatar.svg'},
    { name:'Fernando Ruiz',call:'Missed',date:'20/11/2024',src:'../../assets/avatar.svg'},
  ]

  order =[
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/qr1.svg'},
    {name:'Quiet Ring Tag',price:'$7,99 Usd', src:'../../assets/qr2.svg'},
    {name:'Quiet Ring Sticker',price:'$4,99 Usd', src:'../../assets/qr3.svg'}
  ]

  constructor(private router: Router) { }

  ngOnInit() { }

  // Método para navegar a la vista de Activar QR
  goToActivateQR() {
    this.router.navigate(['/activate-qr']);
  }

  // Método para mostrar la pantalla de llamada con el contacto seleccionado
  showCall(call: Call) {
    console.log('Iniciando llamada con:', call.name);
    this.selectedCall = call;
    this.showCallView = true;
  }

  // Método para ocultar la pantalla de llamada y volver a la lista
  hideCall() {
    this.showCallView = false;
    this.selectedCall = null;
  }
}

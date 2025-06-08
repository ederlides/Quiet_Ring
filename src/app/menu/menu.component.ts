import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalAddMembersComponent } from '../modals/modal-add-members/modal-add-members.component';
import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';
import { ModalEditComponent } from '../modals/modal-edit/modal-edit.component';
import { VerifyMembersComponent } from '../verify-members/verify-members.component';
import { ToggleCustomEvent  } from '@ionic/angular';

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
    { id:5, name: 'Alameda del Rio', active: false },
  ];

  options = [
    { id:1, name:'Descargar Código QR',src:'assets/icon/qr.svg', dir: '/order-qr-code'},
    { id:2, name:'Agregar Miembro',src:'assets/icon/person.svg', dir: ''},
    { id:3, name:'Verificar Miembro',src:'assets/icon/person-check.svg', dir: ''},
    { id:4, name:'Editar Nombre de Timbre',src:'assets/icon/note-pack.svg', dir: ''},
    { id:5, name:'Eliminar Timbre',src:'assets/icon/trash.svg', dir: ''},
    { id:6, name:'Editar Miembro',src:'assets/icon/person-edit.svg', dir: ''},
  ]

  calls: Call[] = [
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'assets/avatar.svg'},
    { name:'Juan Pérez',call:'Missed',date:'2/12/2024',src:'assets/avatar.svg'},
    { name:'María López',call:'Answered',date:'1/12/2024',src:'assets/avatar.svg'},
    { name:'Carlos Gómez',call:'Missed',date:'30/11/2024',src:'assets/avatar.svg'},
    { name:'Ana Martínez',call:'Answered',date:'29/11/2024',src:'assets/avatar.svg'},
    { name:'Pablo Torres',call:'Missed',date:'28/11/2024',src:'assets/avatar.svg'},
    { name:'Laura Silva',call:'Answered',date:'27/11/2024',src:'assets/avatar.svg'},
    { name:'Roberto Díaz',call:'Missed',date:'26/11/2024',src:'assets/avatar.svg'},
    { name:'Sofía Castro',call:'Answered',date:'25/11/2024',src:'assets/avatar.svg'},
    { name:'Miguel Ríos',call:'Missed',date:'24/11/2024',src:'assets/avatar.svg'},
    { name:'Elena Vargas',call:'Answered',date:'23/11/2024',src:'assets/avatar.svg'},
    { name:'Diego Mendoza',call:'Missed',date:'22/11/2024',src:'assets/avatar.svg'},
    { name:'Carla Ortiz',call:'Answered',date:'21/11/2024',src:'assets/avatar.svg'},
    { name:'Fernando Ruiz',call:'Missed',date:'20/11/2024',src:'assets/avatar.svg'},
  ]

  order =[
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'assets/qr1.svg'},
    {name:'Quiet Ring Tag',price:'$7,99 Usd', src:'assets/qr2.svg'},
    {name:'Quiet Ring Sticker',price:'$4,99 Usd', src:'assets/qr3.svg'}
  ]

  constructor(private router: Router, private modalCtrl: ModalController) {}
viewportWidth: any;
viewportHeight: any;
screenWidth: any;
screenHeight: any;
devicePixelRatio: any;
realWidth: any;
realHeight: any;
  ngOnInit() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
  
    this.screenWidth = window.screen.width;
    this.screenHeight = window.screen.height;
  
    this.devicePixelRatio = window.devicePixelRatio;
  
    this.realWidth = this.screenWidth * devicePixelRatio;
    this.realHeight = this.screenHeight * devicePixelRatio;
  
  }

  // Método para navegar a la vista de Activar QR
  goToActivateQR() {
    this.router.navigate(['/activate-qr']);
  }

  // Método para navegar a la vista de Activar QR
  goToJoinAsAMember() {
    this.router.navigate(['/join-as-a-member']);
  }
  
  // Método para navegar a la vista de Activar agregar timbre
  goToCreateDoorbell() {
    this.router.navigate(['/create-doorbell']);
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

  actions(idx: number, item: any): void {
    switch (idx) {
      case 0: // Descargar Código QR
        this.router.navigate(['/order-qr-code']);
      break;
      case 1: // Agregar Miembro
        this.openModalAddMembers(item);
      break;
      case 2: // Verificar Miembro
        // this.router.navigate(['/verify-members']);
        this.openModalMembersVerify(item)
      break;
      case 3: // Editar Nombre de Timbre
        this.openModalEdit(item)
      break;
      case 4: // Eliminar Timbre
        this.openModalDelete(item)
      break;
      case 5: // Editar Miembro
        this.router.navigate(['/edit-members']);
      break;
    }

  }

  async openModalAddMembers(item?: any) {
    const modal = await this.modalCtrl.create({
      component: ModalAddMembersComponent,
      componentProps: {
        title: '',
        message: ``
      },
      cssClass: 'modal-add-members',
      showBackdrop: true,
      // backdropDismiss: false,
      // mode: 'ios'
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm') {
    }
  }

  async openModalDelete(item?: any) {
    const modal = await this.modalCtrl.create({
      component: ModalConfirmDeleteComponent,
      componentProps: {
        title: 'Eliminar timbre',
        message: `¿Quieres eliminar a este timbre "${item.name}?"`
      },
      cssClass: 'modal-confirm-delete',
      showBackdrop: true,
      // backdropDismiss: false,
      // mode: 'ios'
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm') {
    }
  }

  async openModalEdit(item?: any) {
    const modal = await this.modalCtrl.create({
      component: ModalEditComponent,
      componentProps: {
        data: {
          id: item.id,
        }
        
      },
      cssClass: 'modal-confirm-delete',
      showBackdrop: true,
      backdropDismiss: false,
      // mode: 'ios'
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm') {
    }
  }

  async openModalMembersVerify(item?: any) {
    const modal = await this.modalCtrl.create({
      component: VerifyMembersComponent,
      componentProps: {
        data: {
          title: 'Editar timbre',
          value: item.name
        }
        
      },
      // cssClass: 'modal-confirm-delete',
      showBackdrop: true,
      backdropDismiss: false,
      // mode: 'ios'
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm') {
    }
  }

  async onToggleChange(event: ToggleCustomEvent , item: any) {
    const newValue = event.detail.checked;
    // revert visual toggle until user confirms
    event.target.checked = !newValue;
  
    const modal = await this.modalCtrl.create({
      component: ModalConfirmDeleteComponent,
      componentProps: {
        title: `${newValue ? 'Activar' : 'Desactivar'} timbre`,
        message: `¿Estás seguro de que quieres ${newValue ? 'activar' : 'desactivar'} el timbre "${item.name}"?`
      },
      cssClass: 'modal-confirm-delete',
      showBackdrop: true,
      // mode: 'ios', // ← importante para permitir altura dinámica
    });
  
    await modal.present();
  
    const { role } = await modal.onDidDismiss();
  
    if (role === 'confirm') {
      item.active = newValue;
    } else {
      event.target.checked = item.active;
    }
  }

}

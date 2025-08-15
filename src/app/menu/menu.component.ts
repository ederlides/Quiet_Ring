import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalAddMembersComponent } from '../modals/modal-add-members/modal-add-members.component';
import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';
import { ModalEditComponent } from '../modals/modal-edit/modal-edit.component';
import { VerifyMembersComponent } from '../verify-members/verify-members.component';
import { ToggleCustomEvent } from '@ionic/angular';
import { WebrtcService } from '../services/webrtc.service';
import { DeviceInfo, OtpService } from '../core/services/otp-service/otp.service';

// Interfaz para el tipo de objeto de llamada
interface Call {
  name: string;
  call: string;
  date: string;
  src: string;
}
interface Ring {
  id?: string;
  code?: string;
  userId?: string;
  imgts?: string;
  name?: any;
  video?: any;
  status?: boolean;
}

export interface RingRequest {
  idProcess: string;
  ring: Ring;
  deviceInfo: DeviceInfo;
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
  private otpService = inject(OtpService);


  items: Ring[];

  options = [
    { id: 1, name: 'Descargar Código QR', src: 'assets/icon/qr.svg', dir: '/order-qr-code' },
    { id: 2, name: 'Agregar Miembro', src: 'assets/icon/person.svg', dir: '' },
    { id: 3, name: 'Verificar Miembro', src: 'assets/icon/person-check.svg', dir: '' },
    { id: 4, name: 'Editar Nombre de Timbre', src: 'assets/icon/note-pack.svg', dir: '' },
    { id: 5, name: 'Eliminar Timbre', src: 'assets/icon/trash.svg', dir: '' },
    { id: 6, name: 'Editar Miembro', src: 'assets/icon/person-edit.svg', dir: '' },
  ]

  calls: Call[] = [
    { name: 'Daniela Rodriguez', call: 'Perdida', date: '3/12/2024', src: 'assets/avatar.svg' },
    { name: 'Juan Pérez', call: 'Perdida', date: '2/12/2024', src: 'assets/avatar.svg' },
    { name: 'María López', call: 'Contestada', date: '1/12/2024', src: 'assets/avatar.svg' },
    { name: 'Carlos Gómez', call: 'Perdida', date: '30/11/2024', src: 'assets/avatar.svg' },
    { name: 'Ana Martínez', call: 'Contestada', date: '29/11/2024', src: 'assets/avatar.svg' },
    { name: 'Pablo Torres', call: 'Perdida', date: '28/11/2024', src: 'assets/avatar.svg' },
    { name: 'Laura Silva', call: 'Contestada', date: '27/11/2024', src: 'assets/avatar.svg' },
    { name: 'Roberto Díaz', call: 'Perdida', date: '26/11/2024', src: 'assets/avatar.svg' },
    { name: 'Sofía Castro', call: 'Contestada', date: '25/11/2024', src: 'assets/avatar.svg' },
    { name: 'Miguel Ríos', call: 'Perdida', date: '24/11/2024', src: 'assets/avatar.svg' },
    { name: 'Elena Vargas', call: 'Contestada', date: '23/11/2024', src: 'assets/avatar.svg' },
    { name: 'Diego Mendoza', call: 'Perdida', date: '22/11/2024', src: 'assets/avatar.svg' },
    { name: 'Carla Ortiz', call: 'Contestada', date: '21/11/2024', src: 'assets/avatar.svg' },
    { name: 'Fernando Ruiz', call: 'Perdida', date: '20/11/2024', src: 'assets/avatar.svg' },
  ]

  order = [
    { name: 'Quiet Ring Laser', price: '$19,99 Usd', src: 'assets/qr1.svg' },
    { name: 'Quiet Ring Tag', price: '$7,99 Usd', src: 'assets/qr2.svg' },
    { name: 'Quiet Ring Sticker', price: '$4,99 Usd', src: 'assets/qr3.svg' }
  ]

  constructor(private router: Router, private modalCtrl: ModalController, private webrtcService: WebrtcService) { }
  viewportWidth: any;
  viewportHeight: any;
  screenWidth: any;
  screenHeight: any;
  devicePixelRatio: any;
  realWidth: any;
  realHeight: any;
  ngOnInit() {
    this.getRing();
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
        this.router.navigate(['/order-qr-code',item.img]);
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
        message: ``,
        value:item.id
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
          title: 'Editar timbre',
          id: item.id,
          value: item.name,
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
      item.name = data;
      this.updateRing(item);
    }
  }

  async openModalMembersVerify(item?: any) {
    const modal = await this.modalCtrl.create({
      component: VerifyMembersComponent,
      componentProps: {
        data: {
          title: 'Editar timbre',
          value: item.id
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

  async onToggleChange(event: ToggleCustomEvent, item: any) {
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
      item.status = newValue;
      this.updateRing(item);
    } else {
      event.target.checked = item.status;
    }
  }

  updateRing(item) {
    let payload: RingRequest = {
      idProcess: this.generateUUID(),
      ring: item,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.createRing(payload).subscribe({
      next: (response) => {
        this.getRing();
      },
      error: (error) => {
        console.error('Error en verificación Timbres:', error);
        // Aquí manejas el error, muestra alert o mensaje
      }
    });
  }


  getRing() {
    let payload = {
      idProcess: this.generateUUID(),
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.getRing(payload).subscribe({
      next: (response) => {
        this.items = response.processResponse;
      },
      error: (error) => {
        console.error('Error en verificación Timbres:', error);
        // Aquí manejas el error, muestra alert o mensaje
      }
    });
  }


  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}

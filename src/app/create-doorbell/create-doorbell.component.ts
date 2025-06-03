import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddMembersComponent } from '../add-members/add-members.component';
import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';
import { ModalEditComponent } from '../modals/modal-edit/modal-edit.component';

@Component({
  selector: 'app-create-doorbell',
  templateUrl: './create-doorbell.component.html',
  styleUrls: ['./create-doorbell.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AddMembersComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateDoorbellComponent implements OnInit {

  titulo = 'Casa';
  soloAudio = true;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  async openModalAddMembers() {
    const modal = await this.modalCtrl.create({
      component: AddMembersComponent,
      componentProps: {
        someData: 'Hola desde el padre',
      },
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    console.log('Modal cerrado con datos:', data);
  }

  async openModalEdit() {
    const modal = await this.modalCtrl.create({
      component: ModalEditComponent,
      componentProps: {
        data: {
          title: 'Editar',
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

  async openModalDelete() {
    const modal = await this.modalCtrl.create({
      component: ModalConfirmDeleteComponent,
      componentProps: {
        title: 'Eliminar Miembro',
        message: '¿Quieres eliminar a este miembro?'
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
  

}

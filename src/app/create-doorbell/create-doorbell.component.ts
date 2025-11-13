import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddMembersComponent } from '../add-members/add-members.component';
import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';
import { ModalEditComponent } from '../modals/modal-edit/modal-edit.component';
import { RingRequest } from '../menu/menu.component';
import { OtpService } from '../core/services/otp.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-doorbell',
  templateUrl: './create-doorbell.component.html',
  styleUrls: ['./create-doorbell.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateDoorbellComponent implements OnInit {
  private otpService = inject(OtpService);
  titulo = 'Casa';
  soloAudio = true;
  form: UntypedFormGroup;
  constructor(private modalCtrl: ModalController, private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      nameRing: new FormControl(''),
      nameVideo: new FormControl(false)
    });
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
  createRing() {
    let payload: RingRequest = {
      idProcess: this.generateUUID(),
      ring: {
        name: this.form.get('nameRing')?.value,
        video: this.form.get('nameVideo')?.value,
        status:true,
      },
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.createRing(payload).subscribe({
      next: (response) => {
        this.router.navigate(['/menu']);
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

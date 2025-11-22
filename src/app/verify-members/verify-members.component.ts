import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { IonicModule, ModalController, ToggleCustomEvent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { OtpService } from '../core/services/otp.service';
// import { OtpService } from '../core/services/opt.service';
import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';
import { MemberRequest } from '../core/interfaces/interface-member';
import { MemberService } from '../core/services/member.service';

@Component({
  selector: 'app-verify-members',
  templateUrl: './verify-members.component.html',
  styleUrls: ['./verify-members.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VerifyMembersComponent implements OnInit {

  titulo = 'Casa';
  soloAudio = true;
  @Input() data?: any;
  private memberService = inject(MemberService);
  member: any;
  constructor(private modalCtrl: ModalController, private router: Router) { }

  ngOnInit() {
    this.listMember();
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }

  listMember() {
    let payload: MemberRequest = {
      idProcess: this.generateUUID(),
      idRing: this.data.value,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.memberService.listMember(payload).subscribe({
      next: (response) => {
        this.member = response?.processResponse;
      },
      error: (error) => {
        console.error('Error al generar codigo de Vinculación:', error);
        // Aquí manejas el error, muestra alert o mensaje
      }
    });
  }

  async onToggleChange(event: ToggleCustomEvent, item: any) {
    const newValue = event.detail.checked;
    // revert visual toggle until user confirms
    event.target.checked = !newValue;

    const modal = await this.modalCtrl.create({
      component: ModalConfirmDeleteComponent,
      componentProps: {
        title: `${newValue ? 'Activar' : 'Desactivar'} Miembro`,
        message: `¿Estás seguro de que quieres ${newValue ? 'activar' : 'desactivar'} el miembro "${item.cellPhoneNumber}"?`
      },
      cssClass: 'modal-confirm-delete',
      showBackdrop: true,
      // mode: 'ios', // ← importante para permitir altura dinámica
    });

    await modal.present();

    const { role } = await modal.onDidDismiss();

    if (role === 'confirm') {
      item.status = newValue;
      this.updateMember(item);
    } else {
      event.target.checked = item.status;
    }
  }

  updateMember(item) {
    let payload = {
      idProcess: this.generateUUID(),
      member: item,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.memberService.updateMember(payload).subscribe({
      next: (response) => {
        this.listMember();
      },
      error: (error) => {
        console.error('Error al generar codigo de Vinculación:', error);
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

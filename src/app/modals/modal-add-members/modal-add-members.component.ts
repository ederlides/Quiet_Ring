import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { OtpService } from 'src/app/core/services/otp.service';
import { MemberRequest } from 'src/app/core/interfaces/interface-member';
import { MemberService } from 'src/app/core/services/member.service';

@Component({
  standalone: true,
  selector: 'app-modal-add-members',
  imports: [CommonModule, IonicModule],
  templateUrl: './modal-add-members.component.html',
  styleUrls: ['./modal-add-members.component.scss']
})

export class ModalAddMembersComponent {
  @Input() title: string = 'Editar';
  @Input() value?: any;
  private memberService = inject(MemberService);
  code: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.generateCode();
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }

  generateCode() {
    let payload: MemberRequest = {
      idProcess: this.generateUUID(),
      idRing:this.value,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.memberService.generateCode(payload).subscribe({
      next: (response) => {
        this.code = response?.processResponse;
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

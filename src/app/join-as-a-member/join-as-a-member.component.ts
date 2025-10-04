import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { OtpService } from '../core/services/otp.service';
import { MemberRequest } from '../modals/modal-add-members/modal-add-members.component';

@Component({
  selector: 'app-join-as-a-member',
  templateUrl: './join-as-a-member.component.html',
  styleUrls: ['./join-as-a-member.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JoinAsAMemberComponent implements OnInit {

  titulo = 'Casa';
  soloAudio = true;
  @Input() data?: any;

  private otpService = inject(OtpService);
  code: string;

  constructor(private modalCtrl: ModalController, private router: Router) { }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }

  addMember() {
    let payload = {
      idProcess: this.generateUUID(),
      code: this.code,
      deviceInfo: {
        ip: '10.10.10.1',
        mobile: 'Nokia1100',
        mac: '00-11-22-33-44-55'
      }
    };

    this.otpService.addMember(payload).subscribe({
      next: (response) => {
        // this.router.navigate(['/menu']);
        this.router.navigateByUrl('/menu', { replaceUrl: true });
      },
      error: (error) => {
        console.error('Error de Vinculación:', error);
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

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-modal-add-members',
  imports: [CommonModule, IonicModule],
  templateUrl: './modal-add-members.component.html',
  styleUrls: ['./modal-add-members.component.scss']
})
export class ModalAddMembersComponent {
  @Input() title: string = 'Editar';

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }
}

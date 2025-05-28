import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-modal-confirm-delete',
  imports: [CommonModule, IonicModule],
  templateUrl: './modal-confirm-delete.component.html',
  styleUrls: ['./modal-confirm-delete.component.scss']
})
export class ModalConfirmDeleteComponent {
  @Input() title: string = '¿Eliminar?';
  @Input() message: string = '¿Estás seguro de que deseas eliminar este elemento?';

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalConfirmDeleteComponent } from '../modals/modal-confirm-delete/modal-confirm-delete.component';
import { ModalEditComponent } from '../modals/modal-edit/modal-edit.component';

@Component({
  selector: 'app-order-qr-code',
  templateUrl: './order-qr-code.component.html',
  styleUrls: ['./order-qr-code.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderQrCodeComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

  

}

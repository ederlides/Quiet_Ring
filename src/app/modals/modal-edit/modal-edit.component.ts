import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormControl, FormGroup, FormsModule, UntypedFormGroup } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-modal-edit',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './modal-edit.component.html',
  styleUrls: ['./modal-edit.component.scss']
})
export class ModalEditComponent {
  @Input() data?: any;
  form: UntypedFormGroup;
  nameRing: string = '';
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.data?.value) {
      this.nameRing = this.data.value;
    }
  }
  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(this.nameRing, 'confirm');
  }
}

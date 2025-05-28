import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddMembersComponent implements OnInit {

  titulo = 'Casa';
  soloAudio = true;
  @Input() someData: any;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  close() {
    this.modalCtrl.dismiss({ result: 'closed' });
  }

}

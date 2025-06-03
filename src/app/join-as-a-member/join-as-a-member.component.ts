import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private modalCtrl: ModalController, private router: Router) {}

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }

}

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ActivateQrComponent } from './activate-qr.component';

const routes: Routes = [
  {
    path: '',
    component: ActivateQrComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ActivateQrComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivateQrModule { } 
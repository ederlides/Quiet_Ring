import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ActivationCodeComponent } from './activation-code.component';

const routes: Routes = [
  {
    path: '',
    component: ActivationCodeComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ActivationCodeComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivationCodeModule {} 
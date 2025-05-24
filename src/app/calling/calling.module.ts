import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CallingComponent } from './calling.component';

const routes: Routes = [
  {
    path: '',
    component: CallingComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CallingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CallingModule {} 
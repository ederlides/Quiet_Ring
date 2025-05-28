import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CreateDoorbellComponent } from './create-doorbell.component';

const routes: Routes = [
  {
    path: '',
    component: CreateDoorbellComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CreateDoorbellComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateDoorbellModule {} 
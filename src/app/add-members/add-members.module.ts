import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AddMembersComponent } from './add-members.component';

const routes: Routes = [
  {
    path: '',
    component: AddMembersComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    AddMembersComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddMembersModule {} 
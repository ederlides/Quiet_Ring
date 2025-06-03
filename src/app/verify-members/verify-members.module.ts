import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { VerifyMembersComponent } from './verify-members.component';

const routes: Routes = [
  {
    path: '',
    component: VerifyMembersComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    VerifyMembersComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VerifyMembersModule {} 
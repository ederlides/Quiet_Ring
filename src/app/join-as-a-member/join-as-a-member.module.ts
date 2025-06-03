import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { JoinAsAMemberComponent } from './join-as-a-member.component';

const routes: Routes = [
  {
    path: '',
    component: JoinAsAMemberComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    JoinAsAMemberComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JoinAsAMemberModule {} 
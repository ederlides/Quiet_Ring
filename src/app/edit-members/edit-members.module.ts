import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EditMembersComponent } from './edit-members.component';

const routes: Routes = [
  {
    path: '',
    component: EditMembersComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    EditMembersComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditMembersModule {} 
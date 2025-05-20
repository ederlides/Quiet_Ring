import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodeInputComponent } from './code-input.component';

const routes: Routes = [
  {
    path: '',
    component: CodeInputComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CodeInputComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CodeInputModule {}

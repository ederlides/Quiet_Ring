import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { QrReaderComponent } from './qr-reader.component';

const routes: Routes = [
  {
    path: '',
    component: QrReaderComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    QrReaderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QrReaderModule {} 
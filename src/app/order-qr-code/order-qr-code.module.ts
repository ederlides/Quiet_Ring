import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderQrCodeComponent } from './order-qr-code.component';

const routes: Routes = [
  {
    path: '',
    component: OrderQrCodeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    OrderQrCodeComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrderQrCodeModule {} 
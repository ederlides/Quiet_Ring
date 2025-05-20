import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from './typeahead.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TypeaheadComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TypeaheadModule { } 
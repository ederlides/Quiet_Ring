import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonicModule, IonItem, IonLabel, IonList, IonModal, NavController } from '@ionic/angular';
import { TypeaheadComponent } from '../typeahead/typeahead.component';
import { ApiService } from '../service/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, TypeaheadComponent,NgIf]
})
export class LoginComponent implements OnInit {
  viewLogin=false;
  viewOtp=false;

  constructor(private navCtrl: NavController,public apiService: ApiService) { }
  @ViewChild('modal', { static: true }) modal!: IonModal;

  selectedFruitsText = '';
  selectedFruits: string[] = [];
  mobile: String;

  fruits: any[] = [
    { text: 'Colombia', value: '+57' },
    { text: 'Perú', value: '+58' },

  ];
  
  ngOnInit() {
    
  }

  condition(){
    this.viewLogin=true;
    this.fruitSelectionChanged(['+57']);
  }

  callOtp() {
    this.viewOtp=true;
    this.viewLogin=false;
    let request = {
      "idProcess": "pruebasIdProcess",
      "device": "Nokia1100",
      "ip": "10.10.10.2",
      "mobile": this.mobile
    }
    this.apiService.getOtp(this, request,this.handlerSuccessGetOtp, this.handlerError )
  }


  onInputChange(event: any) {
    this.navCtrl.navigateForward('/menu');
  }















//************************************************************************************************************* */


  /**
   * Formats the display text based on the selected fruits.
   * @param data - Array of selected fruit values
   * @returns A formatted string for display
   */
  private formatData(data: string[]): string {
    if (data.length === 1) {
      const fruit = this.fruits.find((fruit) => fruit.value === data[0]);
      return fruit ? fruit.text : '';
    }
    return `${data.length} items`;
  }

  /**
   * Handles fruit selection changes and updates the selected fruits and text.
   * @param fruits - Array of selected fruit values
   */
  fruitSelectionChanged(fruits: string[]) {
    this.selectedFruits = fruits;
    this.selectedFruitsText = this.formatData(this.selectedFruits);
    this.modal.dismiss();
  }

  navigateToNextPage() {
    this.navCtrl.navigateForward('/menu'); // Cambia 'next-page' por la ruta de tu nueva página
  }

  openRegister() {
    this.navCtrl.navigateForward('/menu'); // Cambia 'next-page' por la ruta de tu nueva página
  }


  handlerSuccessGetOtp(_this, data) {
    if (data.status == 200) {
      console.log(data.processResponse)
      _this.callValidOtp(data.processResponse);
    }
  }

  handlerError(_this, result) {
    if (result.status != 200) {

    }
  }

  callValidOtp(otp){
    let request = {
      "idProcess": "pruebasIdProcess",
      "device": "Nokia1100",
      "ip": "10.10.10.2",
      "otp": otp
    }
    this.apiService.validOtp(this, request,this.handlerSuccessValidOtp, this.handlerError )
  }

  handlerSuccessValidOtp(_this, data){
    if (data.status == 200) {
      console.log(data.processResponse)
    }
  }


}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class MenuComponent implements OnInit {
  items = [
    { name: 'Home', active: true },
    { name: 'Dog', active: true },
    { name: 'Passport', active: false },
    { name: 'Mami Beach Apartment', active: true },
    { name: 'Alameda del Rio', active: false }
  ];

  calls= [
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
    { name:'Daniela Rodriguez',call:'Missed',date:'3/12/2024',src:'../../assets/avatar.svg'},
  ]

  order =[
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/order.svg'},
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/order.svg'},
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/order.svg'},
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/order.svg'},
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/order.svg'},
    {name:'Quiet Ring Laser',price:'$19,99 Usd', src:'../../assets/order.svg'},

  ]
  constructor() { }

  ngOnInit() { }

}

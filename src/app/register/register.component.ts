import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],

  standalone: true,
  imports: [IonicModule]
})
export class RegisterComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}

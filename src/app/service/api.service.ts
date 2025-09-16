import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OtpRequest } from '../core/services/otp-service/otp.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token') || ''
  }),
  withCredentials: true
};


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getOtp(_this, data, successHandler, errorHandler) {
    const url = environment.api.otp.generate;
    this.http.post(url, data, httpOptions).subscribe(result => {
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }

  validOtp(_this, data, successHandler, errorHandler) {
    const url = environment.api.otp.validate;
    this.http.post(url, data, httpOptions).subscribe(result => {
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }





}

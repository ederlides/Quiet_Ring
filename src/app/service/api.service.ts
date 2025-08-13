import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OtpRequest } from '../core/services/otp-service/otp.service';
import { Observable } from 'rxjs';
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
    let url = 'http://localhost:8080/otp/generate';
    this.http.post(url, data, httpOptions).subscribe(result => {
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }

  validOtp(_this, data, successHandler, errorHandler) {
    let url = 'http://localhost:8080/otp/validate';
    this.http.post(url, data, httpOptions).subscribe(result => {
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }





}

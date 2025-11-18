import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OtpRequest } from '../core/services/otp.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
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

  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }
  

  getOtp(_this, data, successHandler, errorHandler) {
    let url = `${this.apiUrl}otp/generate`;
    this.http.post(url, data, httpOptions).subscribe(result => {
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }

  validOtp(_this, data, successHandler, errorHandler) {
    let url = `${this.apiUrl}otp/validate`;
    this.http.post(url, data, httpOptions).subscribe(result => {
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }





}

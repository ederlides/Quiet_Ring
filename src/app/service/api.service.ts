import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getOtp(_this, data, successHandler, errorHandler){
    const url = `${environment.apiUrl}${environment.apiEndpoints.otpGenerate}`;
    console.log('🌐 API URL:', url);
    this.http.post(url, data, httpOptions).subscribe(result =>{
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }

  validOtp(_this, data, successHandler, errorHandler){
    const url = `${environment.apiUrl}${environment.apiEndpoints.otpValidate}`;
    console.log('🌐 API URL:', url);
    this.http.post(url, data, httpOptions).subscribe(result =>{
      successHandler(_this, result);
    }, error => errorHandler(_this, error));
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RingRequest } from 'src/app/menu/menu.component';

export interface DeviceInfo {
  ip: string;
  mobile: string;
  mac: string;
}

export interface OtpRequest {
  idProcess: string;
  cellPhoneNumber: string;
  indicative: string;
  otp?: string;
  deviceInfo: DeviceInfo;
}



@Injectable({
  providedIn: 'root'
})
export class OtpService {

  private apiUrl = 'http://localhost:8080/otp';

  constructor(private http: HttpClient) { }

  getOtp(payload: OtpRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/generate", payload);
  }

  verifyOtp(payload: OtpRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/validate", payload);
  }

  createRing(payload): Observable<any> {
    let url = 'http://localhost:8080/ring/create';
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+token,
      'Content-Type': 'application/json'
    });
    return this.http.post(url, payload,  { headers });
  }

  getRing(payload: RingRequest): Observable<any> {
    const url = 'http://localhost:8080/ring/';
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }

}
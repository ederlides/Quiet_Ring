import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
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

  private apiUrl = environment.api.baseUrl;
  constructor(private http: HttpClient) { }

  getOtp(payload: OtpRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/otp/generate", payload);
  }

  verifyOtp(payload: OtpRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/otp/validate", payload);
  }

  createRing(payload): Observable<any> {
    let url = this.apiUrl+"/ring/create";
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post(url, payload, { headers });
  }

  getRing(payload: any): Observable<any> {
    const url = this.apiUrl+"/ring/";
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }

  generateCode(payload: any): Observable<any> {
    const url = this.apiUrl+"/member/generate";
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }

  addMember(payload: any): Observable<any> {
    const url = this.apiUrl+"/member/";
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }

  listMember(payload: any): Observable<any> {
    const url = this.apiUrl+"/member/list";
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }

  updateMember(payload: any): Observable<any> {
    const url = this.apiUrl+"/member/update";
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }

  getQr(payload: any): Observable<any> {
    const url = this.apiUrl+"/qr/";
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, payload, { headers });
  }
}
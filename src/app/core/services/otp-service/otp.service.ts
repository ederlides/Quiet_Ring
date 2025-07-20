import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
    return this.http.post(this.apiUrl+"/generate", payload);
  }

  verifyOtp(payload: OtpRequest): Observable<any> {
    return this.http.post(this.apiUrl+"/validate", payload);
  }
}
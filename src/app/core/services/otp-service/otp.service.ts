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
  operation: number;
  otp?: string;
  deviceInfo: DeviceInfo;
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  private apiUrl = 'https://3c4e2531-5ce7-48b0-a385-041c26955c74.mock.pstmn.io/';

  constructor(private http: HttpClient) { }

  verifyOtp(payload: OtpRequest): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OtpRequest } from '../interfaces/otp-request';

@Injectable({
    providedIn: 'root'
})
export class QrService {

    private apiUrl = environment.baseUrl;
    constructor(private http: HttpClient) { }

    getQr(payload: any): Observable<any> {
        const url = this.apiUrl+"qr/";
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post<any>(url, payload, { headers });
    }
}
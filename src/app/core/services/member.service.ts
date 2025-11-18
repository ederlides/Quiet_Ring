import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OtpRequest } from '../interfaces/otp-request';

@Injectable({
    providedIn: 'root'
})
export class MemberService {

    private apiUrl = environment.baseUrl;
    constructor(private http: HttpClient) { }

    generateCode(payload: any): Observable<any> {
        const url = this.apiUrl+"member/generate";
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post<any>(url, payload, { headers });
    }

    addMember(payload: any): Observable<any> {
        const url = this.apiUrl+"member/";
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post<any>(url, payload, { headers });
    }

    listMember(payload: any): Observable<any> {
        const url = this.apiUrl+"member/list";
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post<any>(url, payload, { headers });
    }

    updateMember(payload: any): Observable<any> {
        const url = this.apiUrl+"member/update";
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post<any>(url, payload, { headers });
    }
}
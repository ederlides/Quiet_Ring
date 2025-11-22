import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RingService {

    private apiUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    createRing(payload): Observable<any> {
        let url = this.apiUrl+"ring/create";
        const token = localStorage.getItem('token') || '';

        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post(url, payload, { headers });
    }

    getRing(payload: any): Observable<any> {
        const url = this.apiUrl+"ring/";
        const token = localStorage.getItem('token') || '';
    
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post<any>(url, payload, { headers });
    }
}
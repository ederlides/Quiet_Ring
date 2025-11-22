import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICallRegister } from '../interfaces/interface-call';

@Injectable({
    providedIn: 'root'
})
export class callService {

    private apiUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    CallRegister(payload: ICallRegister): Observable<any> {
        let url = this.apiUrl+"call/register";
        const token = localStorage.getItem('token') || '';

        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        });
        return this.http.post(url, payload, { headers });
    }
}
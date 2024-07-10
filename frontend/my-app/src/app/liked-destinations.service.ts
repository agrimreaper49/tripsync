import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikedDestinationsService {
  private apiUrl = 'http://localhost:3000'; // Update with your server URL

  constructor(private http: HttpClient) {}

  addLikedDestination(userId: string, destination: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/addLikedDestination`, { userId, destination });
  }

  removeLikedDestination(userId: string, destination: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/removeLikedDestination`, { userId, destination });
  }

  getLikedDestinations(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getLikedDestinations/${userId}`);
  }
}
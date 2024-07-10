import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private user: any = null;

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user)); // Store user in local storage
  }

  getUser() {
    if (this.user) {
      return this.user;
    }
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      this.user = JSON.parse(userFromStorage);
    }
    return this.user;
  }

  clearUser() {
    this.user = null;
    localStorage.removeItem('user');
  }
}

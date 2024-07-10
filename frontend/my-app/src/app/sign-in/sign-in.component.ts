import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../firebase-auth.service'; // Import UserService

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router, private userService: FirebaseAuthService) {}

  onSignIn() {
    this.http.post('http://localhost:3000/signin', { email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          console.log('User signed in:', response.user);
          this.userService.setUser(response.user); // Store user in UserService
          if (response.newUser) {
            console.log('New user created in Firestore');
          }
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Sign in error:', error);
          alert('Sign in failed: ' + (error.error?.error || 'Unknown error'));
        }
      });
  }
}

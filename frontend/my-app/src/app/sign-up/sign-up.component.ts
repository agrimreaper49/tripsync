import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FirebaseAuthService } from '../firebase-auth.service'; // Import UserService

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  private backendUrl = 'https://tripsync-backend-drdmpnauna-ue.a.run.app';

  constructor(private http: HttpClient, private router: Router, private userService: FirebaseAuthService) {}

  onSignUp() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.http.post(`${this.backendUrl}/signup`, { email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          console.log('User registered successfully', response);
          this.userService.setUser(response.user); // Store user in UserService
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Registration failed', error);
          alert('Registration failed: ' + (error.error?.error || 'Unknown error'));
        }
      });
  }
}

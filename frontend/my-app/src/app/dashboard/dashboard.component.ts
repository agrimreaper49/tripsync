import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../firebase-auth.service';
import { DestinationCard } from '../discover/discover.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  likedDestinations: DestinationCard[] = [];
  userId: string | null = null;
  private backendUrl = 'https://tripsync-backend-drdmpnauna-ue.a.run.app';

  constructor(
    private http: HttpClient,
    private userService: FirebaseAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    this.userId = user ? user.uid : null;
    if (this.userId) {
      this.getLikedDestinations();
    }
  }

  getLikedDestinations() {
    this.http.get(`${this.backendUrl}/getLikedDestinations/${this.userId}`).subscribe({
      next: (res: any) => {
        this.likedDestinations = res.likedDestinations || [];
      },
      error: (err) => {
        console.error('Error getting liked destinations:', err);
      }
    });
  }

  toggleLike(card: DestinationCard) {
    if (!this.userId) return;

    card.isLiked = !card.isLiked;

    if (card.isLiked) {
      this.addLikedDestination(card);
    } else {
      this.removeLikedDestination(card);
    }
  }

  addLikedDestination(card: DestinationCard) {
    this.http.post(`${this.backendUrl}/addLikedDestination`, { userId: this.userId, destination: card }).subscribe({
      next: (res) => {
        this.likedDestinations.push(card);
      },
      error: (err) => {
        console.error('Error liking destination:', err);
      }
    });
  }

  removeLikedDestination(card: DestinationCard) {
    this.http.post(`${this.backendUrl}/removeLikedDestination`, { userId: this.userId, destination: card }).subscribe({
      next: (res) => {
        this.likedDestinations = this.likedDestinations.filter(d => d.name !== card.name);
      },
      error: (err) => {
        console.error('Error unliking destination:', err);
      }
    });
  }

  logout() {
    console.log('Logging out...');
    this.http.post(`${this.backendUrl}/signout`, {}).subscribe({
      next: (res) => {
        console.log('User signed out successfully');
        this.router.navigate(['/sign-in']);
      },
      error: (err) => {
        console.error('Sign out error:', err);
      }
    });
  }

  viewDestinationLists() {
    this.router.navigate(['/view-lists']);
  }

  bookDestinations() {
    this.router.navigate(['/dashboard']);
  }
}

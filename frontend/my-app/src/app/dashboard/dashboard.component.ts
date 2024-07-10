import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../firebase-auth.service'; // Make sure to import UserService
import { DestinationCard } from '../discover/discover.component'; // Import the DestinationCard interface

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  likedDestinations: DestinationCard[] = [];
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private userService: FirebaseAuthService, // Inject UserService
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    this.userId = user ? user.uid : null;
    if (this.userId) {
      this.getLikedDestinations();
    }
  }

  getLikedDestinations() {
    this.http.get(`http://localhost:3000/getLikedDestinations/${this.userId}`).subscribe({
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
    this.http.post('http://localhost:3000/addLikedDestination', { userId: this.userId, destination: card }).subscribe({
      next: (res) => {
        this.likedDestinations.push(card);
      },
      error: (err) => {
        console.error('Error liking destination:', err);
      }
    });
  }

  removeLikedDestination(card: DestinationCard) {
    this.http.post('http://localhost:3000/removeLikedDestination', { userId: this.userId, destination: card }).subscribe({
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
    this.http.post('http://localhost:3000/signout', {}).subscribe({
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
    // Navigate to the destination lists view
    this.router.navigate(['/view-lists']);
  }

  bookDestinations() {
    // Navigate to the book destinations view
    this.router.navigate(['/book-destinations']);
  }
  
}

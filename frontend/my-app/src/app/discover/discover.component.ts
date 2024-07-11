import { Component, OnInit } from '@angular/core';
import { GeminiService } from '../gemini.service';
import { HttpClient } from '@angular/common/http';
import { FirebaseAuthService } from '../firebase-auth.service';

export interface DestinationCard {
  id: string;
  name: string;
  description: string;
  image: string;
  isLiked?: boolean;
}

interface List {
  id: string;
  name: string;
  destinations: DestinationCard[];
}

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  destinationCards: DestinationCard[] = [];
  isLoading = false;
  userId: string | null = null;
  userLists: List[] = [];

  private backendUrl = 'https://tripsync-backend-drdmpnauna-ue.a.run.app';

  constructor(
    private geminiService: GeminiService,
    private http: HttpClient,
    private userService: FirebaseAuthService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    this.userId = user ? user.uid : null;
    if (this.userId) {
      this.getLikedDestinations();
      this.getUserLists();
    }
  }

  searchDestinations(searchTerm: string) {
    this.isLoading = true;
    this.geminiService.getDestinationRecommendations(10, searchTerm).subscribe({
      next: (data: DestinationCard[]) => {
        this.destinationCards = data.map(card => ({ ...card, isLiked: false, id: this.generateUniqueId() }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
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
        console.log('Destination liked:', res);
      },
      error: (err) => {
        console.error('Error liking destination:', err);
      }
    });
  }

  removeLikedDestination(card: DestinationCard) {
    this.http.post(`${this.backendUrl}/removeLikedDestination`, { userId: this.userId, destination: card }).subscribe({
      next: (res) => {
        console.log('Destination unliked:', res);
      },
      error: (err) => {
        console.error('Error unliking destination:', err);
      }
    });
  }

  getLikedDestinations() {
    this.http.get(`${this.backendUrl}/getLikedDestinations/${this.userId}`).subscribe({
      next: (res: any) => {
        const likedDestinations = res.likedDestinations;
        this.destinationCards = this.destinationCards.map(card => ({
          ...card,
          isLiked: likedDestinations.some((d: DestinationCard) => d.name === card.name)
        }));
      },
      error: (err) => {
        console.error('Error getting liked destinations:', err);
      }
    });
  }

  getUserLists() {
    this.http.get<List[]>(`${this.backendUrl}/getLists/${this.userId}`).subscribe({
      next: (lists) => {
        this.userLists = lists;
      },
      error: (err) => {
        console.error('Error fetching user lists:', err);
      }
    });
  }

  addDestinationToList(destination: DestinationCard, listId: string) {
    if (!this.userId) return;

    this.http.post(`${this.backendUrl}/addDestinationToList`, { userId: this.userId, listId, destination }).subscribe({
      next: (res) => {
        console.log('Destination added to list:', res);
        // Optionally, update the local list data
        const updatedList = this.userLists.find(list => list.id === listId);
        if (updatedList) {
          updatedList.destinations.push(destination);
        }
      },
      error: (err) => {
        console.error('Error adding destination to list:', err);
      }
    });
  }

  private generateUniqueId(): string {
    // Simple implementation, consider using a more robust method in production
    return Math.random().toString(36).substr(2, 9);
  }
}

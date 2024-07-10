import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseAuthService } from '../firebase-auth.service';
import { DestinationCard } from '../discover/discover.component';

interface List {
  id: string;
  name: string;
  destinations: DestinationCard[];
}

@Component({
  selector: 'app-view-lists',
  templateUrl: './view-lists.component.html',
  styleUrls: ['./view-lists.component.css']
})
export class ViewListsComponent implements OnInit {
  likedDestinations: DestinationCard[] = [];
  createdLists: List[] = [];
  newListName: string = '';
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private userService: FirebaseAuthService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUser();
    this.userId = user ? user.uid : null;
    if (this.userId) {
      this.updateUserLists(this.userId);
      this.getLikedDestinations();
      this.fetchCreatedLists();
    }
  }

  updateUserLists(userId: string): void {
    this.http.post<any>('http://localhost:3000/updateUserLists', { userId }).subscribe({
      next: (res) => {
        console.log('User lists updated successfully:', res);
        // Optionally update local state if needed
        this.createdLists = res.lists;
      },
      error: (err) => {
        console.error('Error updating user lists:', err);
      }
    });
  }

  getLikedDestinations() {
    if (this.userId) {
      this.http.get(`http://localhost:3000/getLikedDestinations/${this.userId}`).subscribe({
        next: (res: any) => {
          this.likedDestinations = res.likedDestinations || [];
        },
        error: (err) => {
          console.error('Error getting liked destinations:', err);
        }
      });
    }
  }

  fetchCreatedLists() {
    if (this.userId) {
      this.http.get<any[]>(`http://localhost:3000/getLists/${this.userId}`).subscribe({
        next: (lists) => {
          this.createdLists = lists.map(list => ({
            ...list,
            id: list.id || '',
            destinations: list.destinations || []
          }));
          console.log('Fetched lists:', this.createdLists);
        },
        error: (err) => {
          console.error('Error fetching lists:', err);
        }
      });
    } else {
      console.error('User ID is not defined');
    }
  }
  

  addList() {
    if (this.userId && this.newListName.trim() !== '') {
      this.http.post<any>('http://localhost:3000/addList', { userId: this.userId, listName: this.newListName }).subscribe({
        next: (res) => {
          console.log('List added successfully:', res);
          const newList = res.list; // Use the new list object returned from the server
          console.log('ID of new list: ', newList.id)
          this.createdLists.push(newList); // Update the local state with the new list
          this.newListName = ''; // Clear the input field
        },
        error: (err) => {
          console.error('Error adding list:', err);
        }
      });
    }
  }
  
  addDestinationToList(listId: string, event: Event) {
    console.log('Selected list ID:', listId); // Log list ID to verify it's not empty
  
    if (this.userId && listId) { // Check if listId is not empty
      const selectElement = event.target as HTMLSelectElement;
      const selectedDestinationId = selectElement.value;
  
      console.log('Selected destination ID:', selectedDestinationId);
  
      const destination = this.likedDestinations.find(d => d.id === selectedDestinationId);
  
      if (destination) {
        console.log('Selected destination:', destination);
  
        const listToUpdate = this.createdLists.find(list => list.id === listId);
        console.log('List to update:', listToUpdate);
  
        if (listToUpdate) {
          this.http.post<any>('http://localhost:3000/addDestinationToList', { userId: this.userId, listId, destination }).subscribe({
            next: (res) => {
              console.log('Destination added to list successfully:', res);
              if (!listToUpdate.destinations) {
                listToUpdate.destinations = [];
              }
              listToUpdate.destinations.push(destination);
              // No need to call fetchCreatedLists() here as we've updated the local state
            },
            error: (err) => {
              console.error('Error adding destination to list:', err);
            }
          });
        } else {
          console.error('List not found with ID:', listId);
        }
      } else {
        console.error('Destination not found with ID:', selectedDestinationId);
      }
    } else {
      console.error('Invalid list ID:', listId);
    }
  }
  onSubmit() {
    this.addList();
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isSidebarVisible = true;
  constructor(private router: Router) {}


  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
    console.log('Sidebar visibility state:', this.isSidebarVisible);
  }
  navigateToDiscover() {
    this.router.navigate(['/discover']);
  }
}

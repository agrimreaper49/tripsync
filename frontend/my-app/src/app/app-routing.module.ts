import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { DiscoverComponent } from './discover/discover.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ViewListsComponent } from './view-lists/view-lists.component';

const routes: Routes = [
  { path: 'sign-in', component: SignInComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'discover', component: DiscoverComponent },
  { path: 'signup', component: SignUpComponent},
  { path: 'view-lists', component: ViewListsComponent }, // Add the new route
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: '**', redirectTo: '/sign-in' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

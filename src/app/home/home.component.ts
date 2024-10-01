import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../api/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [RouterLink],
})
export class HomeComponent {
  protected launch() {
    void Api['profile.launch']('space-cats');
  }
}

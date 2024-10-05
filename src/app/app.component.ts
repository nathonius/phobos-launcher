import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { themeChange } from 'theme-change';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // TODO: Store this in config file
    themeChange();
  }
}

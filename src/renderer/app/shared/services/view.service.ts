import { Injectable, signal } from '@angular/core';
import { AppViewState, HomeViewState } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  public readonly appState = signal<AppViewState>(AppViewState.Home);
  public readonly homeState = signal<HomeViewState>(HomeViewState.ProfileList);
}

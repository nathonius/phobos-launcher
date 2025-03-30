export enum AppViewState {
  Home,
  Settings,
  Engines,
  Bases,
}

export enum HomeViewState {
  CategoryEdit,
  ProfileList,
  ProfileEdit,
}

export type DaisyVariant =
  | 'default'
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

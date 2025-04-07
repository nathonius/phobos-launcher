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

export type DaisyButtonVariant =
  | 'default'
  | 'ghost'
  | 'link'
  | 'soft'
  | 'outline'
  | 'dash'
  | 'active'
  | 'disabled';
export type DaisyButtonShape = 'default' | 'square' | 'circle' | 'wide';
export type DaisyButtonSize = 'default' | 'medium' | 'xs' | 's' | 'lg' | 'xl';
export type DaisyButtonColor =
  | 'default'
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface SGDBGame {
  id: number;
  name: string;
  types: string[];
  verified: boolean;
}

export interface SGDBAuthor {
  name: string;
  steam64: string;
  avatar: URL;
}

export interface SGDBImage {
  id: number;
  score: number;
  style: SGDBGridStyle;
  /**
   * Path to full size grid image
   */
  url: string;
  /**
   * Path to 380x178 thumbnail image
   */
  thumb: string;
  tags: string[];
  author: SGDBAuthor;
  language: string;
  notes: string | null;
}

export type SGDBGridDimension =
  | '460x215'
  | '920x430'
  | '600x900'
  | '342x482'
  | '660x930'
  | '512x512'
  | '1024x1024';
export type SGDBGridStyle =
  | 'alternate'
  | 'blurred'
  | 'white_logo'
  | 'material'
  | 'no_logo';
export type SGDBGridMime = 'image/png' | 'image/jpeg' | 'image/webp';
export type SGDBHeroStyle = 'alternate' | 'blurred' | 'material';
export type SGDBHeroDimension = '1920x620' | '3840x1240' | '1600x650';
export type SGDBHeroMime = 'image/png' | 'image/jpeg' | 'image/webp';
export type SGDBLogoStyle = 'official' | 'white' | 'black' | 'custom';
export type SGDBLogoMime = 'image/png' | 'image/webp';
export type SGDBIconStyle = 'official' | 'custom';
export type SGDBIconDimension =
  | '8'
  | '10'
  | '14'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '35'
  | '40'
  | '48'
  | '54'
  | '56'
  | '57'
  | '60'
  | '64'
  | '72'
  | '76'
  | '80'
  | '90'
  | '96'
  | '100'
  | '114'
  | '120'
  | '128'
  | '144'
  | '150'
  | '152'
  | '160'
  | '180'
  | '192'
  | '194'
  | '256'
  | '310'
  | '512'
  | '768'
  | '1024';
export type SGDBIconMime = 'image/png' | 'image/vnd.microsoft.icon';
export type SGDBImageType = 'static' | 'animated';
export type SGDBImageBooleanOption = 'false' | 'true' | 'any';
export type SGDBImageCategory = 'grid' | 'hero' | 'logo' | 'icon';

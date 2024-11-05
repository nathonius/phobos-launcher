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
  style: string[];
  url: string;
  thumb: string;
  tags: string[];
  author: SGDBAuthor;
  language: string;
  notes: string | null;
}

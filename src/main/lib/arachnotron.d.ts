export namespace Arachnotron {
  export interface Engine {
    config: string;
    name: string;
    path: string;
  }
  export interface IWad {
    name: string;
    path: string;
  }
  export interface Cvar {
    name: string;
    value: string;
  }
  export interface Profile {
    _path?: string;
    args: string;
    backgroundPath: string;
    backgroundTileHide: boolean;
    categories: string[];
    cvars: Cvar[];
    engine: string;
    iconPath: string;
    inheritProfiles: string[];
    iwad: string;
    name: string;
    playerClasses: string[];
    resources: string[];
  }
  export interface Category {
    _path?: string;
    iconPath: string;
    name: string;
  }
  export interface SettingsJson {
    engines: Engine[];
    iwads: IWad[];
  }
  export interface ProfilesJson {
    profiles: string[];
  }
  export interface CategoriesJson {
    categories: string[];
  }
}

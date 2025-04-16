import BandedWood from './banded-wood-bg.png';
import BrownRock from './brown-rock-bg.png';
import DiamondFlat from './diamond-flat-bg.png';
import Foliage from './foliage-bg.png';
import GrayMarble from './gray-marble-bg.png';
import Magma from './magma-bg.png';
import Medieval from './medival-bg.png';
import MetalGrid from './metal-grid-bg.png';
import Nukage from './nukage-bg.png';
import OxidizedHex from './oxidized-hex-flat-bg.png';
import Pipes from './pipes-bg.png';
import RockWall from './rock-wall-bg.png';
import RustyMetal from './rusty-metal-bg.png';
import ShawnLike from './shawn-like-bg.png';
import Skulls from './skulls-flat-bg.png';
import Tech from './tech-flat-bg.png';
import WhiteMarble from './white-marble-bg.png';

export const BACKGROUND_TEXTURES_CONST = {
  BandedWood,
  BrownRock,
  DiamondFlat,
  Foliage,
  GrayMarble,
  Magma,
  Medieval,
  MetalGrid,
  Nukage,
  OxidizedHex,
  Pipes,
  RockWall,
  RustyMetal,
  ShawnLike,
  Skulls,
  Tech,
  WhiteMarble,
} as const;

export const BACKGROUND_TEXTURES = BACKGROUND_TEXTURES_CONST as Record<
  string,
  string
>;

export const BACKGROUND_TEXTURE_OPTIONS: {
  key: keyof typeof BACKGROUND_TEXTURES_CONST;
  name: string;
}[] = [
  { key: 'BandedWood', name: 'Banded wood' },
  { key: 'BrownRock', name: 'Brown rock' },
  { key: 'DiamondFlat', name: 'Diamond' },
  { key: 'Foliage', name: 'Foliage' },
  { key: 'GrayMarble', name: 'Gray marble' },
  { key: 'Magma', name: 'Magma' },
  { key: 'Medieval', name: 'Medieval' },
  { key: 'MetalGrid', name: 'Metal grid' },
  { key: 'Nukage', name: 'Nukage' },
  { key: 'OxidizedHex', name: 'Oxidized hex' },
  { key: 'Pipes', name: 'Pipes' },
  { key: 'RockWall', name: 'Rock wall' },
  { key: 'RustyMetal', name: 'Rusty metal' },
  { key: 'ShawnLike', name: 'Shawn-like' },
  { key: 'Skulls', name: 'Skulls' },
  { key: 'Tech', name: 'Tech' },
  { key: 'WhiteMarble', name: 'White marble' },
];

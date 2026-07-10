import type { Base, Category, Profile } from '../../shared/config';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '2e39fb9d-00cd-4b96-9791-516748d20db6',
    name: 'Doom',
    icon: '__assets/category-doom.png',
  },
  {
    id: '4af02df2-d02d-4260-bace-e37c79f4777f',
    name: 'Hexen/Heretic',
    icon: '__assets/category-hexen.png',
  },
  {
    id: 'd44a4a75-8ff8-4490-9ef0-6596b38670d1',
    name: 'Total Conversions',
    icon: '__assets/category-total-conversions.png',
  },
];

export const DEFAULT_BASES: Base[] = [
  { id: 'da3195dc-08ed-404e-ab50-8bd2db6fe652', name: 'Doom', path: '' },
  { id: 'a3a91498-f478-4528-91cd-3a27985373dc', name: 'Doom 2', path: '' },
  { id: '74c084ac-7cc9-40e8-8bd3-df2ad7692135', name: 'Heretic', path: '' },
  { id: '7bae1deb-17e7-4ac3-a8e8-b5c67ba245fa', name: 'Hexen', path: '' },
  { id: 'b1fe4df1-e06a-47de-90d2-7c825c121a4f', name: 'Plutonia', path: '' },
  { id: 'b4146132-96fe-4285-b9d3-2fcece94aa03', name: 'TNT', path: '' },
  { id: '232ebc9d-9582-4d68-a8a1-63c559104ad4', name: 'Sigil', path: '' },
];

export const DEFAULT_PROFILES: Profile[] = [];

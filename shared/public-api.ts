export const ALL_CHANNELS = [
  'settings.getAll',
  'settings.get',
  'settings.set',
  'settings.openConfig',
  'sgdb.queryGames',
  'sgdb.getImages',
  'sgdb.downloadImage',
  'category.getByName',
  'category.getCategories',
  'category.save',
  'category.delete',
  'profile.getProfiles',
  'profile.launchCustom',
  'profile.save',
  'profile.delete',
  'fileSystem.showOpenDialog',
  'fileSystem.getPathForFile',
  'fileSystem.getBase64Image',
] as const;

export type Channel = (typeof ALL_CHANNELS)[number];

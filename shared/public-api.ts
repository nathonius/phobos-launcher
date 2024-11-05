export type Channel =
  | 'settings.getAll'
  | 'settings.get'
  | 'settings.set'
  | 'sgdb.queryGames'
  | 'sgdb.getGrids'
  | 'sgdb.downloadGrid'
  | 'category.getByName'
  | 'category.getCategories'
  | 'category.save'
  | 'category.delete'
  | 'profile.getProfiles'
  | 'profile.launch'
  | 'profile.launchCustom'
  | 'profile.save'
  | 'profile.delete'
  | 'fileSystem.showOpenDialog'
  | 'fileSystem.getPathForFile'
  | 'fileSystem.getBase64Image';

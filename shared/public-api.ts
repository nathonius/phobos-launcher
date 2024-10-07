export type Channel =
  | 'category.getByName'
  | 'category.getCategoryList'
  | 'profile.getProfiles'
  | 'profile.launch'
  | 'profile.launchCustom'
  | 'profile.save'
  | 'fileSystem.showOpenDialog'
  | 'fileSystem.getPathForFile';

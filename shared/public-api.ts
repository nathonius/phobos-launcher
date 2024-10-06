export type Channel =
  | 'category.getByName'
  | 'category.getCategoryList'
  | 'profile.launch'
  | 'profile.launchCustom'
  | 'profile.save'
  | 'fileSystem.showOpenDialog'
  | 'fileSystem.getPathForFile';

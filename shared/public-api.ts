export type Channel =
  | 'category.getByName'
  | 'category.getCategoryList'
  | 'profile.getProfiles'
  | 'profile.launch'
  | 'profile.launchCustom'
  | 'profile.save'
  | 'profile.delete'
  | 'fileSystem.showOpenDialog'
  | 'fileSystem.getPathForFile'
  | 'fileSystem.getBase64Image';

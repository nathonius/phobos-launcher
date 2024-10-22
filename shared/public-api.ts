export type Channel =
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

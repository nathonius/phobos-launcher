export type Profile = string;

export type Channel =
  | 'category.getByName'
  | 'category.getCategoryList'
  | 'profile.launch'
  | 'fileSystem.showOpenDialog'
  | 'fileSystem.getPathForFile';

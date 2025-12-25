import { Api } from '../../api/api';

export async function getFilePath(
  file: File,
  getShortestPath: boolean
): Promise<string> {
  let path = Api['fileSystem.getPathForFile'](file);
  if (getShortestPath) {
    path = await Api['fileSystem.getShortestPathForFile'](path);
  }
  return path;
}

/**
 * R
 */
export async function handleDragEvent<T>(
  event: DragEvent,
  getShortestPath: boolean,
  callback: (path: string) => T
) {
  // Prevent default behavior (Prevent file from being opened)
  event.preventDefault();

  if (event.dataTransfer?.items) {
    // Use DataTransferItemList interface to access the file(s)
    const items = Array.from(event.dataTransfer.items);
    for (const item of items) {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          const path = await getFilePath(file, getShortestPath);
          callback(path);
        }
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    const files = Array.from(event.dataTransfer?.files ?? []);
    for (const file of files) {
      const path = await getFilePath(file, getShortestPath);
      callback(path);
    }
  }
}

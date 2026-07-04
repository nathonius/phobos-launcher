import { Component, effect, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import type { SearchDir } from '../../shared/config';
import { FileListComponent } from './shared/components/file-list/file-list.component';
import { Api } from './api/api';
import { FileInputComponent } from './shared/components/file-input/file-input.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    FileListComponent,
    NgClass,
    FileInputComponent,
    RouterOutlet,
    RouterLink,
  ],
})
export class AppComponent {
  readonly searchDirs = signal<SearchDir[]>([]);
  readonly subDirs = signal<{ path: string; name: string }[]>([]);
  readonly selectedSubDir = signal<string | null>(null);
  readonly subdirWads = signal<{ path: string; name: string }[]>([]);

  constructor() {
    Api['settings.get']('searchDirs').then((d) => {
      this.searchDirs.set(d ?? []);
    });
    effect(async () => {
      const searchDirs = this.searchDirs().filter(
        (w) => Boolean(w.path) && w.type === 'wad',
      );
      const subDirs: { path: string; name: string }[] = [];
      for (const dir of searchDirs) {
        const foundSubdirs = await this.readDir(dir.path);
        subDirs.push(...foundSubdirs);
      }
      this.subDirs.set(subDirs);
    });
    effect(async () => {
      const selectedSubDir = this.selectedSubDir();
      if (!selectedSubDir) {
        this.subdirWads.set([]);
        return;
      }
      const files = await Api['fileSystem.readDirectory'](selectedSubDir, {
        files: true,
        dirs: false,
        recursive: true,
      });
      this.subdirWads.set(
        files.filter(
          (f) =>
            f.path.toLowerCase().endsWith('.wad') ||
            f.path.toLowerCase().endsWith('.pk3'),
        ),
      );
    });
  }

  handlePathChange(value: string, index: number) {
    const searchDir = this.searchDirs()[index];
    searchDir.path = value;
    this.handleDirChange(searchDir, index);
  }

  handleTypeChange(value: 'wad' | 'mod', index: number) {
    const searchDir = this.searchDirs()[index];
    searchDir.type = value;
    this.handleDirChange(searchDir, index);
  }

  handleDirChange(value?: SearchDir, index?: number) {
    const newSearchDirs = [...this.searchDirs()];
    if (index !== undefined && value !== undefined) {
      newSearchDirs.splice(index, 1, value);
    } else {
      newSearchDirs.push({ path: '', type: 'wad' });
    }
    this.searchDirs.set(newSearchDirs);
    Api['settings.set']('searchDirs', newSearchDirs);
  }

  async readDir(path: string): Promise<{ path: string; name: string }[]> {
    const result = await Api['fileSystem.readDirectory'](path, {
      files: false,
      dirs: true,
      recursive: false,
    });
    return result;
  }
}

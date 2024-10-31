/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { LucideAngularModule } from 'lucide-angular';
import { FileInputComponent } from '../file-input/file-input.component';
import { Api } from '../../../api/api';
import { ListComponentBase } from '../../classes/ListComponentBase';

@Component({
  selector: 'file-list',
  standalone: true,
  imports: [LucideAngularModule, FileInputComponent, ReactiveFormsModule],
  templateUrl: './file-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent extends ListComponentBase<string> {
  public readonly valueChange = output<string[]>();
  public readonly values = input.required<string[]>();
  protected readonly dragging = signal(false);
  private dragTimeout: number | undefined = undefined;

  handleAdd(path?: string): void {
    const newValues = [...this.values()];
    newValues.push(path ?? '');
    this.valueChange.emit(newValues);
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    window.clearTimeout(this.dragTimeout);
    this.dragging.set(true);
  }

  handleDragOut() {
    // Do this on a timeout to help prevent flickering
    window.clearTimeout(this.dragTimeout);
    this.dragTimeout = window.setTimeout(() => {
      this.dragging.set(false);
    }, 100);
  }

  handleDrop(event: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    if (event.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...event.dataTransfer.items].forEach((item) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const path = Api['fileSystem.getPathForFile'](file);
            this.handleAdd(path);
          }
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...(event.dataTransfer?.files ?? [])].forEach((file) => {
        const path = Api['fileSystem.getPathForFile'](file);
        this.handleAdd(path);
      });
    }
    this.dragging.set(false);
  }
}

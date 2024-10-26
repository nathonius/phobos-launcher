/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { FormArray } from '@angular/forms';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import {
  LucideAngularModule,
  FileIcon,
  FolderIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from 'lucide-angular';
import type { Subscription } from 'rxjs';
import { FileInputComponent } from '../file-input/file-input.component';
import { Api } from '../../../api/api';

@Component({
  selector: 'file-list',
  standalone: true,
  imports: [LucideAngularModule, FileInputComponent, ReactiveFormsModule],
  templateUrl: './file-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent {
  public readonly remove = output<number>();
  public readonly change = output<string[]>();
  public readonly filePaths = input.required<FormArray<FormControl<string>>>();
  protected readonly icons = {
    FileIcon,
    FolderIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon,
  };
  protected readonly dragging = signal(false);
  private dragTimeout: number | undefined = undefined;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private changeSubscription: Subscription | undefined = undefined;

  constructor() {
    effect(() => {
      const filePaths = this.filePaths();
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
      }
      this.changeSubscription = filePaths.valueChanges.subscribe((_) => {
        this.changeDetector.markForCheck();
      });
    });
  }

  handleAdd(path?: string): void {
    this.filePaths().push(
      new FormControl<string>(path ?? '', { nonNullable: true })
    );
  }

  handleRemove(index: number): void {
    this.filePaths().removeAt(index);
  }

  handleReorderUp(index: number): void {
    if (index !== 0) {
      const filePaths = this.filePaths();
      const prevItem = filePaths.at(index - 1);
      const item = filePaths.at(index);
      filePaths.setControl(index - 1, item);
      filePaths.setControl(index, prevItem);
    }
  }

  handleReorderDown(index: number): void {
    if (index !== this.filePaths.length - 1) {
      const filePaths = this.filePaths();
      const nextItem = filePaths.at(index + 1);
      const item = filePaths.at(index);
      filePaths.setControl(index + 1, item);
      filePaths.setControl(index, nextItem);
    }
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

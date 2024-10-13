/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
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

@Component({
  selector: 'file-list',
  standalone: true,
  imports: [LucideAngularModule, FileInputComponent, ReactiveFormsModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css',
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

  handleAdd(): void {
    this.filePaths().push(new FormControl<string>('', { nonNullable: true }));
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
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElementRef } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import {
  LucideAngularModule,
  FileIcon,
  FolderIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-angular';
import { DOCUMENT } from '@angular/common';
import { Api } from '../../../api/api';

let idCount = 0;

@Component({
  selector: 'file-input',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './file-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputComponent implements ControlValueAccessor {
  public readonly label = input<string>();
  public readonly placeholder = input<string>();
  public readonly directory = input(true, { transform: booleanAttribute });
  public readonly file = input(true, { transform: booleanAttribute });
  public readonly removable = input(false, { transform: booleanAttribute });
  public readonly reorder = input(false, { transform: booleanAttribute });
  public readonly droppable = input(false, { transform: booleanAttribute });
  public readonly remove = output();
  public readonly valueChange = output<string>();
  public readonly reorderUp = output();
  public readonly reorderDown = output();
  protected readonly _placeholder = computed(
    () => this.placeholder() ?? this.label() ?? ''
  );
  protected readonly icons = {
    FileIcon,
    FolderIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
  };
  protected readonly textInput =
    viewChild<ElementRef<HTMLInputElement>>('textInput');
  protected readonly fileTargetId = `file-target-${++idCount}`;
  protected readonly filePath = signal<string>('');
  protected readonly dragging = signal(false);
  protected readonly isDisabled = signal<boolean>(false);
  protected readonly _document = inject(DOCUMENT);

  protected onChange: (value: string) => void = () => {
    // pass
  };
  protected onTouch: () => void = () => {
    // pass
  };

  private dragTimeout: number | undefined = undefined;

  constructor() {
    effect(() => {
      const path = this.filePath();
      this.valueChange.emit(path);
      this.onChange(path);
    });
  }

  async handleSelectFile() {
    const { filePaths } = await Api['fileSystem.showOpenDialog']({
      properties: ['openFile'],
    });
    if (filePaths.length > 0) {
      this.writeValue(filePaths[0]);
    }
  }

  async handleSelectDirectory() {
    const { filePaths } = await Api['fileSystem.showOpenDialog']({
      properties: ['openDirectory'],
    });
    if (filePaths.length > 0) {
      this.writeValue(filePaths[0]);
    }
  }

  handleTextChange() {
    const text = this.textInput()?.nativeElement.value;
    if (text !== undefined) {
      this.writeValue(text);
    }
  }

  writeValue(value: unknown): void {
    if (typeof value === 'string') {
      this.filePath.set(value);
    } else if (value instanceof File) {
      this.filePath.set(Api['fileSystem.getPathForFile'](value));
    }
  }

  handleDragOver(event: DragEvent) {
    if (this.droppable()) {
      event.preventDefault();
      window.clearTimeout(this.dragTimeout);
      this.dragging.set(true);
    }
  }

  handleDragOut() {
    if (this.droppable()) {
      // Do this on a timeout to help prevent flickering
      window.clearTimeout(this.dragTimeout);
      this.dragTimeout = window.setTimeout(() => {
        this.dragging.set(false);
      }, 100);
    }
  }

  handleDrop(event: DragEvent) {
    if (this.droppable()) {
      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();

      if (event.dataTransfer?.items.length ?? 0 > 0) {
        const item = event.dataTransfer!.items[0];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const path = Api['fileSystem.getPathForFile'](file);
            this.writeValue(path);
          }
        }
      } else if (event.dataTransfer?.files.length ?? 0 > 0) {
        const file = event.dataTransfer!.files[0];
        // Use DataTransfer interface to access the file(s)
        const path = Api['fileSystem.getPathForFile'](file);
        this.writeValue(path);
      }
      this.dragging.set(false);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}

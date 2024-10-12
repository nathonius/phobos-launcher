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
} from 'lucide-angular';
import { DOCUMENT } from '@angular/common';
import { Api } from '../../../api/api';

let idCount = 0;

@Component({
  selector: 'file-input',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.css',
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
  public readonly remove = output();
  protected readonly _placeholder = computed(
    () => this.placeholder() ?? this.label() ?? ''
  );
  protected readonly icons = {
    FileIcon,
    FolderIcon,
    TrashIcon,
  };
  protected readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly textInput =
    viewChild<ElementRef<HTMLInputElement>>('textInput');
  protected readonly fileTargetId = `file-target-${++idCount}`;
  protected readonly filePath = signal<string>('');
  protected readonly isDisabled = signal<boolean>(false);
  protected readonly _document = inject(DOCUMENT);

  protected onChange: (value: string) => void = () => {
    // pass
  };
  protected onTouch: () => void = () => {
    // pass
  };

  constructor() {
    effect(() => {
      const path = this.filePath();
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

  handleFileDrop() {
    const file = this.fileInput()?.nativeElement.files?.[0];
    if (file) {
      this.writeValue(file);
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

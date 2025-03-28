import type { OutputEmitterRef, Signal } from '@angular/core';
import { ArrowDown, ArrowUp, File, Folder, Plus, Trash } from 'lucide-angular';

export abstract class ListComponentBase<T = string> {
  public abstract readonly valueChange: OutputEmitterRef<T[]>;
  public abstract readonly values: Signal<T[]>;
  protected readonly icons = {
    File,
    Folder,
    Trash,
    ArrowUp,
    ArrowDown,
    Plus,
  };

  handleRemove(index: number): void {
    const newValues = [...this.values()];
    newValues.splice(index, 1);
    this.valueChange.emit(newValues);
  }

  handleChange(index: number, value: T) {
    const newValues = [...this.values()];
    newValues[index] = value;
    this.valueChange.emit(newValues);
  }

  handleReorderUp(index: number): void {
    if (index !== 0) {
      const newValues = [...this.values()];
      const temp = newValues[index - 1];
      newValues[index - 1] = newValues[index];
      newValues[index] = temp;
      this.valueChange.emit(newValues);
    }
  }

  handleReorderDown(index: number): void {
    const newValues = this.values();
    if (index !== newValues.length - 1) {
      const temp = newValues[index + 1];
      newValues[index + 1] = newValues[index];
      newValues[index] = temp;
      this.valueChange.emit(newValues);
    }
  }
}

import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
  name: 'console',
  standalone: true,
})
export class ConsolePipe implements PipeTransform {
  transform(value: unknown, ..._args: unknown[]): unknown {
    console.log(value);
    return null;
  }
}

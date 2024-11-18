import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ListComponentBase } from '../../classes/ListComponentBase';
import { TagComponent } from '../tag/tag.component';

@Component({
  selector: 'tag-list',
  standalone: true,
  imports: [ReactiveFormsModule, TagComponent, LucideAngularModule],
  templateUrl: './tag-list.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListComponent extends ListComponentBase<string> {
  public valueChange = output<string[]>();
  public values = input<string[]>([]);
  protected readonly formGroup = new FormGroup({
    tag: new FormControl<string>('', { nonNullable: true }),
  });
  protected handleSubmit() {
    const newTag = this.formGroup.controls.tag.value;
    if (newTag) {
      this.valueChange.emit([...this.values(), newTag]);
      this.formGroup.reset();
    }
  }
}

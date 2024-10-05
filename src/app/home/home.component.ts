import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Api } from '../api/api';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FileInputComponent],
})
export class HomeComponent implements OnInit {
  protected readonly form = new FormGroup({
    engine: new FormControl<string | null>(null),
    base: new FormControl<string | null>(null),
    files: new FormArray<FormControl<string>>([]),
  });

  protected launch() {
    const { engine, base, files } = this.form.value;
    const config = {
      engine: engine!,
      base: base!,
      files: files!,
    };
    console.log(config);
    void Api['profile.launchCustom'](config);
  }

  ngOnInit(): void {}

  addFile() {
    this.form.controls.files.push(
      new FormControl<string>('', { nonNullable: true })
    );
  }

  handleDrop(event: DragEvent) {
    const target = event.target as HTMLInputElement;
    console.log(target.files);
  }
}

import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import {NgxsmkTelInputComponent} from '../../../ngxsmk-tel-input/src/lib/ngxsmk-tel-input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, NgxsmkTelInputComponent],
  template: `
    <form [formGroup]="fg" style="max-width:420px;padding:16px;display:block;gap:12px">
      <label for="phone">Phone</label>
      <ngxsmk-tel-input id="phone" formControlName="phone"></ngxsmk-tel-input>
      <pre style="margin-top:12px">{{ fg.value | json }}</pre>
    </form>
  `
})
export class AppComponent {
  fg: ReturnType<FormBuilder['group']>;
  constructor(private readonly fb: FormBuilder) {
    this.fg = this.fb.group({ phone: ['', Validators.required] }); // init in ctor (no TS2729)
  }
}

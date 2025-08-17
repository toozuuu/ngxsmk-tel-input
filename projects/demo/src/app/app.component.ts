import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent } from '../../../ngxsmk-tel-input/src/lib/ngxsmk-tel-input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxsmkTelInputComponent],
  template: `
    <form [formGroup]="fg" style="max-width:420px;display:grid;gap:12px">
      <ngxsmk-tel-input
        formControlName="phone"
        label="Phone"
        hint="Include area code"
        [initialCountry]="'US'"
        [preferredCountries]="['US','GB','AU']"
        (countryChange)="onCountry($event)">
      </ngxsmk-tel-input>
      <pre>Value: {{ fg.value | json }}</pre>
    </form>
  `
})
export class AppComponent {
  fg: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.fg = this.fb.group({
      phone: ['', Validators.required]
    });
  }

  onCountry(e: { iso2: any }) { console.log('Country changed:', e.iso2); }

}

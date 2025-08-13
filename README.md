# ngxsmk-tel-input

An Angular **telephone input** component with country dropdown, flag icons, and robust validation/formatting.
Wraps [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input) for UI and uses [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js) for parsing & validation. Implements `ControlValueAccessor` so it plugs right into Angular Forms.

> Emits E.164 numbers by default (e.g., `+14155550123`). SSR-safe via lazy imports.

---

## Features

* ✅ Country dropdown with flags
* ✅ E.164 output (configurable for national numbers)
* ✅ Works with Reactive/Template-driven Forms (`ControlValueAccessor`)
* ✅ Built-in validation (uses `libphonenumber-js`)
* ✅ SSR-friendly (lazy `intl-tel-input` import)
* ✅ Tiny API surface, easy to theme

---

## Requirements

* Angular **17+**
* Node **18+** / **20+**

---

## Install

```bash
# your app
npm i ngxsmk-tel-input intl-tel-input libphonenumber-js
```

### Add styles & assets

`intl-tel-input` ships its own CSS and flag images. Add them to your app’s `angular.json`:

```jsonc
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/intl-tel-input/build/css/intlTelInput.css"
            ],
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/intl-tel-input/build/img",
                "output": "assets/intl-tel-input/img"
              }
            ]
          }
        }
      }
    }
  }
}
```

> If you use a custom builder, copy the flags folder to `/assets/intl-tel-input/img`.

---

## Quick start (Reactive Forms)

```ts
// app.component.ts
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TelInputComponent } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, TelInputComponent],
  template: `
    <form [formGroup]="fg" class="space-y-3">
      <label for="phone">Phone</label>
      <ngxsmk-tel-input
        id="phone"
        formControlName="phone"
        [initialCountry]="'US'"
        [preferredCountries]="['US','GB','AU']"
        (countryChange)="onCountry($event)">
      </ngxsmk-tel-input>

      <p *ngIf="fg.get('phone')?.hasError('phoneInvalid') && fg.get('phone')?.touched">
        Please enter a valid phone number.
      </p>

      <pre>Value: {{ fg.value | json }}</pre>
    </form>
  `
})
export class AppComponent {
  fg = this.fb.group({
    phone: ['', Validators.required] // control value will be E.164 string or null
  });
  constructor(private fb: FormBuilder) {}
  onCountry(e: { iso2: any }) { console.log('Country changed:', e.iso2); }
}
```

**Result:** `form.get('phone')?.value` → `'+14155550123'` (E.164) when valid, or `null` while empty/invalid.

---

## Template-driven usage

```html
<form #f="ngForm">
  <ngxsmk-tel-input name="phone" [(ngModel)]="phone"></ngxsmk-tel-input>
</form>

<!-- phone is a string (E.164) or null -->
```

---

## API

### Inputs

| Name                 | Type                    | Default                | Description                                         |
| -------------------- | ----------------------- | ---------------------- | --------------------------------------------------- |
| `initialCountry`     | `CountryCode \| 'auto'` | `'auto'`               | Starting country. `'auto'` uses the plugin default. |
| `preferredCountries` | `CountryCode[]`         | `['US','GB']`          | Pinned countries at the top.                        |
| `onlyCountries`      | `CountryCode[]`         | `undefined`            | Restrict selectable countries.                      |
| `nationalMode`       | `boolean`               | `false`                | If `true`, emits national numbers; otherwise E.164. |
| `placeholder`        | `string`                | `'Enter phone number'` | Input placeholder.                                  |
| `autocomplete`       | `string`                | `'tel'`                | Native autocomplete attribute.                      |
| `disabled`           | `boolean`               | `false`                | Disables the input.                                 |

> `CountryCode` is the ISO-2 uppercase code from `libphonenumber-js` (e.g., `US`, `GB`, `AU`).

### Outputs

| Event           | Payload                 | Description                              |
| --------------- | ----------------------- | ---------------------------------------- |
| `countryChange` | `{ iso2: CountryCode }` | Fires when the selected country changes. |

### Value semantics

* **When valid:** emits **E.164** string (e.g., `+33123456789`) unless `nationalMode` is `true`.
* **When empty or invalid:** emits `null`.
* **Validation:** adds `phoneInvalid` error key when the input cannot be parsed as a valid number for the selected country.

---

## Validation examples

```html
<ngxsmk-tel-input formControlName="phone"></ngxsmk-tel-input>

<div class="error" *ngIf="fg.get('phone')?.hasError('required')">
  Phone is required
</div>
<div class="error" *ngIf="fg.get('phone')?.hasError('phoneInvalid')">
  Please enter a valid phone number
</div>
```

---

## Accessibility

* Pair with a `<label for="phone">` or wrap the input and label together.
* The country dropdown is keyboard navigable (via `intl-tel-input`).
* Consider additional ARIA attributes if you customize the template.

---

## Theming

The component applies a minimal class to the input: `.ngxsmk-tel-input`.
You can style it or the `intl-tel-input` container globally:

```css
.ngxsmk-tel-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
}

.iti {
  width: 100%; /* make dropdown stretch */
}
```

---

## SSR notes

This library lazily imports `intl-tel-input` **only in the browser**.
No special setup required for Angular Universal. If you still see SSR errors, ensure you’re not referencing `window` in your own wrappers.

---

## Troubleshooting

* **No flags / broken images**
  Ensure `angular.json` asset mapping is present and that the output path matches your app’s `/assets` directory.

* **Styles not applied**
  Add `"node_modules/intl-tel-input/build/css/intlTelInput.css"` to the `styles` array in `angular.json`.

* **Form value doesn’t update**
  Use Angular Forms APIs (Reactive or Template-driven). For Reactive Forms, confirm the control is bound via `formControlName` and that `ReactiveFormsModule` is imported.

* **Always invalid**
  Some numbers are only valid with the correct country selected. Try typing with the `+` international prefix or set `initialCountry` appropriately.

---

## Example: national mode

```html
<ngxsmk-tel-input formControlName="phone" [nationalMode]="true" [initialCountry]="'GB'"></ngxsmk-tel-input>
<!-- Value will be a national format string like '020 7946 0958' with validation tied to the selected country -->
```

> When using `nationalMode=true`, you’ll typically store the country code alongside the value, using `(countryChange)`.

---

## Development

This repo is structured as an Angular workspace with a library:

```bash
# Build the library
ng build ngxsmk-tel-input

# (Optional) create a demo app and try it locally
ng g application demo
# import TelInputComponent in your demo app and test
```

---

## Publish

```bash
# Bump version, then:
ng build ngxsmk-tel-input
cd dist/ngxsmk-tel-input
npm publish --access public
```

> Ensure `peerDependencies` in the library’s `package.json` reflect your Angular support range.

---

## Contributing

PRs welcome! Please:

1. Run `npm ci` and `ng build`.
2. Add/adjust unit or e2e tests if you change behavior.
3. Update this README for any API changes.

---

## License

[MIT](./LICENSE)

---

## Credits

* UI powered by [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input)
* Parsing/validation by [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js)

---

### Appendix: `angular.json` snippet (copy-paste)

```jsonc
{
  "styles": [
    "node_modules/intl-tel-input/build/css/intlTelInput.css"
  ],
  "assets": [
    {
      "glob": "**/*",
      "input": "node_modules/intl-tel-input/build/img",
      "output": "assets/intl-tel-input/img"
    }
  ]
}
```

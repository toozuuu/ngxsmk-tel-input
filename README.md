# ngxsmk-tel-input

An Angular **telephone input** component with country dropdown, flags, and robust validation/formatting.
Wraps [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input) for the UI and [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js) for parsing/validation. Implements `ControlValueAccessor` so it plugs into Angular Forms.

> Emits **E.164** by default (e.g. `+14155550123`). SSR‑safe via lazy browser‑only import.

---

## Screenshots

<p align="left">
  <img src="data:image/png;base64,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" alt="Valid phone number - formatted and passing validation" width="420" />
  &nbsp;&nbsp;
  <img src="data:image/png;base64,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" alt="Invalid phone number - error state and null value" width="420" />
</p>

---

## ✨ Features

* Country dropdown with flags
* E.164 output (display can be national with `nationalMode`)
* Reactive & template‑driven Forms support (CVA)
* Built‑in validation using libphonenumber‑js
* SSR‑friendly (no `window` on the server)
* Easy theming via CSS variables
* Nice UX options: label/hint/error text, sizes, variants, clear button, autofocus, select-on-focus

---

## ✅ Requirements

* Angular **17 – 19**
* Node **18** or **20**

> Library `peerDependencies` target Angular `>=17 <20`. Your app can be 17, 18, or 19.

---

## 📦 Install

```bash
npm i ngxsmk-tel-input intl-tel-input libphonenumber-js
```

### Add styles & flag assets (in your **app**, not the library)

Update your app’s `angular.json`:

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
              { "glob": "**/*", "input": "node_modules/intl-tel-input/build/img", "output": "assets/intl-tel-input/img" }
            ]
          }
        }
      }
    }
  }
}
```

Optional override to ensure flags resolve (e.g., Vite/Angular 17+): add to your global styles

```css
.iti__flag { background-image: url("/assets/intl-tel-input/img/flags.png"); }
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .iti__flag { background-image: url("/assets/intl-tel-input/img/flags@2x.png"); }
}
```

Restart the dev server after changes.

---

## 🚀 Quick start (Reactive Forms)

```ts
// app.component.ts
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsmkTelInputComponent],
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

      <p class="err" *ngIf="fg.get('phone')?.hasError('phoneInvalid') && fg.get('phone')?.touched">
        Please enter a valid phone number.
      </p>

      <pre>Value: {{ fg.value | json }}</pre>
    </form>
  `
})
export class AppComponent {
  fg = this.fb.group({ phone: ['', Validators.required] });
  constructor(private readonly fb: FormBuilder) {}
  onCountry(e: { iso2: any }) { console.log('country:', e.iso2); }
}
```

**Value semantics:** the form control value is **E.164** (e.g., `+14155550123`) when valid, or `null` when empty/invalid.

---

## 📝 Template‑driven usage

```html
<form #f="ngForm">
  <ngxsmk-tel-input name="phone" [(ngModel)]="phone"></ngxsmk-tel-input>
</form>
<!-- phone is an E.164 string or null -->
```

---

## ⚙️ API

### Inputs

| Name                   | Type                                   | Default                | Description                                                                   |
| ---------------------- | -------------------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `initialCountry`       | `CountryCode \| 'auto'`                | `'US'`                 | Starting country. `'auto'` uses geoIp stub (`US` by default).                 |
| `preferredCountries`   | `CountryCode[]`                        | `['US','GB']`          | Pin these at the top.                                                         |
| `onlyCountries`        | `CountryCode[]`                        | —                      | Limit selectable countries.                                                   |
| `nationalMode`         | `boolean`                              | `false`                | If `true`, **display** national format in the input. Value still emits E.164. |
| `separateDialCode`     | `boolean`                              | `false`                | Show dial code outside the input.                                             |
| `allowDropdown`        | `boolean`                              | `true`                 | Enable/disable dropdown.                                                      |
| `placeholder`          | `string`                               | `'Enter phone number'` | Input placeholder.                                                            |
| `autocomplete`         | `string`                               | `'tel'`                | Native autocomplete.                                                          |
| `disabled`             | `boolean`                              | `false`                | Disable the control.                                                          |
| `label`                | `string`                               | —                      | Optional floating label text.                                                 |
| `hint`                 | `string`                               | —                      | Helper text below the control.                                                |
| `errorText`            | `string`                               | —                      | Custom error text.                                                            |
| `size`                 | `'sm' \| 'md' \| 'lg'`                 | `'md'`                 | Control height/typography.                                                    |
| `variant`              | `'outline' \| 'filled' \| 'underline'` | `'outline'`            | Visual variant.                                                               |
| `showClear`            | `boolean`                              | `true`                 | Show a clear (×) button when not empty.                                       |
| `autoFocus`            | `boolean`                              | `false`                | Focus on init.                                                                |
| `selectOnFocus`        | `boolean`                              | `false`                | Select all text on focus.                                                     |
| `formatOnBlur`         | `boolean`                              | `true`                 | Pretty‑print on blur (national if `nationalMode`).                            |
| `showErrorWhenTouched` | `boolean`                              | `true`                 | Show error styles only after blur.                                            |
| `dropdownAttachToBody` | `boolean`                              | `true`                 | Attach dropdown to `<body>` (avoids clipping/overflow).                       |
| `dropdownZIndex`       | `number`                               | `2000`                 | Z‑index for dropdown panel.                                                   |

> `CountryCode` is the ISO‑2 uppercase code from `libphonenumber-js` (e.g. `US`, `GB`).

### Outputs

| Event            | Payload                                                    | Description                          |
| ---------------- | ---------------------------------------------------------- | ------------------------------------ |
| `countryChange`  | `{ iso2: CountryCode }`                                    | Fired when selected country changes. |
| `validityChange` | `boolean`                                                  | Fired when validity flips.           |
| `inputChange`    | `{ raw: string; e164: string \| null; iso2: CountryCode }` | Emitted on every keystroke.          |

### Public methods

* `focus(): void`
* `selectCountry(iso2: CountryCode): void`

---

## 🎨 Theming (CSS variables)

Override on the element or a parent container:

```html
<ngxsmk-tel-input style="
  --tel-border:#cbd5e1;
  --tel-ring:#22c55e;
  --tel-radius:14px;
  --tel-dd-item-hover: rgba(34,197,94,.12);
  --tel-dd-z: 3000;
"></ngxsmk-tel-input>
```

Available tokens:

* Input: `--tel-bg`, `--tel-fg`, `--tel-border`, `--tel-border-hover`, `--tel-ring`, `--tel-placeholder`, `--tel-error`, `--tel-radius`, `--tel-focus-shadow`
* Dropdown: `--tel-dd-bg`, `--tel-dd-border`, `--tel-dd-shadow`, `--tel-dd-radius`, `--tel-dd-item-hover`, `--tel-dd-search-bg`, `--tel-dd-z`

Dark mode: wrap in a `.dark` parent — tokens adapt automatically.

---

## ✔️ Validation patterns

```html
<ngxsmk-tel-input formControlName="phone"></ngxsmk-tel-input>

<div class="error" *ngIf="fg.get('phone')?.hasError('required')">Phone is required</div>
<div class="error" *ngIf="fg.get('phone')?.hasError('phoneInvalid')">Please enter a valid phone number</div>
```

* When **valid** → control value = **E.164** string
* When **invalid/empty** → value = **null**, and validator sets `{ phoneInvalid: true }`

> Need national string instead of E.164? Use `(inputChange)` and store `raw`/`national` yourself, or adapt the emitter to output national.

---

## 🌐 SSR notes

* The library lazy‑imports `intl-tel-input` only in the **browser** (guards with `isPlatformBrowser`).
* No `window`/`document` usage on the server path.

---

## 🧪 Local development

This repo is an Angular workspace with a library.

```bash
# Build the library
ng build ngxsmk-tel-input

# Option A: use it inside a demo app in the same workspace
ng serve demo

# Option B: install locally via tarball in another app
cd dist/ngxsmk-tel-input && npm pack
# in your other app
npm i ../path-to-workspace/dist/ngxsmk-tel-input/ngxsmk-tel-input-<version>.tgz
```

> Workspace aliasing via `tsconfig.paths` also works (map `"ngxsmk-tel-input": ["dist/ngxsmk-tel-input"]`).

---

## 🧯 Troubleshooting

**UI looks unstyled / bullets in dropdown**
Add the CSS and assets in `angular.json` (see Install). Restart the dev server.

**Flags don’t show**
Ensure the assets copy exists under `/assets/intl-tel-input/img` and add the CSS override block above.

**`TS2307: Cannot find module 'ngxsmk-tel-input'`**
Build the library first so `dist/ngxsmk-tel-input` exists. If using workspace aliasing, add a `paths` entry to the root `tsconfig.base.json`.

**Peer dependency conflict when installing**
The lib peers are `@angular/* >=17 <20`. Upgrade your app or install a compatible version.

**Vite/Angular “Failed to resolve import …”**
Clear `.angular/cache`, rebuild the lib, and restart `ng serve`.

---

## 📃 License

[MIT](./LICENSE)

## 🙌 Credits

* UI powered by [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input)
* Parsing & validation by [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js)

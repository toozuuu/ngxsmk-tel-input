# ngxsmk-tel-input

An Angular **telephone input** component with country dropdown, flags, and robust validation/formatting.
Wraps [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input) for the UI and [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js) for parsing/validation. Implements `ControlValueAccessor` so it plugs into Angular Forms.

> Emits **E.164** by default (e.g. `+14155550123`). SSR‑safe via lazy browser‑only import.

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

## 🛫 Publish

```bash
# bump version in projects/ngxsmk-tel-input/package.json
ng build ngxsmk-tel-input
cd dist/ngxsmk-tel-input
npm publish --access public
```

> If you get `403 You cannot publish over the previously published versions`, bump the version (SemVer).

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

# ngxsmk-tel-input — International Telephone Input for Angular

[![npm version](https://img.shields.io/npm/v/ngxsmk-tel-input)](https://www.npmjs.com/package/ngxsmk-tel-input)
[![npm downloads](https://img.shields.io/npm/dm/ngxsmk-tel-input)](https://www.npmjs.com/package/ngxsmk-tel-input)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/toozuuu/ngxsmk-tel-input/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/toozuuu/ngxsmk-tel-input?style=social)](https://github.com/toozuuu/ngxsmk-tel-input)

An Angular component for entering and validating **international telephone numbers**. It adds a country flag dropdown, formats input, and validates using real numbering rules.

* UI powered by [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input)
* Parsing & validation via [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js)
* Implements Angular **ControlValueAccessor** (works with Reactive & Template‑driven Forms)

> Emits **E.164** by default (e.g. `+14155550123`). SSR‑safe via lazy, browser‑only import.

---

## Screenshots

<p align="left">
  <img src="https://unpkg.com/ngxsmk-tel-input@1.0.4/docs/valid.png" alt="Valid phone number" width="420" />
  &nbsp;&nbsp;
  <img src="https://unpkg.com/ngxsmk-tel-input@1.0.4/docs/invalid.png" alt="Invalid phone number" width="420" />
</p>

---

## Compatibility

| ngxsmk-tel-input | Angular         |
|------------------| --------------- |
| `1.0.x`          | `17.x` – `19.x` |

> The library declares `peerDependencies` of `@angular/* >=17 <20`.

---

## Installation

### 1) Install dependencies

```bash
npm i ngxsmk-tel-input intl-tel-input libphonenumber-js
```

### 2) Add styles & flag assets (in your **app**, not the library)

Add intl‑tel‑input CSS and copy its flag images via `angular.json`:

```jsonc
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/intl-tel-input/build/css/intlTelInput.css",
              "src/styles.css"
            ],
            "assets": [
              { "glob": "**/*", "input": "src/assets" },
              { "glob": "**/*", "input": "node_modules/intl-tel-input/build/img", "output": "assets/intl-tel-input/img" }
            ]
          }
        }
      }
    }
  }
}
```

Optional (helps some bundlers resolve flags): add to your global styles

```css
.iti__flag { background-image: url("/assets/intl-tel-input/img/flags.png"); }
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .iti__flag { background-image: url("/assets/intl-tel-input/img/flags@2x.png"); }
}
```

Restart your dev server after editing `angular.json`.

---

## Usage

### Reactive Forms

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

      <p *ngIf="fg.get('phone')?.hasError('phoneInvalid') && fg.get('phone')?.touched">
        Please enter a valid phone number.
      </p>

      <pre>Value: {{ fg.value | json }}</pre>
    </form>
  `
})
export class AppComponent {
  fg = this.fb.group({ phone: ['', Validators.required] });
  constructor(private readonly fb: FormBuilder) {}
  onCountry(e: { iso2: any }) { console.log('Country changed:', e.iso2); }
}
```

**Value semantics:** The control emits **E.164** when valid, or `null` when empty/invalid.

### Template‑driven

```html
<form #f="ngForm">
  <ngxsmk-tel-input name="phone" [(ngModel)]="phone"></ngxsmk-tel-input>
</form>
```

---

## Options (Inputs)

| Option                 | Type                                   | Default                | Description                                                            |
| ---------------------- | -------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `initialCountry`       | `CountryCode \| 'auto'`                | `'US'`                 | Starting country. `'auto'` uses a simple geo‑IP stub (defaults to US). |
| `preferredCountries`   | `CountryCode[]`                        | `['US','GB']`          | Countries pinned at the top.                                           |
| `onlyCountries`        | `CountryCode[]`                        | —                      | Restrict selectable countries.                                         |
| `nationalMode`         | `boolean`                              | `false`                | Display national format in the box. Value still emits E.164.           |
| `separateDialCode`     | `boolean`                              | `false`                | Show dial code separately to the left.                                 |
| `allowDropdown`        | `boolean`                              | `true`                 | Enable/disable country dropdown.                                       |
| `placeholder`          | `string`                               | `'Enter phone number'` | Input placeholder.                                                     |
| `autocomplete`         | `string`                               | `'tel'`                | Native autocomplete attribute.                                         |
| `disabled`             | `boolean`                              | `false`                | Disable the control.                                                   |
| `label`                | `string`                               | —                      | Optional label text.                                                   |
| `hint`                 | `string`                               | —                      | Helper text shown below.                                               |
| `errorText`            | `string`                               | —                      | Custom error message.                                                  |
| `size`                 | `'sm' \| 'md' \| 'lg'`                 | `'md'`                 | Preset sizing.                                                         |
| `variant`              | `'outline' \| 'filled' \| 'underline'` | `'outline'`            | Visual style.                                                          |
| `showClear`            | `boolean`                              | `true`                 | Show a clear (×) button when not empty.                                |
| `autoFocus`            | `boolean`                              | `false`                | Focus on init.                                                         |
| `selectOnFocus`        | `boolean`                              | `false`                | Select text on focus.                                                  |
| `formatOnBlur`         | `boolean`                              | `true`                 | Pretty‑print on blur (national if `nationalMode`).                     |
| `showErrorWhenTouched` | `boolean`                              | `true`                 | Only show error styles after the control is touched.                   |
| `dropdownAttachToBody` | `boolean`                              | `true`                 | Attach dropdown to `<body>` to avoid clipping.                         |
| `dropdownZIndex`       | `number`                               | `2000`                 | Z‑index for dropdown panel.                                            |

> `CountryCode` is the ISO‑2 code from `libphonenumber-js` (e.g. `US`, `GB`).

### Outputs (Events)

| Event            | Payload                                                    | Description                              |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `countryChange`  | `{ iso2: CountryCode }`                                    | Fires when the selected country changes. |
| `validityChange` | `boolean`                                                  | Emits when validity toggles.             |
| `inputChange`    | `{ raw: string; e164: string \| null; iso2: CountryCode }` | Emitted on each input.                   |

### Public Methods

* `focus(): void`
* `selectCountry(iso2: CountryCode): void`

---

## Supported Formats

* **E164** → `+41446681800`
* **International** (display) → `+41 44 668 18 00`
* **National** (display) → `044 668 18 00`

> The control **emits E.164** by default. If you need the currently typed format too, use `(inputChange)`.

---

## Theming & Styling

This component exposes CSS variables for quick theming:

```html
<ngxsmk-tel-input style="
  --tel-border:#cbd5e1;
  --tel-ring:#2563eb;
  --tel-radius:12px;
  --tel-dd-item-hover: rgba(37,99,235,.08);
  --tel-dd-z: 3000;
"></ngxsmk-tel-input>
```

Key variables: `--tel-bg`, `--tel-fg`, `--tel-border`, `--tel-border-hover`, `--tel-ring`, `--tel-placeholder`, `--tel-error`, `--tel-radius`, `--tel-focus-shadow`, `--tel-dd-bg`, `--tel-dd-border`, `--tel-dd-shadow`, `--tel-dd-radius`, `--tel-dd-item-hover`, `--tel-dd-search-bg`, `--tel-dd-z`.

Dark mode: wrap in a `.dark` container; tokens adapt.

---

## SSR

The library guards `intl-tel-input` import behind `isPlatformBrowser`, so Angular Universal builds won’t try to access `window` during SSR.

---

## Local Development

This repository is an Angular workspace with a library.

```bash
# Build the library
ng build ngxsmk-tel-input

# Try it in a demo app inside the workspace
ng serve demo

# Or pack and install in another app locally
cd dist/ngxsmk-tel-input && npm pack

# in your other app
npm i ../path/to/dist/ngxsmk-tel-input/ngxsmk-tel-input-<version>.tgz
```

Tip: you can also map a workspace path alias in `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "ngxsmk-tel-input": ["dist/ngxsmk-tel-input"]
    }
  }
}
```

---

## Troubleshooting

* **Unstyled dropdown / bullets / missing flags** → Ensure CSS & assets are added in your app’s `angular.json`, then restart the dev server.
* **`TS2307: Cannot find module 'ngxsmk-tel-input'`** → Build the library first so `dist/ngxsmk-tel-input` exists (or install from npm).
* **Peer dependency conflict** → Your app must be Angular 17–19 to satisfy peers.
* **Dropdown clipped by parent** → Keep `dropdownAttachToBody=true` or raise `dropdownZIndex`.

---

## Contributing

PRs welcome! Please:

1. `npm ci` and `ng build`
2. Cover behavior changes with tests if possible
3. Update README for any API changes

This project is open to using the [all-contributors](https://github.com/all-contributors/all-contributors) spec. Contributions of any kind welcome!

---

## License

[MIT](./LICENSE)

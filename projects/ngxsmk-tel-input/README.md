# ngxsmk-tel-input

An Angular **telephone input** with country dropdown, flags, formatting and validation.

* UI: [`intl-tel-input`](https://github.com/jackocnr/intl-tel-input)
* Parsing/validation: [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js)
* Forms: Implements **ControlValueAccessor** (Reactive & Template‑driven)
* Output: Emits **E.164** (e.g. `+14155550123`) when valid

---

## Requirements

* Angular **17 – 19**
* Node **18** or **20**

> Peer deps: `@angular/* >=17 <20`

---

## Install

```bash
npm i ngxsmk-tel-input intl-tel-input libphonenumber-js
```

### Add styles & flags (in your **app**, not the library)

Add `intl-tel-input` CSS and copy flag images via `angular.json`:

```jsonc
{
  "projects": {
    "<your-app-name>": {
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

Optional flag URL override (put in your app’s global styles):

```css
.iti__flag { background-image: url("/assets/intl-tel-input/img/flags.png"); }
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .iti__flag { background-image: url("/assets/intl-tel-input/img/flags@2x.png"); }
}
```

Restart the dev server after changes.

---

## Quick Start (Reactive Forms)

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
  onCountry(e: { iso2: string }) { console.log('country:', e.iso2); }
}
```

**Value semantics**

* Valid → control value is **E.164** string (e.g. `+14155550123`)
* Empty/invalid → value is **`null`**; validator sets `{ phoneInvalid: true }`

---

## Template‑driven

```html
<form #f="ngForm">
  <ngxsmk-tel-input name="phone" [(ngModel)]="phone"></ngxsmk-tel-input>
</form>
<!-- phone is an E.164 string or null -->
```

---

## API

### Inputs

| Name                   | Type                                   | Default                | Description                                                  |
| ---------------------- | -------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `initialCountry`       | `CountryCode \| 'auto'`                | `'US'`                 | Starting country (`'auto'` uses a stubbed US by default).    |
| `preferredCountries`   | `CountryCode[]`                        | `['US','GB']`          | Pinned at the top.                                           |
| `onlyCountries`        | `CountryCode[]`                        | —                      | Limit selectable countries.                                  |
| `nationalMode`         | `boolean`                              | `false`                | Display national format in the box; value still emits E.164. |
| `separateDialCode`     | `boolean`                              | `false`                | Show dial code separately.                                   |
| `allowDropdown`        | `boolean`                              | `true`                 | Enable/disable dropdown.                                     |
| `placeholder`          | `string`                               | `'Enter phone number'` | Native placeholder.                                          |
| `autocomplete`         | `string`                               | `'tel'`                | Native autocomplete.                                         |
| `disabled`             | `boolean`                              | `false`                | Disable input.                                               |
| `label`                | `string`                               | —                      | Label text.                                                  |
| `hint`                 | `string`                               | —                      | Helper text.                                                 |
| `errorText`            | `string`                               | —                      | Custom error text.                                           |
| `size`                 | `'sm' \| 'md' \| 'lg'`                 | `'md'`                 | Sizing preset.                                               |
| `variant`              | `'outline' \| 'filled' \| 'underline'` | `'outline'`            | Visual style.                                                |
| `showClear`            | `boolean`                              | `true`                 | Show clear (×) button.                                       |
| `autoFocus`            | `boolean`                              | `false`                | Focus on init.                                               |
| `selectOnFocus`        | `boolean`                              | `false`                | Select all text on focus.                                    |
| `formatOnBlur`         | `boolean`                              | `true`                 | Pretty‑print on blur (national if `nationalMode`).           |
| `showErrorWhenTouched` | `boolean`                              | `true`                 | Only show error style after blur.                            |
| `dropdownAttachToBody` | `boolean`                              | `true`                 | Append dropdown to `<body>` to avoid clipping.               |
| `dropdownZIndex`       | `number`                               | `2000`                 | Z‑index for dropdown panel.                                  |

> `CountryCode` is the ISO‑2 code from `libphonenumber-js` (e.g., `US`, `GB`).

### Outputs

| Event            | Payload                                                    | Description                        |
| ---------------- | ---------------------------------------------------------- | ---------------------------------- |
| `countryChange`  | `{ iso2: CountryCode }`                                    | When the selected country changes. |
| `validityChange` | `boolean`                                                  | Emits when validity toggles.       |
| `inputChange`    | `{ raw: string; e164: string \| null; iso2: CountryCode }` | Emitted on each input.             |

### Public methods

* `focus(): void`
* `selectCountry(iso2: CountryCode): void`

---

## Theming

The component exposes CSS variables for easy theming. Example:

```html
<ngxsmk-tel-input style="
  --tel-border:#cbd5e1;
  --tel-ring:#22c55e;
  --tel-radius:14px;
  --tel-dd-item-hover: rgba(34,197,94,.12);
  --tel-dd-z: 3000;
"></ngxsmk-tel-input>
```

Key tokens:

* Input: `--tel-bg`, `--tel-fg`, `--tel-border`, `--tel-border-hover`, `--tel-ring`, `--tel-placeholder`, `--tel-error`, `--tel-radius`, `--tel-focus-shadow`
* Dropdown: `--tel-dd-bg`, `--tel-dd-border`, `--tel-dd-shadow`, `--tel-dd-radius`, `--tel-dd-item-hover`, `--tel-dd-search-bg`, `--tel-dd-z`

Dark mode: wrap in a `.dark` container – tokens adapt.

---

## SSR

* `intl-tel-input` is lazy‑loaded **only in the browser** using `isPlatformBrowser` guards.
* No direct `window`/`document` usage on the server path.

---

## Troubleshooting

* **Unstyled UI / bullets** → Add CSS + assets in `angular.json`, restart dev server.
* **Flags missing** → Verify the images were copied to `/assets/intl-tel-input/img` or add the CSS override.
* **`TS2307: Cannot find module 'ngxsmk-tel-input'`** → Build the lib first; or add a `paths` alias to your app’s `tsconfig` if consuming locally.
* **Peer dependency conflict** → App Angular version must satisfy `>=17 <20`.

---

## Local dev & publish

```bash
# Build the library
ng build ngxsmk-tel-input

# Test via tarball in another app
cd dist/ngxsmk-tel-input && npm pack
# in your app
npm i ../path-to/dist/ngxsmk-tel-input/ngxsmk-tel-input-<version>.tgz

# Publish (from the built dist folder)
# bump version in projects/ngxsmk-tel-input/package.json
ng build ngxsmk-tel-input
cd dist/ngxsmk-tel-input
npm publish --access public
```

---

## License

[MIT](./LICENSE)

## Credits

* UI: `intl-tel-input`
* Parsing/validation: `libphonenumber-js`

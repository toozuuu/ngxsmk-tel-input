import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {AsYouType, CountryCode} from 'libphonenumber-js';
import {NgxsmkTelInputService} from './ngxsmk-tel-input.service';
import {CountryMap, IntlTelI18n} from './types';

type IntlTelInstance = any;

@Component({
  selector: 'ngxsmk-tel-input',
  standalone: true,
  imports: [],
  template: `
    <div class="ngxsmk-tel"
         [class.ngxsmk-tel-disabled]="disabled"
         [attr.data-size]="size"
         [attr.data-variant]="variant"
         [attr.dir]="dir">
      @if (label) {
        <label class="ngxsmk-tel__label" [for]="resolvedId">{{ label }}</label>
      }

      <div class="ngxsmk-tel__wrap" [class.has-error]="showError">
        <div class="ngxsmk-tel-input__wrapper">
          <input
            #telInput
            type="tel"
            class="ngxsmk-tel-input__control"
            [id]="resolvedId"
            [attr.name]="name || null"
            [attr.placeholder]="placeholder || null"
            [attr.autocomplete]="autocomplete"
            [attr.inputmode]="digitsOnly ? 'numeric' : 'tel'"
            [attr.pattern]="digitsOnly ? (allowLeadingPlus ? '\\\\+?[0-9]*' : '[0-9]*') : null"
            [class.ngxsmk-tel-disabled]="disabled"
            [attr.aria-invalid]="showError ? 'true' : 'false'"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
        </div>

        @if (showClear && currentRaw() && !disabled) {
          <button type="button"
                  class="ngxsmk-tel__clear"
                  (click)="clearInput()"
                  [attr.aria-label]="clearAriaLabel">
            ×
          </button>
        }
      </div>

      @if (hint && !showError) {
        <div class="ngxsmk-tel__hint">{{ hint }}</div>
      }
    </div>
  `,
  styleUrls: ['./ngxsmk-tel-input.component.scss'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true},
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true}
  ]
})
export class NgxsmkTelInputComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor, Validator {

  @ViewChild('telInput', {static: true}) inputRef!: ElementRef<HTMLInputElement>;

  /* Core config */
  @Input() initialCountry: CountryCode | 'auto' = 'US';
  @Input() preferredCountries: CountryCode[] = ['US', 'GB'];
  @Input() onlyCountries?: CountryCode[];
  @Input() nationalMode: boolean = false;
  @Input() separateDialCode: boolean = false;
  @Input() allowDropdown: boolean = true;

  @Input() lockWhenValid: boolean = true;

  /* UX */
  @Input() placeholder?: string;
  @Input() autocomplete = 'tel';
  @Input() name?: string;
  @Input() inputId?: string;
  @Input() disabled: boolean = false;

  @Input() label?: string;
  @Input() hint?: string;
  @Input() errorText?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'outline' | 'filled' | 'underline' = 'outline';
  @Input() showClear: boolean = true;
  @Input() autoFocus: boolean = false;
  @Input() selectOnFocus: boolean = false;
  @Input() formatOnBlur: boolean = true;
  @Input() showErrorWhenTouched: boolean = true;

  /* Dropdown plumbing */
  @Input() dropdownAttachToBody: boolean = true;
  @Input() dropdownZIndex: number = 2000;

  /* Localization + RTL */
  @Input('i18n') i18n?: IntlTelI18n;

  @Input('telI18n') set telI18n(v: IntlTelI18n | undefined) {
    this.i18n = v;
  }

  @Input('localizedCountries') localizedCountries?: CountryMap;

  @Input('telLocalizedCountries') set telLocalizedCountries(v: CountryMap | undefined) {
    this.localizedCountries = v;
  }

  @Input() clearAriaLabel: string = 'Clear phone number';
  @Input() dir: 'ltr' | 'rtl' = 'ltr';

  /* Placeholders (intl-tel-input) */
  @Input() autoPlaceholder: 'off' | 'polite' | 'aggressive' = 'off'; // default OFF since no utils fallback
  @Input() utilsScript?: string;
  @Input() customPlaceholder?: (example: string, country: any) => string;

  @Input() formatWhenValid: 'off' | 'blur' | 'typing' = 'blur';

  /* Digits-only controls */
  @Input() digitsOnly: boolean = true;
  @Input() allowLeadingPlus: boolean = true;

  /* Outputs */
  @Output() countryChange = new EventEmitter<{ iso2: CountryCode }>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() inputChange = new EventEmitter<{ raw: string; e164: string | null; iso2: CountryCode }>();

  /* Internal */
  private iti: IntlTelInstance | null = null;
  private onChange: (val: string | null) => void = () => {
  };
  private onTouchedCb: () => void = () => {
  };
  private validatorChange?: () => void;
  private lastEmittedValid = false;
  private pendingWrite: string | null = null;
  private touched: boolean = false;

  readonly resolvedId: string = this.inputId || ('tel-' + Math.random().toString(36).slice(2));

  private readonly platformId = inject(PLATFORM_ID);

  private allowDropdownWasTrue = false;
  private suppressEvents = false; // already used elsewhere if you added it

  constructor(
    private readonly zone: NgZone,
    private readonly tel: NgxsmkTelInputService
  ) {
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.initAndWire();
  }

  private async initAndWire(): Promise<void> {
    await this.initIntlTelInput();
    this.bindDomListeners();

    if (this.pendingWrite !== null) {
      // IMPORTANT: use writeValue so the plugin sets country, then we normalize input
      const v = this.pendingWrite;
      this.pendingWrite = null;
      this.writeValue(v);
    }

    if (this.autoFocus) setTimeout(() => this.focus(), 0);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const configChanged = [
      'initialCountry', 'preferredCountries', 'onlyCountries',
      'separateDialCode', 'allowDropdown', 'nationalMode',
      'i18n', 'localizedCountries', 'dir',
      'autoPlaceholder', 'utilsScript', 'customPlaceholder',
      'digitsOnly', 'allowLeadingPlus'
    ].some(k => k in changes && !changes[k]?.firstChange);
    if (configChanged && this.iti) {
      this.reinitPlugin();
      this.validatorChange?.();
    }
  }

  ngOnDestroy(): void {
    this.destroyPlugin();
  }

  // ----- CVA -----
  writeValue(val: string | null): void {
    if (!this.inputRef) return;

    if (!this.iti) { this.pendingWrite = val ?? ''; return; }

    // Let the plugin pick the country first
    this.iti.setNumber(val || '');
    const iso2 = this.currentIso2();

    const normalized = this.stripTrunkZeroIfNeeded(val ?? '', iso2);
    if (!normalized) {
      this.setInputValue('');
      this.zone.run(() => this.onChange(null));
      return;
    }

    const parsed = this.tel.parse(normalized, iso2);

    // Visible input:
    if (this.separateDialCode || this.nationalMode) {
      this.setInputValue(parsed.national ?? normalized.replace(/^\+\d+/, ''));
    } else {
      this.setInputValue(parsed.e164 ?? normalized);
    }

    // Form value (always E.164/null)
    this.zone.run(() => this.onChange(parsed.e164));
    this.zone.run(() => this.inputChange.emit({ raw: this.currentRaw(), e164: parsed.e164, iso2 }));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    // 1) native input
    if (this.inputRef) this.inputRef.nativeElement.disabled = isDisabled;

    // 2) toggle dropdown by re-init with allowDropdown=false when disabled
    if (this.iti) {
      if (isDisabled && this.allowDropdown) {
        this.allowDropdownWasTrue = true;
        this.allowDropdown = false;
        this.reinitPlugin(); // closes popup & removes handlers
      } else if (!isDisabled && this.allowDropdownWasTrue) {
        this.allowDropdown = true;
        this.allowDropdownWasTrue = false;
        this.reinitPlugin(); // restore dropdown
      } else {
        // even if we didn't reinit, harden UI
        this.applyDisabledUi(isDisabled);
      }
    } else {
      // Not initialized yet; just harden UI for first paint
      this.applyDisabledUi(isDisabled);
    }
  }

  private applyDisabledUi(disabled: boolean) {
    // wrapper already gets [class.disabled]="disabled" from template
    const input = this.inputRef?.nativeElement;
    if (!input) return;

    // Make the flag button non-focusable/non-clickable
    const flag = input.parentElement?.querySelector('.iti__selected-flag') as HTMLElement | null;
    if (flag) {
      flag.tabIndex = disabled ? -1 : 0;
      flag.setAttribute('aria-disabled', String(disabled));
    }
  }


  // ----- Validator -----
  validate(_: AbstractControl): ValidationErrors | null {
    const raw = this.currentRaw();
    if (!raw) return null;
    const valid = this.tel.isValid(raw, this.currentIso2());
    if (valid !== this.lastEmittedValid) {
      this.lastEmittedValid = valid;
      this.validityChange.emit(valid);
    }
    return valid ? null : {phoneInvalid: true};
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorChange = fn;
  }

  // ----- Public helpers -----
  focus(): void {
    this.inputRef?.nativeElement.focus();
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      queueMicrotask(() => el.setSelectionRange(0, el.value.length));
    }
  }

  selectCountry(iso2: CountryCode): void {
    if (this.iti) {
      this.iti.setCountry(iso2.toLowerCase());
      this.handleInput();
    }
  }

  clearInput() {
    this.setInputValue('');
    this.handleInput();
    this.inputRef.nativeElement.focus();
  }

  // ----- Plugin wiring -----
  private async initIntlTelInput() {
    const [{default: intlTelInput}] = await Promise.all([import('intl-tel-input')]);

    const toLowerKeys = (m?: CountryMap) => {
      if (!m) return undefined;
      const out: Record<string, string> = {};
      for (const k in m) {
        if (Object.prototype.hasOwnProperty.call(m, k)) {
          const v = (m as Record<string, string | undefined>)[k];
          if (v != null) out[k.toLowerCase()] = v;
        }
      }
      return out;
    };

    const config: any = {
      initialCountry: this.initialCountry === 'auto' ? 'auto' : (this.initialCountry?.toLowerCase() || 'us'),
      preferredCountries: (this.preferredCountries ?? []).map(c => c.toLowerCase()),
      onlyCountries: (this.onlyCountries ?? []).map(c => c.toLowerCase()),
      nationalMode: this.nationalMode,
      allowDropdown: this.allowDropdown,
      separateDialCode: this.separateDialCode,
      geoIpLookup: (cb: (iso2: string) => void) => cb('us'),

      // placeholders
      autoPlaceholder: this.autoPlaceholder,
      utilsScript: this.utilsScript,
      customPlaceholder: this.customPlaceholder,

      // localization
      i18n: this.i18n,
      localizedCountries: toLowerKeys(this.localizedCountries),

      // dropdown container
      dropdownContainer: this.dropdownAttachToBody && typeof document !== 'undefined' ? document.body : undefined
    };

    this.zone.runOutsideAngular(() => {
      this.iti = intlTelInput(this.inputRef.nativeElement, config);
    });

    (this.inputRef.nativeElement as HTMLElement).style.setProperty('--tel-dd-z', String(this.dropdownZIndex));
  }

  private async reinitPlugin() {
    const prevIso2 = (this.iti?.getSelectedCountryData?.().iso2 || this.initialCountry || 'US').toString().toLowerCase();
    const prevValue = this.currentRaw();

    this.destroyPlugin();
    await this.initIntlTelInput();
    this.bindDomListeners();

    // restore country & value
    try { this.iti?.setCountry(prevIso2); } catch {}
    if (prevValue) {
      this.setInputValue(prevValue);
      this.handleInput();
    }

    (this.inputRef.nativeElement as HTMLElement).style.setProperty('--tel-dd-z', String(this.dropdownZIndex));
    this.applyDisabledUi(this.disabled);
  }

  private destroyPlugin() {
    if (this.iti) {
      this.iti.destroy();
      this.iti = null;
    }
    if (this.inputRef?.nativeElement) {
      const el = this.inputRef.nativeElement;
      const clone = el.cloneNode(true) as HTMLInputElement;

      // preserve important state across clone
      clone.disabled = this.disabled;
      clone.id = this.resolvedId;                 // keep the same id
      clone.name = this.name ?? clone.name;
      clone.value = el.value;

      el.parentNode?.replaceChild(clone, el);
      (this.inputRef as any).nativeElement = clone;
    }
  }


  // ----- Input filtering (digits-only) -----
  private sanitizeDigits(value: string): string {
    if (!this.digitsOnly) return value;
    let v = value.replace(/[^\d+]/g, '');
    if (this.allowLeadingPlus) {
      const hasLeadingPlus = v.startsWith('+');
      v = (hasLeadingPlus ? '+' : '') + v.replace(/\+/g, '');
    } else {
      v = v.replace(/\+/g, '');
    }
    return v;
  }


  /** Remove a single trunk '0' when that makes the number valid.
   *  Works for: "+<cc>0..." and "0..." (national), but only if the stripped form parses valid.
   */
  private stripTrunkZeroIfNeeded(raw: string, iso2: CountryCode): string {
    if (!raw) return raw;

    const dial = this.iti?.getSelectedCountryData?.().dialCode ?? '';
    const parsed = this.tel.parse(raw, iso2);
    if (parsed.isValid) return raw; // already fine; don't touch (e.g., Italy)

    // Case 1: "+<dial>0..." → try removing that single '0'
    if (dial && raw.startsWith(`+${dial}0`)) {
      const attempt = `+${dial}${raw.slice(dial.length + 2)}`; // remove the '0'
      const p2 = this.tel.parse(attempt, iso2);
      if (p2.isValid) return attempt;
    }

    // Case 2: national "0..." → try removing the first '0'
    if (!raw.startsWith('+') && raw.startsWith('0')) {
      const attemptNat = raw.slice(1);
      const p3 = this.tel.parse(attemptNat, iso2);
      if (p3.isValid) return attemptNat;
    }

    return raw; // no improvement; keep original
  }


  private bindDomListeners() {
    const el = this.inputRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      el.addEventListener('beforeinput', (ev: InputEvent) => {
        if (!this.digitsOnly) return;

        const data = (ev as any).data as string | null;

        // If already valid, block extra digit insertions when no selection
        if (this.lockWhenValid && this.isCurrentlyValid()) {
          const selCollapsed = (el.selectionStart ?? 0) === (el.selectionEnd ?? 0);
          const isDigit = !!data && ev.inputType === 'insertText' && data >= '0' && data <= '9';
          const isPlusAtStart = this.allowLeadingPlus && data === '+' && (el.selectionStart ?? 0) === 0 && !el.value.includes('+');

          if (selCollapsed && (isDigit || isPlusAtStart)) {
            ev.preventDefault();
            return;
          }
        }

        // normal filtering when not valid (or replacing text)
        if (!data || ev.inputType !== 'insertText') return;

        const pos = el.selectionStart ?? 0;
        const isDigit = data >= '0' && data <= '9';
        const isPlusAtStart = this.allowLeadingPlus && data === '+' && pos === 0 && !el.value.includes('+');

        if (!isDigit && !isPlusAtStart) ev.preventDefault();
      });

      el.addEventListener('paste', (e: ClipboardEvent) => {
        if (!this.digitsOnly) return;

        const text = (e.clipboardData || (window as any).clipboardData).getData('text') || '';
        const hasAnyDigit = /[0-9]/.test(text);

        // block pasting extra digits if valid and there is no selection
        if (this.lockWhenValid && this.isCurrentlyValid()) {
          const selCollapsed = (el.selectionStart ?? 0) === (el.selectionEnd ?? 0);
          if (selCollapsed && hasAnyDigit) {
            e.preventDefault();
            return;
          }
        }

        // sanitize paste
        e.preventDefault();
        const sanitized = this.sanitizeDigits(text);
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        el.setRangeText(sanitized, start, end, 'end');
        queueMicrotask(() => this.handleInput());
      });

      el.addEventListener('input', () => {
        if (this.digitsOnly) {
          const val = el.value;
          const sanitized = this.sanitizeDigits(val);
          if (val !== sanitized) {
            const caret = el.selectionStart ?? sanitized.length;
            el.value = sanitized;
            el.setSelectionRange(caret, caret);
          }
        }
        this.handleInput();
      });

      el.addEventListener('countrychange', () => {
        const iso2 = this.currentIso2();
        this.zone.run(() => {
          this.countryChange.emit({iso2});
          this.validatorChange?.();
        });
        this.handleInput();
      });

      el.addEventListener('blur', () => this.onBlur());
    });
  }

  onBlur() {
    this.touched = true;
    this.zone.run(() => this.onTouchedCb());
    if (!this.formatOnBlur) return;

    let raw = this.currentRaw();
    const iso2 = this.currentIso2();
    raw = this.stripTrunkZeroIfNeeded(raw, iso2);

    const parsed = this.tel.parse(raw, iso2);
    if (!parsed.isValid) return;

    if (this.separateDialCode || this.nationalMode) {
      if (parsed.national) this.setInputValue(parsed.national.replace(/\s{2,}/g, ' '));
    } else if (parsed.e164) {
      this.setInputValue(parsed.e164);
    }
  }

  onFocus() {
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      queueMicrotask(() => el.setSelectionRange(0, el.value.length));
    }
  }

  private handleInput() {
    let raw = this.currentRaw();
    const iso2 = this.currentIso2();

    // Normalize trunk zero if that makes it valid
    const fixed = this.stripTrunkZeroIfNeeded(raw, iso2);
    if (fixed !== raw) {
      this.setInputValue(fixed);
      raw = fixed;
    }

    const parsed = this.tel.parse(raw, iso2);

    // Emit E.164 outward
    this.zone.run(() => this.onChange(parsed.e164));
    this.zone.run(() => this.inputChange.emit({ raw, e164: parsed.e164, iso2 }));

    // Normalize what the user sees (once valid)
    if (parsed.isValid) {
      if (this.separateDialCode || this.nationalMode) {
        if (parsed.national && raw !== parsed.national) {
          this.setInputValue(parsed.national.replace(/\s{2,}/g, ' '));
        }
      } else if (parsed.e164 && raw !== parsed.e164) {
        this.setInputValue(parsed.e164); // ensures +94710980246, not +9407…
      }
    }
  }

  private formatAsYouType(raw: string, iso2: CountryCode): string {
    try {
      // When a region is provided, AsYouType returns NATIONAL formatting
      const fmt = new AsYouType(iso2);
      return fmt.input(raw);
    } catch {
      return raw;
    }
  }

  currentRaw(): string {
    return (this.inputRef?.nativeElement.value ?? '').trim();
  }

  private currentIso2(): CountryCode {
    const iso2 = (this.iti?.getSelectedCountryData?.().iso2 ?? this.initialCountry ?? 'US')
      .toString().toUpperCase();
    return iso2 as CountryCode;
  }

  private setInputValue(v: string) {
    this.inputRef.nativeElement.value = v ?? '';
  }

  get showError(): boolean {
    const invalid = !!this.validate({} as AbstractControl);
    return this.showErrorWhenTouched ? (this.touched && invalid) : invalid;
  }

  private isCurrentlyValid(): boolean {
    return this.tel.isValid(this.currentRaw(), this.currentIso2());
  }
}

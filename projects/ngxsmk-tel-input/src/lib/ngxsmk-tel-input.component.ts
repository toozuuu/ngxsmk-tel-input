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
import type {CountryCode} from 'libphonenumber-js';
import {NgxsmkTelInputService} from './ngxsmk-tel-input.service';
import {CountryMap, IntlTelI18n} from './types';

type IntlTelInstance = any;

@Component({
  selector: 'ngxsmk-tel-input',
  standalone: true,
  imports: [],
  template: `
    <div class="ngxsmk-tel"
         [class.disabled]="disabled"
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
            [disabled]="disabled"
            [attr.aria-invalid]="showError ? 'true' : 'false'"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
        </div>

        @if (showClear && currentRaw()) {
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

      @if (showError) {
        <div class="ngxsmk-tel__error">{{ errorText || 'Please enter a valid phone number.' }}</div>
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
      this.setInputValue(this.pendingWrite);
      this.handleInput();
      this.pendingWrite = null;
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
    if (!this.iti) {
      this.pendingWrite = val ?? '';
      return;
    }
    this.setInputValue(val ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.inputRef) this.inputRef.nativeElement.disabled = isDisabled;
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

  private reinitPlugin() {
    const current = this.currentRaw();
    this.destroyPlugin();
    this.initIntlTelInput().then(() => {
      if (current) {
        this.setInputValue(current);
        this.handleInput();
      }
    });
  }

  private destroyPlugin() {
    if (this.iti) {
      this.iti.destroy();
      this.iti = null;
    }
    if (this.inputRef?.nativeElement) {
      const el = this.inputRef.nativeElement;
      const clone = el.cloneNode(true) as HTMLInputElement;
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

  private bindDomListeners() {
    const el = this.inputRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      el.addEventListener('beforeinput', (ev: InputEvent) => {
        if (!this.digitsOnly) return;
        const data = (ev as any).data as string | null;
        if (!data || ev.inputType !== 'insertText') return;

        const pos = el.selectionStart ?? 0;
        const isDigit = data >= '0' && data <= '9';
        const isPlusAtStart = this.allowLeadingPlus && data === '+' && pos === 0 && !el.value.includes('+');

        if (!isDigit && !isPlusAtStart) ev.preventDefault();
      });

      el.addEventListener('paste', (e: ClipboardEvent) => {
        if (!this.digitsOnly) return;
        e.preventDefault();
        const text = (e.clipboardData || (window as any).clipboardData).getData('text');
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
    const raw = this.currentRaw();
    if (!raw) return;
    const parsed = this.tel.parse(raw, this.currentIso2());
    if (this.nationalMode && parsed.national) {
      this.setInputValue((parsed.national || '').replace(/\s{2,}/g, ' '));
    }
  }

  onFocus() {
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      queueMicrotask(() => el.setSelectionRange(0, el.value.length));
    }
  }

  private handleInput() {
    const raw = this.currentRaw();
    const iso2 = this.currentIso2();
    const parsed = this.tel.parse(raw, iso2);
    this.zone.run(() => this.onChange(parsed.e164)); // E.164 or null
    this.zone.run(() => this.inputChange.emit({raw, e164: parsed.e164, iso2}));
    if (raw && this.nationalMode && parsed.national) {
      const normalized = parsed.national.replace(/\s{2,}/g, ' ');
      if (normalized !== raw) this.setInputValue(normalized);
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
}

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
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { AsYouType, CountryCode } from 'libphonenumber-js';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';
import { CountryMap, IntlTelI18n } from './types';

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
    </div>
  `,
  styleUrls: ['./ngxsmk-tel-input.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true }
  ]
})
export class NgxsmkTelInputComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor, Validator {
  @ViewChild('telInput', { static: true }) inputRef!: ElementRef<HTMLInputElement>;

  /* Core config */
  @Input() initialCountry: CountryCode | 'auto' = 'US';
  @Input() preferredCountries: CountryCode[] = ['US', 'GB'];
  @Input() onlyCountries?: CountryCode[];
  /** Dropdown shows dial code; input will NEVER show dial code */
  @Input() separateDialCode: boolean = true;
  @Input() allowDropdown: boolean = true;

  /* Display / formatting */
  /** 'formatted' => national with spaces; 'digits' => digits only */
  @Input() nationalDisplay: 'formatted' | 'digits' = 'formatted';
  /** 'typing' (live), 'blur', or 'off' */
  @Input() formatWhenValid: 'off' | 'blur' | 'typing' = 'typing';

  /* UX */
  @Input() placeholder?: string;
  @Input() autocomplete = 'tel';
  @Input() name?: string;
  @Input() inputId?: string;
  @Input() disabled = false;

  @Input() label?: string;
  @Input() hint?: string;
  @Input() errorText?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'outline' | 'filled' | 'underline' = 'outline';
  @Input() showClear = true;
  @Input() autoFocus = false;
  @Input() selectOnFocus = false;
  @Input() showErrorWhenTouched = true;

  /* Dropdown plumbing */
  @Input() dropdownAttachToBody = true;
  @Input() dropdownZIndex = 2000;

  /* Localization + RTL */
  @Input('i18n') i18n?: IntlTelI18n;
  @Input('telI18n') set telI18n(v: IntlTelI18n | undefined) { this.i18n = v; }
  @Input('localizedCountries') localizedCountries?: CountryMap;
  @Input('telLocalizedCountries') set telLocalizedCountries(v: CountryMap | undefined) { this.localizedCountries = v; }

  @Input() clearAriaLabel = 'Clear phone number';
  @Input() dir: 'ltr' | 'rtl' = 'ltr';

  /* Placeholders (intl-tel-input) */
  @Input() autoPlaceholder: 'off' | 'polite' | 'aggressive' = 'off';
  @Input() utilsScript?: string;
  @Input() customPlaceholder?: (example: string, country: any) => string;

  /* Input behavior */
  @Input() digitsOnly = true;    // we still insert spaces when formatted
  @Input() lockWhenValid = true; // optional UX guard

  /* Outputs */
  @Output() countryChange = new EventEmitter<{ iso2: CountryCode }>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() inputChange = new EventEmitter<{ raw: string; e164: string | null; iso2: CountryCode }>();

  /* Internal */
  private iti: IntlTelInstance | null = null;
  private onChange: (val: string | null) => void = () => {};
  private onTouchedCb: () => void = () => {};
  private validatorChange?: () => void;
  private lastEmittedValid = false;
  private pendingWrite: string | null = null;
  private touched = false;

  private allowDropdownWasTrue = false;
  private suppressEvents = false;

  readonly resolvedId: string = this.inputId || ('tel-' + Math.random().toString(36).slice(2));
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private readonly zone: NgZone, private readonly tel: NgxsmkTelInputService) {}

  // ---------- Lifecycle ----------
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.initAndWire();
  }

  private async initAndWire(): Promise<void> {
    await this.initIntlTelInput();
    this.bindDomListeners();

    if (this.pendingWrite !== null) {
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
      'separateDialCode', 'allowDropdown',
      'i18n', 'localizedCountries', 'dir',
      'autoPlaceholder', 'utilsScript', 'customPlaceholder'
    ].some(k => k in changes && !changes[k]?.firstChange);

    if (configChanged && this.iti) {
      this.reinitPlugin();
      this.validatorChange?.();
    }
  }

  ngOnDestroy(): void { this.destroyPlugin(); }

  // ---------- CVA ----------
  writeValue(val: string | null): void {
    if (!this.inputRef) return;

    if (!this.iti) { // not ready yet
      this.pendingWrite = val ?? '';
      return;
    }

    this.suppressEvents = true;
    try {
      // Let the plugin infer the country from E.164 (if provided).
      this.iti.setNumber(val || '');

      const iso2 = this.currentIso2();
      const parsed = this.tel.parse(val ?? '', iso2);

      // Visible input: ALWAYS NSN (no dial code, no trunk '0')
      const nsn = parsed.e164
        ? this.nsnFromE164(parsed.e164, iso2)
        : this.stripLeadingZero(this.toNSN(parsed.national ?? (val ?? '')));

      const display = this.displayValue(nsn, iso2);
      this.setInputValue(display);

      // FormControl value: ALWAYS E.164 (or null)
      this.zone.run(() => this.onChange(parsed.e164));
      this.zone.run(() => this.inputChange.emit({ raw: display, e164: parsed.e164, iso2 }));
    } finally {
      this.suppressEvents = false;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedCb = fn; }

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
        this.applyDisabledUi(isDisabled);
      }
    } else {
      this.applyDisabledUi(isDisabled);
    }
  }

  // ---------- Validator ----------
  validate(_: AbstractControl): ValidationErrors | null {
    const raw = this.currentRaw();
    if (!raw) return null;
    const valid = this.tel.isValid(raw, this.currentIso2());
    if (valid !== this.lastEmittedValid) {
      this.lastEmittedValid = valid;
      this.validityChange.emit(valid);
    }
    return valid ? null : { phoneInvalid: true };
  }

  registerOnValidatorChange(fn: () => void): void { this.validatorChange = fn; }

  // ---------- Public helpers ----------
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

  clearInput(): void {
    this.setInputValue('');
    this.handleInput();
    this.inputRef.nativeElement.focus();
  }

  // ---------- intl-tel-input wiring ----------
  private async initIntlTelInput() {
    const [{ default: intlTelInput }] = await Promise.all([import('intl-tel-input')]);

    const toLowerKeys = (m?: CountryMap) => {
      if (!m) return undefined;
      const out: Record<string, string> = {};
      for (const k in m) if (Object.prototype.hasOwnProperty.call(m, k)) {
        const v = (m as Record<string, string | undefined>)[k];
        if (v != null) out[k.toLowerCase()] = v;
      }
      return out;
    };

    const config: any = {
      initialCountry: this.initialCountry === 'auto' ? 'auto' : (this.initialCountry?.toLowerCase() || 'us'),
      preferredCountries: (this.preferredCountries ?? []).map(c => c.toLowerCase()),
      onlyCountries: (this.onlyCountries ?? []).map(c => c.toLowerCase()),
      nationalMode: true, // we control the visible value; prevents '+' in the input
      allowDropdown: this.allowDropdown,
      separateDialCode: this.separateDialCode,
      geoIpLookup: (cb: (iso2: string) => void) => cb('us'),

      autoPlaceholder: this.autoPlaceholder,
      utilsScript: this.utilsScript,
      customPlaceholder: this.customPlaceholder,

      i18n: this.i18n,
      localizedCountries: toLowerKeys(this.localizedCountries),
      dropdownContainer: this.dropdownAttachToBody && typeof document !== 'undefined' ? document.body : undefined
    };

    this.zone.runOutsideAngular(() => {
      this.iti = intlTelInput(this.inputRef.nativeElement, config);
    });

    (this.inputRef.nativeElement as HTMLElement).style.setProperty('--tel-dd-z', String(this.dropdownZIndex));
    this.applyDisabledUi(this.disabled);
  }

  private async reinitPlugin() {
    const prevIso2 = (this.iti?.getSelectedCountryData?.().iso2 || this.initialCountry || 'US').toString().toLowerCase();
    const prevValue = this.currentRaw();

    this.destroyPlugin();
    await this.initIntlTelInput();
    this.bindDomListeners();

    try { this.iti?.setCountry(prevIso2); } catch {}
    if (prevValue) {
      this.setInputValue(prevValue);
      this.handleInput();
    }
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

      // preserve state across clone
      clone.disabled = this.disabled;
      clone.id = this.resolvedId;
      clone.name = this.name ?? clone.name;
      clone.value = el.value;

      el.parentNode?.replaceChild(clone, el);
      (this.inputRef as any).nativeElement = clone;
    }
  }

  // ---------- Input listeners ----------
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
          if (selCollapsed && isDigit) { ev.preventDefault(); return; }
        }

        if (!data || ev.inputType !== 'insertText') return;
        const isDigit = data >= '0' && data <= '9';
        if (!isDigit) ev.preventDefault(); // digits only; we add spaces ourselves
      });

      el.addEventListener('paste', (e: ClipboardEvent) => {
        const text = (e.clipboardData || (window as any).clipboardData).getData('text') || '';
        e.preventDefault();
        const digits = this.toNSN(text);
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        el.setRangeText(digits, start, end, 'end');
        queueMicrotask(() => this.handleInput());
      });

      el.addEventListener('input', () => this.handleInput());

      el.addEventListener('countrychange', () => {
        const iso2 = this.currentIso2();
        this.zone.run(() => {
          this.countryChange.emit({ iso2 });
          this.validatorChange?.();
        });
        this.handleInput();
      });

      el.addEventListener('blur', () => this.onBlur());
    });
  }

  // ---------- UX handlers ----------
  onBlur() {
    this.touched = true;
    this.zone.run(() => this.onTouchedCb());
    if (this.formatWhenValid === 'off') return;

    const iso2 = this.currentIso2();
    const digits = this.stripLeadingZero(this.toNSN(this.currentRaw()));

    const parsed = this.tel.parse(digits, iso2);
    if (!parsed.e164 && !parsed.isValid) return;

    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    if (this.formatWhenValid !== 'typing') {
      this.setInputValue(this.displayValue(nsn, iso2));
    }
  }

  onFocus() {
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      queueMicrotask(() => el.setSelectionRange(0, el.value.length));
    }
  }

  // ---------- Core input pipeline ----------
  private handleInput() {
    if (this.suppressEvents) return;

    const iso2 = this.currentIso2();
    // Users type national digits; remove any separators and a single trunk '0'
    let digits = this.stripLeadingZero(this.toNSN(this.currentRaw()));

    const parsed = this.tel.parse(digits, iso2);

    // Emit E.164 to the form (or null if incomplete)
    this.zone.run(() => this.onChange(parsed.e164));
    this.zone.run(() => this.inputChange.emit({ raw: this.currentRaw(), e164: parsed.e164, iso2 }));

    // Keep visible value as NSN (optionally formatted)
    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    const display = this.formatWhenValid === 'typing' ? this.displayValue(nsn, iso2) : nsn;

    if (display !== this.currentRaw()) this.setInputValue(display);
  }

  // ---------- Utilities ----------
  /** Convert any string to digits only (NSN basis). */
  private toNSN(v: string | null | undefined): string {
    return (v ?? '').replace(/\D/g, '');
  }

  /** Strip exactly one leading trunk '0' from national input. */
  private stripLeadingZero(nsn: string): string {
    return nsn.replace(/^0/, '');
  }

  /** Current country calling code (e.g. "44", "94"). */
  private currentDialCode(): string {
    return (this.iti?.getSelectedCountryData?.().dialCode ?? '').toString();
  }

  /** Convert E.164 (+<cc><nsn>) to NSN (never includes trunk '0'). */
  private nsnFromE164(e164: string, iso2: CountryCode): string {
    const dial = this.currentDialCode();
    if (!e164 || !dial) return this.toNSN(e164);
    if (e164.startsWith('+' + dial)) return e164.slice(dial.length + 1);
    return this.toNSN(e164);
  }

  /** Format NSN for region (adds spaces but NEVER a trunk '0'). */
  private formatNSN(nsn: string, iso2: CountryCode): string {
    try {
      const fmt = new AsYouType(iso2);
      return fmt.input(nsn);
    } catch {
      return nsn;
    }
  }

  /** Compose visible value based on settings. */
  private displayValue(nsn: string, iso2: CountryCode): string {
    return this.nationalDisplay === 'formatted' ? this.formatNSN(nsn, iso2) : nsn;
    // (spaces in formatted mode; digits only otherwise)
  }

  currentRaw(): string { return (this.inputRef?.nativeElement.value ?? '').trim(); }

  private currentIso2(): CountryCode {
    const iso2 = (this.iti?.getSelectedCountryData?.().iso2 ?? this.initialCountry ?? 'US')
      .toString().toUpperCase();
    return iso2 as CountryCode;
  }

  private setInputValue(v: string) { this.inputRef.nativeElement.value = v ?? ''; }

  get showError(): boolean {
    const invalid = !!this.validate({} as AbstractControl);
    return this.showErrorWhenTouched ? (this.touched && invalid) : invalid;
  }

  private isCurrentlyValid(): boolean { return this.tel.isValid(this.currentRaw(), this.currentIso2()); }

  /** Make flag/dropdown non-interactive when disabled */
  private applyDisabledUi(disabled: boolean) {
    const input = this.inputRef?.nativeElement;
    if (!input) return;
    const flag = input.parentElement?.querySelector('.iti__selected-flag') as HTMLElement | null;
    if (flag) {
      flag.tabIndex = disabled ? -1 : 0;
      flag.setAttribute('aria-disabled', String(disabled));
    }
  }
}

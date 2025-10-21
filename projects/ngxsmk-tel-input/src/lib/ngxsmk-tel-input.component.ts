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
  ViewChild,
  ChangeDetectionStrategy,
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
import { AsYouType, CountryCode, validatePhoneNumberLength } from 'libphonenumber-js';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';
import { CountryMap, IntlTelI18n } from './types';

type IntlTelInstance = any;

@Component({
  selector: 'ngxsmk-tel-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() disabled:boolean = false;

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
  @Input() digitsOnly = true;    // Still insert spaces when formatted
  @Input() lockWhenValid = true; // optional UX guard

  /* Theme */
  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';

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
  private isDestroyed = false;
  private eventListeners: Array<{ element: HTMLElement; event: string; handler: (event: Event) => void }> = [];

  private allowDropdownWasTrue = false;
  private suppressEvents = false;

  readonly resolvedId: string = this.inputId || ('tel-' + Math.random().toString(36).slice(2));
  private readonly platformId = inject(PLATFORM_ID);
  private currentTheme: 'light' | 'dark' = 'light';

  constructor(private readonly zone: NgZone, private readonly tel: NgxsmkTelInputService) {}

  // ---------- Lifecycle ----------
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
    this.detectAndApplyTheme();
    this.setupDropdownThemeObserver();
    void this.initAndWire();
  }

  private async initAndWire(): Promise<void> {
    if (this.isDestroyed) return;
    
    await this.initIntlTelInput();
    this.bindDomListeners();

    if (this.pendingWrite !== null) {
      const v = this.pendingWrite;
      this.pendingWrite = null;
      this.writeValue(v);
    }

    if (this.autoFocus && !this.isDestroyed) {
      requestAnimationFrame(() => {
        if (!this.isDestroyed) this.focus();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
    
    const configChanged = [
      'initialCountry', 'preferredCountries', 'onlyCountries',
      'separateDialCode', 'allowDropdown',
      'i18n', 'localizedCountries', 'dir',
      'autoPlaceholder', 'utilsScript', 'customPlaceholder'
    ].some(k => k in changes && !changes[k]?.firstChange);

    if (configChanged && this.iti && !this.isDestroyed) {
      this.reinitPlugin();
      this.validatorChange?.();
    }

    // Handle theme changes
    if ('theme' in changes && !changes['theme']?.firstChange) {
      this.detectAndApplyTheme();
    }
  }

  ngOnDestroy(): void { 
    this.isDestroyed = true;
    this.destroyPlugin(); 
    this.cleanupEventListeners();
  }

  // ---------- CVA ----------
  writeValue(val: string | null): void {
    if (!this.inputRef || this.isDestroyed) return;

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

      // FormControl value: ALWAYS E.164 (or null) - batch zone runs
      this.zone.run(() => {
        this.onChange(parsed.e164);
        this.inputChange.emit({ raw: display, e164: parsed.e164, iso2 });
      });
    } finally {
      this.suppressEvents = false;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedCb = fn; }

  setDisabledState(isDisabled: boolean): void {
    if (this.isDestroyed) return;
    
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
    if (this.isDestroyed) return null;
    
    const raw = this.currentRaw();
    if (!raw) return null;
    
    // Use enhanced parsing to detect invalid international numbers
    const parsed = this.tel.parseWithInvalidDetection(raw, this.currentIso2());
    const valid = parsed.isValid && !parsed.isInvalidInternational;
    
    if (valid !== this.lastEmittedValid) {
      this.lastEmittedValid = valid;
      this.validityChange.emit(valid);
    }
    
    if (!valid) {
      if (parsed.isInvalidInternational) {
        return { phoneInvalidCountryCode: true };
      }
      return { phoneInvalid: true };
    }
    
    return null;
  }

  registerOnValidatorChange(fn: () => void): void { this.validatorChange = fn; }

  // ---------- Public helpers ----------
  focus(): void {
    if (this.isDestroyed || !this.inputRef) return;
    
    this.inputRef.nativeElement.focus();
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      requestAnimationFrame(() => {
        if (!this.isDestroyed) el.setSelectionRange(0, el.value.length);
      });
    }
  }

  selectCountry(iso2: CountryCode): void {
    if (this.iti && !this.isDestroyed) {
      this.iti.setCountry(iso2.toLowerCase());
      this.handleInput();
    }
  }

  clearInput(): void {
    if (this.isDestroyed) return;
    
    this.setInputValue('');
    this.handleInput();
    this.inputRef.nativeElement.focus();
  }

  // ---------- intl-tel-input wiring ----------
  private async initIntlTelInput() {
    if (this.isDestroyed) return;
    
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
      nationalMode: true, // Control the visible value; prevents '+' in the input
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
      if (!this.isDestroyed) {
        this.iti = intlTelInput(this.inputRef.nativeElement, config);
      }
    });

    if (!this.isDestroyed) {
      (this.inputRef.nativeElement as HTMLElement).style.setProperty('--tel-dd-z', String(this.dropdownZIndex));
      this.applyDisabledUi(this.disabled);
    }
  }

  private async reinitPlugin() {
    if (this.isDestroyed) return;
    
    const prevIso2 = (this.iti?.getSelectedCountryData?.().iso2 || this.initialCountry || 'US').toString().toLowerCase();
    const prevValue = this.currentRaw();

    this.destroyPlugin();
    await this.initIntlTelInput();
    this.bindDomListeners();

    if (!this.isDestroyed) {
      try { this.iti?.setCountry(prevIso2); } catch {}
      if (prevValue) {
        this.setInputValue(prevValue);
        this.handleInput();
      }
      this.applyDisabledUi(this.disabled);
    }
  }

  private destroyPlugin() {
    if (this.iti) {
      this.iti.destroy();
      this.iti = null;
    }
    
    // Optimize DOM manipulation - only clone if necessary
    if (this.inputRef?.nativeElement && this.iti) {
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
    if (this.isDestroyed || !this.inputRef) return;
    
    const el = this.inputRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      const beforeInputHandler = (ev: Event) => {
        if (this.isDestroyed || !this.digitsOnly) return;
        const data = (ev as any).data as string | null;

        // If already valid, block extra digit insertions when no selection
        if (this.lockWhenValid && this.isCurrentlyValid()) {
          const selCollapsed = (el.selectionStart ?? 0) === (el.selectionEnd ?? 0);
          const isDigit = !!data && (ev as any).inputType === 'insertText' && data >= '0' && data <= '9';
          if (selCollapsed && isDigit) { ev.preventDefault(); return; }
        }

        if (!data || (ev as any).inputType !== 'insertText') return;
        const isDigit = data >= '0' && data <= '9';
        if (!isDigit) { ev.preventDefault(); return; }

        // NEW: block if this digit would make the NSN too long for the current country
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const prospective = el.value.slice(0, start) + data + el.value.slice(end);
        const nsn = this.stripLeadingZero(this.toNSN(prospective));
        const iso2 = this.currentIso2();

        if (this.wouldExceedMax(nsn, iso2)) {
          ev.preventDefault();
          return;
        }
      };

      const pasteHandler = (e: Event) => {
        if (this.isDestroyed) return;
        
        const text = ((e as any).clipboardData || (window as any).clipboardData).getData('text') || '';
        e.preventDefault();

        const iso2 = this.currentIso2();
        // digits-only, strip any leading trunk '0'
        let digits = this.stripLeadingZero(this.toNSN(text));

        // NEW: trim pasted digits until not TOO_LONG for the selected country
        while (this.wouldExceedMax(digits, iso2)) {
          digits = digits.slice(0, -1);
          if (!digits) break;
        }

        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        el.setRangeText(digits, start, end, 'end');
        requestAnimationFrame(() => {
          if (!this.isDestroyed) this.handleInput();
        });
      };

      const inputHandler = () => {
        if (!this.isDestroyed) this.handleInput();
      };

      const countryChangeHandler = () => {
        if (this.isDestroyed) return;
        
        const iso2 = this.currentIso2();
        this.zone.run(() => {
          this.countryChange.emit({ iso2 });
          this.validatorChange?.();
        });
        this.handleInput();
      };

      const blurHandler = () => {
        if (!this.isDestroyed) this.onBlur();
      };

      // Store listeners for cleanup
      this.eventListeners = [
        { element: el, event: 'beforeinput', handler: beforeInputHandler },
        { element: el, event: 'paste', handler: pasteHandler },
        { element: el, event: 'input', handler: inputHandler },
        { element: el, event: 'countrychange', handler: countryChangeHandler },
        { element: el, event: 'blur', handler: blurHandler }
      ];

      this.eventListeners.forEach(({ element, event, handler }) => {
        element.addEventListener(event, handler);
      });
    });
  }

  // ---------- UX handlers ----------
  onBlur() {
    if (this.isDestroyed) return;
    
    this.touched = true;
    this.zone.run(() => this.onTouchedCb());
    if (this.formatWhenValid === 'off') return;

    const iso2 = this.currentIso2();
    const digits = this.stripLeadingZero(this.toNSN(this.currentRaw()));

    const parsed = this.tel.parseWithInvalidDetection(digits, iso2);
    if (!parsed.e164 && !parsed.isValid) return;

    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    if (this.formatWhenValid !== 'typing') {
      this.setInputValue(this.displayValue(nsn, iso2));
    }
  }

  onFocus() {
    if (this.isDestroyed || !this.selectOnFocus || !this.inputRef) return;
    
    const el = this.inputRef.nativeElement;
    requestAnimationFrame(() => {
      if (!this.isDestroyed) el.setSelectionRange(0, el.value.length);
    });
  }

  // ---------- Core input pipeline ----------
  private handleInput() {
    if (this.suppressEvents || this.isDestroyed) return;

    const iso2 = this.currentIso2();
    // Users type national digits; remove any separators and a single trunk '0'
    let digits = this.stripLeadingZero(this.toNSN(this.currentRaw()));

    // Use enhanced parsing to detect invalid international numbers
    const parsed = this.tel.parseWithInvalidDetection(digits, iso2);

    // Emit E.164 to the form (or null if incomplete) - batch zone runs
    this.zone.run(() => {
      this.onChange(parsed.e164);
      this.inputChange.emit({ raw: this.currentRaw(), e164: parsed.e164, iso2 });
    });

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

  /** Format NSN for a region (adds spaces but NEVER a trunk '0'). */
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

  currentRaw(): string { 
    return this.isDestroyed ? '' : (this.inputRef?.nativeElement.value ?? '').trim(); 
  }

  private currentIso2(): CountryCode {
    if (this.isDestroyed) return 'US';
    
    const iso2 = (this.iti?.getSelectedCountryData?.().iso2 ?? this.initialCountry ?? 'US')
      .toString().toUpperCase();
    return iso2 as CountryCode;
  }

  private setInputValue(v: string) { 
    if (!this.isDestroyed && this.inputRef) {
      this.inputRef.nativeElement.value = v ?? ''; 
    }
  }

  get showError(): boolean {
    if (this.isDestroyed) return false;
    
    const invalid = !!this.validate({} as AbstractControl);
    return this.showErrorWhenTouched ? (this.touched && invalid) : invalid;
  }

  private isCurrentlyValid(): boolean { 
    return this.isDestroyed ? false : this.tel.isValid(this.currentRaw(), this.currentIso2()); 
  }

  /** Make flag/dropdown non-interactive when disabled */
  private applyDisabledUi(disabled: boolean) {
    if (this.isDestroyed) return;
    
    const input = this.inputRef?.nativeElement;
    if (!input) return;
    const flag = input.parentElement?.querySelector('.iti__selected-flag') as HTMLElement | null;
    if (flag) {
      flag.tabIndex = disabled ? -1 : 0;
      flag.setAttribute('aria-disabled', String(disabled));
    }
  }

  /** Returns true if nsn would be TOO_LONG for the current country. */
  private wouldExceedMax(nsn: string, iso2: CountryCode): boolean {
    if (this.isDestroyed) return false;
    
    try {
      const res = validatePhoneNumberLength(nsn, iso2);
      return res === 'TOO_LONG';
    } catch {
      return false;
    }
  }

  /** Clean up event listeners to prevent memory leaks */
  private cleanupEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /** Detect and apply theme based on user preference and system settings */
  private detectAndApplyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let detectedTheme: 'light' | 'dark' = 'light';

    if (this.theme === 'auto') {
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        detectedTheme = 'dark';
      }
      // Check for document class
      else if (document.documentElement.classList.contains('dark')) {
        detectedTheme = 'dark';
      }
      // Check for data attribute
      else if (document.documentElement.getAttribute('data-theme') === 'dark') {
        detectedTheme = 'dark';
      }
    } else {
      detectedTheme = this.theme;
    }

    this.currentTheme = detectedTheme;
    this.applyTheme(detectedTheme);
  }

  /** Apply theme to the component */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const hostElement = this.inputRef?.nativeElement?.closest('ngxsmk-tel-input') as HTMLElement;
    if (hostElement) {
      hostElement.setAttribute('data-theme', theme);
    }

    // Also apply theme to any existing dropdown
    this.applyThemeToDropdown(theme);
  }

  /** Apply theme to the dropdown if it exists */
  private applyThemeToDropdown(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Find the dropdown in the document
    const dropdown = document.querySelector('.iti__country-list') as HTMLElement;
    if (dropdown) {
      dropdown.setAttribute('data-theme', theme);
    }
  }

  /** Get current theme */
  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /** Set theme programmatically */
  setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme;
    this.detectAndApplyTheme();
  }

  /** Update dropdown theme when it's opened */
  private updateDropdownTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Use a small delay to ensure dropdown is rendered
    setTimeout(() => {
      const dropdown = document.querySelector('.iti__country-list') as HTMLElement;
      if (dropdown) {
        dropdown.setAttribute('data-theme', this.currentTheme);
        
        // Force apply dark theme classes
        if (this.currentTheme === 'dark') {
          dropdown.classList.add('dark-theme');
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          dropdown.classList.remove('dark-theme');
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
        
        // Also update the search input if it exists
        const searchInput = dropdown.querySelector('.iti__search-input') as HTMLElement;
        if (searchInput) {
          searchInput.setAttribute('data-theme', this.currentTheme);
          if (this.currentTheme === 'dark') {
            searchInput.classList.add('dark-theme');
          } else {
            searchInput.classList.remove('dark-theme');
          }
          
          // Ensure search input is focusable and functional
          searchInput.style.pointerEvents = 'auto';
          searchInput.style.opacity = '1';
          (searchInput as HTMLInputElement).disabled = false;
        }
      }
    }, 10);
  }

  /** Setup observer to watch for dropdown changes and apply theme */
  private setupDropdownThemeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Watch for dropdown appearance in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.classList.contains('iti__country-list')) {
                this.updateDropdownTheme();
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store observer for cleanup
    this.eventListeners.push({
      element: document.body,
      event: 'observer',
      handler: () => observer.disconnect()
    });
  }
}

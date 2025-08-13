import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
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
  ValidationErrors
} from '@angular/forms';
import type {CountryCode} from 'libphonenumber-js';
import {NgxTelInputService} from './ngx-tel-input.service';

type IntlTelInstance = any; // keep loose to avoid typing the plugin's full API

@Component({
  selector: 'ngx-tel-input',
  standalone: true,
  template: `
    <div class="ngx-tel-input__wrapper">
      <input
        #telInput
        type="tel"
        class="ngx-tel-input__control"
        [id]="inputId || null"
        [attr.name]="name || null"
        [attr.placeholder]="placeholder || null"
        [attr.autocomplete]="autocomplete"
        [disabled]="disabled"
        (blur)="markTouched()"
      />
    </div>
  `,
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxTelInputComponent), multi: true},
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxTelInputComponent), multi: true}
  ],
})
export class NgxTelInputComponent
  implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @ViewChild('telInput', {static: true}) inputRef!: ElementRef<HTMLInputElement>;

  // ===== Inputs (public API) =====
  /** Initial country (ISO2) or 'auto' to pick a default via geoIpLookup stub */
  @Input() initialCountry: CountryCode | 'auto' = 'US';
  /** Preferred countries on top of the dropdown */
  @Input() preferredCountries: CountryCode[] = ['US', 'GB'];
  /** Limit to these countries only (omit for all) */
  @Input() onlyCountries?: CountryCode[];
  /** Show national numbers instead of E.164 in the box (emits E.164) */
  @Input() nationalMode = false;
  /** Show the dial code separately before the input (intl-tel-input option) */
  @Input() separateDialCode = false;
  /** Allow opening the country dropdown */
  @Input() allowDropdown = true;

  /** Plain input attributes */
  @Input() placeholder = 'Enter phone number';
  @Input() autocomplete = 'tel';
  @Input() name?: string;
  @Input() inputId?: string;

  /** Disabled state (also settable via Angular Forms) */
  @Input() disabled = false;

  // ===== Outputs =====
  @Output() countryChange = new EventEmitter<{ iso2: CountryCode }>();
  @Output() validityChange = new EventEmitter<boolean>();

  // ===== Internal =====
  private iti: IntlTelInstance | null = null;
  private onChange: (val: string | null) => void = () => {
  };
  private onTouched: () => void = () => {
  };
  private lastEmittedValid = false;
  private pendingWrite: string | null = null; // cache writeValue before plugin ready

  constructor(
    private readonly zone: NgZone,
    private readonly tel: NgxTelInputService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
  }

  // ========== Lifecycle ==========
  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    await this.initIntlTelInput();
    this.bindDomListeners();

    // apply any pending value from writeValue
    if (this.pendingWrite !== null) {
      this.setInputValue(this.pendingWrite);
      this.handleInput();
      this.pendingWrite = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // If config inputs changed after init, re-init the plugin (safe & simple)
    const configChanged = ['initialCountry', 'preferredCountries', 'onlyCountries', 'separateDialCode', 'allowDropdown', 'nationalMode']
      .some(k => k in changes && !changes[k].firstChange);

    if (configChanged && this.iti) {
      this.reinitPlugin();
    }
  }

  ngOnDestroy(): void {
    this.destroyPlugin();
  }

  // ========== ControlValueAccessor ==========
  writeValue(val: string | null): void {
    if (!this.inputRef) return;
    if (!this.iti) {
      // cache until plugin is ready
      this.pendingWrite = val ?? '';
      return;
    }
    this.setInputValue(val ?? '');
    // Do not trigger onChange here; writeValue is programmatic
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.inputRef) this.inputRef.nativeElement.disabled = isDisabled;
  }

  // ========== Validator ==========
  validate(_: AbstractControl): ValidationErrors | null {
    const raw = this.currentRaw();
    if (!raw) return null; // let "required" handle empties
    const valid = this.tel.isValid(raw, this.currentIso2());
    if (valid !== this.lastEmittedValid) {
      this.lastEmittedValid = valid;
      this.validityChange.emit(valid);
    }
    return valid ? null : {phoneInvalid: true};
  }

  // ========== Public Helpers ==========
  focus(): void {
    this.inputRef?.nativeElement.focus();
  }

  selectCountry(iso2: CountryCode): void {
    if (this.iti) {
      this.iti.setCountry(iso2.toLowerCase());
      this.handleInput();
    }
  }

  markTouched() {
    this.onTouched();
  }

  // ========== Private: DOM & Plugin ==========
  private async initIntlTelInput() {
    const [{default: intlTelInput}] = await Promise.all([
      import('intl-tel-input'),
    ]);

    // Minimal config – we rely on NgxTelInputService for validation/formatting
    const config: any = {
      initialCountry: this.initialCountry === 'auto' ? 'auto' : (this.initialCountry?.toLowerCase() || 'us'),
      preferredCountries: (this.preferredCountries ?? []).map(c => c.toLowerCase()),
      onlyCountries: (this.onlyCountries ?? []).map(c => c.toLowerCase()),
      nationalMode: this.nationalMode,
      allowDropdown: this.allowDropdown,
      separateDialCode: this.separateDialCode,
      // If initialCountry is 'auto', provide a trivial geoIpLookup (customize in your app)
      geoIpLookup: (cb: (iso2: string) => void) => cb('us'),
      utilsScript: undefined // keep bundle small; we use libphonenumber-js via the service
    };

    this.zone.runOutsideAngular(() => {
      this.iti = intlTelInput(this.inputRef.nativeElement, config);
    });
  }

  private reinitPlugin() {
    this.destroyPlugin();
    // keep current value
    const current = this.currentRaw();
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
    // remove listeners by cloning node (simple & safe)
    if (this.inputRef?.nativeElement) {
      const el = this.inputRef.nativeElement;
      const clone = el.cloneNode(true) as HTMLInputElement;
      el.parentNode?.replaceChild(clone, el);
      // update reference
      (this.inputRef as any).nativeElement = clone;
    }
  }

  private bindDomListeners() {
    const el = this.inputRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      el.addEventListener('input', () => this.handleInput());
      el.addEventListener('countrychange', () => {
        const iso2 = this.currentIso2();
        this.zone.run(() => this.countryChange.emit({iso2}));
        this.handleInput();
      });
      el.addEventListener('paste', () => queueMicrotask(() => this.handleInput()));
      el.addEventListener('blur', () => this.zone.run(() => this.onTouched()));
    });
  }

  private handleInput() {
    const raw = this.currentRaw();
    const iso2 = this.currentIso2();

    const parsed = this.tel.parse(raw, iso2);
    // Emit E.164 (or null if invalid)
    this.zone.run(() => this.onChange(parsed.e164));

    // Optional: present national vs. international in the box without fighting the user
    // We only normalize whitespace; avoid aggressive reformatting to preserve caret.
    if (raw && this.nationalMode && parsed.national) {
      // Replace double spaces etc. (intl-tel-input already styles)
      const normalized = parsed.national.replace(/\s{2,}/g, ' ');
      if (normalized !== raw) this.setInputValue(normalized);
    }
  }

  private currentRaw(): string {
    return (this.inputRef?.nativeElement.value ?? '').trim();
  }

  private currentIso2(): CountryCode {
    const iso2 = (this.iti?.getSelectedCountryData?.().iso2 ?? this.initialCountry ?? 'US').toString().toUpperCase();
    return iso2 as CountryCode;
  }

  private setInputValue(v: string) {
    this.inputRef.nativeElement.value = v ?? '';
  }
}

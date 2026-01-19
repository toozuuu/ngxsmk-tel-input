import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
  signal,
  computed,
  output,
  input,
  Signal,
  WritableSignal,
  effect,
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
import { NgxsmkTelInputService, ParseResult, ParseWithInvalidResult } from './ngxsmk-tel-input.service';
import { CountryMap, IntlTelI18n } from './types';
import { createPhoneInputState, createFormattedValueSignal, createValidationStatusSignal, createPhoneMetadataSignal, PhoneInputState } from './signals';
import { PhoneIntelligenceService, CarrierInfo, FormatSuggestion } from './phone-intelligence.service';

/**
 * Interface for custom theme colors.
 */
export interface ColorPalette {
  background?: string;
  foreground?: string;
  border?: string;
  borderHover?: string;
  ring?: string;
  placeholder?: string;
}

/**
 * Type definition for intl-tel-input instance.
 * Matches the actual implementation of the Iti class.
 */
type IntlTelInstance = {
  destroy(): void;
  setNumber(aNumber: string): void;
  setCountry(countryCode: string): void;
  getSelectedCountryData(): { iso2?: string; dialCode?: string };
  promise?: Promise<unknown>;
};

/**
 * Type for intl-tel-input configuration options.
 */
interface IntlTelInputConfig {
  initialCountry: string;
  countryOrder: string[];
  onlyCountries?: string[];
  nationalMode: boolean;
  allowDropdown: boolean;
  separateDialCode: boolean;
  geoIpLookup: (callback: (iso2: string) => void) => void;
  autoPlaceholder: 'off' | 'polite' | 'aggressive';
  utilsScript?: string;
  customPlaceholder?: (example: string, country: unknown) => string;
  i18n?: IntlTelI18n;
  localizedCountries?: Record<string, string>;
  dropdownContainer?: HTMLElement;
}

/**
 * Type for clipboard event with data property.
 */
interface ClipboardEventWithData extends ClipboardEvent {
  clipboardData: DataTransfer | null;
}

/**
 * Type for beforeinput event with data and inputType properties.
 */
interface BeforeInputEvent extends Event {
  data: string | null;
  inputType: string;
}

/**
 * Angular telephone input component with country dropdown, flags, and robust validation/formatting.
 * Wraps intl-tel-input for the UI and libphonenumber-js for parsing/validation.
 * Implements ControlValueAccessor for seamless integration with Angular Forms.
 * 
 * **Compatibility**: Works with Angular 17+ and supports both:
 * - Zone.js (traditional Angular change detection)
 * - Zoneless Angular (Angular 18+ without Zone.js)
 * - All data binding types (property, event, two-way)
 * - Reactive Forms and Template-driven Forms
 * - Signals (Angular 16+)
 * 
 * **Mobile Responsive**: Fully optimized for mobile devices with:
 * - Touch-friendly tap targets (44x44px minimum)
 * - Prevents iOS zoom (16px font size)
 * - Responsive dropdown that adapts to viewport
 * - Safe area insets support for notched devices
 * - Optimized touch interactions
 * 
 * @example
 * ```html
 * <ngxsmk-tel-input
 *   formControlName="phone"
 *   label="Phone Number"
 *   [initialCountry]="'US'"
 *   [preferredCountries]="['US','GB']">
 * </ngxsmk-tel-input>
 * ```
 */
@Component({
  selector: 'ngxsmk-tel-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <div class="ngxsmk-tel"
         [class.disabled]="disabledSignal() || disabled"
         [attr.data-size]="sizeSignal() || size"
         [attr.data-variant]="variantSignal() || variant"
         [attr.dir]="dir"
         [attr.aria-label]="label || 'Phone number input'">
      @if (label) {
        <label class="ngxsmk-tel__label" [for]="resolvedId">{{ label }}</label>
      }

      <div class="ngxsmk-tel__wrap" 
           [class.has-error]="showError()"
           [attr.aria-describedby]="getAriaDescribedBy()">
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
            [disabled]="disabledSignal() || disabled"
            [attr.aria-invalid]="showError() ? 'true' : 'false'"
            [attr.aria-required]="isRequired ? 'true' : null"
            [attr.aria-describedby]="getAriaDescribedBy()"
            [attr.aria-errormessage]="showError() && errorText ? resolvedId + '-error' : null"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
        </div>

        @if (showClear && (rawValue() || currentRaw())) {
          <button type="button"
                  class="ngxsmk-tel__clear"
                  (click)="clearInput()"
                  [attr.aria-label]="clearAriaLabel"
                  [attr.aria-describedby]="resolvedId">
            ×
          </button>
        }
      </div>

      @if (hint && !showError()) {
        <div class="ngxsmk-tel__hint" [id]="resolvedId + '-hint'">{{ hint }}</div>
      }
      @if (showError() && errorText) {
        <div class="ngxsmk-tel__error" 
             [id]="resolvedId + '-error'"
             role="alert"
             [attr.aria-live]="'polite'">{{ errorText }}</div>
      }
      <div [id]="resolvedId + '-status'" 
           class="sr-only" 
           role="status" 
           [attr.aria-live]="'polite'"
           [attr.aria-atomic]="true">{{ getAriaStatusMessage() }}</div>
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

  // ========== Signal-based API (Angular 17+) ==========

  /** Signal-based input: Initial country to select. Use 'auto' for geo-location detection. */
  initialCountrySignal = input<CountryCode | 'auto'>('US');

  /** Signal-based input: Countries to show at the top of the dropdown list. */
  preferredCountriesSignal = input<CountryCode[]>(['US', 'GB']);

  /** Signal-based input: Restrict selectable countries to this list. */
  onlyCountriesSignal = input<CountryCode[] | undefined>(undefined);

  /** Signal-based input: When true, shows dial code outside the input field. */
  separateDialCodeSignal = input<boolean>(true);

  /** Signal-based input: Enable or disable the country dropdown. */
  allowDropdownSignal = input<boolean>(true);

  /** Signal-based input: Display format - 'formatted' => national with spaces; 'digits' => digits only */
  nationalDisplaySignal = input<'formatted' | 'digits'>('formatted');

  /** Signal-based input: Format timing - 'typing' (live), 'blur', or 'off' */
  formatWhenValidSignal = input<'off' | 'blur' | 'typing'>('typing');

  /** Signal-based input: Size variant */
  sizeSignal = input<'sm' | 'md' | 'lg'>('md');

  /** Signal-based input: Style variant */
  variantSignal = input<'outline' | 'filled' | 'underline'>('outline');

  /** Signal-based input: Theme preference */
  themeSignal = input<'light' | 'dark' | 'auto'>('auto');

  /** Signal-based input: Disabled state */
  disabledSignal = input<boolean>(false);

  /** Signal-based output: Emitted when country selection changes */
  countryChangeSignal = output<{ iso2: CountryCode }>();

  /** Signal-based output: Emitted when validity changes */
  validityChangeSignal = output<boolean>();

  /** Signal-based output: Emitted on every input change */
  inputChangeSignal = output<{ raw: string; e164: string | null; iso2: CountryCode }>();

  /** Internal state signal for reactive state management */
  private stateSignal: WritableSignal<PhoneInputState> = createPhoneInputState();

  /** Computed signal: Current phone input state */
  readonly state = this.stateSignal.asReadonly();

  /** Computed signal: Formatted display value */
  readonly formattedValue = createFormattedValueSignal(this.stateSignal, this.nationalDisplaySignal);

  /** Computed signal: Validation status */
  readonly validationStatus = createValidationStatusSignal(this.stateSignal);

  /** Computed signal: Phone number metadata */
  readonly phoneMetadata = createPhoneMetadataSignal(this.stateSignal);

  /** Computed signal: Whether the input is valid */
  readonly isValid = computed(() => this.stateSignal().isValid);

  /** Computed signal: Whether the input has errors */
  readonly hasErrors = computed(() => {
    const errors = this.stateSignal().errors;
    return errors !== null && Object.keys(errors).length > 0;
  });

  /** Computed signal: Whether to show error message */
  readonly showError = computed(() => {
    if (this.isDestroyed) return false;
    const state = this.stateSignal();
    const hasErrors = state.errors !== null && Object.keys(state.errors).length > 0;
    return this.showErrorWhenTouched ? (state.touched && hasErrors) : hasErrors;
  });

  /** Computed signal: Current E.164 value */
  readonly e164Value = computed(() => this.stateSignal().e164);

  /** Computed signal: Current raw input value */
  readonly rawValue = computed(() => this.stateSignal().raw);

  /** Computed signal: Current country ISO2 code */
  readonly currentCountry = computed(() => this.stateSignal().iso2);

  // ========== Traditional @Input/@Output API (backward compatibility) ==========

  /** Initial country to select. Use 'auto' for geo-location detection (defaults to 'US'). */
  @Input() initialCountry: CountryCode | 'auto' = 'US';
  /** Countries to show at the top of the dropdown list. */
  @Input() preferredCountries: CountryCode[] = ['US', 'GB'];
  /** Restrict selectable countries to this list. If not provided, all countries are available. */
  @Input() onlyCountries?: CountryCode[];
  /** When true, shows dial code outside the input field (after the flag). */
  @Input() separateDialCode: boolean = true;
  /** Enable or disable the country dropdown. */
  @Input() allowDropdown: boolean = true;

  /** 'formatted' => national with spaces; 'digits' => digits only */
  @Input() nationalDisplay: 'formatted' | 'digits' = 'formatted';
  /** 'typing' (live), 'blur', or 'off' */
  @Input() formatWhenValid: 'off' | 'blur' | 'typing' = 'typing';

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
  @Input() showClear = true;
  @Input() autoFocus = false;
  @Input() selectOnFocus = false;
  @Input() showErrorWhenTouched = true;

  @Input() dropdownAttachToBody = true;
  @Input() dropdownZIndex = 2000;

  @Input('i18n') i18n?: IntlTelI18n;
  @Input('telI18n') set telI18n(v: IntlTelI18n | undefined) { this.i18n = v; }
  @Input('localizedCountries') localizedCountries?: CountryMap;
  @Input('telLocalizedCountries') set telLocalizedCountries(v: CountryMap | undefined) { this.localizedCountries = v; }

  @Input() clearAriaLabel = 'Clear phone number';
  @Input() dir: 'ltr' | 'rtl' = 'ltr';

  @Input() autoPlaceholder: 'off' | 'polite' | 'aggressive' = 'off';
  @Input() utilsScript?: string;
  @Input() customPlaceholder?: (example: string, country: unknown) => string;

  @Input() digitsOnly = true;
  @Input() lockWhenValid = true;

  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Custom colors for fine-grained theme control.
   */
  @Input() customColors?: {
    light?: ColorPalette;
    dark?: ColorPalette;
  };

  /** Enable carrier and number type detection */
  @Input() enableIntelligence = false;

  /** Enable format suggestions */
  @Input() enableFormatSuggestions = false;

  @Output() countryChange = new EventEmitter<{ iso2: CountryCode }>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() inputChange = new EventEmitter<{ raw: string; e164: string | null; iso2: CountryCode }>();
  @Output() intelligenceChange = new EventEmitter<CarrierInfo | null>();
  @Output() formatSuggestion = new EventEmitter<FormatSuggestion | null>();

  private iti: IntlTelInstance | null = null;
  private onChange: (val: string | null) => void = () => { };
  private onTouchedCb: () => void = () => { };
  private validatorChange?: () => void;
  private lastEmittedValid = false;
  private pendingWrite: string | null = null;
  private touched = false;
  private isDestroyed = false;
  private eventListeners: Array<{ element: HTMLElement; event: string; handler: (event: Event) => void }> = [];
  private searchInputCleanupFunctions: Array<() => void> = [];

  private allowDropdownWasTrue = false;
  private suppressEvents = false;
  private themeObserver: MutationObserver | null = null;
  private globalThemeObserver: MutationObserver | null = null;

  readonly resolvedId: string = this.inputId || ('tel-' + Math.random().toString(36).slice(2));
  private readonly platformId = inject(PLATFORM_ID);
  private currentTheme: 'light' | 'dark' = 'light';
  private lastThemeConfig: 'light' | 'dark' | 'auto' | null = null;

  isRequired = false;

  private readonly intelligence: PhoneIntelligenceService | null = inject(PhoneIntelligenceService, { optional: true });

  private readonly hostElementRef = inject(ElementRef);

  constructor(
    @Optional() private readonly zone: NgZone | null,
    private readonly tel: NgxsmkTelInputService,
    private readonly cdr: ChangeDetectorRef
  ) {
    // Watch for theme signal changes
    effect(() => {
      if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
      // Check both signal and traditional input
      const theme = this.themeSignal() || this.theme;
      if (theme !== undefined && theme !== this.lastThemeConfig) {
        this.lastThemeConfig = theme;
        // Apply theme immediately (works even before plugin is initialized)
        this.detectAndApplyTheme();
      }
    });
  }

  /**
   * Helper method to run code inside Angular zone if available, otherwise just run it.
   * Works with both Zone.js and zoneless Angular.
   */
  private runInZone(fn: () => void): void {
    if (this.zone) {
      this.zone.run(fn);
    } else {
      fn();
      this.cdr.markForCheck();
    }
  }

  /**
   * Helper method to run code outside Angular zone if available, otherwise just run it.
   * Works with both Zone.js and zoneless Angular.
   */
  private runOutsideZone(fn: () => void): void {
    if (this.zone) {
      this.zone.runOutsideAngular(fn);
    } else {
      fn();
    }
  }

  /**
   * Helper method for requestAnimationFrame with fallback for older browsers.
   */
  private requestAnimationFrame(fn: () => void): void {
    if (typeof window !== 'undefined') {
      const raf = window.requestAnimationFrame ||
        (window as any).webkitRequestAnimationFrame ||
        (window as any).mozRequestAnimationFrame ||
        (window as any).msRequestAnimationFrame ||
        ((callback: () => void) => setTimeout(callback, 16));
      raf(fn);
    } else {
      fn();
    }
  }

  /**
   * Determines if dropdown should be attached to body.
   * On mobile screens (<=768px), returns false to show dropdown inline instead of as modal.
   */
  private shouldAttachToBody(): boolean {
    if (!this.dropdownAttachToBody) return false;
    if (typeof window === 'undefined') return false;
    // On mobile, don't attach to body to avoid modal popup behavior
    // Use fallback for older browsers
    const width = window.innerWidth || (window as any).clientWidth || 1024;
    return width > 768;
  }

  /**
   * Angular lifecycle hook called after the view is initialized.
   * Initializes the intl-tel-input plugin and sets up event listeners.
   */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
    // Ensure theme is applied on initial render
    // Use setTimeout to ensure host element is fully available
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.detectAndApplyTheme();
      }
    }, 0);
    this.setupDropdownThemeObserver();
    this.setupGlobalThemeObserver();
    void this.initAndWire();
  }

  private async initAndWire(): Promise<void> {
    if (this.isDestroyed) return;

    await this.initIntlTelInput();
    if (this.isDestroyed) return;

    this.bindDomListeners();

    if (this.pendingWrite !== null && !this.isDestroyed) {
      const v = this.pendingWrite;
      this.pendingWrite = null;
      this.writeValue(v);
    }

    if (this.autoFocus && !this.isDestroyed) {
      this.requestAnimationFrame(() => {
        if (!this.isDestroyed) this.focus();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;

    // Check for signal changes or traditional input changes
    const configChanged = [
      'initialCountry', 'preferredCountries', 'onlyCountries',
      'separateDialCode', 'allowDropdown',
      'i18n', 'localizedCountries', 'dir',
      'autoPlaceholder', 'utilsScript', 'customPlaceholder'
    ].some(k => k in changes && !changes[k]?.firstChange);

    // Also check if any signal inputs have changed (signals trigger change detection automatically)
    if (configChanged && this.iti && !this.isDestroyed) {
      this.reinitPlugin();
      this.validatorChange?.();
    }

    // Handle theme changes from traditional @Input
    if ('theme' in changes && !changes['theme'].firstChange) {
      const theme = this.theme;
      if (theme !== this.lastThemeConfig) {
        this.lastThemeConfig = theme;
        this.detectAndApplyTheme();
        // Mark for check to ensure view updates with OnPush
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroyPlugin();
    this.cleanupEventListeners();
    this.cleanupSearchInputListeners();
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.globalThemeObserver) {
      this.globalThemeObserver.disconnect();
      this.globalThemeObserver = null;
    }
  }

  /**
   * Writes a new value to the form control.
   * Called by Angular Forms when the control value changes programmatically.
   * @param val - The new value (E.164 format string or null)
   */
  writeValue(val: string | null): void {
    if (!this.inputRef || this.isDestroyed) return;

    if (!this.iti) {
      this.pendingWrite = val ?? '';
      return;
    }

    // Get current state for comparison (will be checked after setNumber with correct country)
    const currentE164 = this.stateSignal().e164;

    this.suppressEvents = true;
    try {
      // Call setNumber() FIRST to let intl-tel-input detect and set the correct country
      // This is critical when the incoming value has a different country code
      this.iti.setNumber(val || '');

      // Now get the country code AFTER setNumber has potentially changed it
      const iso2 = this.currentIso2();

      // Parse with the correct country code
      const parsed = this.tel.parseWithInvalidDetection(val ?? '', iso2);
      const incomingE164 = parsed.e164;

      // Avoid unnecessary updates if E.164 value hasn't changed
      if (currentE164 === incomingE164) {
        // Even if E.164 is the same, update if the display value would be different
        // (e.g., user changed format settings or country changed)
        const currentRaw = this.stateSignal().raw;
        const currentIso2 = this.stateSignal().iso2;

        // If country changed, we need to update
        if (currentIso2 !== iso2) {
          // Country changed, proceed with update
        } else {
          // Same country, check if display value is different
          const nsn = incomingE164
            ? this.nsnFromE164(incomingE164, iso2)
            : this.stripLeadingZero(this.toNSN(parsed.national ?? (val ?? '')));
          const display = this.displayValue(nsn, iso2);
          if (currentRaw === display) {
            return; // Nothing to update
          }
        }
      }

      const nsn = incomingE164
        ? this.nsnFromE164(incomingE164, iso2)
        : this.stripLeadingZero(this.toNSN(parsed.national ?? (val ?? '')));

      const display = this.displayValue(nsn, iso2);
      this.setInputValue(display);

      // Update state signal without triggering Angular Forms onChange
      // (writeValue is called BY Angular Forms, so we shouldn't notify it back)
      this.stateSignal.update(state => ({
        ...state,
        raw: display,
        e164: incomingE164,
        iso2,
        isValid: parsed.isValid && !parsed.isInvalidInternational,
        errors: (parsed.isValid && !parsed.isInvalidInternational) ? null : (parsed.isInvalidInternational ? { phoneInvalidCountryCode: true, phoneInvalid: false } : { phoneInvalid: true, phoneInvalidCountryCode: false })
      }));

      // Emit inputChange for external listeners (but NOT onChange to avoid loop)
      this.runInZone(() => {
        this.inputChange.emit({ raw: display, e164: incomingE164, iso2 });
        this.inputChangeSignal.emit({ raw: display, e164: incomingE164, iso2 });
      });
      // Mark for check to ensure view updates (works in both zone and zoneless)
      this.cdr.markForCheck();
    } finally {
      this.suppressEvents = false;
    }
  }

  /**
   * Registers a callback function that is called when the control's value changes.
   * @param fn - Callback function that receives the new value (string | null)
   */
  registerOnChange(fn: (val: string | null) => void): void { this.onChange = fn; }

  /**
   * Registers a callback function that is called when the control is touched.
   * @param fn - Callback function to be called on touch
   */
  registerOnTouched(fn: () => void): void { this.onTouchedCb = fn; }

  /**
   * Sets the disabled state of the control.
   * Called by Angular Forms when the control's disabled state changes.
   * @param isDisabled - Whether the control should be disabled
   */
  setDisabledState(isDisabled: boolean): void {
    if (this.isDestroyed) return;

    this.disabled = isDisabled;

    if (this.inputRef) this.inputRef.nativeElement.disabled = isDisabled;

    if (this.iti) {
      if (isDisabled && this.allowDropdown) {
        this.allowDropdownWasTrue = true;
        this.allowDropdown = false;
        this.reinitPlugin(); // closes popup & removes handlers
      } else if (!isDisabled && this.allowDropdownWasTrue) {
        this.allowDropdown = true;
        this.allowDropdownWasTrue = false;
        this.reinitPlugin();
      } else {
        this.applyDisabledUi(isDisabled);
      }
    } else {
      this.applyDisabledUi(isDisabled);
    }
  }

  /**
   * Validates the phone number input.
   * Returns validation errors if the number is invalid, null if valid.
   * @param _ - The form control (unused, but required by Validator interface)
   * @returns ValidationErrors object with error keys, or null if valid
   */
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.isDestroyed) return null;

    // Update isRequired based on control validators
    // Check if control has required validator by testing with null value
    try {
      if (control.validator) {
        const testControl = { value: null } as AbstractControl;
        const errors = control.validator(testControl);
        this.isRequired = !!(errors && errors['required']);
      } else {
        this.isRequired = false;
      }
    } catch (e) {
      // Fallback to not required if validator check fails
      this.isRequired = false;
    }

    const raw = this.currentRaw();
    if (!raw) return null;

    const parsed = this.tel.parseWithInvalidDetection(raw, this.currentIso2());
    const valid = parsed.isValid && !parsed.isInvalidInternational;

    if (valid !== this.lastEmittedValid) {
      this.lastEmittedValid = valid;

      // Update state signal
      this.stateSignal.update(state => ({
        ...state,
        isValid: valid,
        errors: valid ? null : (parsed.isInvalidInternational ? { phoneInvalidCountryCode: true, phoneInvalid: false } : { phoneInvalid: true, phoneInvalidCountryCode: false })
      }));

      // Emit both traditional and signal-based outputs
      this.validityChange.emit(valid);
      this.validityChangeSignal.emit(valid);

      // Mark for check when validity changes
      this.cdr.markForCheck();
    }

    if (!valid) {
      if (parsed.isInvalidInternational) {
        return { phoneInvalidCountryCode: true };
      }
      return { phoneInvalid: true };
    }

    return null;
  }

  /**
   * Registers a callback function that is called when validator inputs change.
   * @param fn - Callback function to be called when validation should be re-run
   */
  registerOnValidatorChange(fn: () => void): void { this.validatorChange = fn; }

  /**
   * Programmatically focuses the input field.
   * If selectOnFocus is enabled, also selects all text.
   */
  focus(): void {
    if (this.isDestroyed || !this.inputRef) return;

    this.inputRef.nativeElement.focus();
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      this.requestAnimationFrame(() => {
        if (!this.isDestroyed) {
          try {
            el.setSelectionRange(0, el.value.length);
          } catch (e) {
            // Fallback for browsers that don't support setSelectionRange
            if (el.select) {
              el.select();
            }
          }
        }
      });
    }
  }

  /**
   * Programmatically selects a country.
   * @param iso2 - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
   */
  selectCountry(iso2: CountryCode): void {
    if (this.iti && !this.isDestroyed) {
      this.iti.setCountry(iso2.toLowerCase());
      this.handleInput();
    }
  }

  /**
   * Clears the input field and refocuses it.
   */
  clearInput(): void {
    if (this.isDestroyed) return;

    this.setInputValue('');
    this.handleInput();
    this.inputRef.nativeElement.focus();
  }

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

    // Use signal values if available, fallback to traditional inputs
    const initialCountry = this.initialCountrySignal() || this.initialCountry;
    const preferredCountries = this.preferredCountriesSignal() || this.preferredCountries;
    const onlyCountries = this.onlyCountriesSignal() ?? this.onlyCountries;
    const allowDropdown = this.allowDropdownSignal() ?? this.allowDropdown;
    const separateDialCode = this.separateDialCodeSignal() ?? this.separateDialCode;

    const config: IntlTelInputConfig = {
      initialCountry: initialCountry === 'auto' ? 'auto' : (initialCountry?.toLowerCase() || 'us'),
      countryOrder: (preferredCountries ?? []).map(c => c.toLowerCase()),
      onlyCountries: (onlyCountries ?? []).map(c => c.toLowerCase()),
      nationalMode: true,
      allowDropdown,
      separateDialCode,
      geoIpLookup: (cb: (iso2: string) => void) => cb('us'),

      autoPlaceholder: this.autoPlaceholder,
      utilsScript: this.utilsScript,
      customPlaceholder: this.customPlaceholder,

      i18n: this.i18n,
      localizedCountries: toLowerKeys(this.localizedCountries),
      // On mobile, don't attach to body to avoid modal behavior
      dropdownContainer: this.shouldAttachToBody() ? (typeof document !== 'undefined' ? document.body : undefined) : undefined
    };

    this.runOutsideZone(() => {
      if (!this.isDestroyed) {
        this.iti = intlTelInput(this.inputRef.nativeElement, config as any);
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
      try {
        this.iti?.setCountry(prevIso2);
      } catch (e) {
        // Ignore errors when setting country (e.g., invalid country code)
      }
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
  }

  // ---------- Input listeners ----------
  private bindDomListeners() {
    if (this.isDestroyed || !this.inputRef) return;

    const el = this.inputRef.nativeElement;

    this.runOutsideZone(() => {
      const beforeInputHandler = (ev: Event) => {
        if (this.isDestroyed || !this.digitsOnly) return;
        const inputEvent = ev as BeforeInputEvent;
        const data = inputEvent.data;

        if (this.lockWhenValid && this.isCurrentlyValid()) {
          const selStart = el.selectionStart ?? 0;
          const selEnd = el.selectionEnd ?? 0;
          const selCollapsed = selStart === selEnd;
          const isDigit = !!data && inputEvent.inputType === 'insertText' && data >= '0' && data <= '9';
          if (selCollapsed && isDigit) { ev.preventDefault(); return; }
        }

        if (!data || inputEvent.inputType !== 'insertText') return;
        const isDigit = data >= '0' && data <= '9';
        if (!isDigit) { ev.preventDefault(); return; }

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

        const clipboardEvent = e as ClipboardEventWithData;
        // Support both standard ClipboardEvent and IE11 fallback
        const clipboardData = clipboardEvent.clipboardData ||
          ((window as Window & { clipboardData?: DataTransfer }).clipboardData) ||
          null;
        let text = '';
        if (clipboardData) {
          try {
            text = clipboardData.getData('text') || '';
          } catch (err) {
            // Fallback for browsers without clipboardData support
            text = '';
          }
        }
        e.preventDefault();

        const iso2 = this.currentIso2();
        let digits = this.stripLeadingZero(this.toNSN(text));

        while (this.wouldExceedMax(digits, iso2)) {
          digits = digits.slice(0, -1);
          if (!digits) break;
        }

        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;

        // Use setRangeText with fallback for older browsers
        if (el.setRangeText) {
          try {
            el.setRangeText(digits, start, end, 'end');
          } catch (e) {
            // Fallback for browsers without setRangeText support
            el.value = el.value.substring(0, start) + digits + el.value.substring(end);
          }
        } else {
          el.value = el.value.substring(0, start) + digits + el.value.substring(end);
        }

        this.requestAnimationFrame(() => {
          if (!this.isDestroyed) this.handleInput();
        });
      };

      const inputHandler = () => {
        if (!this.isDestroyed) this.handleInput();
      };

      const countryChangeHandler = () => {
        if (this.isDestroyed || this.suppressEvents) return;

        const iso2 = this.currentIso2();

        // Update state signal
        this.stateSignal.update(state => ({
          ...state,
          iso2
        }));

        this.runInZone(() => {
          const changeEvent = { iso2 };

          // Emit both traditional and signal-based outputs
          this.countryChange.emit(changeEvent);
          this.countryChangeSignal.emit(changeEvent);

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

  onBlur() {
    if (this.isDestroyed) return;

    this.touched = true;

    // Update state signal
    this.stateSignal.update(state => ({
      ...state,
      touched: true
    }));

    this.runInZone(() => {
      this.onTouchedCb();
      // Trigger validation on blur
      this.validatorChange?.();
    });
    // Mark for check to update view with OnPush (works in both zone and zoneless)
    this.cdr.markForCheck();

    const formatWhenValidBlur = this.formatWhenValidSignal() || this.formatWhenValid;
    if (formatWhenValidBlur === 'off') return;

    const iso2 = this.currentIso2();
    const digits = this.stripLeadingZero(this.toNSN(this.currentRaw()));

    const parsed = this.tel.parseWithInvalidDetection(digits, iso2);
    if (!parsed.e164 && !parsed.isValid) return;

    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    if (formatWhenValidBlur !== 'typing') {
      this.setInputValue(this.displayValue(nsn, iso2));
    }
  }

  onFocus() {
    if (this.isDestroyed || !this.selectOnFocus || !this.inputRef) return;

    const el = this.inputRef.nativeElement;
    this.requestAnimationFrame(() => {
      if (!this.isDestroyed) {
        try {
          if (el.setSelectionRange) {
            el.setSelectionRange(0, el.value.length);
          } else if (el.select) {
            // Fallback for browsers that don't support setSelectionRange
            el.select();
          }
        } catch (e) {
          // Ignore errors in older browsers
        }
      }
    });
  }

  private handleInput() {
    if (this.suppressEvents || this.isDestroyed) return;

    // Cache currentRaw() to avoid multiple DOM reads
    const rawValue = this.currentRaw();
    const iso2 = this.currentIso2();
    const digits = this.stripLeadingZero(this.toNSN(rawValue));

    const parsed = this.tel.parseWithInvalidDetection(digits, iso2);
    const isValid = parsed.isValid && !parsed.isInvalidInternational;

    // Batch state signal update
    this.stateSignal.update(state => ({
      ...state,
      raw: rawValue,
      e164: parsed.e164,
      iso2,
      isValid,
      errors: isValid ? null : (parsed.isInvalidInternational ? { phoneInvalidCountryCode: true, phoneInvalid: false } : { phoneInvalid: true, phoneInvalidCountryCode: false })
    }));

    // Intelligence features
    if (this.enableIntelligence && this.intelligence && parsed.e164) {
      const carrierInfo = this.intelligence.detectCarrierAndType(parsed.e164, iso2);
      if (carrierInfo) {
        this.intelligenceChange.emit(carrierInfo);
      }
    }

    // Format suggestions
    if (this.enableFormatSuggestions && this.intelligence && !parsed.isValid) {
      const suggestion = this.intelligence.suggestFormatCorrection(rawValue, iso2);
      if (suggestion) {
        this.formatSuggestion.emit(suggestion);
      }
    }

    // Batch zone operations and emissions
    this.runInZone(() => {
      this.onChange(parsed.e164);

      const changeEvent = { raw: rawValue, e164: parsed.e164, iso2 };

      // Emit both traditional and signal-based outputs
      this.inputChange.emit(changeEvent);
      this.inputChangeSignal.emit(changeEvent);

      // Trigger validation when input changes
      this.validatorChange?.();
    });
    // Mark for check to update view with OnPush (works in both zone and zoneless)
    this.cdr.markForCheck();

    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    const formatWhenValid = this.formatWhenValidSignal() || this.formatWhenValid;
    const display = formatWhenValid === 'typing' ? this.displayValue(nsn, iso2) : nsn;

    if (display !== rawValue) this.setInputValue(display);
  }
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
    try {
      return (this.iti?.getSelectedCountryData?.()?.dialCode ?? '').toString();
    } catch (e) {
      // Return empty string if country data is unavailable
      return '';
    }
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
    } catch (e) {
      // Return unformatted NSN if formatting fails
      return nsn;
    }
  }

  /** Compose visible value based on settings. */
  private displayValue(nsn: string, iso2: CountryCode): string {
    const nationalDisplay = this.nationalDisplaySignal() || this.nationalDisplay;
    return nationalDisplay === 'formatted' ? this.formatNSN(nsn, iso2) : nsn;
  }

  /**
   * Gets the current raw input value (as displayed, with formatting).
   * @returns The current input value as a string
   */
  currentRaw(): string {
    return this.isDestroyed ? '' : (this.inputRef?.nativeElement.value ?? '').trim();
  }

  /**
   * Gets the aria-describedby attribute value for accessibility.
   * @returns Space-separated list of element IDs that describe this input
   */
  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    const hasError = this.showError();
    if (this.hint && !hasError) {
      ids.push(this.resolvedId + '-hint');
    }
    if (hasError && this.errorText) {
      ids.push(this.resolvedId + '-error');
    }
    ids.push(this.resolvedId + '-status');
    return ids.length > 0 ? ids.join(' ') : null;
  }

  /**
   * Gets the ARIA status message for screen readers.
   * @returns Status message describing the current state
   */
  getAriaStatusMessage(): string {
    if (this.isDestroyed) return '';
    const raw = this.currentRaw();
    if (!raw) return '';

    const iso2 = this.currentIso2();
    const parsed = this.tel.parseWithInvalidDetection(raw, iso2);

    if (parsed.isValid && parsed.e164) {
      return `Valid phone number: ${parsed.e164}`;
    } else if (parsed.isInvalidInternational) {
      return 'Invalid country code';
    } else {
      return 'Invalid phone number';
    }
  }

  private currentIso2(): CountryCode {
    if (this.isDestroyed) return 'US';

    try {
      const iso2 = (this.iti?.getSelectedCountryData?.()?.iso2 ?? this.initialCountry ?? 'US')
        .toString().toUpperCase();
      return iso2 as CountryCode;
    } catch (e) {
      // Fallback to initial country or default if country data is unavailable
      return (this.initialCountry ?? 'US') as CountryCode;
    }
  }

  private setInputValue(v: string) {
    if (!this.isDestroyed && this.inputRef) {
      this.inputRef.nativeElement.value = v ?? '';
    }
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
    } catch (e) {
      // Return false if validation fails (assume not too long)
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

    // Fix precedence: Check signal first, but if it's 'auto' (default), fallback to legacy input
    // This allows [theme]="'light'" to work even if signal defaults to 'auto'
    const signalTheme = this.themeSignal();
    const theme = signalTheme !== 'auto' ? signalTheme : this.theme;

    if (theme === 'auto') {
      // Check for matchMedia support (not available in older browsers)
      try {
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
          detectedTheme = 'dark';
        }
      } catch (e) {
        // Fallback for browsers without matchMedia support
      }

      // Check for dark class on document element
      if (document.documentElement?.classList?.contains('dark')) {
        detectedTheme = 'dark';
      }
      // Check for data-theme attribute
      else if (document.documentElement?.getAttribute('data-theme') === 'dark') {
        detectedTheme = 'dark';
      }
    } else {
      detectedTheme = theme;
    }

    // Always apply theme (even if same) to ensure it's set on the element
    console.log(`[NgxsmkTelInput] Applying theme: ${detectedTheme} (Config: ${theme}, System Dark: ${typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches})`);

    this.currentTheme = detectedTheme;
    this.applyTheme(detectedTheme);
  }

  /** Apply theme to the component */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const hostElement = this.hostElementRef?.nativeElement as HTMLElement;
    if (hostElement) {
      // Set the theme attribute - this is the primary way CSS selects the theme
      hostElement.setAttribute('data-theme', theme);

      // Also add/remove dark class for additional CSS selector support
      if (theme === 'dark') {
        hostElement.classList.add('dark');
        hostElement.classList.remove('light');
      } else {
        hostElement.classList.add('light');
        hostElement.classList.remove('dark');
      }

      // Force style recalculation to ensure CSS is applied
      void hostElement.offsetHeight; // Trigger reflow

      // Mark for check to update view with OnPush strategy
      this.cdr.markForCheck();
    } else {
      // Retry if host element not available yet
      this.requestAnimationFrame(() => {
        if (!this.isDestroyed) {
          this.applyTheme(theme);
        }
      });
      return;
    }

    this.applyCustomColors(theme);

    this.applyThemeToDropdown(theme);
  }

  private applyCustomColors(theme: 'light' | 'dark') {
    if (!this.customColors || !this.customColors[theme]) return;
    const p = this.customColors[theme]!;
    // Use hostElementRef since we used it above
    const hostElement = this.hostElementRef?.nativeElement as HTMLElement;
    if (!hostElement) return;

    const style = hostElement.style;
    const set = (k: string, v?: string) => { if (v) style.setProperty(k, v, 'important'); };

    set('--tel-bg', p.background);
    set('--tel-fg', p.foreground);
    set('--tel-border', p.border);
    set('--tel-border-hover', p.borderHover);
    set('--tel-ring', p.ring);
    set('--tel-placeholder', p.placeholder);
  }

  /** Apply theme to the dropdown if it exists */
  private applyThemeToDropdown(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof document === 'undefined' || !document.querySelector) return;

    try {
      const dropdown = document.querySelector('.iti__country-list') as HTMLElement;
      if (dropdown && dropdown.setAttribute) {
        dropdown.setAttribute('data-theme', theme);
      }
    } catch (e) {
      // Fallback for browsers without querySelector support
    }
  }

  /**
   * Gets the current resolved theme (light or dark).
   * @returns The current theme ('light' or 'dark')
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Sets the theme programmatically.
   * @param theme - Theme to apply ('light' or 'dark')
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme;
    this.detectAndApplyTheme();
  }

  /** Update dropdown theme when it's opened */
  private updateDropdownTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const dropdown = document.querySelector('.iti__country-list') as HTMLElement;
      if (dropdown) {
        dropdown.setAttribute('data-theme', this.currentTheme);

        if (this.currentTheme === 'dark') {
          dropdown.classList.add('dark-theme');
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          dropdown.classList.remove('dark-theme');
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }

        const searchInput = dropdown.querySelector('.iti__search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.setAttribute('data-theme', this.currentTheme);
          if (this.currentTheme === 'dark') {
            searchInput.classList.add('dark-theme');
          } else {
            searchInput.classList.remove('dark-theme');
          }

          searchInput.style.pointerEvents = 'auto';
          searchInput.style.opacity = '1';
          searchInput.disabled = false;

          // Add clear button functionality
          this.setupSearchInputClearButton(searchInput);
        }
      }
    }, 10);
  }

  /** Setup clear button for search input */
  private setupSearchInputClearButton(searchInput: HTMLInputElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Clean up any existing listeners first
    this.cleanupSearchInputListeners();

    // Find the search container (could be parent or a wrapper)
    let searchContainer = searchInput.parentElement;
    if (!searchContainer) return;

    // Remove existing clear button if any
    const existingClear = searchContainer.querySelector('.iti__search-clear');
    if (existingClear) {
      existingClear.remove();
    }

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'iti__search-clear';
    clearButton.setAttribute('aria-label', 'Clear search');
    clearButton.innerHTML = '×';
    clearButton.setAttribute('tabindex', '-1');

    // Make search input container relative if needed
    const containerStyle = window.getComputedStyle(searchContainer);
    if (containerStyle.position === 'static') {
      searchContainer.style.position = 'relative';
    }

    // Append clear button to container
    searchContainer.appendChild(clearButton);

    // Show/hide clear button based on input value
    const updateClearButton = () => {
      if (searchInput.value && searchInput.value.trim()) {
        clearButton.style.display = 'flex';
      } else {
        clearButton.style.display = 'none';
      }
    };

    // Clear input when button is clicked
    const handleClear = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = '';
      // Trigger input event to update the country list
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
      searchInput.focus();
      updateClearButton();
    };

    const handleMousedown = (e: Event) => e.preventDefault();
    const handlePaste = () => {
      setTimeout(updateClearButton, 0);
    };

    // Add event listeners and track cleanup functions
    clearButton.addEventListener('click', handleClear);
    this.searchInputCleanupFunctions.push(() => clearButton.removeEventListener('click', handleClear));

    clearButton.addEventListener('mousedown', handleMousedown);
    this.searchInputCleanupFunctions.push(() => clearButton.removeEventListener('mousedown', handleMousedown));

    // Update button visibility on input
    searchInput.addEventListener('input', updateClearButton);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('input', updateClearButton));

    searchInput.addEventListener('keyup', updateClearButton);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('keyup', updateClearButton));

    searchInput.addEventListener('focus', updateClearButton);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('focus', updateClearButton));

    searchInput.addEventListener('paste', handlePaste);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('paste', handlePaste));

    // Initial state
    updateClearButton();
  }

  /** Clean up search input event listeners to prevent memory leaks */
  private cleanupSearchInputListeners(): void {
    this.searchInputCleanupFunctions.forEach(cleanup => cleanup());
    this.searchInputCleanupFunctions = [];
  }

  /** Setup observer to watch for dropdown changes and apply theme */
  private setupDropdownThemeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window === 'undefined' || !window.MutationObserver) return;

    // Only create observer if it doesn't already exist
    if (this.themeObserver) return;

    try {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === 1) {
                const element = node as HTMLElement;
                if (element.classList && element.classList.contains('iti__country-list')) {
                  this.updateDropdownTheme();
                }
              }
            });
          }
        });
      });

      if (this.themeObserver && document.body) {
        this.themeObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    } catch (e) {
      // Fallback for browsers without MutationObserver support
      this.themeObserver = null;
    }
  }

  /** Setup observer to watch for global theme changes on html/body */
  private setupGlobalThemeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Watch for class changes on document.documentElement (html tag)
    // This supports Tailwind and other class-based theming systems
    const target = document.documentElement;
    if (!target || !window.MutationObserver) return;

    this.globalThemeObserver = new MutationObserver((mutations) => {
      // Only re-check if we are in auto mode
      const themeConfig = this.themeSignal() || this.theme;
      if (themeConfig === 'auto') {
        this.detectAndApplyTheme();
      }
    });

    this.globalThemeObserver.observe(target, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
  }
}

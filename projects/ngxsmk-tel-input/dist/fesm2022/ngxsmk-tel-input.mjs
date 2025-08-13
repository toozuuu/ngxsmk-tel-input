import * as i0 from '@angular/core';
import { InjectionToken, Optional, Inject, Injectable, EventEmitter, PLATFORM_ID, forwardRef, Output, Input, ViewChild, Component } from '@angular/core';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

const ngxsmk_TEL_DEFAULTS = new InjectionToken('ngxsmk_TEL_DEFAULTS');
class ngxsmkTelInputService {
    defaults = {
        defaultCountry: 'US',
        nationalMode: false
    };
    constructor(cfg) {
        this.defaults = { ...this.defaults, ...(cfg ?? {}) };
    }
    /** Update defaults at runtime if you need to (multi-tenant apps, theming, etc.) */
    setDefaults(partial) {
        this.defaults = { ...this.defaults, ...partial };
    }
    getDefaults() {
        return this.defaults;
    }
    /** Fast check: '+...' → true-ish shape (not full validation) */
    looksLikeE164(v) {
        return !!v && /^\+\d{3,}$/.test(v);
    }
    /**
     * Parse any user input into structured data.
     * - If input starts with +, region is inferred from the number.
     * - Else uses provided `country` or the configured default.
     */
    parse(input, country) {
        const raw = (input ?? '').trim();
        if (!raw)
            return { e164: null, isValid: false };
        const region = this.looksLikeE164(raw) ? undefined : (country ?? this.defaults.defaultCountry);
        const pn = parsePhoneNumberFromString(raw, region);
        if (!pn)
            return { e164: null, isValid: false };
        const isValid = pn.isValid();
        return {
            e164: isValid ? pn.number : null,
            national: pn.formatNational(),
            international: pn.formatInternational(),
            country: pn.country,
            isValid,
            raw: pn
        };
    }
    /** Validate a number (raw user input or E.164). Optionally force region. */
    isValid(input, country) {
        return this.parse(input, country).isValid;
    }
    /** Format to E.164 (or null if invalid) */
    toE164(input, country) {
        return this.parse(input, country).e164;
    }
    /** Format nicely for display (international vs national) */
    formatDisplay(input, opts) {
        const { international = !this.defaults.nationalMode, country } = opts ?? {};
        const p = this.parse(input, country);
        if (!p.raw)
            return input;
        return international ? p.raw.formatInternational() : p.raw.formatNational();
    }
    /** As-you-type formatting for text inputs (pure function) */
    asYouType(nextText, country) {
        const region = country ?? this.defaults.defaultCountry;
        const ayt = new AsYouType(region);
        return ayt.input(nextText ?? '');
    }
    /** Infer country from E.164 or raw input (best effort) */
    inferCountry(input) {
        const p = this.parse(input);
        return p.country;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: ngxsmkTelInputService, deps: [{ token: ngxsmk_TEL_DEFAULTS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: ngxsmkTelInputService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: ngxsmkTelInputService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ngxsmk_TEL_DEFAULTS]
                }] }] });

class ngxsmkTelInputComponent {
    zone;
    tel;
    platformId;
    inputRef;
    // ===== Inputs (public API) =====
    /** Initial country (ISO2) or 'auto' to pick a default via geoIpLookup stub */
    initialCountry = 'US';
    /** Preferred countries on top of the dropdown */
    preferredCountries = ['US', 'GB'];
    /** Limit to these countries only (omit for all) */
    onlyCountries;
    /** Show national numbers instead of E.164 in the box (emits E.164) */
    nationalMode = false;
    /** Show the dial code separately before the input (intl-tel-input option) */
    separateDialCode = false;
    /** Allow opening the country dropdown */
    allowDropdown = true;
    /** Plain input attributes */
    placeholder = 'Enter phone number';
    autocomplete = 'tel';
    name;
    inputId;
    /** Disabled state (also settable via Angular Forms) */
    disabled = false;
    // ===== Outputs =====
    countryChange = new EventEmitter();
    validityChange = new EventEmitter();
    // ===== Internal =====
    iti = null;
    onChange = () => {
    };
    onTouched = () => {
    };
    lastEmittedValid = false;
    pendingWrite = null; // cache writeValue before plugin ready
    constructor(zone, tel, platformId) {
        this.zone = zone;
        this.tel = tel;
        this.platformId = platformId;
    }
    // ========== Lifecycle ==========
    async ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId))
            return;
        await this.initIntlTelInput();
        this.bindDomListeners();
        // apply any pending value from writeValue
        if (this.pendingWrite !== null) {
            this.setInputValue(this.pendingWrite);
            this.handleInput();
            this.pendingWrite = null;
        }
    }
    ngOnChanges(changes) {
        if (!isPlatformBrowser(this.platformId))
            return;
        // If config inputs changed after init, re-init the plugin (safe & simple)
        const configChanged = ['initialCountry', 'preferredCountries', 'onlyCountries', 'separateDialCode', 'allowDropdown', 'nationalMode']
            .some(k => k in changes && !changes[k].firstChange);
        if (configChanged && this.iti) {
            this.reinitPlugin();
        }
    }
    ngOnDestroy() {
        this.destroyPlugin();
    }
    // ========== ControlValueAccessor ==========
    writeValue(val) {
        if (!this.inputRef)
            return;
        if (!this.iti) {
            // cache until plugin is ready
            this.pendingWrite = val ?? '';
            return;
        }
        this.setInputValue(val ?? '');
        // Do not trigger onChange here; writeValue is programmatic
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        if (this.inputRef)
            this.inputRef.nativeElement.disabled = isDisabled;
    }
    // ========== Validator ==========
    validate(_) {
        const raw = this.currentRaw();
        if (!raw)
            return null; // let "required" handle empties
        const valid = this.tel.isValid(raw, this.currentIso2());
        if (valid !== this.lastEmittedValid) {
            this.lastEmittedValid = valid;
            this.validityChange.emit(valid);
        }
        return valid ? null : { phoneInvalid: true };
    }
    // ========== Public Helpers ==========
    focus() {
        this.inputRef?.nativeElement.focus();
    }
    selectCountry(iso2) {
        if (this.iti) {
            this.iti.setCountry(iso2.toLowerCase());
            this.handleInput();
        }
    }
    markTouched() {
        this.onTouched();
    }
    // ========== Private: DOM & Plugin ==========
    async initIntlTelInput() {
        const [{ default: intlTelInput }] = await Promise.all([
            import('intl-tel-input'),
        ]);
        // Minimal config – we rely on ngxsmkTelInputService for validation/formatting
        const config = {
            initialCountry: this.initialCountry === 'auto' ? 'auto' : (this.initialCountry?.toLowerCase() || 'us'),
            preferredCountries: (this.preferredCountries ?? []).map(c => c.toLowerCase()),
            onlyCountries: (this.onlyCountries ?? []).map(c => c.toLowerCase()),
            nationalMode: this.nationalMode,
            allowDropdown: this.allowDropdown,
            separateDialCode: this.separateDialCode,
            // If initialCountry is 'auto', provide a trivial geoIpLookup (customize in your app)
            geoIpLookup: (cb) => cb('us'),
            utilsScript: undefined // keep bundle small; we use libphonenumber-js via the service
        };
        this.zone.runOutsideAngular(() => {
            this.iti = intlTelInput(this.inputRef.nativeElement, config);
        });
    }
    reinitPlugin() {
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
    destroyPlugin() {
        if (this.iti) {
            this.iti.destroy();
            this.iti = null;
        }
        // remove listeners by cloning node (simple & safe)
        if (this.inputRef?.nativeElement) {
            const el = this.inputRef.nativeElement;
            const clone = el.cloneNode(true);
            el.parentNode?.replaceChild(clone, el);
            // update reference
            this.inputRef.nativeElement = clone;
        }
    }
    bindDomListeners() {
        const el = this.inputRef.nativeElement;
        this.zone.runOutsideAngular(() => {
            el.addEventListener('input', () => this.handleInput());
            el.addEventListener('countrychange', () => {
                const iso2 = this.currentIso2();
                this.zone.run(() => this.countryChange.emit({ iso2 }));
                this.handleInput();
            });
            el.addEventListener('paste', () => queueMicrotask(() => this.handleInput()));
            el.addEventListener('blur', () => this.zone.run(() => this.onTouched()));
        });
    }
    handleInput() {
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
            if (normalized !== raw)
                this.setInputValue(normalized);
        }
    }
    currentRaw() {
        return (this.inputRef?.nativeElement.value ?? '').trim();
    }
    currentIso2() {
        const iso2 = (this.iti?.getSelectedCountryData?.().iso2 ?? this.initialCountry ?? 'US').toString().toUpperCase();
        return iso2;
    }
    setInputValue(v) {
        this.inputRef.nativeElement.value = v ?? '';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: ngxsmkTelInputComponent, deps: [{ token: i0.NgZone }, { token: ngxsmkTelInputService }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.14", type: ngxsmkTelInputComponent, isStandalone: true, selector: "ngxsmk-tel-input", inputs: { initialCountry: "initialCountry", preferredCountries: "preferredCountries", onlyCountries: "onlyCountries", nationalMode: "nationalMode", separateDialCode: "separateDialCode", allowDropdown: "allowDropdown", placeholder: "placeholder", autocomplete: "autocomplete", name: "name", inputId: "inputId", disabled: "disabled" }, outputs: { countryChange: "countryChange", validityChange: "validityChange" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ngxsmkTelInputComponent), multi: true },
            { provide: NG_VALIDATORS, useExisting: forwardRef(() => ngxsmkTelInputComponent), multi: true }
        ], viewQueries: [{ propertyName: "inputRef", first: true, predicate: ["telInput"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="ngxsmk-tel-input__wrapper">
      <input
        #telInput
        type="tel"
        class="ngxsmk-tel-input__control"
        [id]="inputId || null"
        [attr.name]="name || null"
        [attr.placeholder]="placeholder || null"
        [attr.autocomplete]="autocomplete"
        [disabled]="disabled"
        (blur)="markTouched()"
      />
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: ngxsmkTelInputComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngxsmk-tel-input',
                    standalone: true,
                    template: `
    <div class="ngxsmk-tel-input__wrapper">
      <input
        #telInput
        type="tel"
        class="ngxsmk-tel-input__control"
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
                        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ngxsmkTelInputComponent), multi: true },
                        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ngxsmkTelInputComponent), multi: true }
                    ],
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: ngxsmkTelInputService }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }], propDecorators: { inputRef: [{
                type: ViewChild,
                args: ['telInput', { static: true }]
            }], initialCountry: [{
                type: Input
            }], preferredCountries: [{
                type: Input
            }], onlyCountries: [{
                type: Input
            }], nationalMode: [{
                type: Input
            }], separateDialCode: [{
                type: Input
            }], allowDropdown: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], autocomplete: [{
                type: Input
            }], name: [{
                type: Input
            }], inputId: [{
                type: Input
            }], disabled: [{
                type: Input
            }], countryChange: [{
                type: Output
            }], validityChange: [{
                type: Output
            }] } });

/*
 * Public API Surface of ngxsmk-tel-input
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ngxsmkTelInputComponent, ngxsmkTelInputService, ngxsmk_TEL_DEFAULTS };
//# sourceMappingURL=ngxsmk-tel-input.mjs.map

import * as i0 from '@angular/core';
import { Injectable, EventEmitter, PLATFORM_ID, forwardRef, Output, Input, ViewChild, Inject, Component } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

class NgxsmkTelInputService {
    parse(input, iso2) {
        const phone = parsePhoneNumberFromString(input, iso2);
        if (!phone)
            return { e164: null, national: null, isValid: false };
        const isValid = phone.isValid();
        return { e164: isValid ? phone.number : null, national: phone.formatNational(), isValid };
    }
    isValid(input, iso2) {
        const phone = parsePhoneNumberFromString(input, iso2);
        return !!phone && phone.isValid();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: NgxsmkTelInputService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: NgxsmkTelInputService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: NgxsmkTelInputService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class NgxsmkTelInputComponent {
    zone;
    tel;
    platformId;
    inputRef;
    /* Existing inputs */
    initialCountry = 'US';
    preferredCountries = ['US', 'GB'];
    onlyCountries;
    nationalMode = false;
    separateDialCode = false;
    allowDropdown = true;
    placeholder = 'Enter phone number';
    autocomplete = 'tel';
    name;
    inputId;
    disabled = false;
    /* New UI/UX inputs */
    label;
    hint;
    errorText;
    size = 'md';
    variant = 'outline';
    showClear = true;
    autoFocus = false;
    selectOnFocus = false;
    formatOnBlur = true;
    showErrorWhenTouched = true;
    /** Dropdown plumbing */
    dropdownAttachToBody = true; // append dropdown to <body> (escapes overflow/clip)
    dropdownZIndex = 2000; // used by CSS var --tel-dd-z
    /* Outputs */
    countryChange = new EventEmitter();
    validityChange = new EventEmitter();
    inputChange = new EventEmitter();
    /* Internal */
    iti = null;
    onChange = () => { };
    onTouchedCb = () => { };
    lastEmittedValid = false;
    pendingWrite = null;
    touched = false;
    resolvedId = (() => 'tel-' + Math.random().toString(36).slice(2))();
    constructor(zone, tel, platformId) {
        this.zone = zone;
        this.tel = tel;
        this.platformId = platformId;
    }
    async ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId))
            return;
        // set z-index via CSS var
        this.constructor; // no-op to keep TS calm
        this.inputRef.nativeElement.closest(':host');
        await this.initIntlTelInput();
        this.bindDomListeners();
        if (this.pendingWrite !== null) {
            this.setInputValue(this.pendingWrite);
            this.handleInput();
            this.pendingWrite = null;
        }
        if (this.autoFocus)
            setTimeout(() => this.focus(), 0);
    }
    ngOnChanges(changes) {
        if (!isPlatformBrowser(this.platformId))
            return;
        const configChanged = ['initialCountry', 'preferredCountries', 'onlyCountries', 'separateDialCode', 'allowDropdown', 'nationalMode']
            .some(k => k in changes && !changes[k].firstChange);
        if (configChanged && this.iti)
            this.reinitPlugin();
    }
    ngOnDestroy() { this.destroyPlugin(); }
    // ----- CVA -----
    writeValue(val) {
        if (!this.inputRef)
            return;
        if (!this.iti) {
            this.pendingWrite = val ?? '';
            return;
        }
        this.setInputValue(val ?? '');
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouchedCb = fn; }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        if (this.inputRef)
            this.inputRef.nativeElement.disabled = isDisabled;
    }
    // ----- Validator -----
    validate(_) {
        const raw = this.currentRaw();
        if (!raw)
            return null;
        const valid = this.tel.isValid(raw, this.currentIso2());
        if (valid !== this.lastEmittedValid) {
            this.lastEmittedValid = valid;
            this.validityChange.emit(valid);
        }
        return valid ? null : { phoneInvalid: true };
    }
    // ----- Public helpers -----
    focus() {
        this.inputRef?.nativeElement.focus();
        if (this.selectOnFocus) {
            const el = this.inputRef.nativeElement;
            queueMicrotask(() => el.setSelectionRange(0, el.value.length));
        }
    }
    selectCountry(iso2) {
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
    async initIntlTelInput() {
        const [{ default: intlTelInput }] = await Promise.all([import('intl-tel-input')]);
        const config = {
            initialCountry: this.initialCountry === 'auto' ? 'auto' : (this.initialCountry?.toLowerCase() || 'us'),
            preferredCountries: (this.preferredCountries ?? []).map(c => c.toLowerCase()),
            onlyCountries: (this.onlyCountries ?? []).map(c => c.toLowerCase()),
            nationalMode: this.nationalMode,
            allowDropdown: this.allowDropdown,
            separateDialCode: this.separateDialCode,
            geoIpLookup: (cb) => cb('us'),
            utilsScript: undefined,
            dropdownContainer: this.dropdownAttachToBody && typeof document !== 'undefined' ? document.body : undefined
        };
        this.zone.runOutsideAngular(() => { this.iti = intlTelInput(this.inputRef.nativeElement, config); });
        // expose z-index var to host (so CSS picks it up)
        this.inputRef.nativeElement.style.setProperty('--tel-dd-z', String(this.dropdownZIndex));
    }
    reinitPlugin() {
        const current = this.currentRaw();
        this.destroyPlugin();
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
        if (this.inputRef?.nativeElement) {
            const el = this.inputRef.nativeElement;
            const clone = el.cloneNode(true);
            el.parentNode?.replaceChild(clone, el);
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
            el.addEventListener('blur', () => this.onBlur());
        });
    }
    onBlur() {
        this.touched = true;
        this.zone.run(() => this.onTouchedCb());
        if (!this.formatOnBlur)
            return;
        const raw = this.currentRaw();
        if (!raw)
            return;
        const parsed = this.tel.parse(raw, this.currentIso2());
        if (this.nationalMode && parsed.national) {
            this.setInputValue(parsed.national.replace(/\s{2,}/g, ' '));
        }
    }
    onFocus() {
        if (this.selectOnFocus) {
            const el = this.inputRef.nativeElement;
            queueMicrotask(() => el.setSelectionRange(0, el.value.length));
        }
    }
    handleInput() {
        const raw = this.currentRaw();
        const iso2 = this.currentIso2();
        const parsed = this.tel.parse(raw, iso2);
        this.zone.run(() => this.onChange(parsed.e164)); // E.164 or null
        this.zone.run(() => this.inputChange.emit({ raw, e164: parsed.e164, iso2 }));
        if (raw && this.nationalMode && parsed.national) {
            const normalized = parsed.national.replace(/\s{2,}/g, ' ');
            if (normalized !== raw)
                this.setInputValue(normalized);
        }
    }
    currentRaw() { return (this.inputRef?.nativeElement.value ?? '').trim(); }
    currentIso2() {
        const iso2 = (this.iti?.getSelectedCountryData?.().iso2 ?? this.initialCountry ?? 'US').toString().toUpperCase();
        return iso2;
    }
    setInputValue(v) { this.inputRef.nativeElement.value = v ?? ''; }
    get showError() {
        const invalid = !!this.validate({});
        return this.showErrorWhenTouched ? (this.touched && invalid) : invalid;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: NgxsmkTelInputComponent, deps: [{ token: i0.NgZone }, { token: NgxsmkTelInputService }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.14", type: NgxsmkTelInputComponent, isStandalone: true, selector: "ngxsmk-tel-input", inputs: { initialCountry: "initialCountry", preferredCountries: "preferredCountries", onlyCountries: "onlyCountries", nationalMode: "nationalMode", separateDialCode: "separateDialCode", allowDropdown: "allowDropdown", placeholder: "placeholder", autocomplete: "autocomplete", name: "name", inputId: "inputId", disabled: "disabled", label: "label", hint: "hint", errorText: "errorText", size: "size", variant: "variant", showClear: "showClear", autoFocus: "autoFocus", selectOnFocus: "selectOnFocus", formatOnBlur: "formatOnBlur", showErrorWhenTouched: "showErrorWhenTouched", dropdownAttachToBody: "dropdownAttachToBody", dropdownZIndex: "dropdownZIndex" }, outputs: { countryChange: "countryChange", validityChange: "validityChange", inputChange: "inputChange" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true },
            { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true }
        ], viewQueries: [{ propertyName: "inputRef", first: true, predicate: ["telInput"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="ngx-tel" [class.disabled]="disabled" [attr.data-size]="size" [attr.data-variant]="variant">
      <label *ngIf="label" class="ngx-tel__label" [for]="resolvedId">{{ label }}</label>

      <div class="ngx-tel__wrap" [class.has-error]="showError">
        <div class="ngxsmk-tel-input__wrapper">
          <input
            #telInput
            type="tel"
            class="ngxsmk-tel-input__control"
            [id]="resolvedId"
            [attr.name]="name || null"
            [attr.placeholder]="placeholder || null"
            [attr.autocomplete]="autocomplete"
            [disabled]="disabled"
            [attr.aria-invalid]="showError ? 'true' : 'false'"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
        </div>

        <button *ngIf="showClear && currentRaw()"
                type="button"
                class="ngx-tel__clear"
                (click)="clearInput()"
                [attr.aria-label]="'Clear phone number'">
          ×
        </button>
      </div>

      <div class="ngx-tel__hint" *ngIf="hint && !showError">{{ hint }}</div>
      <div class="ngx-tel__error" *ngIf="showError">{{ errorText || 'Please enter a valid phone number.' }}</div>
    </div>
  `, isInline: true, styles: [":host{--tel-bg: #fff;--tel-fg: #0f172a;--tel-border: #c0c0c0;--tel-border-hover: #9aa0a6;--tel-ring: #2563eb;--tel-placeholder: #9ca3af;--tel-error: #ef4444;--tel-radius: 12px;--tel-focus-shadow: 0 0 0 3px rgba(37, 99, 235, .25);--tel-dd-bg: var(--tel-bg);--tel-dd-border: var(--tel-border);--tel-dd-shadow: 0 24px 60px rgba(0,0,0,.18);--tel-dd-radius: 12px;--tel-dd-item-hover: rgba(37,99,235,.08);--tel-dd-z: 2000;--tel-dd-search-bg: rgba(148,163,184,.08);display:block}:host-context(.dark){--tel-bg: #0b0f17;--tel-fg: #e5e7eb;--tel-border: #334155;--tel-border-hover: #475569;--tel-ring: #60a5fa;--tel-placeholder: #94a3b8;--tel-dd-bg: #0f1521;--tel-dd-border: #324056;--tel-dd-search-bg: rgba(148,163,184,.12)}.ngx-tel{width:100%;color:var(--tel-fg)}.ngx-tel.disabled{opacity:.7;cursor:not-allowed}.ngx-tel__label{display:inline-block;margin-bottom:6px;font-size:.875rem;font-weight:500}.ngx-tel__wrap{position:relative}.ngxsmk-tel-input__wrapper,:host ::ng-deep .iti{width:100%}.ngxsmk-tel-input__control{width:100%;height:40px;font:inherit;color:var(--tel-fg);background:var(--tel-bg);border:1px solid var(--tel-border);border-radius:var(--tel-radius);padding:10px 40px 10px 12px;outline:none;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}.ngxsmk-tel-input__control::placeholder{color:var(--tel-placeholder)}.ngxsmk-tel-input__control:hover{border-color:var(--tel-border-hover)}.ngxsmk-tel-input__control:focus{border-color:var(--tel-ring);box-shadow:var(--tel-focus-shadow)}[data-size=sm] .ngxsmk-tel-input__control{height:34px;font-size:13px;padding:6px 36px 6px 10px;border-radius:10px}[data-size=lg] .ngxsmk-tel-input__control{height:46px;font-size:16px;padding:12px 44px 12px 14px;border-radius:14px}[data-variant=filled] .ngxsmk-tel-input__control{background:#94a3b814}[data-variant=underline] .ngxsmk-tel-input__control{border:0;border-bottom:2px solid var(--tel-border);border-radius:0;padding-left:0;padding-right:34px}[data-variant=underline] .ngxsmk-tel-input__control:focus{border-bottom-color:var(--tel-ring);box-shadow:none}:host ::ng-deep .iti__flag-container{border-top-left-radius:var(--tel-radius);border-bottom-left-radius:var(--tel-radius);border:1px solid var(--tel-border);border-right:none;background:var(--tel-bg)}:host ::ng-deep .iti__selected-flag{height:100%;padding:0 10px;display:inline-flex;align-items:center}:host ::ng-deep .iti__country-list{background:var(--tel-dd-bg);border:1px solid var(--tel-dd-border);border-radius:var(--tel-dd-radius);box-shadow:var(--tel-dd-shadow);max-height:min(50vh,360px);overflow:auto;padding:6px 0;width:max(280px,100%);z-index:var(--tel-dd-z)}:host ::ng-deep .iti--container .iti__country-list{z-index:var(--tel-dd-z)}:host ::ng-deep .iti__search-input{position:sticky;top:0;margin:0;padding:10px 12px;width:100%;border:0;border-bottom:1px solid var(--tel-dd-border);outline:none;background:var(--tel-dd-search-bg);color:var(--tel-fg)}:host ::ng-deep .iti__search-input::placeholder{color:var(--tel-placeholder)}:host ::ng-deep .iti__country{display:grid;grid-template-columns:28px 1fr auto;align-items:center;column-gap:.5rem;padding:10px 12px;cursor:pointer}:host ::ng-deep .iti__flag-box{width:28px;display:inline-flex;justify-content:center}:host ::ng-deep .iti__country-name{color:var(--tel-fg)}:host ::ng-deep .iti__dial-code{color:var(--tel-placeholder);font-weight:600;margin-left:10px}:host ::ng-deep .iti__country:hover,:host ::ng-deep .iti__country.iti__highlight{background:var(--tel-dd-item-hover)}:host ::ng-deep .iti__country:focus{outline:2px solid var(--tel-ring);outline-offset:-2px}:host ::ng-deep .iti__divider{margin:6px 0;border-top:1px dashed var(--tel-dd-border)}:host ::ng-deep .iti--separate-dial-code .ngxsmk-tel-input__control{padding-left:56px}:host ::ng-deep .iti__country-list::-webkit-scrollbar{width:10px}:host ::ng-deep .iti__country-list::-webkit-scrollbar-thumb{background:#94a3b866;border-radius:8px}:host ::ng-deep .iti__country-list::-webkit-scrollbar-track{background:transparent}@media (max-width: 480px){:host ::ng-deep .iti__country-list{width:100vw;max-width:100vw}}.ngx-tel__clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;font-size:18px;line-height:1;width:28px;height:28px;border-radius:50%;cursor:pointer;color:var(--tel-placeholder)}.ngx-tel__clear:hover{background:#94a3b826}.ngx-tel__hint{margin-top:6px;font-size:12px;color:var(--tel-placeholder)}.ngx-tel__error{margin-top:6px;font-size:12px;color:var(--tel-error)}.ngx-tel__wrap.has-error .ngxsmk-tel-input__control{border-color:var(--tel-error);box-shadow:0 0 0 3px #ef444426}\n"], dependencies: [{ kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.14", ngImport: i0, type: NgxsmkTelInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngxsmk-tel-input', standalone: true, imports: [NgIf], template: `
    <div class="ngx-tel" [class.disabled]="disabled" [attr.data-size]="size" [attr.data-variant]="variant">
      <label *ngIf="label" class="ngx-tel__label" [for]="resolvedId">{{ label }}</label>

      <div class="ngx-tel__wrap" [class.has-error]="showError">
        <div class="ngxsmk-tel-input__wrapper">
          <input
            #telInput
            type="tel"
            class="ngxsmk-tel-input__control"
            [id]="resolvedId"
            [attr.name]="name || null"
            [attr.placeholder]="placeholder || null"
            [attr.autocomplete]="autocomplete"
            [disabled]="disabled"
            [attr.aria-invalid]="showError ? 'true' : 'false'"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
        </div>

        <button *ngIf="showClear && currentRaw()"
                type="button"
                class="ngx-tel__clear"
                (click)="clearInput()"
                [attr.aria-label]="'Clear phone number'">
          ×
        </button>
      </div>

      <div class="ngx-tel__hint" *ngIf="hint && !showError">{{ hint }}</div>
      <div class="ngx-tel__error" *ngIf="showError">{{ errorText || 'Please enter a valid phone number.' }}</div>
    </div>
  `, providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true },
                        { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true }
                    ], styles: [":host{--tel-bg: #fff;--tel-fg: #0f172a;--tel-border: #c0c0c0;--tel-border-hover: #9aa0a6;--tel-ring: #2563eb;--tel-placeholder: #9ca3af;--tel-error: #ef4444;--tel-radius: 12px;--tel-focus-shadow: 0 0 0 3px rgba(37, 99, 235, .25);--tel-dd-bg: var(--tel-bg);--tel-dd-border: var(--tel-border);--tel-dd-shadow: 0 24px 60px rgba(0,0,0,.18);--tel-dd-radius: 12px;--tel-dd-item-hover: rgba(37,99,235,.08);--tel-dd-z: 2000;--tel-dd-search-bg: rgba(148,163,184,.08);display:block}:host-context(.dark){--tel-bg: #0b0f17;--tel-fg: #e5e7eb;--tel-border: #334155;--tel-border-hover: #475569;--tel-ring: #60a5fa;--tel-placeholder: #94a3b8;--tel-dd-bg: #0f1521;--tel-dd-border: #324056;--tel-dd-search-bg: rgba(148,163,184,.12)}.ngx-tel{width:100%;color:var(--tel-fg)}.ngx-tel.disabled{opacity:.7;cursor:not-allowed}.ngx-tel__label{display:inline-block;margin-bottom:6px;font-size:.875rem;font-weight:500}.ngx-tel__wrap{position:relative}.ngxsmk-tel-input__wrapper,:host ::ng-deep .iti{width:100%}.ngxsmk-tel-input__control{width:100%;height:40px;font:inherit;color:var(--tel-fg);background:var(--tel-bg);border:1px solid var(--tel-border);border-radius:var(--tel-radius);padding:10px 40px 10px 12px;outline:none;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}.ngxsmk-tel-input__control::placeholder{color:var(--tel-placeholder)}.ngxsmk-tel-input__control:hover{border-color:var(--tel-border-hover)}.ngxsmk-tel-input__control:focus{border-color:var(--tel-ring);box-shadow:var(--tel-focus-shadow)}[data-size=sm] .ngxsmk-tel-input__control{height:34px;font-size:13px;padding:6px 36px 6px 10px;border-radius:10px}[data-size=lg] .ngxsmk-tel-input__control{height:46px;font-size:16px;padding:12px 44px 12px 14px;border-radius:14px}[data-variant=filled] .ngxsmk-tel-input__control{background:#94a3b814}[data-variant=underline] .ngxsmk-tel-input__control{border:0;border-bottom:2px solid var(--tel-border);border-radius:0;padding-left:0;padding-right:34px}[data-variant=underline] .ngxsmk-tel-input__control:focus{border-bottom-color:var(--tel-ring);box-shadow:none}:host ::ng-deep .iti__flag-container{border-top-left-radius:var(--tel-radius);border-bottom-left-radius:var(--tel-radius);border:1px solid var(--tel-border);border-right:none;background:var(--tel-bg)}:host ::ng-deep .iti__selected-flag{height:100%;padding:0 10px;display:inline-flex;align-items:center}:host ::ng-deep .iti__country-list{background:var(--tel-dd-bg);border:1px solid var(--tel-dd-border);border-radius:var(--tel-dd-radius);box-shadow:var(--tel-dd-shadow);max-height:min(50vh,360px);overflow:auto;padding:6px 0;width:max(280px,100%);z-index:var(--tel-dd-z)}:host ::ng-deep .iti--container .iti__country-list{z-index:var(--tel-dd-z)}:host ::ng-deep .iti__search-input{position:sticky;top:0;margin:0;padding:10px 12px;width:100%;border:0;border-bottom:1px solid var(--tel-dd-border);outline:none;background:var(--tel-dd-search-bg);color:var(--tel-fg)}:host ::ng-deep .iti__search-input::placeholder{color:var(--tel-placeholder)}:host ::ng-deep .iti__country{display:grid;grid-template-columns:28px 1fr auto;align-items:center;column-gap:.5rem;padding:10px 12px;cursor:pointer}:host ::ng-deep .iti__flag-box{width:28px;display:inline-flex;justify-content:center}:host ::ng-deep .iti__country-name{color:var(--tel-fg)}:host ::ng-deep .iti__dial-code{color:var(--tel-placeholder);font-weight:600;margin-left:10px}:host ::ng-deep .iti__country:hover,:host ::ng-deep .iti__country.iti__highlight{background:var(--tel-dd-item-hover)}:host ::ng-deep .iti__country:focus{outline:2px solid var(--tel-ring);outline-offset:-2px}:host ::ng-deep .iti__divider{margin:6px 0;border-top:1px dashed var(--tel-dd-border)}:host ::ng-deep .iti--separate-dial-code .ngxsmk-tel-input__control{padding-left:56px}:host ::ng-deep .iti__country-list::-webkit-scrollbar{width:10px}:host ::ng-deep .iti__country-list::-webkit-scrollbar-thumb{background:#94a3b866;border-radius:8px}:host ::ng-deep .iti__country-list::-webkit-scrollbar-track{background:transparent}@media (max-width: 480px){:host ::ng-deep .iti__country-list{width:100vw;max-width:100vw}}.ngx-tel__clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;font-size:18px;line-height:1;width:28px;height:28px;border-radius:50%;cursor:pointer;color:var(--tel-placeholder)}.ngx-tel__clear:hover{background:#94a3b826}.ngx-tel__hint{margin-top:6px;font-size:12px;color:var(--tel-placeholder)}.ngx-tel__error{margin-top:6px;font-size:12px;color:var(--tel-error)}.ngx-tel__wrap.has-error .ngxsmk-tel-input__control{border-color:var(--tel-error);box-shadow:0 0 0 3px #ef444426}\n"] }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: NgxsmkTelInputService }, { type: Object, decorators: [{
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
            }], label: [{
                type: Input
            }], hint: [{
                type: Input
            }], errorText: [{
                type: Input
            }], size: [{
                type: Input
            }], variant: [{
                type: Input
            }], showClear: [{
                type: Input
            }], autoFocus: [{
                type: Input
            }], selectOnFocus: [{
                type: Input
            }], formatOnBlur: [{
                type: Input
            }], showErrorWhenTouched: [{
                type: Input
            }], dropdownAttachToBody: [{
                type: Input
            }], dropdownZIndex: [{
                type: Input
            }], countryChange: [{
                type: Output
            }], validityChange: [{
                type: Output
            }], inputChange: [{
                type: Output
            }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { NgxsmkTelInputComponent, NgxsmkTelInputService };
//# sourceMappingURL=ngxsmk-tel-input.mjs.map

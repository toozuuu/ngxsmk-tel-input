import { AfterViewInit, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, ValidationErrors } from '@angular/forms';
import type { CountryCode } from 'libphonenumber-js';
import { ngxsmkTelInputService } from './ngxsmk-tel-input.service';
import * as i0 from "@angular/core";
export declare class ngxsmkTelInputComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
    private readonly zone;
    private readonly tel;
    private readonly platformId;
    inputRef: ElementRef<HTMLInputElement>;
    /** Initial country (ISO2) or 'auto' to pick a default via geoIpLookup stub */
    initialCountry: CountryCode | 'auto';
    /** Preferred countries on top of the dropdown */
    preferredCountries: CountryCode[];
    /** Limit to these countries only (omit for all) */
    onlyCountries?: CountryCode[];
    /** Show national numbers instead of E.164 in the box (emits E.164) */
    nationalMode: boolean;
    /** Show the dial code separately before the input (intl-tel-input option) */
    separateDialCode: boolean;
    /** Allow opening the country dropdown */
    allowDropdown: boolean;
    /** Plain input attributes */
    placeholder: string;
    autocomplete: string;
    name?: string;
    inputId?: string;
    /** Disabled state (also settable via Angular Forms) */
    disabled: boolean;
    countryChange: EventEmitter<{
        iso2: CountryCode;
    }>;
    validityChange: EventEmitter<boolean>;
    private iti;
    private onChange;
    private onTouched;
    private lastEmittedValid;
    private pendingWrite;
    constructor(zone: NgZone, tel: ngxsmkTelInputService, platformId: Object);
    ngAfterViewInit(): Promise<void>;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    writeValue(val: string | null): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    validate(_: AbstractControl): ValidationErrors | null;
    focus(): void;
    selectCountry(iso2: CountryCode): void;
    markTouched(): void;
    private initIntlTelInput;
    private reinitPlugin;
    private destroyPlugin;
    private bindDomListeners;
    private handleInput;
    private currentRaw;
    private currentIso2;
    private setInputValue;
    static ɵfac: i0.ɵɵFactoryDeclaration<ngxsmkTelInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ngxsmkTelInputComponent, "ngxsmk-tel-input", never, { "initialCountry": { "alias": "initialCountry"; "required": false; }; "preferredCountries": { "alias": "preferredCountries"; "required": false; }; "onlyCountries": { "alias": "onlyCountries"; "required": false; }; "nationalMode": { "alias": "nationalMode"; "required": false; }; "separateDialCode": { "alias": "separateDialCode"; "required": false; }; "allowDropdown": { "alias": "allowDropdown"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "autocomplete": { "alias": "autocomplete"; "required": false; }; "name": { "alias": "name"; "required": false; }; "inputId": { "alias": "inputId"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "countryChange": "countryChange"; "validityChange": "validityChange"; }, never, never, true, never>;
}

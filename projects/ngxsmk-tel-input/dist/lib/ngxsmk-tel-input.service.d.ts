import { type CountryCode } from 'libphonenumber-js';
import * as i0 from "@angular/core";
export declare class NgxsmkTelInputService {
    parse(input: string, iso2: CountryCode): {
        e164: string | null;
        national: string | null;
        isValid: boolean;
    };
    isValid(input: string, iso2: CountryCode): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxsmkTelInputService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NgxsmkTelInputService>;
}

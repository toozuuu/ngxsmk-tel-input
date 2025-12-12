/**
 * Base verification service interface
 */

import { Observable } from 'rxjs';
import { CountryCode } from 'libphonenumber-js';

export interface VerificationRequest {
  phoneNumber: string;
  country: CountryCode;
  method: 'sms' | 'voice' | 'whatsapp';
}

export interface VerificationResponse {
  success: boolean;
  sid?: string;
  error?: string;
  expiresAt?: Date;
}

export interface VerificationCheck {
  code: string;
  sid: string;
}

export interface VerificationCheckResponse {
  success: boolean;
  verified: boolean;
  error?: string;
}

export abstract class VerificationService {
  abstract verify(request: VerificationRequest): Observable<VerificationResponse>;
  abstract check(request: VerificationCheck): Observable<VerificationCheckResponse>;
}


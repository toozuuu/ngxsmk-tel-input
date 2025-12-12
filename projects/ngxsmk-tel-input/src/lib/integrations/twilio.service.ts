/**
 * Twilio verification service integration
 */

import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VerificationService, VerificationRequest, VerificationResponse, VerificationCheck, VerificationCheckResponse } from './verification.service';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  serviceSid?: string;
  apiUrl?: string;
}

export const TWILIO_CONFIG = 'TWILIO_CONFIG';

@Injectable({ providedIn: 'root' })
export class TwilioVerificationService extends VerificationService {
  private readonly apiUrl = 'https://verify.twilio.com/v2/Services';
  private config: TwilioConfig | null = null;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(TWILIO_CONFIG) config?: TwilioConfig
  ) {
    super();
    this.config = config || null;
  }

  setConfig(config: TwilioConfig): void {
    this.config = config;
  }

  verify(request: VerificationRequest): Observable<VerificationResponse> {
    if (!this.config) {
      throw new Error('Twilio configuration not provided');
    }

    const serviceSid = this.config.serviceSid;
    if (!serviceSid) {
      throw new Error('Twilio Service SID not configured');
    }

    const url = `${this.apiUrl}/${serviceSid}/Verifications`;
    const headers = this.getAuthHeaders();
    const body = {
      To: request.phoneNumber,
      Channel: request.method === 'whatsapp' ? 'whatsapp' : request.method
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      map(response => ({
        success: true,
        sid: response.sid,
        expiresAt: new Date(Date.now() + 600000) // 10 minutes default
      })),
      catchError(error => {
        return from([{
          success: false,
          error: error.error?.message || 'Verification failed'
        }]);
      })
    );
  }

  check(request: VerificationCheck): Observable<VerificationCheckResponse> {
    if (!this.config) {
      throw new Error('Twilio configuration not provided');
    }

    const serviceSid = this.config.serviceSid;
    if (!serviceSid) {
      throw new Error('Twilio Service SID not configured');
    }

    const url = `${this.apiUrl}/${serviceSid}/VerificationCheck`;
    const headers = this.getAuthHeaders();
    const body = {
      To: request.code,
      Code: request.code
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      map(response => ({
        success: true,
        verified: response.status === 'approved'
      })),
      catchError(error => {
        return from([{
          success: false,
          verified: false,
          error: error.error?.message || 'Verification check failed'
        }]);
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    if (!this.config) {
      throw new Error('Twilio configuration not provided');
    }

    const auth = btoa(`${this.config.accountSid}:${this.config.authToken}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  }
}

/**
 * Provide Twilio verification service
 */
export function provideTwilioVerification(config: TwilioConfig) {
  return [
    TwilioVerificationService,
    {
      provide: TWILIO_CONFIG,
      useValue: config
    }
  ];
}


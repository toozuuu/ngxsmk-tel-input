/**
 * Vonage (Nexmo) verification service integration
 */

import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VerificationService, VerificationRequest, VerificationResponse, VerificationCheck, VerificationCheckResponse } from './verification.service';

export interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  brand?: string;
  apiUrl?: string;
}

export const VONAGE_CONFIG = 'VONAGE_CONFIG';

@Injectable({ providedIn: 'root' })
export class VonageVerificationService extends VerificationService {
  private readonly apiUrl = 'https://api.nexmo.com/verify';
  private config: VonageConfig | null = null;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(VONAGE_CONFIG) config?: VonageConfig
  ) {
    super();
    this.config = config || null;
  }

  setConfig(config: VonageConfig): void {
    this.config = config;
  }

  verify(request: VerificationRequest): Observable<VerificationResponse> {
    if (!this.config) {
      throw new Error('Vonage configuration not provided');
    }

    const url = `${this.apiUrl}/json`;
    const body = new URLSearchParams({
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      number: request.phoneNumber,
      brand: this.config.brand || 'App',
      workflow_id: request.method === 'voice' ? '6' : '1'
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(url, body.toString(), { headers }).pipe(
      map(response => {
        if (response.status === '0') {
          return {
            success: true,
            sid: response.request_id,
            expiresAt: new Date(Date.now() + 300000) // 5 minutes default
          };
        } else {
          return {
            success: false,
            error: response.error_text || 'Verification failed'
          };
        }
      }),
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
      throw new Error('Vonage configuration not provided');
    }

    const url = `${this.apiUrl}/check/json`;
    const body = new URLSearchParams({
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      request_id: request.sid,
      code: request.code
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(url, body.toString(), { headers }).pipe(
      map(response => {
        if (response.status === '0') {
          return {
            success: true,
            verified: true
          };
        } else {
          return {
            success: false,
            verified: false,
            error: response.error_text || 'Verification check failed'
          };
        }
      }),
      catchError(error => {
        return from([{
          success: false,
          verified: false,
          error: error.error?.message || 'Verification check failed'
        }]);
      })
    );
  }
}

/**
 * Provide Vonage verification service
 */
export function provideVonageVerification(config: VonageConfig) {
  return [
    VonageVerificationService,
    {
      provide: VONAGE_CONFIG,
      useValue: config
    }
  ];
}


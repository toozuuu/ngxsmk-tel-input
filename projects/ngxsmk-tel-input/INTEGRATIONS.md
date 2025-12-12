# Third-Party Integrations

The `ngxsmk-tel-input` library provides integrations with popular phone verification services: Twilio, Vonage (Nexmo), and AWS SNS.

## Twilio Integration

### Setup

```typescript
import { provideTwilioVerification } from 'ngxsmk-tel-input';
import { HttpClientModule } from '@angular/common/http';

@Component({
  providers: [
    provideTwilioVerification({
      accountSid: 'your-account-sid',
      authToken: 'your-auth-token',
      serviceSid: 'your-service-sid'
    })
  ],
  imports: [HttpClientModule]
})
export class AppComponent {}
```

### Usage

```typescript
import { Component } from '@angular/core';
import { TwilioVerificationService } from 'ngxsmk-tel-input';

@Component({
  template: `
    <ngxsmk-tel-input
      formControlName="phone"
      (inputChange)="onPhoneChange($event)"
    />
    <button (click)="sendVerification()">Send Code</button>
    <input [(ngModel)]="code" placeholder="Enter code" />
    <button (click)="verifyCode()">Verify</button>
  `
})
export class MyComponent {
  phoneNumber = '';
  code = '';
  verificationSid = '';

  constructor(private twilio: TwilioVerificationService) {}

  onPhoneChange(event: { e164: string | null }) {
    if (event.e164) {
      this.phoneNumber = event.e164;
    }
  }

  sendVerification() {
    this.twilio.verify({
      phoneNumber: this.phoneNumber,
      country: 'US',
      method: 'sms'
    }).subscribe(response => {
      if (response.success && response.sid) {
        this.verificationSid = response.sid;
        alert('Verification code sent!');
      } else {
        alert('Failed to send code: ' + response.error);
      }
    });
  }

  verifyCode() {
    this.twilio.check({
      code: this.code,
      sid: this.verificationSid
    }).subscribe(response => {
      if (response.verified) {
        alert('Phone number verified!');
      } else {
        alert('Verification failed: ' + response.error);
      }
    });
  }
}
```

## Vonage (Nexmo) Integration

### Setup

```typescript
import { provideVonageVerification } from 'ngxsmk-tel-input';
import { HttpClientModule } from '@angular/common/http';

@Component({
  providers: [
    provideVonageVerification({
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
      brand: 'Your App Name'
    })
  ],
  imports: [HttpClientModule]
})
export class AppComponent {}
```

### Usage

```typescript
import { Component } from '@angular/core';
import { VonageVerificationService } from 'ngxsmk-tel-input';

@Component({
  template: `
    <ngxsmk-tel-input
      formControlName="phone"
      (inputChange)="onPhoneChange($event)"
    />
    <button (click)="sendVerification()">Send Code</button>
    <input [(ngModel)]="code" placeholder="Enter code" />
    <button (click)="verifyCode()">Verify</button>
  `
})
export class MyComponent {
  phoneNumber = '';
  code = '';
  verificationSid = '';

  constructor(private vonage: VonageVerificationService) {}

  onPhoneChange(event: { e164: string | null }) {
    if (event.e164) {
      this.phoneNumber = event.e164;
    }
  }

  sendVerification() {
    this.vonage.verify({
      phoneNumber: this.phoneNumber,
      country: 'US',
      method: 'sms'
    }).subscribe(response => {
      if (response.success && response.sid) {
        this.verificationSid = response.sid;
        alert('Verification code sent!');
      }
    });
  }

  verifyCode() {
    this.vonage.check({
      code: this.code,
      sid: this.verificationSid
    }).subscribe(response => {
      if (response.verified) {
        alert('Phone number verified!');
      }
    });
  }
}
```

## AWS SNS Integration

### Setup

```typescript
import { provideAwsSnsVerification } from 'ngxsmk-tel-input';
import { HttpClientModule } from '@angular/common/http';

@Component({
  providers: [
    provideAwsSnsVerification({
      accessKeyId: 'your-access-key-id',
      secretAccessKey: 'your-secret-access-key',
      region: 'us-east-1'
    })
  ],
  imports: [HttpClientModule]
})
export class AppComponent {}
```

### Usage

```typescript
import { Component } from '@angular/core';
import { AwsSnsVerificationService } from 'ngxsmk-tel-input';

@Component({
  template: `
    <ngxsmk-tel-input
      formControlName="phone"
      (inputChange)="onPhoneChange($event)"
    />
    <button (click)="sendVerification()">Send Code</button>
    <input [(ngModel)]="code" placeholder="Enter code" />
    <button (click)="verifyCode()">Verify</button>
  `
})
export class MyComponent {
  phoneNumber = '';
  code = '';
  verificationSid = '';

  constructor(private awsSns: AwsSnsVerificationService) {}

  onPhoneChange(event: { e164: string | null }) {
    if (event.e164) {
      this.phoneNumber = event.e164;
    }
  }

  sendVerification() {
    this.awsSns.verify({
      phoneNumber: this.phoneNumber,
      country: 'US',
      method: 'sms'
    }).subscribe(response => {
      if (response.success && response.sid) {
        this.verificationSid = response.sid;
        alert('Verification code sent!');
      }
    });
  }

  verifyCode() {
    this.awsSns.check({
      code: this.code,
      sid: this.verificationSid
    }).subscribe(response => {
      if (response.verified) {
        alert('Phone number verified!');
      }
    });
  }
}
```

## Complete Example with Phone Input

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';
import { TwilioVerificationService } from 'ngxsmk-tel-input';

@Component({
  template: `
    <form [formGroup]="form">
      <ngxsmk-tel-input
        formControlName="phone"
        label="Phone Number"
        [initialCountry]="'US'"
        (inputChange)="onPhoneChange($event)"
      />
      
      <div *ngIf="form.get('phone')?.valid && !verificationSent">
        <button (click)="sendVerification()" [disabled]="sending">
          {{ sending ? 'Sending...' : 'Send Verification Code' }}
        </button>
      </div>
      
      <div *ngIf="verificationSent">
        <input
          formControlName="code"
          placeholder="Enter verification code"
          maxlength="6"
        />
        <button (click)="verifyCode()" [disabled]="verifying">
          {{ verifying ? 'Verifying...' : 'Verify' }}
        </button>
      </div>
      
      <div *ngIf="verified">
        <p class="success">Phone number verified successfully!</p>
      </div>
    </form>
  `
})
export class PhoneVerificationComponent {
  form: FormGroup;
  verificationSid = '';
  verificationSent = false;
  verified = false;
  sending = false;
  verifying = false;

  constructor(
    private fb: FormBuilder,
    private twilio: TwilioVerificationService
  ) {
    this.form = this.fb.group({
      phone: ['', Validators.required],
      code: ['']
    });
  }

  onPhoneChange(event: { e164: string | null }) {
    if (event.e164) {
      this.form.patchValue({ phone: event.e164 });
    }
  }

  sendVerification() {
    const phoneNumber = this.form.get('phone')?.value;
    if (!phoneNumber) return;

    this.sending = true;
    this.twilio.verify({
      phoneNumber,
      country: 'US',
      method: 'sms'
    }).subscribe(response => {
      this.sending = false;
      if (response.success && response.sid) {
        this.verificationSid = response.sid;
        this.verificationSent = true;
      }
    });
  }

  verifyCode() {
    const code = this.form.get('code')?.value;
    if (!code || !this.verificationSid) return;

    this.verifying = true;
    this.twilio.check({
      code,
      sid: this.verificationSid
    }).subscribe(response => {
      this.verifying = false;
      if (response.verified) {
        this.verified = true;
      }
    });
  }
}
```

## Notes

- All services require `HttpClientModule` to be imported
- Configuration should be stored securely (use environment variables)
- In production, verification should be handled server-side for security
- AWS SNS integration requires AWS SDK for full functionality
- All services return Observables for reactive programming


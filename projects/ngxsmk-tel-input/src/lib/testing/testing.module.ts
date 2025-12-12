/**
 * Testing module for ngxsmk-tel-input
 */

import { NgModule } from '@angular/core';
import { NgxsmkTelInputService } from '../ngxsmk-tel-input.service';
import { MockNgxsmkTelInputService } from './mock-phone-service';

/**
 * Testing module that provides mock services
 * Note: NgxsmkTelInputComponent is standalone and should be imported directly in test components
 */
@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    {
      provide: NgxsmkTelInputService,
      useClass: MockNgxsmkTelInputService
    }
  ]
})
export class NgxsmkTelInputTestingModule {}


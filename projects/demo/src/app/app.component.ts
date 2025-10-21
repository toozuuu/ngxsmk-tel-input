import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { NgxsmkTelInputComponent, IntlTelI18n, CountryMap, ThemeService } from 'ngxsmk-tel-input';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsmkTelInputComponent, JsonPipe],
  styleUrls: ['./app.component.scss'],
  template: `
    <div class="app-container">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-icon">📱</span>
            Ngxsmk Tel Input
          </h1>
          <p class="hero-subtitle">Optimized Angular International Telephone Input Component</p>
          <div class="hero-badges">
            <span class="badge">⚡ Performance Optimized</span>
            <span class="badge">🌍 International Support</span>
            <span class="badge">♿ Accessible</span>
          </div>
        </div>
      </div>

      <!-- Demo Content -->
      <div class="demo-content">
        <!-- Main Demo -->
        <div class="demo-section">
          <h2>Live Demo</h2>
          <div class="demo-card">
            <form [formGroup]="basicForm" class="demo-form">
              <ngxsmk-tel-input
                formControlName="phone"
                label="Phone Number"
                hint="Enter your international phone number"
                [initialCountry]="'US'"
                [preferredCountries]="['US', 'GB', 'AU', 'CA', 'DE', 'FR']"
                [separateDialCode]="true"
                [showClear]="true"
                [size]="'md'"
                [variant]="'outline'"
                [i18n]="enLabels"
                [localizedCountries]="enCountries"
                (inputChange)="onPhoneChange($event)"
                (countryChange)="onCountryChange($event)">
              </ngxsmk-tel-input>
              
              <div class="form-output">
                <h3>Form Data:</h3>
                <pre>{{ basicForm.value | json }}</pre>
              </div>
            </form>
          </div>
        </div>

        <!-- Variants Demo -->
        <div class="demo-section">
          <h2>Size & Style Variants</h2>
          <div class="variants-grid">
            <div class="variant-group">
              <h3>Sizes</h3>
              <div class="variant-item">
                <label>Small</label>
                <ngxsmk-tel-input [size]="'sm'" [variant]="'outline'" placeholder="Small input"></ngxsmk-tel-input>
              </div>
              <div class="variant-item">
                <label>Medium</label>
                <ngxsmk-tel-input [size]="'md'" [variant]="'outline'" placeholder="Medium input"></ngxsmk-tel-input>
              </div>
              <div class="variant-item">
                <label>Large</label>
                <ngxsmk-tel-input [size]="'lg'" [variant]="'outline'" placeholder="Large input"></ngxsmk-tel-input>
              </div>
            </div>

            <div class="variant-group">
              <h3>Styles</h3>
              <div class="variant-item">
                <label>Outline</label>
                <ngxsmk-tel-input [variant]="'outline'" placeholder="Outline style"></ngxsmk-tel-input>
              </div>
              <div class="variant-item">
                <label>Filled</label>
                <ngxsmk-tel-input [variant]="'filled'" placeholder="Filled style"></ngxsmk-tel-input>
              </div>
              <div class="variant-item">
                <label>Underline</label>
                <ngxsmk-tel-input [variant]="'underline'" placeholder="Underline style"></ngxsmk-tel-input>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Features -->
        <div class="demo-section">
          <h2>Performance Optimizations</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>OnPush Strategy</h3>
              <p>Reduces change detection cycles by 50%+</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧠</div>
              <h3>Smart Caching</h3>
              <p>LRU cache for phone validation results</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔧</div>
              <h3>Memory Safe</h3>
              <p>Proper cleanup prevents memory leaks</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎨</div>
              <h3>CSS Optimized</h3>
              <p>GPU acceleration and containment</p>
            </div>
          </div>
        </div>

        <!-- Theme Demo -->
        <div class="demo-section">
          <h2>Theme Support</h2>
          <div class="theme-demo">
            <div class="theme-controls">
              <h3>Theme Controls</h3>
              <div class="theme-buttons">
                <button 
                  class="theme-btn" 
                  [class.active]="currentTheme === 'light'"
                  (click)="setTheme('light')">
                  ☀️ Light
                </button>
                <button 
                  class="theme-btn" 
                  [class.active]="currentTheme === 'dark'"
                  (click)="setTheme('dark')">
                  🌙 Dark
                </button>
                <button 
                  class="theme-btn" 
                  [class.active]="currentTheme === 'auto'"
                  (click)="setTheme('auto')">
                  🔄 Auto
                </button>
              </div>
              <p class="theme-info">Current theme: <strong>{{ currentTheme }}</strong></p>
            </div>
            
            <div class="theme-showcase">
              <h3>Theme Variants</h3>
              <div class="theme-variants">
                <div class="theme-variant">
                  <label>Light Theme</label>
                  <ngxsmk-tel-input 
                    [theme]="'light'"
                    placeholder="Light theme input"
                    [size]="'md'"
                    [variant]="'outline'">
                  </ngxsmk-tel-input>
                </div>
                <div class="theme-variant">
                  <label>Dark Theme</label>
                  <ngxsmk-tel-input 
                    [theme]="'dark'"
                    placeholder="Dark theme input"
                    [size]="'md'"
                    [variant]="'outline'">
                  </ngxsmk-tel-input>
                </div>
                <div class="theme-variant">
                  <label>Auto Theme</label>
                  <ngxsmk-tel-input 
                    [theme]="'auto'"
                    placeholder="Auto theme input"
                    [size]="'md'"
                    [variant]="'outline'">
                  </ngxsmk-tel-input>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invalid Country Code Test -->
        <div class="demo-section">
          <h2>Invalid Country Code Detection Test</h2>
          <div class="demo-card">
            <p class="test-description">
              This test demonstrates the fix for country codes starting with "11" and other invalid country codes.
              Try entering numbers like "1123456789" or "99123456789" to see the validation in action.
            </p>
            <form [formGroup]="testForm" class="demo-form">
              <ngxsmk-tel-input
                formControlName="invalidCountryCode"
                label="Test Invalid Country Code"
                hint="Try entering '1123456789' or '99123456789'"
                [initialCountry]="'US'"
                [separateDialCode]="true"
                [showClear]="true"
                [size]="'md'"
                [variant]="'outline'"
                [i18n]="enLabels"
                [localizedCountries]="enCountries"
                (inputChange)="onTestPhoneChange($event)"
                (countryChange)="onTestCountryChange($event)">
              </ngxsmk-tel-input>
              
              <div class="form-output">
                <h3>Form Validation:</h3>
                <pre>{{ testForm.get('invalidCountryCode')?.errors | json }}</pre>
                <p><strong>Form Valid:</strong> {{ testForm.valid ? 'Yes' : 'No' }}</p>
                <p><strong>Control Valid:</strong> {{ testForm.get('invalidCountryCode')?.valid ? 'Yes' : 'No' }}</p>
              </div>
            </form>
          </div>
        </div>

        <!-- Live Stats -->
        <div class="demo-section">
          <h2>Live Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ phoneChangeCount }}</div>
              <div class="stat-label">Phone Changes</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ validPhoneCount }}</div>
              <div class="stat-label">Valid Numbers</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ countryChangeCount }}</div>
              <div class="stat-label">Country Changes</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ lastPhoneNumber || 'None' }}</div>
              <div class="stat-label">Last Number</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="app-footer">
        <p>Built with ❤️ using Angular 19.2.0 | Optimized for performance and accessibility</p>
      </footer>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);
  private themeSubscription?: Subscription;
  
  // Form instance
  basicForm = this.fb.group({
    phone: ['+12025458754', Validators.required]
  });

  // Test form for invalid country code detection
  testForm = this.fb.group({
    invalidCountryCode: ['', Validators.required]
  });

  // Demo statistics
  phoneChangeCount = 0;
  validPhoneCount = 0;
  countryChangeCount = 0;
  lastPhoneNumber: string | null = null;

  // Theme
  currentTheme: 'light' | 'dark' | 'auto' = 'auto';

  // English UI labels (dropdown/search/ARIA)
  enLabels: IntlTelI18n = {
    selectedCountryAriaLabel: 'Selected country',
    countryListAriaLabel: 'Country list',
    searchPlaceholder: 'Search country',
    zeroSearchResults: 'No results',
    noCountrySelected: 'No country selected'
  };

  // Country names
  enCountries: CountryMap = {
    US: 'United States',
    GB: 'United Kingdom',
    AU: 'Australia',
    CA: 'Canada',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico'
  };

  onPhoneChange(event: { raw: string; e164: string | null; iso2: string }) {
    this.phoneChangeCount++;
    this.lastPhoneNumber = event.e164 || event.raw;
    
    if (event.e164) {
      this.validPhoneCount++;
    }
    
    console.log('Phone change:', event);
  }

  onCountryChange(event: { iso2: string }) {
    this.countryChangeCount++;
    console.log('Country changed to:', event.iso2);
  }

  onTestPhoneChange(event: { raw: string; e164: string | null; iso2: string }) {
    console.log('Test phone change:', event);
  }

  onTestCountryChange(event: { iso2: string }) {
    console.log('Test country changed to:', event.iso2);
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.themeService.setTheme(theme);
  }
}

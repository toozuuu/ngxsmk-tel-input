# Real-World Examples

This directory contains complete, production-ready examples demonstrating how to use `ngxsmk-tel-input` in real-world scenarios.

## Examples

### 1. E-commerce Checkout

**File:** `e-commerce-checkout/checkout.component.ts`

Complete checkout form with phone input for shipping information.

**Features:**
- Phone number validation
- Form validation
- Order summary
- Error handling

**Usage:**
```typescript
import { CheckoutComponent } from './examples/e-commerce-checkout/checkout.component';
```

### 2. User Registration

**File:** `user-registration/registration.component.ts`

User registration form with phone verification capabilities.

**Features:**
- Phone intelligence (carrier detection)
- Format suggestions
- Password matching validation
- Terms acceptance

**Usage:**
```typescript
import { RegistrationComponent } from './examples/user-registration/registration.component';
```

### 3. Profile Management

**File:** `profile-management/profile.component.ts`

User profile settings with phone number update.

**Features:**
- Phone number update
- Carrier information display
- Form dirty state tracking
- Success notifications

**Usage:**
```typescript
import { ProfileComponent } from './examples/profile-management/profile.component';
```

## Running Examples

1. Import the example component in your app:

```typescript
import { CheckoutComponent } from './examples/e-commerce-checkout/checkout.component';

@Component({
  imports: [CheckoutComponent],
  template: '<app-checkout />'
})
export class AppComponent {}
```

2. Or use in routing:

```typescript
const routes: Routes = [
  { path: 'checkout', component: CheckoutComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'profile', component: ProfileComponent }
];
```

## Customization

All examples are fully customizable:

- Modify form fields
- Add/remove validation rules
- Customize styling
- Integrate with your API
- Add additional features

## Best Practices

1. **Always validate phone numbers** before submission
2. **Use E.164 format** for storage and API calls
3. **Show format suggestions** for better UX
4. **Handle errors gracefully** with user-friendly messages
5. **Provide clear feedback** on validation status

## Integration Tips

- Use reactive forms for complex validation
- Implement phone verification for security
- Store phone numbers in E.164 format
- Consider timezone detection for international users
- Use carrier detection for mobile-specific features


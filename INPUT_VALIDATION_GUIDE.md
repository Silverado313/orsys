# Input Validation Implementation Guide

## Overview

The `input-validator.js` utility provides comprehensive input validation and sanitization to prevent:
- ✅ XSS (Cross-Site Scripting) attacks
- ✅ Injection attacks
- ✅ Invalid data in forms
- ✅ Type coercion errors

## Quick Start

### 1. Include the script in your HTML

```html
<!-- Before your form scripts -->
<script src="/src/scripts/shared/input-validator.js"></script>
```

### 2. Define validation schema

```javascript
const voucherSchema = {
    slipNo: [
        { type: 'required', message: 'Slip number is required' },
        { type: 'minLength', value: 3, message: 'Slip number must be at least 3 characters' }
    ],
    cellNo: [
        { type: 'required' }
    ],
    amount: [
        { type: 'required' },
        { type: 'amount', message: 'Amount must be greater than 0' }
    ],
    email: [
        { type: 'required' },
        { type: 'email' }
    ],
    phone: [
        { type: 'phone', message: 'Invalid phone number' }
    ],
    date: [
        { type: 'required' },
        { type: 'custom', validate: (val) => new Date(val) <= new Date(), message: 'Date cannot be in future' }
    ]
};
```

### 3. Validate form on submit

```javascript
document.getElementById('voucher-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Validate
    const validation = InputValidator.validateFormData(data, voucherSchema);

    if (!validation.isValid) {
        InputValidator.displayErrors(validation.errors, '#alert-container');
        return;
    }

    // Sanitize data
    const sanitized = InputValidator.sanitizeFormData(data);

    // Submit to database
    submitToDB(sanitized);
});
```

## Available Validators

### String Sanitization
```javascript
InputValidator.sanitizeString('<script>alert("xss")</script>')
// Returns: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

### Email Validation
```javascript
InputValidator.isValidEmail('user@aryservices.com.pk')  // true
InputValidator.isValidEmail('invalid-email')             // false
```

### Phone Validation (Pakistani)
```javascript
InputValidator.isValidPhone('03001234567')   // true
InputValidator.isValidPhone('+923001234567') // true
InputValidator.isValidPhone('03001234')      // false
```

### Amount Validation
```javascript
InputValidator.isValidAmount('1000')    // true
InputValidator.isValidAmount('0')       // false
InputValidator.isValidAmount('abc')     // false
```

### Denomination Validation
```javascript
InputValidator.isValidDenomination(5)    // true
InputValidator.isValidDenomination(5000) // true
InputValidator.isValidDenomination(-5)   // false
```

## Form Validation Schema

### Schema Format

```javascript
{
    fieldName: [
        {
            type: 'required',                    // Type of validation
            message: 'Custom error message',     // Optional
            value: someValue                     // If needed for rule
        },
        // More rules...
    ]
}
```

### Validation Types

| Type | Example | Description |
|------|---------|-------------|
| `required` | `{ type: 'required' }` | Field must have value |
| `email` | `{ type: 'email' }` | Valid email format |
| `phone` | `{ type: 'phone' }` | Valid phone format |
| `number` | `{ type: 'number' }` | Must be numeric |
| `amount` | `{ type: 'amount' }` | Must be positive number |
| `minLength` | `{ type: 'minLength', value: 5 }` | Minimum characters |
| `maxLength` | `{ type: 'maxLength', value: 50 }` | Maximum characters |
| `pattern` | `{ type: 'pattern', value: /regex/ }` | Regex pattern |
| `custom` | `{ type: 'custom', validate: (v) => {} }` | Custom function |

## Real-World Example: Voucher Form

### HTML Form

```html
<form id="voucher-form">
    <input type="text" name="slipNo" class="form-control" />
    <input type="email" name="email" class="form-control" />
    <input type="number" name="amount" class="form-control" />
    <input type="text" name="phone" class="form-control" />
    <div id="alert-container"></div>
    <button type="submit" class="btn btn-primary">Create Voucher</button>
</form>
```

### JavaScript Validation

```javascript
// Define validation schema
const voucherValidationSchema = {
    slipNo: [
        { type: 'required', message: 'Slip number is required' },
        { type: 'minLength', value: 3 },
        { type: 'maxLength', value: 20 }
    ],
    email: [
        { type: 'required' },
        { type: 'email', message: 'Please enter valid email' }
    ],
    amount: [
        { type: 'required' },
        { type: 'amount', message: 'Amount must be greater than zero' }
    ],
    phone: [
        { type: 'phone', message: 'Invalid Pakistani phone number' }
    ]
};

// Setup form submission
document.getElementById('voucher-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    InputValidator.clearErrors('#voucher-form');

    // Collect form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Validate
    const result = InputValidator.validateFormData(data, voucherValidationSchema);

    if (!result.isValid) {
        InputValidator.displayErrors(result.errors, '#alert-container');
        return;
    }

    // Sanitize before sending
    const sanitized = InputValidator.sanitizeFormData(data);

    try {
        // Send to database
        const docRef = await db.collection('vouchers').add({
            ...sanitized,
            createdBy: auth.currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('alert-container').innerHTML = 
            '<div class="alert alert-success">Voucher created successfully!</div>';
        this.reset();

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('alert-container').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
});
```

## Security Best Practices

### ✅ DO

- Always validate on the client side for UX
- Always validate on the server side for security
- Sanitize all user input
- Use parameterized queries (Firebase does this automatically)
- Validate file uploads
- Use HTTPS always

### ❌ DON'T

- Trust client-side validation alone
- Display sensitive error messages to users
- Store unvalidated data
- Allow HTML/script tags in user input
- Skip validation for trusted sources

## Next Steps

1. ✅ Add `input-validator.js` to your project
2. 🔄 Update all forms to use validation schema
3. 📊 Log validation failures for monitoring
4. 🧪 Add unit tests for validation functions
5. 📚 Create form component library with built-in validation

---

**Security Level After Implementation**: 🟢 **Very Good**

Input validation + Firestore rules = Strong defense against common web attacks.

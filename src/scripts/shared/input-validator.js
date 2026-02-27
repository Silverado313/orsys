/**
 * Input Validation Utility
 * Provides sanitization and validation for form inputs
 * Prevents XSS, injection attacks, and invalid data
 */

class InputValidator {
    /**
     * Sanitize string input to prevent XSS
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validate email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (Pakistani format)
     */
    static isValidPhone(phone) {
        // Remove spaces and dashes
        const cleaned = phone.replace(/[\s-]/g, '');
        // Pakistani phone: 11-12 digits, starting with 0 or +92
        const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
        return phoneRegex.test(cleaned);
    }

    /**
     * Validate currency amount
     */
    static isValidAmount(amount) {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0;
    }

    /**
     * Validate slip number (alphanumeric, no special chars except dash/underscore)
     */
    static isValidSlipNumber(slipNo) {
        const slipRegex = /^[a-zA-Z0-9_-]+$/;
        return slipNo.length > 0 && slipRegex.test(slipNo);
    }

    /**
     * Validate date format (YYYY-MM-DD)
     */
    static isValidDate(dateString) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) {
            return false;
        }
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Generic text length validator
     */
    static isValidLength(text, minLength = 1, maxLength = 500) {
        return text.length >= minLength && text.length <= maxLength;
    }

    /**
     * Validate denomination (positive integer)
     */
    static isValidDenomination(value) {
        const num = parseInt(value, 10);
        return !isNaN(num) && num >= 0 && num < 10000;
    }

    /**
     * Validate and sanitize form data object
     */
    static validateFormData(data, schema) {
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            for (const rule of rules) {
                let isValid = true;
                let errorMessage = rule.message || `Invalid ${field}`;

                switch (rule.type) {
                    case 'required':
                        isValid = value !== null && value !== undefined && value.toString().trim() !== '';
                        break;

                    case 'email':
                        isValid = this.isValidEmail(value);
                        break;

                    case 'phone':
                        isValid = this.isValidPhone(value);
                        break;

                    case 'number':
                        isValid = !isNaN(parseFloat(value));
                        break;

                    case 'amount':
                        isValid = this.isValidAmount(value);
                        break;

                    case 'minLength':
                        isValid = value.length >= rule.value;
                        errorMessage = `${field} must be at least ${rule.value} characters`;
                        break;

                    case 'maxLength':
                        isValid = value.length <= rule.value;
                        errorMessage = `${field} must be at most ${rule.value} characters`;
                        break;

                    case 'pattern':
                        isValid = rule.value.test(value);
                        break;

                    case 'custom':
                        isValid = rule.validate(value);
                        break;
                }

                if (!isValid) {
                    if (!errors[field]) {
                        errors[field] = [];
                    }
                    errors[field].push(errorMessage);
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Clean and sanitize form data
     */
    static sanitizeFormData(data) {
        const sanitized = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value).trim();
            } else if (typeof value === 'number') {
                sanitized[key] = value;
            } else if (value === null || value === undefined) {
                sanitized[key] = '';
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Display validation errors in UI
     */
    static displayErrors(errors, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = '';

        for (const [field, messages] of Object.entries(errors)) {
            const fieldElement = document.querySelector(`[name="${field}"]`);
            if (fieldElement) {
                fieldElement.classList.add('is-invalid');
            }

            messages.forEach(message => {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger alert-dismissible fade show';
                alertDiv.innerHTML = `
                    <span><strong>${field}:</strong> ${message}</span>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                container.appendChild(alertDiv);
            });
        }
    }

    /**
     * Clear validation errors
     */
    static clearErrors(formSelector = null) {
        if (formSelector) {
            const form = document.querySelector(formSelector);
            if (form) {
                form.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                });
            }
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputValidator;
}

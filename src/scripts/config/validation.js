/**
 * ============================================================================
 * Input Validation Utilities
 * ============================================================================
 * Centralized validation functions to prevent XSS, injection attacks, and
 * invalid data submission across the application.
 * ============================================================================
 */

const ValidationRules = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  
  // Phone number validation (Pakistani format)
  phone: {
    pattern: /^(\+92|0)?3\d{9}$|^(\+92|0)?2\d{7,8}$/,
    message: 'Invalid phone number (use +923XX format or 0XXX)'
  },
  
  // Slip number (numeric)
  slipNo: {
    pattern: /^\d+$/,
    message: 'Slip number must be numeric'
  },
  
  // Currency amount (decimal with 2 places)
  amount: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Invalid amount format'
  },
  
  // Username/Name (alphanumeric + spaces, 3-50 chars)
  name: {
    pattern: /^[a-zA-Z0-9\s'-]{3,50}$/,
    message: 'Name must be 3-50 characters (letters, numbers, spaces, hyphens, apostrophes)'
  },
  
  // Denomination count (non-negative integer)
  count: {
    pattern: /^\d+$/,
    message: 'Count must be a non-negative number'
  },
  
  // URL-safe text
  text: {
    pattern: /^[a-zA-Z0-9\s\-_.(),:/]{0,255}$/,
    message: 'Invalid characters in text'
  },
  
  // Remarks/Notes (allow more characters)
  remarks: {
    pattern: /^[a-zA-Z0-9\s\-_.(),:/&@#%!?]{0,500}$/,
    message: 'Invalid characters in remarks (max 500 characters)'
  }
};

/**
 * Validate a single field against a rule
 * @param {string} value - Value to validate
 * @param {string} rule - Rule key from ValidationRules
 * @returns {object} - { valid: boolean, error: string }
 */
function validateField(value, rule) {
  if (!value && rule !== 'skip-empty') {
    return { valid: false, error: 'This field is required' };
  }
  
  if (!ValidationRules[rule]) {
    console.warn(`⚠️ Validation rule not found: ${rule}`);
    return { valid: true };
  }
  
  const ruleObj = ValidationRules[rule];
  if (!ruleObj.pattern.test(value)) {
    return { valid: false, error: ruleObj.message };
  }
  
  return { valid: true };
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize user input for database storage
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"/\\]/g, (char) => {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '\\': '&#x5C;'
      };
      return escapeMap[char] || char;
    });
}

/**
 * Validate entire form object
 * @param {object} formData - Form data to validate
 * @param {object} schema - Validation schema { fieldName: 'ruleName' }
 * @returns {object} - { valid: boolean, errors: {} }
 */
function validateForm(formData, schema) {
  const errors = {};
  let isValid = true;
  
  for (const [field, rule] of Object.entries(schema)) {
    const value = formData[field];
    const validation = validateField(value, rule);
    
    if (!validation.valid) {
      errors[field] = validation.error;
      isValid = false;
    }
  }
  
  return { valid: isValid, errors };
}

/**
 * Display validation errors on form
 * @param {object} errors - Errors object from validateForm
 * @param {string} containerId - ID of container for error display
 */
function displayFormErrors(errors, containerId = 'form-errors') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  for (const [field, error] of Object.entries(errors)) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
      <strong>${field}:</strong> ${error}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.appendChild(errorDiv);
  }
}

/**
 * Clear validation error from form field
 * @param {string} fieldId - ID of form field
 */
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
  }
}

/**
 * Mark field as having error
 * @param {string} fieldId - ID of form field
 * @param {string} message - Error message
 */
function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    
    let feedback = field.nextElementSibling;
    if (!feedback?.classList.contains('invalid-feedback')) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentNode.insertBefore(feedback, field.nextSibling);
    }
    feedback.textContent = message;
  }
}

// Export functions globally
window.ValidationRules = ValidationRules;
window.validateField = validateField;
window.sanitizeHtml = sanitizeHtml;
window.sanitizeInput = sanitizeInput;
window.validateForm = validateForm;
window.displayFormErrors = displayFormErrors;
window.clearFieldError = clearFieldError;
window.setFieldError = setFieldError;

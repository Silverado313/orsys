//Sign-in script
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Access Firebase Auth
    const auth = firebase.auth();

        // Show loading state
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
        loginBtn.disabled = true;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        // Use displayName if available, otherwise use the part before @ in email
        let displayName = userCredential.user.email.displayName || userCredential.user.email.split('@')[0];
        
        // Capitalize first letter
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        alert('Sign-in successful! Welcome, ' + displayName + ' to OrSYS (Online Receipt System)');
        // alert('Sign-in successful! Welcome, ' + userCredential.user.email);
        // Redirect to another page if needed
        window.location.href = "src/pages/dashboard.html"; // Change to your desired page
    } catch (error) {
        alert('Sign-in failed: ' + error.message);
    }
});

    // Form elements
    const loginForm = document.getElementById('login-form');
    const alertContainer = document.getElementById('alert-container');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');
    const forgotPassword = document.getElementById('forgot-password');


// Forgot password
forgotPassword.addEventListener('click', function(e) {
    e.preventDefault();
    resetPassword();
});

// Reset password function
function resetPassword() {
    const email = emailInput.value;
    
    if (!email) {
        showAlert('Please enter your email address first.', 'warning');
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showAlert('Password reset email sent! Check your inbox.', 'success');
        })
        .catch((error) => {
            console.error("Error sending reset email: ", error);
            showAlert('Error: ' + error.message, 'danger');
        });
}


// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
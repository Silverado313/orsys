//Scripts to Create or InsertData
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            // User is not logged in, redirect to login page
            window.location.href = 'index.html';
        } else {
            // User is logged in, set user info
            document.getElementById('user').value = user.displayName || user.email.split('@')[0];
            document.getElementById('email').value = user.email;
            
            // Initialize the rest of the application
            initializeApp();
        }
    });
    
    // Logout function
    document.getElementById('logout-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            auth.signOut().then(() => {
                window.location.href = '/';
            }).catch((error) => {
                console.error('Logout error:', error);
                alert('Error during logout: ' + error.message);
            });
        }
    });
    
    function initializeApp() {
        // Form elements
        const voucherForm = document.getElementById('voucher-form');
        const alertContainer = document.getElementById('alert-container');
        
        // Preview elements
        const previewSlipNo = document.getElementById('preview-slipNo');
        const previewCellNo = document.getElementById('preview-cellNo');
        const previewPaymentFrom = document.getElementById('preview-paymentFrom');
        const previewPointPerson = document.getElementById('preview-pointPerson');
        const previewDate = document.getElementById('preview-date');
        const previewMode = document.getElementById('preview-paymentMode');
        const previewPaymentStatus = document.getElementById('preview-paymentStatus');
        const previewUser = document.getElementById('preview-user');
        const previewRemarks = document.getElementById('preview-remarks');
        const previewDenominations = document.getElementById('denomination-preview');
        const previewTotalCash = document.getElementById('preview-totalCash');
        
        // Update preview on form change
        voucherForm.addEventListener('input', updateReceiptPreview);
        
        // Form submission
        voucherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitVoucher();
        });
        
        // Update receipt preview
        function updateReceiptPreview() {
            previewSlipNo.textContent = Date.now();
            previewCellNo.textContent = document.getElementById('cellNo').value || '-';
            previewPaymentFrom.textContent = document.getElementById('paymentFrom').value || '-';
            previewPointPerson.textContent = document.getElementById('pointPerson').value || '-';
            previewMode.textContent = document.getElementById('paymentMode').value || '-';
            previewPaymentStatus.textContent = document.getElementById('paymentStatus').value || '-';
            previewUser.textContent = document.getElementById('user').value || '-';
            previewRemarks.textContent = document.getElementById('remarks').value || '-';
            previewDate.textContent = new Date().toLocaleString();
            
            // Calculate denominations
            const denominations = [
                { value: 5000, id: 'deno5000', count: 0 },
                { value: 1000, id: 'deno1000', count: 0 },
                { value: 500, id: 'deno500', count: 0 },
                { value: 100, id: 'deno100', count: 0 },
                { value: 50, id: 'deno50', count: 0 },
                { value: 20, id: 'deno20', count: 0 },
                { value: 10, id: 'deno10', count: 0 },
                { value: 1, id: 'deno1', count: 0 }
            ];
            
            let totalCash = 0;
            let previewHTML = '';
            
            denominations.forEach(deno => {
                const count = parseInt(document.getElementById(deno.id).value) || 0;
                const amount = count * deno.value;
                totalCash += amount;
                
                if (count > 0) {
                    previewHTML += `
                        <tr>
                            <td>${deno.value}</td>
                            <td>${count}</td>
                            <td>${amount.toLocaleString()}</td>
                        </tr>
                    `;
                }
            });
            
            previewDenominations.innerHTML = previewHTML;
            previewTotalCash.textContent = totalCash.toLocaleString();
        }
        
        // Submit voucher to Firestore
        function submitVoucher() {
            // Get form values
            const paymentDate = document.getElementById('paymentDate').value;
            const cellNo = document.getElementById('cellNo').value;
            const paymentFrom = document.getElementById('paymentFrom').value;
            const pointPerson = document.getElementById('pointPerson').value;
            const paymentMode = document.getElementById('paymentMode').value;
            const paymentStatus = document.getElementById('paymentStatus').value;
            const user = document.getElementById('user').value;
            const email = document.getElementById('email').value;
            const remarks = document.getElementById('remarks').value;
            
            // Get denomination values
            const deno5000 = parseInt(document.getElementById('deno5000').value) || 0;
            const deno1000 = parseInt(document.getElementById('deno1000').value) || 0;
            const deno500 = parseInt(document.getElementById('deno500').value) || 0;
            const deno100 = parseInt(document.getElementById('deno100').value) || 0;
            const deno50 = parseInt(document.getElementById('deno50').value) || 0;
            const deno20 = parseInt(document.getElementById('deno20').value) || 0;
            const deno10 = parseInt(document.getElementById('deno10').value) || 0;
            const deno1 = parseInt(document.getElementById('deno1').value) || 0;
            
            // Calculate total cash
            const cash = (deno5000 * 5000) + (deno1000 * 1000) + (deno500 * 500) + 
                        (deno100 * 100) + (deno50 * 50) + (deno20 * 20) + 
                        (deno10 * 10) + (deno1 * 1);
            
            // Current date
            const entryDate = new Date();
            const sysDate = new Date();
            
            // Create voucher object
            const voucher = {
                slipNo: Date.now(),
                cellNo,
                paymentDate, //:new Date().toLocaleString(),
                paymentFrom,
                pointPerson,
                paymentMode,
                paymentStatus,
                remarks,
                user,
                email,
                deno5000,
                deno1000,
                deno500,
                deno100,
                deno50,
                deno20,
                deno10,
                deno1,
                cash,
                entryDate: firebase.firestore.Timestamp.fromDate(entryDate),
                sysDate: firebase.firestore.Timestamp.fromDate(sysDate)
            };
            
            // Add document to Firestore
            db.collection("cr.vouchers").add(voucher)
                .then((docRef) => {
                    showAlert("Voucher submitted successfully!", "success");
                    voucherForm.reset();
                    updateReceiptPreview();
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    showAlert("Error submitting voucher: " + error.message, "danger");
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
            
            // Auto dismiss after 15 seconds
            setTimeout(() => {
                alertDiv.remove();
                window.location.reload();
            }, 5000);
        }
        
        // Initial update of receipt preview
        updateReceiptPreview();
    }
});
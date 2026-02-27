        document.addEventListener('DOMContentLoaded', function() {
            // Elements
            const slipNumberInput = document.getElementById('slipNumber');
            const verifyBtn = document.getElementById('verifyBtn');
            const alertContainer = document.getElementById('alert-container');
            const verificationResult = document.getElementById('verification-result');
            const statusMessage = document.getElementById('status-message');
            const printBtn = document.getElementById('print-receipt');
            const verifyAnotherBtn = document.getElementById('verify-another');
            
            // Event listeners
            verifyBtn.addEventListener('click', verifyReceipt);
            slipNumberInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyReceipt();
                }
            });
            
            printBtn.addEventListener('click', function() {
                window.print();
            });
            
            verifyAnotherBtn.addEventListener('click', function() {
                verificationResult.classList.add('d-none');
                slipNumberInput.value = '';
                slipNumberInput.focus();
            });
            
            // Verify receipt function
            function verifyReceipt() {
                const slipNumber = slipNumberInput.value.trim();
                
                if (!slipNumber) {
                    showAlert('Please enter a slip number', 'warning');
                    return;
                }
                
                // Show loading state
                verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verifying...';
                verifyBtn.disabled = true;
                
                // Query Firestore for the receipt
                db.collection("cr.vouchers")
                    .where("slipNo", "==", parseInt(slipNumber))
                    .get()
                    .then((querySnapshot) => {
                        if (querySnapshot.empty) {
                            // No receipt found
                            showVerificationResult(false, 'Receipt not found. Please check the slip number and try again.');
                        } else {
                            // Receipt found
                            const doc = querySnapshot.docs[0];
                            const voucher = doc.data();
                            
                            // Display receipt details
                            displayReceiptDetails(voucher);
                            showVerificationResult(true, 'Receipt verified successfully! This is a valid receipt.');
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting document:", error);
                        showAlert('Error verifying receipt: ' + error.message, 'danger');
                    })
                    .finally(() => {
                        // Reset button state
                        verifyBtn.innerHTML = '<i class="fas fa-search me-2"></i>Verify';
                        verifyBtn.disabled = false;
                    });
            }
            
            // Display receipt details
            function displayReceiptDetails(voucher) {
                // Format date
                const date = voucher.entryDate.toDate().toLocaleString();
                
                // Set basic information
                document.getElementById('result-slipNo').textContent = voucher.slipNo;
                document.getElementById('result-cell').textContent = voucher.cellNo;
                document.getElementById('result-paymentFrom').textContent = voucher.paymentFrom;
                document.getElementById('result-paymentMode').textContent = voucher.paymentMode;
                document.getElementById('result-pointPerson').textContent = voucher.pointPerson;
                document.getElementById('result-date').textContent = date;
                document.getElementById('result-paymentStatus').textContent = voucher.paymentStatus;
                document.getElementById('result-user').textContent = voucher.user;
                document.getElementById('result-remarks').textContent = voucher.remarks || 'N/A';
                
                // Calculate denominations
                const denominations = [
                    { value: 5000, count: voucher.deno5000 || 0 },
                    { value: 1000, count: voucher.deno1000 || 0 },
                    { value: 500, count: voucher.deno500 || 0 },
                    { value: 100, count: voucher.deno100 || 0 },
                    { value: 50, count: voucher.deno50 || 0 },
                    { value: 20, count: voucher.deno20 || 0 },
                    { value: 10, count: voucher.deno10 || 0 },
                    { value: 1, count: voucher.deno1 || 0 }
                ];
                
                let totalCash = 0;
                let denominationsHTML = '';
                
                denominations.forEach(deno => {
                    if (deno.count > 0) {
                        const amount = deno.count * deno.value;
                        totalCash += amount;
                        
                        denominationsHTML += `
                            <tr>
                                <td>${deno.value}</td>
                                <td>${deno.count}</td>
                                <td>${amount.toLocaleString()}</td>
                            </tr>
                        `;
                    }
                });
                
                document.getElementById('result-denominations').innerHTML = denominationsHTML;
                document.getElementById('result-totalCash').textContent = totalCash.toLocaleString();
            }
            
            // Show verification result
            function showVerificationResult(isValid, message) {
                statusMessage.textContent = message;
                
                if (isValid) {
                    statusMessage.className = 'verification-status verified';
                } else {
                    statusMessage.className = 'verification-status not-verified';
                }
                
                verificationResult.classList.remove('d-none');
                
                // Scroll to results
                verificationResult.scrollIntoView({ behavior: 'smooth' });
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
        });
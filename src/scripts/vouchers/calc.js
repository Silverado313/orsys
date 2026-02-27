// Real-time calculation variables
let totalCredit = 0;
let totalDebit = 0;
let isConnected = false;

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PKR'
    }).format(amount);
}

function updateBalanceDisplay() {
    const cashBalance = totalCredit - totalDebit;
    const resultDiv = document.getElementById('cash-balance');
    
    if (resultDiv && isConnected) {
        resultDiv.innerHTML = `
            <div class="balance-title">Cash Balance Summary</div>
            <div class="balance-item">
                <span class="balance-label">Total Cash-In (A):</span>
                <span class="balance-value">${formatCurrency(totalCredit)}</span>
            </div>
            <div class="balance-item">
                <span class="balance-label">Total Cash-Out (B):</span>
                <span class="balance-value">${formatCurrency(totalDebit)}</span>
            </div>
            <div class="balance-item">
                <span class="balance-label">Net Balance (A - B):</span>
                <span class="balance-value" style="color: ${cashBalance >= 0 ? '#4CAF50' : '#ff6b6b'}">
                    ${formatCurrency(cashBalance)}
                </span>
            </div>
        `;
    }
}

function showError(message) {
    const resultDiv = document.getElementById('cash-balance');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

// Setup real-time listeners
function initializeRealTimeUpdates() {
    try {
        // Listen to cr.voucher collection changes
        db.collection('cr.vouchers').onSnapshot((snapshot) => {
            totalCredit = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Handle different possible field names for cash
                const cashValue = data.cash || data.amount || data.value || 0;
                if (typeof cashValue === 'number' && !isNaN(cashValue)) {
                    totalCredit += cashValue;
                }
            });
            isConnected = true;
            updateBalanceDisplay();
        }, (error) => {
            console.error('Error listening to cr.voucher:', error);
            showError('Failed to connect to credit voucher collection');
        });

        // Listen to dr.voucher collection changes
        db.collection('dr.vouchers').onSnapshot((snapshot) => {
            totalDebit = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Handle different possible field names for cash
                const cashValue = data.cash || data.amount || data.value || 0;
                if (typeof cashValue === 'number' && !isNaN(cashValue)) {
                    totalDebit += cashValue;
                }
            });
            isConnected = true;
            updateBalanceDisplay();
        }, (error) => {
            console.error('Error listening to dr.voucher:', error);
            showError('Failed to connect to debit voucher collection');
        });

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize database connection');
    }
}

// Start real-time updates when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing real-time cash balance monitor...');
    initializeRealTimeUpdates();
});

// Handle connection status
window.addEventListener('online', () => {
    console.log('Connection restored');
    initializeRealTimeUpdates();
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    showError('No internet connection');
});
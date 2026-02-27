let reportTable;
let reportData = [];

// Check authentication state
function checkAuthState() {
    const allowedEmails = [
        'aneel@aryservices.com.pk',
        'mohiuddin.siddiqui@aryservices.com.pk',
        'qasim@aryservices.com.pk'
    ];
    
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = '/dashboard.html';
            return;
        }
        
        // Allow specific emails OR any email from company domain
        const isAllowedEmail = allowedEmails.includes(user.email);
        // const isCompanyDomain = user.email.endsWith('@aryservices.com.pk');
        
        if (!isAllowedEmail) { //&& !isCompanyDomain) {
            window.location.href = '/dashboard.html';
        }
    });
}



// function checkAuthState() {
//     auth.onAuthStateChanged(function(user) {
//         // if (!user) {
//         if (!user || user.email !== 'aneel@aryservices.com.pk') {
//             window.location.href = '/dashboard.html';
//         }
//     });
// }

// Logout function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            window.location.href = '/';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error during logout: ' + error.message);
        });
    }
}

// Set default date range (current month)
function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('dateFrom').value = firstDay.toISOString().split('T')[0];
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];
}

// Calculate total amount from denomination
function calculateTotalAmount(voucher) {
    const deno5000 = voucher.deno5000 || 0;
    const deno1000 = voucher.deno1000 || 0;
    const deno500 = voucher.deno500 || 0;
    const deno100 = voucher.deno100 || 0;
    const deno50 = voucher.deno50 || 0;
    const deno20 = voucher.deno20 || 0;
    const deno10 = voucher.deno10 || 0;
    const deno1 = voucher.deno1 || 0;
    
    return (deno5000 * 5000) + (deno1000 * 1000) + (deno500 * 500) + 
            (deno100 * 100) + (deno50 * 50) + (deno20 * 20) + 
            (deno10 * 10) + (deno1 * 1);
}

// Get badge color for status
function getStatusBadgeColor(status) {
    switch(status) {
        case 'Completed': return 'success';
        case 'Pending': return 'warning';
        case 'Failed': return 'danger';
        default: return 'secondary';
    }
}

// Generate report
function generateReport() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const statusFilter = document.getElementById('statusFilter').value;

    if (!dateFrom || !dateTo) {
        alert('Please select both From and To dates');
        return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
        alert('From date cannot be greater than To date');
        return;
    }

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('report-section').style.display = 'none';
    document.getElementById('summary-section').style.display = 'none';

    // Convert dates to Firestore Timestamp
    const fromDate = firebase.firestore.Timestamp.fromDate(new Date(dateFrom + 'T00:00:00'));
    const toDate = firebase.firestore.Timestamp.fromDate(new Date(dateTo + 'T23:59:59'));

    // Build query
    let query = db.collection("cr.vouchers")
                    .where("entryDate", ">=", fromDate)
                    .where("entryDate", "<=", toDate)
                    .orderBy("entryDate", "desc");

    // Execute query
    query.get()
        .then((querySnapshot) => {
            reportData = [];
            let totalAmount = 0;
            let completedCount = 0;
            let pendingCount = 0;
            let failedCount = 0;

            querySnapshot.forEach((doc) => {
                const voucher = doc.data();
                
                // Apply status filter if selected
                if (statusFilter && voucher.paymentStatus !== statusFilter) {
                    return;
                }

                const amount = calculateTotalAmount(voucher);
                totalAmount += amount;

                // Count by status
                switch(voucher.paymentStatus) {
                    case 'Completed': completedCount++; break;
                    case 'Pending': pendingCount++; break;
                    case 'Failed': failedCount++; break;
                }

                reportData.push({
                    id: doc.id,
                    slipNo: voucher.slipNo,
                    date: voucher.entryDate.toDate(),
                    paymentFrom: voucher.paymentFrom,
                    pointPerson: voucher.pointPerson,
                    paymentStatus: voucher.paymentStatus,
                    user: voucher.user,
                    totalAmount: amount,
                    remarks: voucher.remarks || 'N/A',
                    rawData: voucher
                });
            });

            // Update summary cards
            document.getElementById('total-vouchers').textContent = reportData.length;
            document.getElementById('total-amount').textContent = 'PKR ' + totalAmount.toLocaleString();
            document.getElementById('completed-vouchers').textContent = completedCount;
            document.getElementById('pending-vouchers').textContent = pendingCount;

            // Hide loading and show results
            document.getElementById('loading').style.display = 'none';
            document.getElementById('summary-section').style.display = 'flex';
            document.getElementById('report-section').style.display = 'block';

            // Initialize or update DataTable
            initializeDataTable();
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
            document.getElementById('loading').style.display = 'none';
            alert("Error generating report: " + error.message);
        });
}

// Initialize DataTable
function initializeDataTable() {
    // Destroy existing table if it exists
    if (reportTable && $.fn.DataTable.isDataTable('#report-table')) {
        reportTable.clear();
        reportTable.destroy();
        $('#report-table').empty();
    }

    // Clear and rebuild table structure
    const tableBody = document.querySelector('#report-table tbody');
    const tableHead = document.querySelector('#report-table thead');
    
    // Ensure table structure exists
    if (!tableHead) {
        document.getElementById('report-table').innerHTML = `
            <thead class="table-dark">
                <tr>
                    <th>Slip No</th>
                    <th>Date</th>
                    <th>Payment From</th>
                    <th>Point Person</th>
                    <th>Status</th>
                    <th>User</th>
                    <th>Total Amount</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
    } else {
        tableBody.innerHTML = '';
    }

    // Add data to table body
    let tableHTML = '';
    reportData.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.slipNo}</td>
                <td>${item.date.toLocaleDateString()}</td>
                <td>${item.paymentFrom}</td>
                <td>${item.pointPerson}</td>
                <td><span class="badge bg-${getStatusBadgeColor(item.paymentStatus)}">${item.paymentStatus}</span></td>
                <td>${item.user}</td>
                <td>PKR ${item.totalAmount.toLocaleString()}</td>
                <td>${item.remarks}</td>
            </tr>
        `;
    });
    document.querySelector('#report-table tbody').innerHTML = tableHTML;

    // Initialize DataTable
    try {
        reportTable = $('#report-table').DataTable({
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            order: [[1, 'desc']], // Sort by date desc
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
                    '<"row"<"col-sm-12"tr>>' +
                    '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            responsive: true,
            language: {
                search: "Search vouchers:",
                lengthMenu: "Show _MENU_ vouchers per page",
                info: "Showing _START_ to _END_ of _TOTAL_ vouchers",
                infoEmpty: "No vouchers found",
                infoFiltered: "(filtered from _MAX_ total vouchers)",
                zeroRecords: "No vouchers match your search criteria",
                emptyTable: "No vouchers found for the selected date range"
            }
        });
        
        console.log('DataTable initialized successfully');
    } catch (error) {
        console.error('Error initializing DataTable:', error);
        alert('Error initializing table. Please refresh the page.');
    }
}

// Export to Excel function
function exportToExcel() {
    if (!reportData || reportData.length === 0) {
        alert('No data to export');
        return;
    }

    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const filename = `Voucher_Report_${dateFrom}_to_${dateTo}.csv`;

    // Prepare CSV content
    const headers = ['Slip No', 'Date', 'Payment From', 'Point Person', 'Status', 'User', 'Total Amount', 'Remarks'];
    const csvContent = [
        headers.join(','),
        ...reportData.map(item => [
            item.slipNo,
            item.date.toLocaleDateString(),
            `"${item.paymentFrom}"`,
            `"${item.pointPerson}"`,
            item.paymentStatus,
            `"${item.user}"`,
            item.totalAmount,
            `"${item.remarks}"`
        ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthState();

    // Set default dates
    setDefaultDates();

    // Add event listeners
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    document.getElementById('filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });

    // Export button handlers
    document.getElementById('export-excel').addEventListener('click', function() {
        exportToExcel();
    });

    document.getElementById('export-csv').addEventListener('click', function() {
        exportToExcel(); // Same function for now, can be modified for different format
    });
});
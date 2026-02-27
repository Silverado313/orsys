// Enhanced Dashboard with DataTables.net and Dynamic Totals

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            // User is not logged in, redirect to login page
            window.location.href = '/';
        } else {
            // User is logged in, display user info and load receipts
            displayUserInfo(user);
            loadVouchers();
        }
    });
}

// Display user information from Google Auth
function displayUserInfo(user) {
    const userDisplayElement = document.getElementById('DisplayUserName');
    
    if (userDisplayElement) {
        let displayName = user.displayName || user.email.split('@')[0];
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        // userDisplayElement.innerHTML = 'Welcome! ' + displayName + ' ' + new Date().toLocaleString();
        userDisplayElement.innerHTML = 'Welcome! ' + displayName;
        
        if (user.photoURL) {
            userDisplayElement.innerHTML = `
                <img src="${user.photoURL}" alt="Profile" class="user-avatar rounded-circle me-2" style="width: 30px; height: 30px;">
                ${displayName}
            `;
        }
    }
}

// Logout function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        const logoutBtn = document.getElementById('logout-btn');
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;
        
        auth.signOut().then(() => {
            window.location.href = '/';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error during logout: ' + error.message);
            logoutBtn.innerHTML = originalText;
            logoutBtn.disabled = false;
        });
    }
}

// Global DataTable variable
let vouchersTable;
let allVouchersData = [];

// Load vouchers with DataTables integration
function loadVouchers() {
    // Show loading indicator
    const receiptsTableBody = document.getElementById('receipts-table-body');
    receiptsTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="mt-2">Loading vouchers...</div>
            </td>
        </tr>
    `;

    // Destroy existing DataTable if it exists
    if (vouchersTable) {
        vouchersTable.destroy();
    }

    db.collection("cr.vouchers").orderBy("entryDate", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                receiptsTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-4">No receipts found. Submit a voucher to see history.</td>
                    </tr>
                `;
                return;
            }
            
            // Clear the table body
            receiptsTableBody.innerHTML = '';
            
            // Store all data for calculations
            allVouchersData = [];
            
            querySnapshot.forEach((doc) => {
                const voucher = doc.data();
                const date = voucher.entryDate.toDate();
                
                // Calculate total cash for each voucher
                const totalCash = calculateTotalCash(voucher);
                
                // Store voucher data with calculated total
                const voucherData = {
                    id: doc.id,
                    ...voucher,
                    totalCash: totalCash,
                    formattedDate: date.toLocaleDateString(),
                    timestamp: date.getTime()
                };
                
                allVouchersData.push(voucherData);
            });

            // Initialize DataTable
            initializeDataTable();
            
            // Calculate and display initial totals
            updateTotalDisplay();
            
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
            receiptsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-danger">
                        Error loading receipts: ${error.message}
                    </td>
                </tr>
            `;
        });
}

// Initialize DataTable with Bootstrap 5 styling
function initializeDataTable() {
    vouchersTable = $('#receipts-table').DataTable({
        data: allVouchersData,
        columns: [
            { 
                data: 'slipNo',
                title: 'Slip No',
                width: '10%'
            },
            { 
                data: 'paymentFrom',
                title: 'Payment From',
                width: '15%'
            },
            { 
                data: 'pointPerson',
                title: 'Point Person',
                width: '15%'
            },
            { 
                data: 'paymentMode',
                title: 'Payment Mode',
                width: '10%'
            },
            { 
                data: 'paymentStatus',
                title: 'Status',
                width: '10%',
                render: function(data) {
                    return `<span class="badge bg-${getStatusBadgeColor(data)}">${data}</span>`;
                }
            },
            { 
                data: 'totalCash',
                title: 'Total Amount',
                width: '12%',
                render: function(data) {
                    return `PKR ${data.toLocaleString()}`;
                },
                className: 'text-end'
            },
            // { 
            //     data: 'sysDate',
            //     title: 'Date',
            //     width: '10%',
            //     render: function(data) {
            //         if (!data) return "-";

            //         // If Firestore Timestamp
            //         if (data.toDate) {
            //             return data.toDate().toLocaleDateString("en-GB");
            //         }

            //         // If already a Date or string
            //         return new Date(data).toLocaleDateString("en-GB");
            //     }
            // },
            { 
                data: 'sysDate',
                title: 'MM-YYYY',
                width: '10%',
                render: function(data) {
                    if (!data) return "-";

                    // Convert Firestore Timestamp or String to a JS Date Object
                    var date = data.toDate ? data.toDate() : new Date(data);

                    // Check if date is valid
                    if (isNaN(date.getTime())) return "-";

                    // Use toLocaleDateString with specific options
                    return date.toLocaleDateString("en-GB", {
                        month: "2-digit",
                        year: "numeric"
                    }).replace("/", "-"); // Replaces the default / with -
                }
            },
            { 
                data: null,
                title: 'Actions',
                width: '18%',
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    return `
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary view-receipt me-1" data-id="${row.id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info print-receipt me-1" data-slip="${row.slipNo}" title="Print">
                                <i class="fas fa-print"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-receipt" data-id="${row.id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        order: [[6, 'desc']], // Order by date descending
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100, "All"],
        responsive: false,
        processing: true,
        language: {
            search: "Search vouchers:",
            lengthMenu: "Show _MENU_ vouchers per page",
            info: "Showing _START_ to _END_ of _TOTAL_ vouchers",
            infoEmpty: "No vouchers found",
            infoFiltered: "(filtered from _MAX_ total vouchers)",
            emptyTable: "No vouchers available",
            zeroRecords: "No matching vouchers found"
        },
        dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row mt-3'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        drawCallback: function(settings) {
            // Attach event listeners after each draw
            attachEventListeners();
            // Update totals based on current filtered data
            updateTotalDisplay();
        },
        initComplete: function() {
            // Add custom styling and features after initialization
            addCustomFeatures();
        }
    });

    // Add search event listener for real-time total updates
    $('#receipts-table_filter input').on('keyup search', function() {
        setTimeout(updateTotalDisplay, 100); // Small delay to ensure filtering is complete
    });
}

// Add custom features to enhance the DataTable
function addCustomFeatures() {
    // Add total display container above the table
    const tableContainer = document.querySelector('.dataTables_wrapper');
    if (tableContainer && !document.getElementById('totals-display')) {
        const totalsHtml = `
    
        `;
        tableContainer.insertAdjacentHTML('afterbegin', totalsHtml);
    }

    // Add export buttons
    addExportButtons();
}

// Add export functionality
function addExportButtons() {
    const filterContainer = document.querySelector('.dataTables_filter');
    if (filterContainer && !document.getElementById('export-buttons')) {
        const exportHtml = `
            <div id="export-buttons" class="d-inline-block ms-3">
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-success btn-sm" onclick="exportToCSV()" title="Export to CSV">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="printTable()" title="Print Table">
                        <i class="fas fa-print"></i> Print
                    </button>
                </div>
            </div>
        `;
        filterContainer.insertAdjacentHTML('beforeend', exportHtml);
    }
}

// Calculate total cash from denomination breakdown
function calculateTotalCash(voucher) {
    return (
        (voucher.deno5000 || 0) * 5000 +
        (voucher.deno1000 || 0) * 1000 +
        (voucher.deno500 || 0) * 500 +
        (voucher.deno100 || 0) * 100 +
        (voucher.deno50 || 0) * 50 +
        (voucher.deno20 || 0) * 20 +
        (voucher.deno10 || 0) * 10 +
        (voucher.deno1 || 0) * 1
    );
}

// Update total display based on current filtered data
function updateTotalDisplay() {
    if (!vouchersTable) return;

    // Get currently displayed (filtered) data
    const filteredData = vouchersTable.rows({ search: 'applied' }).data().toArray();
    
    let totalVouchers = filteredData.length;
    let totalAmount = 0;
    let completedAmount = 0;
    let pendingAmount = 0;
    let failedAmount = 0;

    filteredData.forEach(voucher => {
        totalAmount += voucher.totalCash;
        
        switch(voucher.paymentStatus) {
            case 'Completed':
                completedAmount += voucher.totalCash;
                break;
            case 'Pending':
                pendingAmount += voucher.totalCash;
                break;
            case 'Failed':
                failedAmount += voucher.totalCash;
                break;
        }
    });

    // Format amounts with K and M abbreviations
    function formatAmount(amount) {
        if (amount >= 10000000) { // 10 million or more
            return 'PKR ' + (amount / 10000000).toFixed(1) + 'M';
        } else if (amount >= 1000000) { // 1 million or more
            return 'PKR ' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 100000) { // 100,000 or more
            return 'PKR ' + (amount / 1000).toFixed(0) + 'K';
        } else if (amount >= 1000) { // 1,000 or more
            return 'PKR ' + (amount / 1000).toFixed(1) + 'K';
        } else {
            return 'PKR ' + amount.toLocaleString();
        }
    }

    // Update the display
    const totalVouchersEl = document.getElementById('total-vouchers');
    const totalAmountEl = document.getElementById('total-amount');
    const completedAmountEl = document.getElementById('completed-amount');
    const pendingAmountEl = document.getElementById('pending-amount');

    if (totalVouchersEl) totalVouchersEl.textContent = totalVouchers.toLocaleString();
    if (totalAmountEl) totalAmountEl.textContent = formatAmount(totalAmount);
    if (completedAmountEl) completedAmountEl.textContent = formatAmount(completedAmount);
    if (pendingAmountEl) pendingAmountEl.textContent = formatAmount(pendingAmount);
}
/// Old Script to Display Total Amount
// function updateTotalDisplay() {
//     if (!vouchersTable) return;

//     // Get currently displayed (filtered) data
//     const filteredData = vouchersTable.rows({ search: 'applied' }).data().toArray();
    
//     let totalVouchers = filteredData.length;
//     let totalAmount = 0;
//     let completedAmount = 0;
//     let pendingAmount = 0;
//     let failedAmount = 0;

//     filteredData.forEach(voucher => {
//         totalAmount += voucher.totalCash;
        
//         switch(voucher.paymentStatus) {
//             case 'Completed':
//                 completedAmount += voucher.totalCash;
//                 break;
//             case 'Pending':
//                 pendingAmount += voucher.totalCash;
//                 break;
//             case 'Failed':
//                 failedAmount += voucher.totalCash;
//                 break;
//         }
//     });

//     // Update the display
//     const totalVouchersEl = document.getElementById('total-vouchers');
//     const totalAmountEl = document.getElementById('total-amount');
//     const completedAmountEl = document.getElementById('completed-amount');
//     const pendingAmountEl = document.getElementById('pending-amount');

//     if (totalVouchersEl) totalVouchersEl.textContent = totalVouchers.toLocaleString();
//     if (totalAmountEl) totalAmountEl.textContent = `PKR ${totalAmount.toLocaleString()}`;
//     if (completedAmountEl) completedAmountEl.textContent = `PKR ${completedAmount.toLocaleString()}`;
//     if (pendingAmountEl) pendingAmountEl.textContent = `PKR ${pendingAmount.toLocaleString()}`;
// }

// Export to CSV function
function exportToCSV() {
    if (!vouchersTable) return;

    const filteredData = vouchersTable.rows({ search: 'applied' }).data().toArray();
    
    let csvContent = "Slip No,Payment From,Point Person,Pay Date,Payment Mode,Status,Total Amount,Date,Remarks\n";
    
    filteredData.forEach(voucher => {
        const row = [
            voucher.slipNo,
            `"${voucher.paymentFrom}"`,
            `"${voucher.pointPerson}"`,
            voucher.paymentDate,
            voucher.paymentMode,
            voucher.paymentStatus,
            voucher.totalCash,
            voucher.formattedDate,
            `"${voucher.remarks || ''}"`
        ].join(',');
        csvContent += row + "\n";
    });

    // Add totals row
    const totals = calculateFilteredTotals(filteredData);
    csvContent += `\nSUMMARY,,,,,,\n`;
    csvContent += `Total Vouchers,${totals.count},,,,\n`;
    csvContent += `Total Amount,PKR ${totals.total.toLocaleString()},,,,\n`;
    csvContent += `Completed,PKR ${totals.completed.toLocaleString()},,,,\n`;
    csvContent += `Pending,PKR ${totals.pending.toLocaleString()},,,,\n`;

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vouchers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print table function
function printTable() {
    if (!vouchersTable) return;

    const filteredData = vouchersTable.rows({ search: 'applied' }).data().toArray();
    const totals = calculateFilteredTotals(filteredData);
    
    let printContent = `
        <html>
        <head>
            <title>ORSYS-ARY Vouchers Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .totals { margin-top: 20px; }
                .totals table { width: 50%; }
                .text-right { text-align: right; }
                @media print { 
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>ORSYS-ARY Vouchers Report</h2>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Total Records: ${filteredData.length}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Slip No</th>
                        <th>Payment From</th>
                        <th>Point Person</th>
                        <th>Payment Mode</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredData.forEach(voucher => {
        printContent += `
            <tr>
                <td>${voucher.slipNo}</td>
                <td>${voucher.paymentFrom}</td>
                <td>${voucher.pointPerson}</td>
                <td>${voucher.paymentMode}</td>
                <td>${voucher.paymentStatus}</td>
                <td class="text-right">PKR ${voucher.totalCash.toLocaleString()}</td>
                <td>${voucher.formattedDate}</td>
            </tr>
        `;
    });
    
    printContent += `
                </tbody>
            </table>
            
            <div class="totals">
                <h3>Summary</h3>
                <table>
                    <tr><td><strong>Total Vouchers:</strong></td><td class="text-right">${totals.count}</td></tr>
                    <tr><td><strong>Total Amount:</strong></td><td class="text-right">PKR ${totals.total.toLocaleString()}</td></tr>
                    <tr><td><strong>Completed:</strong></td><td class="text-right">PKR ${totals.completed.toLocaleString()}</td></tr>
                    <tr><td><strong>Pending:</strong></td><td class="text-right">PKR ${totals.pending.toLocaleString()}</td></tr>
                </table>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// Calculate totals for filtered data
function calculateFilteredTotals(data) {
    return data.reduce((totals, voucher) => {
        totals.count++;
        totals.total += voucher.totalCash;
        
        switch(voucher.paymentStatus) {
            case 'Completed':
                totals.completed += voucher.totalCash;
                break;
            case 'Pending':
                totals.pending += voucher.totalCash;
                break;
            case 'Failed':
                totals.failed += voucher.totalCash;
                break;
        }
        
        return totals;
    }, { count: 0, total: 0, completed: 0, pending: 0, failed: 0 });
}

// Helper function to get badge color based on status
function getStatusBadgeColor(status) {
    switch(status) {
        case 'Completed': return 'success';
        case 'Pending': return 'warning';
        case 'Failed': return 'danger';
        default: return 'secondary';
    }
}

// Attach event listeners to action buttons
function attachEventListeners() {
    // View receipt buttons
    document.querySelectorAll('.view-receipt').forEach(button => {
        button.addEventListener('click', function() {
            const receiptId = this.getAttribute('data-id');
            viewReceipt(receiptId);
        });
    });
    
    // Print receipt buttons
    document.querySelectorAll('.print-receipt').forEach(button => {
        button.addEventListener('click', function() {
            const slipNo = this.getAttribute('data-slip');
            window.open(`/src/pages/vouchers/print.html?slip=${slipNo}`, "_blank", 
                "toolbar=yes,scrollbars=yes,resizable=yes,top=150,left=250,width=800,height=600");
        });
    });
    
    // Delete receipt buttons
    document.querySelectorAll('.delete-receipt').forEach(button => {
        button.addEventListener('click', function() {
            const receiptId = this.getAttribute('data-id');
            deleteReceipt(receiptId);
        });
    });
}

// View receipt details (enhanced with better formatting)
function viewReceipt(receiptId) {
    const voucher = allVouchersData.find(v => v.id == receiptId);
    
    if (!voucher) {
        alert("Receipt not found!");
        return;
    }

    const date = new Date(voucher.timestamp).toLocaleString();
    const totalCash = voucher.totalCash;
    
    // Create enhanced receipt details HTML
    const receiptHTML = `
        <div class="receipt-container">
            <div class="receipt-header text-center mb-4">
                <h4>OFFICIAL RECEIPT VOUCHER</h4>
                <p class="mb-0">ORSYS-ARY Receipt System</p>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>Slip No:</strong> ${voucher.slipNo}</p>
                    <p><strong>Payment From:</strong> ${voucher.paymentFrom}</p>
                    <p><strong>Point Person:</strong> ${voucher.pointPerson}</p>
                    <p><strong>Payment Mode:</strong> ${voucher.paymentMode}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Payment Status:</strong> <span class="badge bg-${getStatusBadgeColor(voucher.paymentStatus)}">${voucher.paymentStatus}</span></p>
                    <p><strong>User:</strong> ${voucher.user}</p>
                    <p><strong>Total Amount:</strong> <span class="fw-bold text-success">PKR ${totalCash.toLocaleString()}</span></p>
                </div>
            </div>
            
            <p><strong>Remarks:</strong> ${voucher.remarks || 'N/A'}</p>
            
            <h5 class="mt-4 mb-3">Denomination Breakdown</h5>
            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th>Denomination</th>
                            <th class="text-center">Count</th>
                            <th class="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${voucher.deno5000 ? `<tr><td>PKR 5,000</td><td class="text-center">${voucher.deno5000}</td><td class="text-end">PKR ${(voucher.deno5000 * 5000).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno1000 ? `<tr><td>PKR 1,000</td><td class="text-center">${voucher.deno1000}</td><td class="text-end">PKR ${(voucher.deno1000 * 1000).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno500 ? `<tr><td>PKR 500</td><td class="text-center">${voucher.deno500}</td><td class="text-end">PKR ${(voucher.deno500 * 500).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno100 ? `<tr><td>PKR 100</td><td class="text-center">${voucher.deno100}</td><td class="text-end">PKR ${(voucher.deno100 * 100).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno50 ? `<tr><td>PKR 50</td><td class="text-center">${voucher.deno50}</td><td class="text-end">PKR ${(voucher.deno50 * 50).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno20 ? `<tr><td>PKR 20</td><td class="text-center">${voucher.deno20}</td><td class="text-end">PKR ${(voucher.deno20 * 20).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno10 ? `<tr><td>PKR 10</td><td class="text-center">${voucher.deno10}</td><td class="text-end">PKR ${(voucher.deno10 * 10).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno1 ? `<tr><td>PKR 1</td><td class="text-center">${voucher.deno1}</td><td class="text-end">PKR ${(voucher.deno1 * 1).toLocaleString()}</td></tr>` : ''}
                    </tbody>
                    <tfoot class="table-success">
                        <tr>
                            <th colspan="2"><strong>Total Cash</strong></th>
                            <th class="text-end"><strong>PKR ${totalCash.toLocaleString()}</strong></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    // Display in modal
    document.getElementById('receipt-detail-content').innerHTML = receiptHTML;
    
    // Show the modal
    const receiptModal = new bootstrap.Modal(document.getElementById('receipt-modal'));
    receiptModal.show();
}

// Delete receipt function (enhanced with better UX)
function deleteReceipt(receiptId) {
    const voucher = allVouchersData.find(v => v.id === receiptId);
    
    if (!voucher) {
        alert("Receipt not found!");
        return;
    }

    if (confirm(`Are you sure you want to delete voucher ${voucher.slipNo}?\n\nThis action cannot be undone.`)) {
        const deleteBtn = document.querySelector(`[data-id="${receiptId}"].delete-receipt`);
        const originalHtml = deleteBtn.innerHTML;
        
        // Show loading state
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        deleteBtn.disabled = true;
        
        db.collection("cr.vouchers").doc(receiptId).delete()
            .then(() => {
                alert("Receipt deleted successfully!");
                // Remove from local data array
                allVouchersData = allVouchersData.filter(v => v.id !== receiptId);
                // Reload DataTable
                loadVouchers();
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
                alert("Error deleting receipt: " + error.message);
                
                // Restore button state
                deleteBtn.innerHTML = originalHtml;
                deleteBtn.disabled = false;
            });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to logout button
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    
    // Check authentication state
    checkAuthState();
});
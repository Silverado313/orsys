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
                window.location.href = '/';
                return;
            }
            
            const isAllowedEmail = allowedEmails.includes(user.email);
            
            if (!isAllowedEmail) {
                document.body.style.display = 'none';                    
                // alert('Not Allowed');              
                window.location.href = '/';
            } else {
                displayUserInfo(user);
            }
        });
    }

// Display user information from Google Auth
function displayUserInfo(user) {
    
    const userDisplayElement = document.getElementById('DisplayUserName');
    
    if (userDisplayElement) {
        // Use displayName if available, otherwise use the part before @ in email
        let displayName = user.displayName || user.email.split('@')[0];
        
        // Capitalize first letter
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        userDisplayElement.innerHTML = 'Welcome! ' + displayName ; // + ' ' + new Date().toLocaleString();
        
        // Optional: Add user profile picture if available
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

        // Show overlay loader
        const overlay = document.getElementById("overlay");
        if (overlay) overlay.style.display = "block";
        
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
                        paymentMode: voucher.paymentMode,
                        pointPerson: voucher.pointPerson,
                        cellNo: voucher.cellNo,
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
                if (overlay) overlay.style.display = "none";
                document.getElementById('summary-section').style.display = 'flex';
                document.getElementById('report-section').style.display = 'block';

                // Initialize DataTable
                initializeDataTable();
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
                if (overlay) overlay.style.display = "none";
                alert("Error generating report: " + error.message);
            });
    }

    // Initialize DataTable (Updated to match table_req.html structure)
    function initializeDataTable() {     
        // Destroy existing table if it exists
        if (reportTable && $.fn.DataTable.isDataTable('#report-table')) {
            reportTable.destroy();
        }

        // Initialize DataTable with columns definition like table_req.html
        const dateFromFile = document.getElementById('dateFrom').value //= firstDay.toISOString().split('T')[0];
        const dateToFile = document.getElementById('dateTo').value //= today.toISOString().split('T')[0];        
        reportTable = $('#report-table').DataTable({
            columns: [
                // { title: "UID" },
                { title: "Slip No" },
                { title: "Date" },
                { title: "MM-YYYY" },
                { title: "Payment From" },
                { title: "Payment Mode" },
                { title: "Point Person" },
                { title: "PP Cell" },
                { title: "Status" },
                { title: "User" },
                { title: "Total PKR" },
                // { title: "Remarks" },
                { title: "Actions", orderable: false },
                { title: "Dele", orderable: false }
            ],
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'excel',
                    filename: 'Report_CRV_' + dateFromFile + '_to_' + dateToFile
                },
                'print'
            ],
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            order: [[1, 'desc']], // Sort by date desc
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

        // Clear existing data
        reportTable.clear().draw();

        // Add data to table
        reportData.forEach(item => {
            reportTable.row.add([
                // item.id,
                item.slipNo,
                new Date(item.date).toLocaleDateString("en-GB"),
                new Date(item.date)
                .toLocaleDateString("en-GB", { month: '2-digit', year: 'numeric' })
                .replace('/', '-'),
                item.paymentFrom,
                item.paymentMode,
                item.pointPerson,
                item.cellNo,
                `<span class="badge bg-${getStatusBadgeColor(item.paymentStatus)}">${item.paymentStatus}</span>`,
                item.user,
                // 'PKR ' + 
                item.totalAmount.toLocaleString(),
                // item.remarks,
                `<a onclick='window.open("/src/pages/vouchers/print.html?slip=${item.slipNo}", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=150,left=250,width=800,height=600")'; class="btn btn-info btn-sm">View</a>`,
                `<button class="btn btn-sm btn-outline-danger delete-receipt" data-id="${item.id}"><i class="fas fa-trash"></i> Delete</button>`
            ]).draw(false);
        });

        console.log('DataTable initialized successfully');
        attachEventListeners();
    }

    // Attach event listeners to action buttons
    function attachEventListeners() {
        // View receipt buttons
        // document.querySelectorAll('.view-receipt').forEach(button => {
        //     button.addEventListener('click', function() {
        //         const receiptId = this.getAttribute('data-id');
        //         viewReceipt(receiptId);
        //     });
        // });
        
        // Delete receipt buttons
        document.querySelectorAll('.delete-receipt').forEach(button => {
            button.addEventListener('click', function() {
                const receiptId = this.getAttribute('data-id');
                deleteReceipt(receiptId);
            });
        });
    }

    // Delete receipt function
    function deleteReceipt(receiptId) {
        if (confirm("Are you sure you want to delete this receipt? This action cannot be undone.")) {
            db.collection("cr.vouchers").doc(receiptId).delete()
                .then(() => {
                    alert("Receipt deleted successfully!");
                    loadVouchers(); // Reload the table
                })
                .catch((error) => {
                    console.error("Error deleting document: ", error);
                    alert("Error deleting receipt: " + error.message);
                });
        }
    }


    // // Export to Excel function
    // function exportToExcel() {
    //     if (!reportData || reportData.length === 0) {
    //         alert('No data to export');
    //         return;
    //     }

    //     const dateFrom = document.getElementById('dateFrom').value;
    //     const dateTo = document.getElementById('dateTo').value;
    //     const filename = `Voucher_Report_${dateFrom}_to_${dateTo}.csv`;

    //     // Prepare CSV content
    //     const headers = ['Slip No', 'Date', 'Payment From', 'Point Person', 'Status', 'User', 'Total Amount', 'Remarks'];
    //     const csvContent = [
    //         headers.join(','),
    //         ...reportData.map(item => [
    //             item.slipNo,
    //             item.date.toLocaleDateString(),
    //             `"${item.paymentFrom}"`,
    //             `"${item.pointPerson}"`,
    //             item.paymentStatus,
    //             `"${item.user}"`,
    //             item.totalAmount,
    //             `"${item.remarks}"`
    //         ].join(','))
    //     ].join('\n');

    //     // Create and download file
    //     const blob = new Blob([csvContent], { type: 'text/csv' });
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = filename;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     window.URL.revokeObjectURL(url);
    // }

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
        // Check authentication        checkAuthState();

        // Set default dates
        setDefaultDates();

        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', logoutUser);
        document.getElementById('filter-form').addEventListener('submit', function(e) {
            e.preventDefault();
            generateReport();
        });

        // // Export button handlers
        // document.getElementById('export-excel').addEventListener('click', function() {
        //     exportToExcel();
        // });

        // document.getElementById('export-csv').addEventListener('click', function() {
        //     exportToExcel();
        // });
    });
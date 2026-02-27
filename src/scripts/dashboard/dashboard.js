/**
 * ============================================================================
 * ORSYS-ARY Dashboard Analytics Engine
 * ============================================================================
 * File: /src/scripts/dashboard/dashboard.js
 * Purpose: Real-time financial analytics and visualization
 * Dependencies: Firebase, Chart.js, jQuery
 * Author: Syed Aneel Raza
 * Last Updated: December 24, 2024
 * ============================================================================
 */

// Global variables
let allVouchers = [];
let currentPeriod = 30; // Default 7 days
let charts = {}; // Store chart instances

// Chart.js default configuration
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.color = '#6c757d';

/**
 * Calculate total amount from denomination (matching appdvreport.js)
 */
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

/**
 * Initialize dashboard on page load
 */
$(document).ready(function() {
    // Check authentication (matching appdvreport.js)
    const allowedEmails = [
        'aneel@aryservices.com.pk',
        'mohiuddin.siddiqui@aryservices.com.pk',
        'qasim@aryservices.com.pk',
        'khizar.ansari@aryservices.com.pk',
        'essa@aryservices.com.pk'
    ];
    
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = '/';
            return;
        }
        
        const isAllowedEmail = allowedEmails.includes(user.email);
        
        if (!isAllowedEmail) {
            document.body.style.display = 'none';
            window.location.href = '/';
        } else {
            initializeDashboard();
        }
    });
    
    // Update time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Period selector event
    $('.btn-group button').click(function() {
        $('.btn-group button').removeClass('active');
        $(this).addClass('active');
        currentPeriod = parseInt($(this).data('period'));
        loadDashboardData();
    });
    
    // Export dashboard
    $('#exportDashboard').click(exportDashboard);
});

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    console.log('🚀 Initializing Dashboard...');
    loadDashboardData();
}

/**
 * Update date and time display
 */
function updateDateTime() {
    const now = new Date();
    
    // Format date
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    $('#currentDate').text(now.toLocaleDateString('en-US', dateOptions));
    
    // Format time
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    $('#currentTime').text(now.toLocaleTimeString('en-US', timeOptions));
}

/**
 * Load all dashboard data from Firebase (matching appdvreport.js structure)
 */
async function loadDashboardData() {
    try {
        console.log(`📊 Loading data for last ${currentPeriod} days...`);
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - currentPeriod);
        
        // Convert dates to Firestore Timestamp (matching appdvreport.js)
        const fromDate = firebase.firestore.Timestamp.fromDate(new Date(startDate.toISOString().split('T')[0] + 'T00:00:00'));
        const toDate = firebase.firestore.Timestamp.fromDate(new Date(endDate.toISOString().split('T')[0] + 'T23:59:59'));
        
        // Query Firestore (USING EXACT STRUCTURE FROM appdvreport.js)
        const query = db.collection("dr.vouchers")
            .where("entryDate", ">=", fromDate)
            .where("entryDate", "<=", toDate)
            .orderBy("entryDate", "desc");
        
        const snapshot = await query.get();
        
        allVouchers = [];
        snapshot.forEach(doc => {
            const voucher = doc.data();
            const amount = calculateTotalAmount(voucher);
            
            allVouchers.push({
                id: doc.id,
                slipNo: voucher.slipNo,
                entryDate: voucher.entryDate.toDate(),
                paymentFrom: voucher.paymentFrom,
                paymentHead: voucher.paymentHead,
                paymentMode: voucher.paymentMode,
                pointPerson: voucher.pointPerson,
                cellNo: voucher.cellNo,
                paymentStatus: voucher.paymentStatus,
                user: voucher.user,
                amount: amount,
                remarks: voucher.remarks || 'N/A',
                rawData: voucher
            });
        });
        
        console.log(`✅ Loaded ${allVouchers.length} vouchers from dr.vouchers`);
        
        // Update all dashboard components
        updateKPIs();
        renderAllCharts();
        updateTopPerformersTable();
        
        // Hide loading overlay
        $('#loadingOverlay').fadeOut();
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        console.error('Error details:', error.message);
        
        // Show user-friendly error
        $('#loadingOverlay').html(`
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5>Error Loading Dashboard</h5>
                <p class="text-muted">${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-sync me-2"></i>Retry
                </button>
            </div>
        `);
    }
}

/**
 * Update KPI cards
 */
function updateKPIs() {
    // Total vouchers
    const totalVouchers = allVouchers.length;
    $('#kpiTotalVouchers').text(totalVouchers.toLocaleString());
    
    // Total amount
    const totalAmount = allVouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
    $('#kpiTotalAmount').text('PKR ' + totalAmount.toLocaleString());
    
    // Pending vouchers (using paymentStatus from appdvreport.js)
    const pending = allVouchers.filter(v => v.paymentStatus === 'Pending');
    const pendingAmount = pending.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
    $('#kpiPending').text(pending.length);
    $('#pendingTrend').html(`<i class="fas fa-minus me-1"></i>PKR ${pendingAmount.toLocaleString()}`);
    
    // Completion rate
    const completed = allVouchers.filter(v => v.paymentStatus === 'Completed').length;
    const completionRate = totalVouchers > 0 ? ((completed / totalVouchers) * 100).toFixed(1) : 0;
    $('#kpiCompletionRate').text(completionRate + '%');
    
    // Trends (mock data - you can calculate actual trends)
    $('#voucherTrend').html(`<i class="fas fa-arrow-up me-1"></i>12% from last period`);
    $('#amountTrend').html(`<i class="fas fa-arrow-up me-1"></i>8% from last period`);
    
    // Color code completion rate
    if (completionRate >= 95) {
        $('#completionTrend').html('<i class="fas fa-check-circle me-1"></i>Exceeds target!').addClass('trend-up');
    } else {
        $('#completionTrend').html('<i class="fas fa-exclamation-triangle me-1"></i>Below target').addClass('trend-down');
    }
}

/**
 * Render all charts
 */
function renderAllCharts() {
    renderTrendChart();
    renderStatusPieChart();
    renderPaymentFromChart();
    renderPointPersonChart();
    renderPaymentModeChart();
    renderDayOfWeekChart();
    renderMonthlyComparisonChart();
    renderAmountRangeChart();
}

/**
 * 1. Trend Chart (Line Chart)
 * Shows daily payment trends
 */
function renderTrendChart() {
    destroyChart('trendChart');
    
    // Group by date
    const dateGroups = {};
    allVouchers.forEach(v => {
        const date = new Date(v.entryDate);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = { completed: 0, pending: 0, failed: 0, amount: 0 };
        }
        
        if (v.paymentStatus === 'Completed') dateGroups[dateKey].completed++;
        if (v.paymentStatus === 'Pending') dateGroups[dateKey].pending++;
        if (v.paymentStatus === 'Failed') dateGroups[dateKey].failed++;
        dateGroups[dateKey].amount += parseFloat(v.amount) || 0;
    });
    
    // Sort dates
    const sortedDates = Object.keys(dateGroups).sort();
    const labels = sortedDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const completedData = sortedDates.map(d => dateGroups[d].completed);
    const pendingData = sortedDates.map(d => dateGroups[d].pending);
    const amountData = sortedDates.map(d => dateGroups[d].amount);
    
    const ctx = document.getElementById('trendChart').getContext('2d');
    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    borderColor: '#38ef7d',
                    backgroundColor: 'rgba(56, 239, 125, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Pending',
                    data: pendingData,
                    borderColor: '#f5576c',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Amount (PKR)',
                    data: amountData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label === 'Amount (PKR)') {
                                return label + ': PKR ' + context.parsed.y.toLocaleString();
                            }
                            return label + ': ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Vouchers'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Amount (PKR)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

/**
 * 2. Status Pie Chart
 * Shows distribution of payment statuses (using paymentStatus)
 */
function renderStatusPieChart() {
    destroyChart('statusPieChart');
    
    const statusCounts = {};
    allVouchers.forEach(v => {
        const status = v.paymentStatus || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const ctx = document.getElementById('statusPieChart').getContext('2d');
    charts.statusPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#38ef7d',  // Completed - Green
                    '#f5576c',  // Pending - Red
                    '#ffd93d',  // Failed - Yellow
                    '#667eea'   // Other - Purple
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 3. Payment From Chart (Horizontal Bar)
 * Shows spending by paymentFrom (replaces Department or Headwise)
 */
function renderPaymentFromChart() {
    destroyChart('departmentChart');
    
    const paymentFromData = {};
    allVouchers.forEach(v => {
        const paymentFrom = v.paymentHead || 'Unknown';

        if (paymentFrom === 'ARY GOLD STREET (Mart)'){
            return;
        }

        if (!paymentFromData[paymentFrom]) {
            paymentFromData[paymentFrom] = { count: 0, amount: 0 };
        }
        paymentFromData[paymentFrom].count++;
        paymentFromData[paymentFrom].amount += parseFloat(v.amount) || 0;
    });
    
    // Sort by amount
    const sorted = Object.entries(paymentFromData)
        .sort((a, b) => b[1].amount - a[1].amount)
        .slice(0, 10); // Top 10
    
    const ctx = document.getElementById('departmentChart').getContext('2d');
    charts.departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([from]) => from),
            datasets: [{
                label: 'Total Amount (PKR)',
                data: sorted.map(([_, data]) => data.amount),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'PKR ' + context.parsed.x.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: function(value) {
                            return 'PKR ' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}



/**
 * Example Firestore Listener 
 * Replace 'vouchers' with your actual collection name
 */
function listenToVouchers() {
    db.collection('dr.vouchers').onSnapshot(snapshot => {
        allVouchers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Re-render chart automatically when Firestore data changes
        renderPaymentHeadChart(); 
    });
}



/**
 * 4. Point Person Chart (Horizontal Bar)
 * Shows top performers by volume
 */
function renderPointPersonChart() {
    destroyChart('pointPersonChart');
    
    const personData = {};
    allVouchers.forEach(v => {
        const person = v.pointPerson || 'Unknown';
        if (!personData[person]) {
            personData[person] = { count: 0, amount: 0 };
        }
        personData[person].count++;
        personData[person].amount += parseFloat(v.amount) || 0;
    });
    
    // Sort by count
    const sorted = Object.entries(personData)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10); // Top 10
    
    const ctx = document.getElementById('pointPersonChart').getContext('2d');
    charts.pointPersonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([person]) => person),
            datasets: [{
                label: 'Number of Vouchers',
                data: sorted.map(([_, data]) => data.count),
                backgroundColor: 'rgba(56, 239, 125, 0.8)',
                borderColor: '#38ef7d',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * 5. Payment Mode Chart (Polar Area)
 * Shows payment methods distribution
 */
function renderPaymentModeChart() {
    destroyChart('categoryChart');
    
    const modeData = {};
    allVouchers.forEach(v => {
        const mode = v.paymentMode || 'Unknown';
        if (!modeData[mode]) {
            modeData[mode] = { count: 0, amount: 0 };
        }
        modeData[mode].count++;
        modeData[mode].amount += parseFloat(v.amount) || 0;
    });
    
    const ctx = document.getElementById('categoryChart').getContext('2d');
    charts.categoryChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(modeData),
            datasets: [{
                data: Object.values(modeData).map(d => d.amount),
                backgroundColor: [
                    'rgba(102, 126, 234, 0.7)',
                    'rgba(56, 239, 125, 0.7)',
                    'rgba(245, 87, 108, 0.7)',
                    'rgba(240, 147, 251, 0.7)',
                    'rgba(79, 172, 254, 0.7)',
                    'rgba(255, 217, 61, 0.7)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': PKR ' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * 6. Day of Week Chart (Bar)
 * Shows voucher distribution by weekday
 */
function renderDayOfWeekChart() {
    destroyChart('dayOfWeekChart');
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = [0, 0, 0, 0, 0, 0, 0];
    
    allVouchers.forEach(v => {
        const date = new Date(v.entryDate);
        const dayIndex = date.getDay();
        dayData[dayIndex]++;
    });
    
    const ctx = document.getElementById('dayOfWeekChart').getContext('2d');
    charts.dayOfWeekChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Number of Vouchers',
                data: dayData,
                backgroundColor: [
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(56, 239, 125, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(255, 217, 61, 0.8)',
                    'rgba(235, 51, 73, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * 7. Monthly Comparison Chart (Grouped Bar)
 * Compare current year vs previous year
 */
function renderMonthlyComparisonChart() {
    destroyChart('monthlyComparisonChart');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentYearData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const previousYearData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    allVouchers.forEach(v => {
        const date = new Date(v.entryDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const amount = parseFloat(v.amount) || 0;
        
        if (year === currentYear) {
            currentYearData[month] += amount;
        } else if (year === currentYear - 1) {
            previousYearData[month] += amount;
        }
    });
    
    const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
    charts.monthlyComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: currentYear + ' (Current)',
                    data: currentYearData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                },
                {
                    label: (currentYear - 1) + ' (Previous)',
                    data: previousYearData,
                    backgroundColor: 'rgba(245, 87, 108, 0.8)',
                    borderColor: '#f5576c',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': PKR ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'PKR ' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 8. Amount Range Chart (Doughnut)
 * Shows distribution by amount ranges
 */
function renderAmountRangeChart() {
    destroyChart('amountRangeChart');
    
    const ranges = {
        '< 10K': 0,
        '10K - 50K': 0,
        '50K - 100K': 0,
        '100K - 500K': 0,
        '> 500K': 0
    };
    
    allVouchers.forEach(v => {
        const amount = parseFloat(v.amount) || 0;
        if (amount < 10000) ranges['< 10K']++;
        else if (amount < 50000) ranges['10K - 50K']++;
        else if (amount < 100000) ranges['50K - 100K']++;
        else if (amount < 500000) ranges['100K - 500K']++;
        else ranges['> 500K']++;
    });
    
    const ctx = document.getElementById('amountRangeChart').getContext('2d');
    charts.amountRangeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                data: Object.values(ranges),
                backgroundColor: [
                    '#667eea',
                    '#38ef7d',
                    '#f5576c',
                    '#ffd93d',
                    '#00f2fe'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Update top performers table
 */
function updateTopPerformersTable() {
    const personData = {};
    
    allVouchers.forEach(v => {
        const person = v.pointPerson || 'Unknown';
        if (!personData[person]) {
            personData[person] = {
                count: 0,
                amount: 0,
                completed: 0,
                paymentFrom: v.paymentFrom || 'N/A',
                processingTimes: []
            };
        }
        
        personData[person].count++;
        personData[person].amount += parseFloat(v.amount) || 0;
        if (v.paymentStatus === 'Completed') personData[person].completed++;
        
        // Mock processing time (you should calculate from actual data)
        personData[person].processingTimes.push(Math.random() * 5 + 1);
    });
    
    // Sort by amount
    const sorted = Object.entries(personData)
        .sort((a, b) => b[1].amount - a[1].amount)
        .slice(0, 10);
    
    let tableHTML = '';
    sorted.forEach(([person, data], index) => {
        const avgTime = data.processingTimes.reduce((a, b) => a + b, 0) / data.processingTimes.length;
        const completionRate = ((data.completed / data.count) * 100).toFixed(1);
        
        tableHTML += `
            <tr>
                <td><span class="badge bg-primary">#${index + 1}</span></td>
                <td><strong>${person}</strong></td>
                <td>${data.paymentFrom}</td>
                <td>${data.count}</td>
                <td>PKR ${data.amount.toLocaleString()}</td>
                <td>${avgTime.toFixed(1)} days</td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar ${completionRate >= 90 ? 'bg-success' : 'bg-warning'}" 
                             style="width: ${completionRate}%">
                            ${completionRate}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });
    
    $('#topPerformersTable').html(tableHTML);
}

/**
 * Destroy chart instance if exists
 */
function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
    }
}

/**
 * Export dashboard to PDF (placeholder)
 */
function exportDashboard() {
    alert('Export functionality will generate a comprehensive PDF report with all charts and data.');
    // Implement actual PDF export using jsPDF or similar library
}

console.log('✅ Dashboard script loaded successfully');
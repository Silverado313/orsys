// document.addEventListener('DOMContentLoaded', function() {
//     // Get the slip parameter from the URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const slipNo = urlParams.get('slip');

//     if (!slipNo) {
//         document.getElementById('receipt-content').innerHTML = `
//             <div class="alert alert-danger">
//                 <h4>Error</h4>
//                 <p>No receipt slip number provided in the URL.</p>
//                 <p>Please use a valid link like: /shareView.html?slip=1756281913650</p>
//             </div>
//         `;
//         return;
//     }

//     // Load the receipt data
//     loadReceiptForPrint(slipNo);
// });

// function loadReceiptForPrint(slipNo) {
//     db.collection("cr.vouchers")
//         .where("slipNo", "==", parseInt(slipNo))
//         .get()
//         .then((querySnapshot) => {
//             if (querySnapshot.empty) {
//                 document.getElementById('receipt-content').innerHTML = `
//                     <div class="alert alert-warning">
//                         <h4>Receipt Not Found</h4>
//                         <p>No receipt found with slip number: ${slipNo}</p>
//                     </div>
//                 `;
//                 return;
//             }
    
//             const doc = querySnapshot.docs[0];
//             const voucher = doc.data();
//             displayReceipt(voucher);
//         })
//         .catch((error) => {
//             console.error("Error getting document:", error);
//             document.getElementById('receipt-content').innerHTML = `
//                 <div class="alert alert-danger">
//                     <h4>Error Loading Receipt</h4>
//                     <p>${error.message}</p>
//                 </div>
//             `;
//         });
// }

// function displayReceipt(voucher) {
//     const date = voucher.entryDate.toDate().toLocaleString();

//     // Calculate total cash
//     const totalCash = (voucher.deno5000 * 5000) + (voucher.deno1000 * 1000) + 
//                         (voucher.deno500 * 500) + (voucher.deno100 * 100) + 
//                         (voucher.deno50 * 50) + (voucher.deno20 * 20) + 
//                         (voucher.deno10 * 10) + (voucher.deno1 * 1);

//     // Create receipt HTML
//     const receiptHTML = `
//         <div class="receipt-container" id="receipt-to-capture">
//             <div class="Qr-N-Logo">
//             <img class="Logo" src="image/ARY_Digital_Logo_2.png" alt="">
//             <img class="Qr" src="image/qrcode_orsys-ary.web.app.png" alt="">    
//             </div>                    
//             <div class="receipt-header">
//                 <h3>OFFICIAL RECEIPT VOUCHER</h3>
//                 <p class="mb-0">ORSYS-ARY Receipt System</p>
//             </div>
    
//             <div class="receipt-details">
//                 <div class="row">
//                     <div class="col-6">
//                         <p><strong>Slip No:</strong> ${voucher.slipNo}</p>
//                         <p><strong>Payment From:</strong> ${voucher.paymentFrom}</p>
//                         <p><strong>Point Person:</strong> ${voucher.pointPerson}</p>
//                         <p><strong>Payment Mode:</strong> ${voucher.paymentMode}</p>
//                     </div>
//                     <div class="col-6">
//                         <p><strong>Date:</strong> ${date}</p>
//                         <p><strong>Payment Status:</strong> <span class="badge bg-${getStatusBadgeColor(voucher.paymentStatus)}">${voucher.paymentStatus}</span></p>
//                         <p><strong>User:</strong> ${voucher.user}</p>
//                     </div>
//                 </div>
        
//                 <p><strong>Remarks:</strong> ${voucher.remarks || 'N/A'}</p>
        
//                 <h5 class="mt-4">Denomination Breakdown</h5>
//                 <table class="table table-sm table-bordered">
//                     <thead class="table-light">
//                         <tr>
//                             <th>Denomination</th>
//                             <th>Count</th>
//                             <th>Amount</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${voucher.deno5000 ? `<tr><td>5000</td><td>${voucher.deno5000}</td><td>Rs. ${(voucher.deno5000 * 5000).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno1000 ? `<tr><td>1000</td><td>${voucher.deno1000}</td><td>Rs. ${(voucher.deno1000 * 1000).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno500 ? `<tr><td>500</td><td>${voucher.deno500}</td><td>Rs. ${(voucher.deno500 * 500).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno100 ? `<tr><td>100</td><td>${voucher.deno100}</td><td>Rs. ${(voucher.deno100 * 100).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno50 ? `<tr><td>50</td><td>${voucher.deno50}</td><td>Rs. ${(voucher.deno50 * 50).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno20 ? `<tr><td>20</td><td>${voucher.deno20}</td><td>Rs. ${(voucher.deno20 * 20).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno10 ? `<tr><td>10</td><td>${voucher.deno10}</td><td>Rs. ${(voucher.deno10 * 10).toLocaleString()}</td></tr>` : ''}
//                         ${voucher.deno1 ? `<tr><td>1</td><td>${voucher.deno1}</td><td>Rs. ${(voucher.deno1 * 1).toLocaleString()}</td></tr>` : ''}
//                     </tbody>
//                     <tfoot class="table-primary">
//                         <tr>
//                             <th colspan="2">Total Cash</th>
//                             <th>Rs. ${totalCash.toLocaleString()}</th>
//                         </tr>
//                     </tfoot>
//                 </table>
//             </div>
    
//             <div class="receipt-footer">
//                 <p>Thank you for your payment!</p>
//                 <p class="mb-0">This is System Generated Receipt | Powered by ORSYS-ARY Receipt System</p>
//             </div>
//         </div>
//     `;

//     document.getElementById('receipt-content').innerHTML = receiptHTML;
// }

// function getStatusBadgeColor(status) {
//     switch(status) {
//         case 'Completed': return 'success';
//         case 'Pending': return 'warning';
//         case 'Failed': return 'danger';
//         default: return 'secondary';
//     }
// }

// async function shareAsImage() {
//     const element = document.getElementById('receipt-to-capture');
//     if (!element) {
//         alert('Receipt not loaded yet. Please wait...');
//         return;
//     }

//     try {
//         // Show loading
//         const shareBtn = event.target;
//         const originalText = shareBtn.innerHTML;
//         shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
//         shareBtn.disabled = true;

//         // Generate canvas from the receipt
//         const canvas = await html2canvas(element, {
//             backgroundColor: '#ffffff',
//             scale: 2, // Higher quality
//             useCORS: true,
//             allowTaint: false,
//             logging: false,
//             width: element.offsetWidth,
//             height: element.offsetHeight
//         });

//         // Convert to blob
//         canvas.toBlob(async (blob) => {
//             if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'receipt.png', { type: 'image/png' })] })) {
//                 // Use native sharing if available
//                 const file = new File([blob], `receipt_${Date.now()}.png`, { type: 'image/png' });
//                 try {
//                     await navigator.share({
//                         title: 'ORSYS-ARY Receipt',
//                         text: 'Receipt from ORSYS-ARY System',
//                         files: [file]
//                     });
//                 } catch (error) {
//                     if (error.name !== 'AbortError') {
//                         console.error('Error sharing:', error);
//                         fallbackDownload(blob);
//                     }
//                 }
//             } else {
//                 // Fallback to download
//                 fallbackDownload(blob);
//             }

//             // Restore button
//             shareBtn.innerHTML = originalText;
//             shareBtn.disabled = false;
//         }, 'image/png', 0.9);

//     } catch (error) {
//         console.error('Error generating image:', error);
//         alert('Error generating image. Please try again.');

//         // Restore button
//         shareBtn.innerHTML = originalText;
//         shareBtn.disabled = false;
//     }
// }

// async function downloadImage() {
//     const element = document.getElementById('receipt-to-capture');
//     if (!element) {
//         alert('Receipt not loaded yet. Please wait...');
//         return;
//     }

//     try {
//         // Show loading
//         const downloadBtn = event.target;
//         const originalText = downloadBtn.innerHTML;
//         downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
//         downloadBtn.disabled = true;

//         // Generate canvas from the receipt
//         const canvas = await html2canvas(element, {
//             backgroundColor: '#ffffff',
//             scale: 2,
//             useCORS: true,
//             allowTaint: false,
//             logging: false
//         });

//         // Convert to blob and download
//         canvas.toBlob((blob) => {
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `receipt_${Date.now()}.png`;
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             URL.revokeObjectURL(url);

//             // Restore button
//             downloadBtn.innerHTML = originalText;
//             downloadBtn.disabled = false;
//         }, 'image/png', 0.9);

//     } catch (error) {
//         console.error('Error generating image:', error);
//         alert('Error generating image. Please try again.');

//         // Restore button
//         downloadBtn.innerHTML = originalText;
//         downloadBtn.disabled = false;
//     }
// }

// function fallbackDownload(blob) {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `receipt_${Date.now()}.png`;
//     a.style.display = 'none';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);

//     // Show instructions for WhatsApp
//     alert('Image downloaded! You can now open WhatsApp and attach this image to share it.');
// }

// // Demo receipt data for testing (remove this in production)
// function loadDemoReceipt() {
//     const demoVoucher = {
//         slipNo: 1756281913650,
//         paymentFrom: "John Doe",
//         pointPerson: "Jane Smith",
//         paymentMode: "Cash",
//         entryDate: { toDate: () => new Date() },
//         paymentStatus: "Completed",
//         user: "admin",
//         remarks: "Monthly subscription payment",
//         deno5000: 2,
//         deno1000: 5,
//         deno500: 3,
//         deno100: 10,
//         deno50: 4,
//         deno20: 5,
//         deno10: 3,
//         deno1: 7
//     };
//     displayReceipt(demoVoucher);
// }

// // Auto-load demo if no slip parameter (for testing)
// document.addEventListener('DOMContentLoaded', function() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const slipNo = urlParams.get('slip');

//     if (!slipNo) {
//         // Load demo receipt for testing
//         setTimeout(() => {
//             loadDemoReceipt();
//         }, 1000);
//     } else {
//         // Load actual receipt data
//         loadReceiptForPrint(slipNo);
//     }
// });

// New Code

let currentVoucher = null;

function getCurrentSlipNo() {
    return currentVoucher ? currentVoucher.slipNo : Date.now();
}

document.addEventListener('DOMContentLoaded', function() {
    // Get the slip parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const slipNo = urlParams.get('slip');
    
    if (!slipNo) {
        document.getElementById('receipt-content').innerHTML = `
            <div class="alert alert-danger">
                <h4>Error</h4>
                <p>No receipt slip number provided in the URL.</p>
                <p>Please use a valid link like: /shareView.html?slip=1756281913650</p>
            </div>
        `;
        return;
    }
    
    // Load the receipt data
    loadReceiptForPrint(slipNo);
});

function loadReceiptForPrint(slipNo) {
    db.collection("cr.vouchers")
        .where("slipNo", "==", parseInt(slipNo))
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                document.getElementById('receipt-content').innerHTML = `
                    <div class="alert alert-warning">
                        <h4>Receipt Not Found</h4>
                        <p>No receipt found with slip number: ${slipNo}</p>
                    </div>
                `;
                return;
            }
            
            const doc = querySnapshot.docs[0];
            const voucher = doc.data();
            displayReceipt(voucher);
        })
        .catch((error) => {
            console.error("Error getting document:", error);
            document.getElementById('receipt-content').innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error Loading Receipt</h4>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

function displayReceipt(voucher) {
    // Store voucher data globally for filename generation
    currentVoucher = voucher;
    const date = voucher.entryDate.toDate().toLocaleString();
    
    // Calculate total cash
    const totalCash = (voucher.deno5000 * 5000) + (voucher.deno1000 * 1000) + 
                        (voucher.deno500 * 500) + (voucher.deno100 * 100) + 
                        (voucher.deno50 * 50) + (voucher.deno20 * 20) + 
                        (voucher.deno10 * 10) + (voucher.deno1 * 1);
    
    // Create receipt HTML
    const receiptHTML = `
        <div class="receipt-container" id="receipt-to-capture">
            <div class="Qr-N-Logo">
                <img class="Logo" src="/image/ARY_Digital_Logo_2.png" alt="">
                <img class="Qr" src="/image/qrcode_orsys-ary.web.app.png" alt="">
            </div>                    
            <div class="receipt-header">
                <h3>OFFICIAL RECEIPT VOUCHER</h3>
                <p class="mb-0">ORSYS-ARY Receipt System</p>
            </div>
            
            <div class="receipt-details">
                <div class="row">
                    <div class="col-6">
                        <p><strong>Slip No:</strong> ${voucher.slipNo}</p>
                        <p><strong>Payment From:</strong> ${voucher.paymentFrom}</p>
                        <p><strong>Point Person:</strong> ${voucher.pointPerson}</p>
                        <p><strong>Payment Mode:</strong> ${voucher.paymentMode}</p>
                    </div>
                    <div class="col-6">
                        <p><strong>Cell No:</strong> ${voucher.cellNo}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Payment Status:</strong> <span class="badge bg-${getStatusBadgeColor(voucher.paymentStatus)}">${voucher.paymentStatus}</span></p>
                        <p><strong>User:</strong> ${voucher.user}</p>
                    </div>
                </div>
                
                <p><strong>Remarks:</strong> ${voucher.remarks || 'N/A'}</p>
                
                <h5 class="mt-4">Denomination Breakdown</h5>
                <table class="table table-sm table">
                    <thead class="table-light">
                        <tr>
                            <th>Denomination</th>
                            <th>Count</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${voucher.deno5000 ? `<tr><td>5000</td><td>${voucher.deno5000}</td><td>${(voucher.deno5000 * 5000).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno1000 ? `<tr><td>1000</td><td>${voucher.deno1000}</td><td>${(voucher.deno1000 * 1000).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno500 ? `<tr><td>500</td><td>${voucher.deno500}</td><td>${(voucher.deno500 * 500).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno100 ? `<tr><td>100</td><td>${voucher.deno100}</td><td>${(voucher.deno100 * 100).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno50 ? `<tr><td>50</td><td>${voucher.deno50}</td><td>${(voucher.deno50 * 50).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno20 ? `<tr><td>20</td><td>${voucher.deno20}</td><td>${(voucher.deno20 * 20).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno10 ? `<tr><td>10</td><td>${voucher.deno10}</td><td>${(voucher.deno10 * 10).toLocaleString()}</td></tr>` : ''}
                        ${voucher.deno1 ? `<tr><td>1</td><td>${voucher.deno1}</td><td>${(voucher.deno1 * 1).toLocaleString()}</td></tr>` : ''}
                    </tbody>
                    <tfoot class="table-primary">
                        <tr>
                            <th colspan="2">Total Cash</th>
                            <th>${totalCash.toLocaleString()}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="receipt-footer">
                <p>Thank you for your payment!</p>
                <p class="mb-0">This is System Generated Receipt | Powered by ORSYS-ARY Receipt System</p>
            </div>
        </div>
    `;
    
    document.getElementById('receipt-content').innerHTML = receiptHTML;
}

function getStatusBadgeColor(status) {
    switch(status) {
        case 'Completed': return 'success';
        case 'Pending': return 'warning';
        case 'Failed': return 'danger';
        default: return 'secondary';
    }
}

async function shareAsImage() {
    const element = document.getElementById('receipt-to-capture');
    if (!element) {
        alert('Receipt not loaded yet. Please wait...');
        return;
    }

    try {
        // Show loading
        const shareBtn = event.target;
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        shareBtn.disabled = true;

        // Generate canvas from the receipt
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: element.offsetWidth,
            height: element.offsetHeight
        });

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'receipt.png', { type: 'image/png' })] })) {
                // Use native sharing if available
                const file = new File([blob], `receipt_${getCurrentSlipNo()}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        title: 'ORSYS-ARY Receipt',
                        text: `Receipt #${currentVoucher.slipNo} from ORSYS-ARY System`,
                        files: [file]
                    });
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Error sharing:', error);
                        fallbackDownload(blob);
                    }
                }
            } else {
                // Fallback to download
                fallbackDownload(blob);
            }

            // Restore button
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }, 'image/png', 0.9);

    } catch (error) {
        console.error('Error generating image:', error);
        alert('Error generating image. Please try again.');
        
        // Restore button
        shareBtn.innerHTML = originalText;
        shareBtn.disabled = false;
    }
}

async function downloadImage() {
    const element = document.getElementById('receipt-to-capture');
    if (!element) {
        alert('Receipt not loaded yet. Please wait...');
        return;
    }

    try {
        // Show loading
        const downloadBtn = event.target;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        downloadBtn.disabled = true;

        // Generate canvas from the receipt
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${getCurrentSlipNo()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Restore button
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 'image/png', 0.9);

    } catch (error) {
        console.error('Error generating image:', error);
        alert('Error generating image. Please try again.');
        
        // Restore button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

function fallbackDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${getCurrentSlipNo()}.png`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show instructions for WhatsApp
    alert('Image downloaded! You can now open WhatsApp and attach this image to share it.');
}

// Demo receipt data for testing (remove this in production)
// function loadDemoReceipt() {
//     const demoVoucher = {
//         slipNo: 1756281913650,
//         paymentFrom: "John Doe",
//         pointPerson: "Jane Smith",
//         paymentMode: "Cash",
//         entryDate: { toDate: () => new Date() },
//         paymentStatus: "Completed",
//         user: "admin",
//         remarks: "Monthly subscription payment",
//         deno5000: 2,
//         deno1000: 5,
//         deno500: 3,
//         deno100: 10,
//         deno50: 4,
//         deno20: 5,
//         deno10: 3,
//         deno1: 7
//     };
//     displayReceipt(demoVoucher);
// }

// Auto-load demo if no slip parameter (for testing)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const slipNo = urlParams.get('slip');
    
    if (!slipNo) {
        // Load demo receipt for testing
        setTimeout(() => {
            loadDemoReceipt();
        }, 1000);
    } else {
        // Load actual receipt data
        loadReceiptForPrint(slipNo);
    }
});
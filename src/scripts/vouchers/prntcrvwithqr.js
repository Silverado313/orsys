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
                <p>Please use a valid link like: /prntview.html?slip=1756281913650</p>
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

async function displayReceipt(voucher) {
    // Store voucher data globally for filename generation
    currentVoucher = voucher;
    const date = voucher.entryDate.toDate().toLocaleString();
    
    // Generate QR code for this receipt - Use absolute URL
    const receiptUrl = `${window.location.origin}/src/pages/vouchers/print.html?slip=${voucher.slipNo}`;
    let qrCodeHTML = '';
    
    // Check if QRCode library is available
    if (typeof QRCode === 'undefined') {
        console.warn('QRCode library not loaded, using fallback');
        qrCodeHTML = `
            <div style="text-align: center; padding: 10px; border: 1px solid #ddd; width: 110px; height: 110px;">
                <p style="font-size: 9px; color: #666; margin: 0; line-height: 1.2;">Scan Code<br>Not Available</p>
            </div>
        `;
    } else {
        try {
            // Create a temporary container for QR code generation
            const qrContainer = document.createElement('div');
            qrContainer.style.position = 'absolute';
            qrContainer.style.left = '-9999px'; // Hide offscreen instead of display:none
            document.body.appendChild(qrContainer);
            
            // Generate QR code with proper error level
            const qrCode = new QRCode(qrContainer, {
                text: receiptUrl,
                width: 110,
                height: 110,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M // Use M for better compatibility
            });
            
            // Wait a moment for QR code to generate
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get the generated QR code canvas
            const qrCanvas = qrContainer.querySelector('canvas');
            const qrImg = qrContainer.querySelector('img');
            
            if (qrCanvas) {
                // Convert canvas to data URL
                const qrDataUrl = qrCanvas.toDataURL('image/png');
                qrCodeHTML = `<img class="Qr" src="${qrDataUrl}" alt="Receipt QR Code">`;
            } else if (qrImg) {
                // If img element was created instead of canvas
                qrCodeHTML = `<img class="Qr" src="${qrImg.src}" alt="Receipt QR Code">`;
            } else {
                throw new Error('QR code element not generated');
            }
            
            // Clean up
            document.body.removeChild(qrContainer);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrCodeHTML = `
                <div style="text-align: center; padding: 10px; border: 1px solid #ddd; width: 110px; height: 110px;">
                    <p style="font-size: 9px; color: #666; margin: 0; line-height: 1.2;">QR Code<br>Generation<br>Failed</p>
                    <p style="font-size: 8px; color: #999; margin-top: 5px;">URL: ${receiptUrl.substring(0, 30)}...</p>
                </div>
            `;
        }
    }
    
    // Calculate total cash
    const totalCash = (voucher.deno5000 * 5000) + (voucher.deno1000 * 1000) + 
                        (voucher.deno500 * 500) + (voucher.deno100 * 100) + 
                        (voucher.deno50 * 50) + (voucher.deno20 * 20) + 
                        (voucher.deno10 * 10) + (voucher.deno1 * 1);
    
    // Calculate denominations with proper filtering
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
    
    let denominationsHTML = '';
    
    denominations.forEach(deno => {
        if (deno.count > 0) {
            const amount = deno.count * deno.value;
            denominationsHTML += `
                <tr>
                    <td>${deno.value}</td>
                    <td>${deno.count}</td>
                    <td>${amount.toLocaleString()}</td>
                </tr>
            `;
        }
    });
    
    // Create receipt HTML with QR code integrated
    const receiptHTML = `
        <div class="receipt-container" id="receipt-to-capture">
          
            <div class="Qr-N-Logo">
                <img class="Logo" src="/image/ARY_Digital_Logo_2.png" alt="">
                <div class="qr-container">
                    ${qrCodeHTML}
                    <p style="margin-top: 2px; font-size: 10px; color: #666; text-align: center;">Scan to verify</p>
                </div>                 
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
                <table class="table table-sm">
                    <thead class="table-light">
                        <tr>
                            <th>Denomination</th>
                            <th>Count</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${denominationsHTML}
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
                <p class="mb-0">Generated by ORSYS-ARY Receipt System</p>
            </div>
            <hr>
        </div>
    `;
    
    document.getElementById('receipt-content').innerHTML = receiptHTML;
}

// Helper function to test QR code URL
function testQRUrl() {
    if (currentVoucher) {
        const testUrl = `${window.location.origin}/prntview.html?slip=${currentVoucher.slipNo}`;
        console.log('Testing QR URL:', testUrl);
        window.open(testUrl, '_blank');
    }
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

        // Set A4 dimensions on the element first (210mm x 297mm)
        element.style.width = '93.133mm';
        element.style.height = '297mm';

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

        // Set A4 dimensions on the element first (210mm x 297mm)
        element.style.width = '93.133';
        element.style.height = '297mm';

        // Generate canvas from the receipt
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: element.offsetWidth,
            height: element.offsetHeight
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

async function downloadPDF() {
    const element = document.getElementById('receipt-to-capture');
    if (!element) {
        alert('Receipt not loaded yet. Please wait...');
        return;
    }

    try {
        // Show loading
        const downloadBtn = event.target;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
        downloadBtn.disabled = true;

        // Generate QR code for PDF (ensure it's included)
        const receiptUrl = `${window.location.origin}/prntview.html?slip=${getCurrentSlipNo()}`;
        let qrDataUrl = '';
        
        try {
            const qrCanvas = document.createElement('canvas');
            await QRCode.toCanvas(qrCanvas, receiptUrl, {
                width: 80,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            qrDataUrl = qrCanvas.toDataURL('image/png');
        } catch (error) {
            console.error('QR code generation failed:', error);
        }

        // Store original styles to restore later
        const originalStyles = {
            width: element.style.width,
            height: element.style.height,
            overflow: element.style.overflow
        };

        // Set A4 dimensions temporarily
        element.style.width = '93.133mm';
        element.style.height = 'auto';
        element.style.overflow = 'hidden';

        // Use html2pdf for better HTML to PDF conversion
        const opt = {
            margin: 10,
            filename: `receipt_${getCurrentSlipNo()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate and download PDF
        await html2pdf().from(element).set(opt).save();

        // Restore original styles
        element.style.width = originalStyles.width;
        element.style.height = originalStyles.height;
        element.style.overflow = originalStyles.overflow;

        // Restore button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        
        // Restore button
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
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
function loadDemoReceipt() {
    const demoVoucher = {
        slipNo: 1756281913650,
        paymentFrom: "John Doe",
        pointPerson: "Jane Smith",
        paymentMode: "Cash",
        cellNo: "Cell-A",
        entryDate: { toDate: () => new Date() },
        paymentStatus: "Completed",
        user: "admin",
        remarks: "Monthly subscription payment",
        deno5000: 2,
        deno1000: 5,
        deno500: 3,
        deno100: 10,
        deno50: 4,
        deno20: 5,
        deno10: 3,
        deno1: 7
    };
    displayReceipt(demoVoucher);
}

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